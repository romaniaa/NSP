import type { MountainConfig } from "@/config/mountains";
import { WEBCAMS } from "@/config/webcams";

export const SITE_NAME = "OpenPeaks";

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

export const HOME_TITLE = "Ski Conditions in BC & the Rockies";
export const HOME_DESCRIPTION =
  "Live ski conditions for 26 hills and 8 backcountry zones in BC and the Rockies, from the North Shore and Whistler to the Okanagan, Kootenays and Banff: temperature, snow depth, freezing level, the rain-or-snow line and avalanche danger. Updated hourly.";

// Only claim webcams where the page embeds them.
const hasCams = (m: MountainConfig) => (WEBCAMS[m.id]?.cams.length ?? 0) > 0;

export const mountainTitle = (m: MountainConfig) =>
  hasCams(m)
    ? `${m.fullName} Snow Report, Webcams & Conditions`
    : `${m.fullName} Conditions: Rain or Snow & Freezing Level`;

export const mountainDescription = (m: MountainConfig) =>
  hasCams(m)
    ? `${m.fullName} conditions today and a 7-day forecast: snow depth, live webcams, new snow, freezing level, and whether it's raining or snowing at each lift. Updated hourly.`
    : `${m.fullName} conditions today and a 7-day forecast: new snow, freezing level, temperature and whether it's raining or snowing at each lift. Updated hourly.`;

// JSON-LD for a <script type="application/ld+json">, with "<" escaped so
// nothing in it can close the script tag.
export const jsonLd = (data: object) =>
  JSON.stringify(data).replace(/</g, "\\u003c");
