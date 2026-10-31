"use server";

import { z } from "zod";
import { check, runAdminAction, UserError } from "@/lib/admin-action";
import { PHOTO_PATH_RE, PHOTO_SLOT_IDS } from "@/lib/photo-slots";
import { plainText } from "@/lib/sanitize";

const slot = z.enum(PHOTO_SLOT_IDS);
const alt = z.string().transform(plainText).pipe(z.string().max(200, "ალტ-ტექსტი მაქსიმუმ 200 სიმბოლოა"));

const savePhotoSchema = z
  .object({
    slot,
    path: z.string().regex(PHOTO_PATH_RE, "ფაილის სახელი არასწორია"),
    width: z.number().int().min(1).max(10_000),
    height: z.number().int().min(1).max(10_000),
    alt,
  })
  .refine((d) => d.path.startsWith(`${d.slot}-`), "ფაილის სახელი არასწორია");

/**
 * Called after the browser uploaded the compressed file to Storage.
 * Points the slot at the new file, then deletes the previous file.
 */
export async function savePhoto(input: z.input<typeof savePhotoSchema>) {
  return runAdminAction(savePhotoSchema, input, async (data, { supabase }) => {
    const { data: current } = check(await supabase.from("photos").select("path").eq("slot", data.slot).maybeSingle());

    check(
      await supabase.from("photos").upsert(
        { slot: data.slot, path: data.path, width: data.width, height: data.height, alt: data.alt },
        { onConflict: "slot" },
      ),
    );

    if (current?.path && current.path !== data.path) {
      const { error } = await supabase.storage.from("photos").remove([current.path]);
      // The new photo is live either way; an orphaned old file is harmless, so only log it.
      if (error) console.error("[photos] could not delete old file", current.path, error);
    }
  });
}

export async function saveAlt(input: { slot: string; alt: string }) {
  return runAdminAction(z.object({ slot, alt }), input, async (data, { supabase }) => {
    check(await supabase.from("photos").upsert({ slot: data.slot, alt: data.alt }, { onConflict: "slot" }));
  });
}

export async function deletePhoto(input: { slot: string }) {
  return runAdminAction(z.object({ slot }), input, async (data, { supabase }) => {
    const { data: current } = check(await supabase.from("photos").select("path").eq("slot", data.slot).maybeSingle());
    if (!current?.path) throw new UserError("ფოტო უკვე წაშლილია.");

    check(await supabase.from("photos").update({ path: null, width: null, height: null }).eq("slot", data.slot));
    const { error } = await supabase.storage.from("photos").remove([current.path]);
    if (error) console.error("[photos] could not delete file", current.path, error);
  });
}
