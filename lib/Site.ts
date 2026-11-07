import type { MountainConfig } from "@/config/mountains";

export const SITE_NAME = "North Shore Peaks";

// Absolute site URL for canonical links, the sitemap and social previews.
// Set NEXT_PUBLIC_SITE_URL once you have a custom domain. Until then, Vercel's
// production domain is used, which Vercel provides automatically on every build.
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000")
).replace(/\/$/, "");

// A page's openGraph replaces the layout's rather than merging with it, so
// each page spreads these in.
export const OPEN_GRAPH = {
  type: "website",
  siteName: SITE_NAME,
  locale: "en_CA",
} as const;

export const HOME_TITLE = "North Shore Ski Conditions: Cypress, Grouse & Seymour";
export const HOME_DESCRIPTION =
  "Live ski conditions for Vancouver's North Shore: snow depth, webcams, freezing level and the rain-or-snow line for Cypress Mountain, Grouse Mountain and Mount Seymour.";

export const mountainTitle = (m: MountainConfig) =>
  `${m.fullName} Snow Report, Webcams & Conditions`;

export const mountainDescription = (m: MountainConfig) =>
  `${m.fullName} conditions today: snow depth, live webcams, freezing level, and whether it's raining or snowing at each lift. Updated every 15 minutes.`;

// JSON-LD for a <script type="application/ld+json">, with "<" escaped so
// nothing in it can close the script tag.
export const jsonLd = (data: object) =>
  JSON.stringify(data).replace(/</g, "\\u003c");
