import { NEW_TAB_HINT } from "@/lib/a11y";
import type { PublicReview, ReviewStats } from "@/lib/content";
import { formatRating } from "@/lib/format";
import { GoogleIcon } from "./icons";
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
          <Stars
            rating={Math.round(stats.average)}
            label={`${formatRating(stats.average)} ვარსკვლავი 5-დან`}
            className="size-6"
          />
          <span className="text-muted">{stats.count} შეფასება</span>
        </div>
      )}

      <ReviewsList initial={reviews} initialHasMore={hasMore} />

      {googleReviewUrl && (
        <p className="mt-8 flex justify-center">
          <a
            href={googleReviewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-12 items-center gap-3 rounded-full border border-line bg-card px-6 font-semibold transition-colors hover:border-accent-ink"
          >
            <GoogleIcon className="size-5 shrink-0" />
            შეგვაფასეთ Google-ზე
            <span className="sr-only">{NEW_TAB_HINT}</span>
          </a>
        </p>
      )}

      <div id="review-form" className="mt-10 scroll-mt-24">
        <ReviewForm siteKey={turnstileSiteKey} />
      </div>
    </Section>
  );
}
