import type { PhotoSlot } from "@/lib/supabase/database.types";

export const PHOTO_SLOTS: { slot: PhotoSlot; label: string; hint: string }[] = [
  { slot: "banner", label: "მთავარი ბანერი", hint: "ჰორიზონტალური ფოტო, საუკეთესოა 1600×900" },
  { slot: "p1", label: "ბლოკი P1", hint: "საუკეთესოა 4:3 (მაგ. 1200×900)" },
  { slot: "p2", label: "ბლოკი P2", hint: "საუკეთესოა 4:3 (მაგ. 1200×900)" },
  { slot: "p3", label: "ბლოკი P3", hint: "საუკეთესოა 4:3 (მაგ. 1200×900)" },
  { slot: "p4", label: "ბლოკი P4", hint: "საუკეთესოა 4:3 (მაგ. 1200×900)" },
  {
    slot: "og",
    label: "გაზიარების ფოტო",
    hint: "ჩანს Facebook-ზე / Viber-ში ბმულის გაზიარებისას. საუკეთესოა 1200×630. თუ ცარიელია, გამოიყენება ბანერი.",
  },
];

export const PHOTO_SLOT_IDS = PHOTO_SLOTS.map((s) => s.slot) as [PhotoSlot, ...PhotoSlot[]];

/** New unique object name per upload, so CDN caches never serve an old image. */
export function newPhotoPath(slot: PhotoSlot): string {
  return `${slot}-${Date.now()}.webp`;
}

export const PHOTO_PATH_RE = /^(banner|p[1-4]|og)-\d{10,16}\.webp$/;
