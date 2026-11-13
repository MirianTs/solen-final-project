"use client";

import { useState, useTransition } from "react";
import { loadMoreReviews } from "@/app/actions/reviews";
import type { PublicReview } from "@/lib/content";
import { ReviewCard } from "./review-card";
import { ReviewDialog } from "./review-dialog";

type Props = { initial: PublicReview[]; initialHasMore: boolean };

/** Approved reviews with "მეტის ნახვა" (6 at a time via a read-only server action). */
export function ReviewsList({ initial, initialHasMore }: Props) {
  const [reviews, setReviews] = useState(initial);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [failed, setFailed] = useState(false);
  const [opened, setOpened] = useState<PublicReview | null>(null);
  const [pending, startTransition] = useTransition();

  function loadMore() {
    setFailed(false);
    startTransition(async () => {
      try {
        const next = await loadMoreReviews(reviews.length);
        setReviews((prev) => {
          const seen = new Set(prev.map((r) => r.id));
          return [...prev, ...next.reviews.filter((r) => !seen.has(r.id))];
        });
        setHasMore(next.hasMore);
      } catch {
        setFailed(true);
      }
    });
  }

  if (reviews.length === 0) {
    return <p className="text-muted">ჯერ შეფასებები არ არის. იყავით პირველი!</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3" aria-live="polite" aria-busy={pending}>
        {reviews.map((review) => (
          <ReviewCard key={review.id} review={review} onOpen={() => setOpened(review)} />
        ))}
      </ul>
      <ReviewDialog review={opened} onClose={() => setOpened(null)} />
      {failed && (
        <p role="alert" className="text-center text-red-400">
          ვერ ჩაიტვირთა. სცადეთ თავიდან.
        </p>
      )}
      {hasMore && (
        <button
          type="button"
          onClick={loadMore}
          disabled={pending}
          className="mx-auto inline-flex min-h-12 items-center rounded-full border border-line px-7 font-semibold transition-colors hover:border-accent-ink hover:text-accent-ink disabled:opacity-60"
        >
          {pending ? "იტვირთება…" : "მეტის ნახვა"}
        </button>
      )}
    </div>
  );
}
