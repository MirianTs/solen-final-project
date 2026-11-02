import type { Metadata } from "next";
import { preconnect } from "react-dom";
import { ContactSection } from "@/components/public/contact-section";
import { Hero } from "@/components/public/hero";
import { ReviewsSection } from "@/components/public/reviews-section";
import { ServicesPrices } from "@/components/public/services-prices";
import { SiteFooter } from "@/components/public/site-footer";
import { SiteHeader } from "@/components/public/site-header";
import { buildContactLinks, safeHttpUrl } from "@/lib/contact";
import { getSiteContent } from "@/lib/content";
import { publicEnv } from "@/lib/env";
import { buildBusinessJsonLd, buildHomeMetadata } from "@/lib/seo";
import { THEME_SCRIPT } from "@/lib/theme";

// Static page, revalidated on every admin save (revalidatePath('/')) and hourly as a safety net.
export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  return buildHomeMetadata(await getSiteContent());
}

export default async function Home() {
  const content = await getSiteContent();
  const { texts, settings, photos } = content;
  // Photos are served from Supabase Storage (another origin): open the connection early for the banner.
  preconnect(publicEnv().NEXT_PUBLIC_SUPABASE_URL);
  const links = buildContactLinks(settings);
  const address = settings.address_text?.trim() ?? "";

  const jsonLd = buildBusinessJsonLd(content);

  return (
    <>
      {/* First in <body>: sets the light/dark theme before anything paints. */}
      <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      <script
        type="application/ld+json"
        // Escape "<" so content from the database can never close the script tag.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <a
        href="#main"
        className="sr-only z-50 rounded-full bg-accent px-4 py-2 font-bold text-black focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
      >
        მთავარ შიგთავსზე გადასვლა
      </a>
      <SiteHeader links={links} />
      <main id="main" className="flex flex-col">
        <Hero slogan={texts.hero_slogan} banner={photos.banner} tel={links.tel} stats={content.stats} />
        <ServicesPrices title={texts.services_title} note={texts.prices_note} columns={content.columns} />
        <ReviewsSection
          title={texts.reviews_title}
          stats={content.stats}
          reviews={content.reviews}
          hasMore={content.hasMoreReviews}
          googleReviewUrl={safeHttpUrl(settings.google_review_url)}
          turnstileSiteKey={publicEnv().NEXT_PUBLIC_TURNSTILE_SITE_KEY}
        />
        <ContactSection title={texts.contact_title} text={texts.contact_text} address={address} links={links} />
      </main>
      <SiteFooter text={texts.footer_text} links={links} address={address} />
    </>
  );
}
