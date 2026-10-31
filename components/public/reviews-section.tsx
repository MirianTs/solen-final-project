import type { PublicReview, ReviewStats } from "@/lib/content";
import { formatRating } from "@/lib/format";
import { ReviewsList } from "./reviews-list";
import { Section } from "./section";
import { Stars } from "./stars";

type Props = {
  title: string;
  stats: ReviewStats;
  reviews: PublicReview[];
  hasMore: boolean;
  googleReviewUrl: string | null;
};

export function ReviewsSection({ title, stats, reviews, hasMore, googleReviewUrl }: Props) {
  return (
    <Section id="reviews" title={title}>
      {stats.count > 0 && (
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <span className="text-4xl font-extrabold">{formatRating(stats.average)}</span>
          <Stars rating={Math.round(stats.average)} className="size-6" />
          <span className="text-muted">{stats.count} შეფასება</span>
        </div>
      )}

      <ReviewsList initial={reviews} initialHasMore={hasMore} />

      {googleReviewUrl && (
        <p className="mt-6 text-center">
          <a
            href={googleReviewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-accent underline-offset-4 hover:underline"
          >
            შეგვაფასეთ Google-ზე
          </a>
        </p>
      )}

      {/* Review form (Turnstile + anti-spam) is added in Phase 6. */}
      <div id="review-form" className="mt-10 scroll-mt-24" />
    </Section>
  );
}
