import type { PhotoSlot } from "@/lib/supabase/database.types";

export const PHOTO_SLOTS: { slot: PhotoSlot; label: string; hint: string }[] = [
  { slot: "banner", label: "მთავარი ბანერი", hint: "ჰორიზონტალური ფოტო, საუკეთესოა 1600×900" },
  {
    slot: "og",
    label: "გაზიარების ფოტო",
    hint: "ჩანს Facebook-ზე / Viber-ში ბმულის გაზიარებისას. საუკეთესოა 1200×630. თუ ცარიელია, გამოიყენება ბანერი.",
  },
];

export const PHOTO_SLOT_IDS = PHOTO_SLOTS.map((s) => s.slot) as [PhotoSlot, ...PhotoSlot[]];

/** New unique object name per upload, so CDN caches never serve an old image. */
export function newPhotoPath(slot: PhotoSlot, ext: "webp" | "jpg" = "webp"): string {
  return `${slot}-${Date.now()}.${ext}`;
}

// Valid uploaded file names. p1–p4 are slots of the removed P1–P4 blocks; they stay in the
// database enum, so the pattern still accepts them.
export const PHOTO_PATH_RE = /^(banner|p[1-4]|og)-\d{10,16}\.(webp|jpg)$/;
