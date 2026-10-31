import type { PublicReview, ReviewStats } from "@/lib/content";
import { formatRating } from "@/lib/format";
import { ReviewForm } from "./review-form";
import { ReviewsList } from "./reviews-list";
import { Section } from "./section";
import { Stars } from "./stars";

type Props = {
  title: string;
  stats: ReviewStats;
  reviews: PublicReview[];
  hasMore: boolean;
  googleReviewUrl: string | null;
  turnstileSiteKey: string;
};

export function ReviewsSection({ title, stats, reviews, hasMore, googleReviewUrl, turnstileSiteKey }: Props) {
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
            className="font-semibold text-accent-ink underline-offset-4 hover:underline"
          >
            შეგვაფასეთ Google-ზე
          </a>
        </p>
      )}

      <div id="review-form" className="mt-10 scroll-mt-24">
        <ReviewForm siteKey={turnstileSiteKey} />
      </div>
    </Section>
  );
}
