import "server-only";
import { serverEnv } from "@/lib/env";

const SITEVERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
// Cloudflare documents tokens of at most 2048 characters; longer input is rejected without a request.
const MAX_TOKEN_LENGTH = 2048;
// Give up after this long so a slow siteverify call cannot hang the review form.
const TIMEOUT_MS = 8000;

/** Verifies a Turnstile token server-side. Returns false on any failure (including network errors). */
export async function verifyTurnstile(token: string, remoteIp: string | null): Promise<boolean> {
  if (!token || token.length > MAX_TOKEN_LENGTH) return false;

  const body = new URLSearchParams({ secret: serverEnv().TURNSTILE_SECRET_KEY, response: token });
  if (remoteIp) body.set("remoteip", remoteIp);

  try {
    const res = await fetch(SITEVERIFY_URL, {
      method: "POST",
      body,
      cache: "no-store",
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) return false;
    const data = (await res.json()) as { success?: boolean; "error-codes"?: string[] };
    if (!data.success) console.warn("[turnstile] rejected", data["error-codes"]);
    return data.success === true;
  } catch (error) {
    console.error("[turnstile] siteverify failed", error);
    return false;
  }
}
