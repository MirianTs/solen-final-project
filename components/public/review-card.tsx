import type { PublicReview } from "@/lib/content";
import { Stars } from "./stars";

export function ReviewCard({ review }: { review: PublicReview }) {
  return (
    <li className="reveal flex flex-col gap-3 rounded-card border border-line bg-card p-5 lg:p-6 transition duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-[0_18px_50px_-20px_rgb(255_214_10/0.25)] motion-reduce:hover:translate-y-0">
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
