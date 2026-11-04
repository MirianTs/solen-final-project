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
  const hasSlogan = Boolean(slogan.trim());

  return (
    <section id="top" aria-labelledby="hero-title" className="container-site pt-3 md:pt-8">
      <div className="theme-dark relative isolate overflow-hidden rounded-card border border-line bg-card">
        {banner ? (
          // Shown whole at its own aspect ratio on every screen: banners often carry text, so never crop them.
          <div className="relative overflow-hidden">
            <Image
              src={banner.url}
              alt={banner.alt}
              width={banner.width}
              height={banner.height}
              preload
              loading="eager"
              fetchPriority="high"
              sizes="(min-width: 1536px) 1376px, (min-width: 1280px) 1216px, 100vw"
              className="anim-zoom block h-auto w-full"
            />
          </div>
        ) : (
          <>
            {/* No photo yet: a slowly drifting yellow glow keeps the hero alive. */}
            <div aria-hidden className="absolute inset-0 -z-10 overflow-hidden">
              <div className="anim-glow absolute -top-1/3 -right-1/4 aspect-square w-[85%] rounded-full bg-accent/25 blur-3xl md:w-[60%]" />
              <div className="anim-glow absolute -bottom-1/2 -left-1/4 aspect-square w-[60%] rounded-full bg-accent-hover/10 blur-3xl [animation-direction:alternate-reverse]" />
            </div>
            <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-black via-black/55 to-black/5" />
          </>
        )}

        <div
          className={
            banner
              ? // With a photo: always under it, so the yellow button never sits on a yellow banner.
                "flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:px-8 sm:py-5 lg:px-10"
              : "flex min-h-[23rem] flex-col justify-end gap-6 p-5 sm:min-h-[26rem] sm:p-10 md:min-h-[32rem] md:p-14 lg:min-h-[36rem] 2xl:min-h-[40rem]"
          }
        >
          {hasSlogan ? (
            <h1
              id="hero-title"
              className={`anim-rise max-w-4xl leading-[1.18] font-extrabold text-balance [overflow-wrap:anywhere] ${
                banner
                  ? "text-2xl sm:text-3xl lg:text-4xl"
                  : "text-[1.75rem] min-[400px]:text-[2rem] sm:text-5xl lg:text-6xl 2xl:text-7xl"
              }`}
            >
              {slogan}
            </h1>
          ) : (
            // Slogan cleared in the admin: nothing on screen, but the page keeps its h1.
            <h1 id="hero-title" className="sr-only">
              Solen — გათბობა და კონდიციონერები
            </h1>
          )}
          {tel && (
            <a
              href={tel}
              className={`anim-fade-up anim-delay-1 anim-ring inline-flex min-h-13 items-center gap-2 rounded-full ${banner ? "w-full justify-center sm:w-fit sm:shrink-0" : "w-fit"} bg-accent px-8 text-lg font-bold text-black transition hover:scale-[1.03] hover:bg-accent-hover hover:shadow-[0_0_32px_rgb(255_214_10/0.35)] motion-reduce:hover:scale-100 lg:min-h-14 lg:px-10 lg:text-xl`}
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
    <div className="anim-fade-up anim-delay-2 mt-3 flex items-center justify-between gap-3 rounded-2xl border border-line bg-card px-4 py-3 sm:px-6 lg:py-4">
      {stats.count > 0 ? (
        <a href="#reviews" className="flex items-center gap-2 font-semibold transition-colors hover:text-accent-ink">
          <span className="text-lg font-bold lg:text-xl">{formatRating(stats.average)}</span>
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
        className="inline-flex min-h-11 shrink-0 items-center rounded-full border border-accent-ink px-5 font-semibold text-accent-ink transition-colors hover:bg-accent hover:text-black"
      >
        შეაფასე
      </a>
    </div>
  );
}
