"use server";

import { z } from "zod";
import { check, runAdminAction } from "@/lib/admin-action";
import { SETTING_FIELDS, TEXT_FIELDS } from "@/lib/admin-fields";
import { digitsOnly } from "@/lib/contact";
import { plainText } from "@/lib/sanitize";

const textsSchema = z.object(
  Object.fromEntries(
    TEXT_FIELDS.flatMap((f) => [
      [
        f.key,
        z
          .string()
          .transform(plainText)
          .pipe(z.string().max(f.max, `„${f.fullLabel}“: მაქსიმუმ ${f.max} სიმბოლო`)),
      ],
      ...(f.visibleKey ? [[f.visibleKey, z.enum(["1", "0"])]] : []),
    ]),
  ),
);

/** Saves all page texts at once; unknown keys are rejected (strict schema). Returns the cleaned values. */
export async function saveTexts(input: Record<string, string>) {
  return runAdminAction(textsSchema.strict(), input, async (data, { supabase }) => {
    const rows = Object.entries(data).map(([key, value]) => ({ key, value: value as string }));
    check(await supabase.from("texts").upsert(rows, { onConflict: "key" }));
    return data as Record<string, string>;
  });
}

const phoneSchema = (label: string) =>
  z
    .string()
    .trim()
    .refine((v) => v === "" || /^\+?[\d\s()-]+$/.test(v), `${label}: დასაშვებია მხოლოდ ციფრები და +`)
    .transform((v) => (v ? `+${digitsOnly(v)}` : ""))
    .refine((v) => v === "" || (v.length >= 10 && v.length <= 16), `${label}: ნომერი არასწორია (მაგ. +995568883279)`);

const urlSchema = (label: string) =>
  z
    .string()
    .trim()
    .max(500, `${label}: ბმული ძალიან გრძელია`)
    .refine((v) => {
      if (v === "") return true;
      try {
        const u = new URL(v);
        return u.protocol === "https:" || u.protocol === "http:";
      } catch {
        return false;
      }
    }, `${label}: შეიყვანეთ სრული ბმული (https://...)`);

const settingsSchema = z
  .object(
    Object.fromEntries(
      SETTING_FIELDS.map((f) => [
        f.key,
        f.kind === "phone"
          ? phoneSchema(f.label)
          : f.kind === "url"
            ? urlSchema(f.label)
            : z.string().transform(plainText).pipe(z.string().max(200, `${f.label}: მაქსიმუმ 200 სიმბოლო`)),
      ]),
    ),
  )
  .strict();

/** Saves all contact settings at once. Phones come back as "+<digits>", so the form can show them normalized. */
export async function saveSettings(input: Record<string, string>) {
  return runAdminAction(settingsSchema, input, async (data, { supabase }) => {
    const rows = Object.entries(data).map(([key, value]) => ({ key, value: value as string }));
    check(await supabase.from("settings").upsert(rows, { onConflict: "key" }));
    return data as Record<string, string>;
  });
}
