import type { Metadata } from "next";
import { PhotoSlotCard } from "@/components/admin/photo-slot-card";
import { requireAdmin } from "@/lib/auth";
import { publicEnv } from "@/lib/env";
import { PHOTO_SLOTS } from "@/lib/photo-slots";

export const metadata: Metadata = { title: "ფოტოები" };

export default async function PhotosPage() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("photos").select("*");
  const rows = new Map((data ?? []).map((r) => [r.slot, r]));
  const base = `${publicEnv().NEXT_PUBLIC_SUPABASE_URL.replace(/\/$/, "")}/storage/v1/object/public/photos`;

  return (
    <>
      <h1 className="mb-2 text-2xl font-bold">ფოტოები</h1>
      <p className="mb-6 text-sm text-muted">
        ფოტო ავტომატურად მცირდება (მაქს. 1600px სიგანე, WebP), ასე რომ ტელეფონის ფოტოც პირდაპირ შეგიძლიათ ატვირთოთ.
      </p>
      <div className="grid gap-4 md:grid-cols-2">
        {PHOTO_SLOTS.map(({ slot, label, hint }) => {
          const row = rows.get(slot);
          return (
            <PhotoSlotCard
              key={slot}
              slot={slot}
              label={label}
              hint={hint}
              initialUrl={row?.path ? `${base}/${row.path}` : null}
              initialAlt={row?.alt ?? ""}
              initialSize={row?.width && row?.height ? { width: row.width, height: row.height } : null}
              publicBaseUrl={base}
            />
          );
        })}
      </div>
    </>
  );
}
