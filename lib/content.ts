import "server-only";
import { cache } from "react";
import { publicEnv } from "@/lib/env";
import { formatDate } from "@/lib/format";
import { createPublicClient } from "@/lib/supabase/public";
import type { PhotoSlot, Views } from "@/lib/supabase/database.types";

export const REVIEWS_PAGE_SIZE = 6;

export type Photo = { url: string; alt: string; width: number; height: number };
export type PriceItem = { id: string; name: string; price: string; photo: Photo | null };
export type PriceColumn = { id: string; title: string; services: PriceItem[] };
// dateLabel is formatted on the server: not every browser ships Georgian (ka-GE) locale data.
export type PublicReview = Views<"public_reviews"> & { dateLabel: string };
export type ReviewStats = { average: number; count: number };

export type SiteContent = {
  settings: Record<string, string>;
  texts: Record<string, string>;
  photos: Partial<Record<PhotoSlot, Photo>>;
  columns: PriceColumn[];
  stats: ReviewStats;
  reviews: PublicReview[];
  hasMoreReviews: boolean;
};

// Generic fallbacks so the page still renders when a row (or the whole DB) is missing.
const TEXT_FALLBACKS: Record<string, string> = {
  hero_slogan: "გათბობა და კონდიციონერები",
  prices_title: "ფასები",
  services_title: "სერვისები",
  reviews_title: "შეფასებები",
  contact_title: "დაგვიკავშირდით",
  contact_text: "",
  footer_text: "",
};

export function photoUrl(path: string): string {
  const base = publicEnv().NEXT_PUBLIC_SUPABASE_URL.replace(/\/$/, "");
  const encoded = path.split("/").map(encodeURIComponent).join("/");
  return `${base}/storage/v1/object/public/photos/${encoded}`;
}

function toRecord(rows: { key: string; value: string }[] | null): Record<string, string> {
  return Object.fromEntries((rows ?? []).map((r) => [r.key, r.value]));
}

/** Runs a query and returns null (logging the error) instead of throwing. */
async function safe<T>(label: string, run: () => PromiseLike<{ data: T | null; error: unknown }>): Promise<T | null> {
  try {
    const { data, error } = await run();
    if (error) {
      console.error(`[content] ${label} failed`, error);
      return null;
    }
    return data;
  } catch (error) {
    console.error(`[content] ${label} failed`, error);
    return null;
  }
}

export async function fetchReviews(offset: number, limit = REVIEWS_PAGE_SIZE) {
  const db = createPublicClient();
  // Fetch one extra row to know whether more reviews exist.
  const rows =
    (await safe("reviews", () =>
      db
        .from("public_reviews")
        .select("id, rating, name, comment, created_at")
        .order("created_at", { ascending: false })
        .order("id", { ascending: false })
        .range(offset, offset + limit),
    )) ?? [];
  const reviews = rows.slice(0, limit).map((r) => ({ ...r, dateLabel: formatDate(r.created_at) }));
  return { reviews, hasMore: rows.length > limit };
}

/** All public page content. Wrapped in React cache so metadata and the page share one fetch. */
export const getSiteContent = cache(async (): Promise<SiteContent> => {
  const db = createPublicClient();

  const [settings, texts, photos, columns, services, stats, firstReviews] = await Promise.all([
    safe("settings", () => db.from("settings").select("key, value")),
    safe("texts", () => db.from("texts").select("key, value")),
    safe("photos", () => db.from("photos").select("*")),
    safe("price_columns", () => db.from("price_columns").select("*").order("position")),
    safe("services", () => db.from("services").select("*").order("position")),
    safe<Views<"review_stats">>("review_stats", () => db.from("review_stats").select("*").maybeSingle()),
    fetchReviews(0),
  ]);

  const photoMap: Partial<Record<PhotoSlot, Photo>> = {};
  for (const p of photos ?? []) {
    if (!p.path) continue;
    photoMap[p.slot] = {
      url: photoUrl(p.path),
      alt: p.alt,
      width: p.width ?? 1600,
      height: p.height ?? 900,
    };
  }

  return {
    settings: toRecord(settings),
    texts: { ...TEXT_FALLBACKS, ...Object.fromEntries(Object.entries(toRecord(texts)).filter(([, v]) => v.trim())) },
    photos: photoMap,
    columns: (columns ?? []).map((c) => ({
      id: c.id,
      title: c.title,
      services: (services ?? [])
        .filter((s) => s.column_id === c.id)
        .map((s) => ({
          id: s.id,
          name: s.name,
          price: s.price,
          photo:
            s.photo_path && s.photo_width && s.photo_height
              ? { url: photoUrl(s.photo_path), alt: s.name, width: s.photo_width, height: s.photo_height }
              : null,
        })),
    })),
    stats: { average: Number(stats?.average ?? 0), count: Number(stats?.count ?? 0) },
    reviews: firstReviews.reviews,
    hasMoreReviews: firstReviews.hasMore,
  };
});
