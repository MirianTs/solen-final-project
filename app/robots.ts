import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/seo";

/** /robots.txt: everything except the admin panel (which also sends noindex itself) may be crawled. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: "/admin" }],
    sitemap: `${siteUrl()}/sitemap.xml`,
  };
}
