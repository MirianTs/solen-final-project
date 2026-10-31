import type { PublicReview } from "@/lib/content";
import { Stars } from "./stars";

export function ReviewCard({ review }: { review: PublicReview }) {
  return (
    <li className="flex flex-col gap-3 rounded-card border border-line bg-card p-5">
      <div className="flex items-center justify-between gap-3">
        <Stars rating={review.rating} />
        <time dateTime={review.created_at} className="text-sm text-muted">
          {review.dateLabel}
        </time>
      </div>
      {review.comment && <p className="leading-relaxed whitespace-pre-line">{review.comment}</p>}
      <p className="mt-auto font-semibold text-muted">— {review.name}</p>
    </li>
  );
}
