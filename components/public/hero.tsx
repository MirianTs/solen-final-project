import Image from "next/image";
import type { Photo, ReviewStats } from "@/lib/content";
import { formatRating } from "@/lib/format";
import { PhoneIcon, StarIcon } from "./icons";

type Props = {
  slogan: string;
  banner?: Photo;
  tel: string | null;
  stats: ReviewStats;
};

export function Hero({ slogan, banner, tel, stats }: Props) {
  return (
    <section id="top" aria-labelledby="hero-title" className="mx-auto w-full max-w-6xl px-4 pt-4 md:pt-8">
      <div className="relative isolate overflow-hidden rounded-card border border-line bg-card">
        {banner ? (
          <Image
            src={banner.url}
            alt={banner.alt}
            width={banner.width}
            height={banner.height}
            preload
            loading="eager"
            fetchPriority="high"
            sizes="(min-width: 1152px) 1152px, 100vw"
            className="absolute inset-0 -z-10 size-full object-cover"
          />
        ) : (
          <div
            aria-hidden
            className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,rgba(255,214,10,0.25),transparent_60%)]"
          />
        )}
        {/* Darkens the photo so the slogan stays readable. */}
        <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-black via-black/60 to-black/10" />

        <div className="flex min-h-[19rem] flex-col justify-end gap-5 p-5 sm:min-h-[24rem] sm:p-8 md:min-h-[30rem] md:p-12">
          <h1 id="hero-title" className="max-w-3xl text-3xl font-extrabold leading-tight text-balance sm:text-4xl md:text-5xl">
            {slogan}
          </h1>
          {tel && (
            <a
              href={tel}
              className="inline-flex min-h-12 w-fit items-center gap-2 rounded-full bg-accent px-7 text-lg font-bold text-black transition-colors hover:bg-accent-hover"
            >
              <PhoneIcon className="size-5" />
              დარეკე
            </a>
          )}
        </div>
      </div>

      <RatingStrip stats={stats} />
    </section>
  );
}

function RatingStrip({ stats }: { stats: ReviewStats }) {
  return (
    <div className="mt-3 flex items-center justify-between gap-3 rounded-2xl border border-line bg-card px-4 py-3">
      {stats.count > 0 ? (
        <a href="#reviews" className="flex items-center gap-2 font-semibold hover:text-accent">
          <span className="text-lg font-bold">{formatRating(stats.average)}</span>
          <StarIcon className="size-5 text-accent" />
          <span aria-hidden className="text-muted">
            ·
          </span>
          <span className="text-muted">{stats.count} შეფასება</span>
        </a>
      ) : (
        <span className="text-muted">გაგვიზიარეთ თქვენი აზრი</span>
      )}
      <a
        href="#review-form"
        className="inline-flex min-h-11 shrink-0 items-center rounded-full border border-accent px-5 font-semibold text-accent transition-colors hover:bg-accent hover:text-black"
      >
        შეაფასე
      </a>
    </div>
  );
}
