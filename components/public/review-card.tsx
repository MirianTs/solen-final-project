import type { PublicReview } from "@/lib/content";
import { CARD_HOVER } from "./card-styles";
import { Stars } from "./stars";

/** Review tile: the comment is cut to 4 lines; the whole card opens the full review (see ReviewDialog). */
export function ReviewCard({ review, onOpen }: { review: PublicReview; onOpen: () => void }) {
  return (
    <li className="reveal">
      <button
        type="button"
        onClick={onOpen}
        aria-label={`${review.name}-ის შეფასების სრულად ნახვა`}
        className={`flex size-full flex-col gap-3 rounded-card border border-line bg-card p-5 text-left lg:p-6 ${CARD_HOVER}`}
      >
        <span className="flex w-full items-center justify-between gap-3">
          <Stars rating={review.rating} />
          <time dateTime={review.created_at} className="text-sm text-muted">
            {review.dateLabel}
          </time>
        </span>
        {review.comment && <span className="line-clamp-4 leading-relaxed whitespace-pre-line">{review.comment}</span>}
        <span className="mt-auto flex w-full items-center justify-between gap-3">
          <span className="font-semibold text-muted">— {review.name}</span>
          <span className="text-sm font-semibold text-accent-ink">სრულად →</span>
        </span>
      </button>
    </li>
  );
}
