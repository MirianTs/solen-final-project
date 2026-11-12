import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/seo";

/** /sitemap.xml: the site has a single public page; its URL follows NEXT_PUBLIC_SITE_URL. */
export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: `${siteUrl()}/`, lastModified: new Date(), changeFrequency: "weekly", priority: 1 }];
}
