import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/Site";

export default function robots(): MetadataRoute.Robots {
  // Keep Vercel preview deployments out of search results; only production is indexed.
  const isPreview =
    process.env.VERCEL_ENV != null && process.env.VERCEL_ENV !== "production";

  return isPreview
    ? { rules: { userAgent: "*", disallow: "/" } }
    : {
        rules: { userAgent: "*", allow: "/" },
        sitemap: `${SITE_URL}/sitemap.xml`,
      };
}
