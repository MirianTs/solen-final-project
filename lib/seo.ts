import "server-only";
import type { Metadata } from "next";
import { digitsOnly, safeHttpUrl } from "@/lib/contact";
import type { SiteContent } from "@/lib/content";
import { publicEnv } from "@/lib/env";

export const SITE_NAME = "Solen";
const DEFAULT_TITLE = "Solen — გათბობა, რადიატორები და კონდიციონერები თბილისში";
const DEFAULT_DESCRIPTION =
  "გაზის ქვაბების, რადიატორებისა და კონდიციონერების მონტაჟი, შეკეთება და მომსახურება თბილისში. სწრაფად და გარანტიით.";

export function siteUrl(): string {
  return publicEnv().NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
}

function description(content: SiteContent): string {
  const slogan = content.texts.hero_slogan?.trim();
  return slogan && slogan.length >= 40 ? slogan.slice(0, 160) : DEFAULT_DESCRIPTION;
}

/** og slot, falling back to the banner. */
function shareImage(content: SiteContent) {
  return content.photos.og ?? content.photos.banner;
}

export function buildHomeMetadata(content: SiteContent): Metadata {
  const desc = description(content);
  const image = shareImage(content);
  const images = image ? [{ url: image.url, width: image.width, height: image.height, alt: image.alt || SITE_NAME }] : [];

  return {
    title: { absolute: DEFAULT_TITLE },
    description: desc,
    alternates: { canonical: "/" },
    openGraph: {
      type: "website",
      locale: "ka_GE",
      url: "/",
      siteName: SITE_NAME,
      title: DEFAULT_TITLE,
      description: desc,
      images,
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title: DEFAULT_TITLE,
      description: desc,
      images: image ? [image.url] : [],
    },
  };
}

/** schema.org HVACBusiness. aggregateRating is omitted when there are no approved reviews. */
export function buildBusinessJsonLd(content: SiteContent) {
  const { settings, stats } = content;
  const phone = digitsOnly(settings.phone);
  const image = shareImage(content);
  const url = siteUrl();
  const sameAs = [safeHttpUrl(settings.facebook_url), safeHttpUrl(settings.maps_url)].filter((u): u is string => !!u);

  return {
    "@context": "https://schema.org",
    "@type": "HVACBusiness",
    name: SITE_NAME,
    description: description(content),
    url,
    logo: `${url}/brand/solen-icon-512.png`,
    ...(image && { image: image.url }),
    ...(phone && { telephone: `+${phone}` }),
    address: {
      "@type": "PostalAddress",
      ...(settings.address_text?.trim() && { streetAddress: settings.address_text.trim() }),
      addressLocality: "Tbilisi",
      addressCountry: "GE",
    },
    areaServed: { "@type": "City", name: "Tbilisi" },
    ...(sameAs.length > 0 && { sameAs }),
    ...(stats.count > 0 && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: stats.average.toFixed(1),
        reviewCount: stats.count,
        bestRating: 5,
        worstRating: 1,
      },
    }),
  };
}

export { DEFAULT_DESCRIPTION, DEFAULT_TITLE };
