"use server";

import { createHash, randomUUID } from "node:crypto";
import { cookies, headers } from "next/headers";
import { z } from "zod";
import { serverEnv } from "@/lib/env";
import { plainText } from "@/lib/sanitize";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { verifyTurnstile } from "@/lib/turnstile";

export type SubmitReviewResult = { ok: true } | { ok: false; error: string; field?: "rating" | "name" | "comment" };

const DEVICE_COOKIE = "solen_did";
const LIMIT_DAYS = 30;

const reviewSchema = z.object({
  rating: z.coerce
    .number({ error: "აირჩიეთ შეფასება (1–5 ვარსკვლავი)." })
    .int()
    .min(1, "აირჩიეთ შეფასება (1–5 ვარსკვლავი).")
    .max(5, "აირჩიეთ შეფასება (1–5 ვარსკვლავი)."),
  name: z
    .string()
    .transform(plainText)
    .pipe(z.string().min(1, "შეიყვანეთ სახელი.").max(60, "სახელი მაქსიმუმ 60 სიმბოლოა.")),
  comment: z.string().transform(plainText).pipe(z.string().max(1000, "კომენტარი მაქსიმუმ 1000 სიმბოლოა.")),
  token: z.string(),
});

/** Salted SHA-256 (HASH_SALT), so stored device/IP hashes cannot be matched against plain values. */
function sha256(value: string): string {
  return createHash("sha256").update(`${serverEnv().HASH_SALT}:${value}`).digest("hex");
}

/** Visitor IP from the proxy headers (first x-forwarded-for entry on Vercel), or null. */
async function clientIp(): Promise<string | null> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || h.get("x-real-ip")?.trim() || null;
}

/**
 * Public review submission. Order: validate → Turnstile → device/IP limit → insert (status 'pending').
 * Uses the service-role client because anon has no access to the reviews table at all.
 * Never returns internal error details.
 */
export async function submitReview(input: {
  rating: number;
  name: string;
  comment: string;
  token: string;
}): Promise<SubmitReviewResult> {
  try {
    const parsed = reviewSchema.safeParse(input);
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      const field = issue?.path[0];
      return {
        ok: false,
        error: issue?.message ?? "შეამოწმეთ ველები.",
        field: field === "rating" || field === "name" || field === "comment" ? field : undefined,
      };
    }
    const data = parsed.data;

    const ip = await clientIp();
    if (!(await verifyTurnstile(data.token, ip))) {
      return { ok: false, error: "დაადასტურეთ, რომ რობოტი არ ხართ, და სცადეთ თავიდან." };
    }

    // Device id: random, httpOnly, 1 year. Only its salted hash is stored.
    const cookieStore = await cookies();
    let deviceId = cookieStore.get(DEVICE_COOKIE)?.value;
    if (!deviceId || !/^[0-9a-f-]{36}$/.test(deviceId)) {
      deviceId = randomUUID();
      cookieStore.set(DEVICE_COOKIE, deviceId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 365,
      });
    }
    const deviceHash = sha256(`device:${deviceId}`);
    const ipHash = ip ? sha256(`ip:${ip}`) : null;

    const db = createSupabaseAdminClient();
    const since = new Date(Date.now() - LIMIT_DAYS * 24 * 60 * 60 * 1000).toISOString();
    // Hashes are hex strings, so they are safe inside the PostgREST or() filter.
    const orFilter = ipHash ? `device_hash.eq.${deviceHash},ip_hash.eq.${ipHash}` : `device_hash.eq.${deviceHash}`;
    const { count, error: countError } = await db
      .from("reviews")
      .select("id", { count: "exact", head: true })
      .gte("created_at", since)
      .or(orFilter);
    if (countError) throw countError;
    if ((count ?? 0) > 0) {
      return {
        ok: false,
        error: `თქვენ უკვე დატოვეთ შეფასება. ახალი შეფასების დატოვება ${LIMIT_DAYS} დღეში ერთხელ შეიძლება.`,
      };
    }

    const { error: insertError } = await db.from("reviews").insert({
      rating: data.rating,
      name: data.name,
      comment: data.comment,
      status: "pending",
      device_hash: deviceHash,
      ip_hash: ipHash,
    });
    if (insertError) throw insertError;

    return { ok: true };
  } catch (error) {
    console.error("[submitReview]", error);
    return { ok: false, error: "შეფასება ვერ გაიგზავნა. სცადეთ მოგვიანებით." };
  }
}
