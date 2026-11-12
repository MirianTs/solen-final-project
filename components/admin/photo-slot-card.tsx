"use client";

import { useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { deletePhoto, saveAlt, savePhoto } from "@/app/admin/actions/photos";
import { compressImage } from "@/lib/compress-image";
import { newPhotoPath } from "@/lib/photo-slots";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { PhotoSlot } from "@/lib/supabase/database.types";

type Props = {
  slot: PhotoSlot;
  label: string;
  hint: string;
  initialUrl: string | null;
  initialAlt: string;
  initialSize: { width: number; height: number } | null;
  publicBaseUrl: string;
};

const ACCEPT = "image/jpeg,image/png,image/webp,image/heic,image/heif";
// Phone photos are big; anything above this is rejected before compression starts.
const MAX_INPUT_BYTES = 30 * 1024 * 1024;
// Every upload gets a new file name (newPhotoPath), so a file can be cached for a year.
const CACHE_SECONDS = "31536000";

export function PhotoSlotCard({ slot, label, hint, initialUrl, initialAlt, initialSize, publicBaseUrl }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState(initialUrl);
  const [size, setSize] = useState(initialSize);
  const [alt, setAlt] = useState(initialAlt);
  const [savedAlt, setSavedAlt] = useState(initialAlt);
  const [status, setStatus] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const busy = pending || status !== null;

  async function onFile(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("აირჩიეთ სურათის ფაილი (JPG, PNG, WebP).");
      return;
    }
    if (file.size > MAX_INPUT_BYTES) {
      toast.error("ფაილი ძალიან დიდია (მაქს. 30 MB).");
      return;
    }

    const supabase = createSupabaseBrowserClient();
    let uploadedPath: string | null = null;
    try {
      setStatus("იკუმშება…");
      const { blob, width, height, type, ext } = await compressImage(file);

      setStatus("იტვირთება…");
      const path = newPhotoPath(slot, ext);
      const { error: uploadError } = await supabase.storage
        .from("photos")
        .upload(path, blob, { contentType: type, cacheControl: CACHE_SECONDS, upsert: false });
      if (uploadError) throw uploadError;
      uploadedPath = path;

      setStatus("ინახება…");
      const result = await savePhoto({ slot, path, width, height, alt });
      if (!result.ok) {
        await supabase.storage.from("photos").remove([path]);
        toast.error(result.error);
        return;
      }

      setUrl(`${publicBaseUrl}/${path}`);
      setSize({ width, height });
      // The server trims the alt text; compare against the same value so no stray "save" button appears.
      setSavedAlt(alt.trim());
      toast.success(`ფოტო განახლდა (${width}×${height}, ${Math.round(blob.size / 1024)} KB)`);
    } catch (error) {
      if (uploadedPath) await supabase.storage.from("photos").remove([uploadedPath]);
      const message = error instanceof Error ? error.message : "";
      toast.error(
        message === "ENCODE_UNSUPPORTED"
          ? "ეს ბრაუზერი ფოტოს ვერ ამუშავებს. სცადეთ სხვა ბრაუზერით."
          : "ფოტოს ატვირთვა ვერ მოხერხდა. სცადეთ თავიდან.",
      );
    } finally {
      setStatus(null);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function onSaveAlt() {
    startTransition(async () => {
      const result = await saveAlt({ slot, alt });
      if (result.ok) {
        setSavedAlt(alt.trim());
        toast.success("აღწერა შენახულია");
      } else toast.error(result.error);
    });
  }

  function onDelete() {
    if (!window.confirm(`წავშალო „${label}“-ის ფოტო?`)) return;
    startTransition(async () => {
      const result = await deletePhoto({ slot });
      if (result.ok) {
        setUrl(null);
        setSize(null);
        toast.success("ფოტო წაიშალა");
      } else toast.error(result.error);
    });
  }

  const inputId = `photo-${slot}`;

  return (
    <article className="flex flex-col gap-4 rounded-card border border-line bg-card p-4 sm:p-5">
      <div>
        <h2 className="text-lg font-bold">{label}</h2>
        <p className="text-sm text-muted">{hint}</p>
      </div>

      <div className="relative flex aspect-video items-center justify-center overflow-hidden rounded-2xl border border-line bg-bg">
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element -- admin preview, images are unoptimized anyway
          <img src={url} alt={savedAlt} className="size-full object-cover" />
        ) : (
          <span className="text-sm text-muted">ფოტო არ არის</span>
        )}
        {status && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70 font-semibold" role="status">
            {status}
          </div>
        )}
      </div>
      {size && (
        <p className="-mt-2 text-xs text-muted">
          {size.width}×{size.height} px
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept={ACCEPT}
          className="peer sr-only"
          disabled={busy}
          onChange={(e) => void onFile(e.target.files?.[0])}
        />
        {/* The file input itself is hidden, so its keyboard focus ring is drawn on this label. */}
        <label
          htmlFor={inputId}
          className={`admin-btn-primary cursor-pointer peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent-ink ${busy ? "pointer-events-none opacity-60" : ""}`}
        >
          {url ? "შეცვლა" : "ატვირთვა"}
        </label>
        {url && (
          <button type="button" onClick={onDelete} disabled={busy} className="admin-btn-danger min-h-12">
            წაშლა
          </button>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor={`${inputId}-alt`} className="text-sm font-semibold">
          აღწერა (alt) — ვისთვისაც ფოტო არ ჩანს
        </label>
        <div className="flex gap-2">
          <input
            id={`${inputId}-alt`}
            value={alt}
            maxLength={200}
            onChange={(e) => setAlt(e.target.value)}
            className="admin-input"
          />
          {alt.trim() !== savedAlt && (
            <button type="button" onClick={onSaveAlt} disabled={busy} className="admin-btn-ghost shrink-0">
              შენახვა
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
