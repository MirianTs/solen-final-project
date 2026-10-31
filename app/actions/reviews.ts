"use server";

import { z } from "zod";
import { fetchReviews, type PublicReview } from "@/lib/content";

const offsetSchema = z.number().int().min(0).max(10_000);

/** "მეტის ნახვა": returns the next page of approved reviews. Read-only, so it keeps the page static. */
export async function loadMoreReviews(offset: number): Promise<{ reviews: PublicReview[]; hasMore: boolean }> {
  const parsed = offsetSchema.safeParse(offset);
  if (!parsed.success) return { reviews: [], hasMore: false };
  return fetchReviews(parsed.data);
}
