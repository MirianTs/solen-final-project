import { ContactSection } from "@/components/public/contact-section";
import { FeatureBlocks, type FeatureBlock } from "@/components/public/feature-blocks";
import { Hero } from "@/components/public/hero";
import { Prices } from "@/components/public/prices";
import { ReviewsSection } from "@/components/public/reviews-section";
import { SiteFooter } from "@/components/public/site-footer";
import { SiteHeader } from "@/components/public/site-header";
import { buildContactLinks, safeHttpUrl } from "@/lib/contact";
import { getSiteContent } from "@/lib/content";

// Static page, revalidated on every admin save (revalidatePath('/')) and hourly as a safety net.
export const revalidate = 3600;

export default async function Home() {
  const content = await getSiteContent();
  const { texts, settings, photos } = content;
  const links = buildContactLinks(settings);
  const address = settings.address_text?.trim() ?? "";

  const blocks: FeatureBlock[] = (["p1", "p2", "p3", "p4"] as const).map((slot) => ({
    key: slot,
    title: texts[`${slot}_title`] ?? "",
    text: texts[`${slot}_text`] ?? "",
    photo: photos[slot],
  }));

  return (
    <>
      <a
        href="#main"
        className="sr-only z-50 rounded-full bg-accent px-4 py-2 font-bold text-black focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
      >
        მთავარ შიგთავსზე გადასვლა
      </a>
      <SiteHeader links={links} />
      <main id="main" className="flex flex-col">
        <Hero slogan={texts.hero_slogan} banner={photos.banner} tel={links.tel} stats={content.stats} />
        <Prices title={texts.prices_title} columns={content.columns} />
        <FeatureBlocks title={texts.services_title} blocks={blocks} />
        <ReviewsSection
          title={texts.reviews_title}
          stats={content.stats}
          reviews={content.reviews}
          hasMore={content.hasMoreReviews}
          googleReviewUrl={safeHttpUrl(settings.google_review_url)}
        />
        <ContactSection title={texts.contact_title} text={texts.contact_text} address={address} links={links} />
      </main>
      <SiteFooter text={texts.footer_text} phoneDisplay={links.phoneDisplay} tel={links.tel} address={address} />
    </>
  );
}
