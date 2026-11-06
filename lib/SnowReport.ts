import { cacheLife } from "next/cache";
import type { MountainId } from "@/config/mountains";

// Each resort's own snow report, read from its public conditions page. None of
// them offers a data feed, so these readers depend on page markup and will need
// updating if a resort redesigns its site. A reader that can't find what it
// expects throws, and the page shows the report as unavailable.

const TZ = "America/Vancouver";
const USER_AGENT = "NorthShorePeaks/1.0 (snow report reader)";

// Months (1–12, Vancouver time) when the snow report is shown.
export const SNOW_SEASON_MONTHS = [11, 12, 1, 2, 3, 4];

export interface Stat {
  label: string;
  cm: number;
}

export type SnowReport =
  | {
      status: "ok";
      depths: Stat[]; // e.g. Peak and Plateau, or Summit and Base
      snowfall: Stat[]; // recent new snow, e.g. 24 hours, 48 hours, 7 days
      updated: string | null; // as the resort words it
      url: string;
    }
  // The resort hasn't published a report yet this season.
  | { status: "not-posted"; url: string }
  // No reader for this resort yet; link to its report instead.
  | { status: "unsupported"; url: string };

export const REPORT_PAGES: Record<MountainId, string> = {
  cypress: "https://www.cypressmountain.com/mountain-report",
  grouse: "https://www.grousemountain.com/current_conditions",
  seymour: "https://mtseymour.ca/the-mountain/todays-conditions-hours",
};

export function isSnowSeason(now: Date) {
  const month = Number(
    new Intl.DateTimeFormat("en-CA", { timeZone: TZ, month: "numeric" }).format(now)
  );
  return SNOW_SEASON_MONTHS.includes(month);
}

async function getPage(url: string) {
  const res = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
  if (!res.ok) throw new Error(`snow report ${url}: ${res.status} ${res.statusText}`);
  return res.text();
}

const decode = (s: string) =>
  s
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#0?39;/g, "'");

// Page text with tags, scripts and styles stripped and whitespace collapsed.
const pageText = (htmlSrc: string) =>
  decode(
    htmlSrc
      .replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, " ")
      .replace(/<!--[\s\S]*?-->/g, " ")
      .replace(/<[^>]+>/g, " ")
  )
    .replace(/\s+/g, " ")
    .trim();

function pick(found: Map<string, number>, wanted: [string, string][]): Stat[] {
  return wanted.flatMap(([key, label]) => {
    const cm = found.get(key.toLowerCase());
    return cm == null ? [] : [{ label, cm }];
  });
}

// Seymour renders each stat as "<value> cm <label>", e.g. "45 cm At The Base".
async function seymour(): Promise<SnowReport> {
  const url = REPORT_PAGES.seymour;
  const text = pageText(await getPage(url));

  const found = new Map<string, number>();
  for (const m of Array.from(
    text.matchAll(
      /(\d+(?:\.\d+)?) cm (24hr Snowfall|48hr Snowfall|7 Day Snowfall|At The Summit|At The Base)/gi
    )
  )) {
    found.set(m[2].toLowerCase(), Number(m[1]));
  }

  const depths = pick(found, [
    ["At The Summit", "Summit"],
    ["At The Base", "Base"],
  ]);
  if (depths.length === 0) throw new Error("snow report seymour: no depths on the page");

  const updated = text.match(/Last Updated: (.+?@ ?\d{1,2}:\d{2} ?[ap]m)/i)?.[1] ?? null;

  return {
    status: "ok",
    depths,
    snowfall: pick(found, [
      ["24hr Snowfall", "24 hours"],
      ["48hr Snowfall", "48 hours"],
      ["7 Day Snowfall", "7 days"],
    ]),
    updated,
    url,
  };
}

// Grouse renders "<p>Depth Peak</p><h3 class='metric'>150cm</h3>" inside a
// conditions-snow-report block that is empty until the season's first report.
async function grouse(): Promise<SnowReport> {
  const url = REPORT_PAGES.grouse;
  const page = await getPage(url);

  const start = page.indexOf("conditions-snow-report__content");
  if (start === -1) throw new Error("snow report grouse: report block not found");
  // The block ends where the announcements begin.
  const end = page.indexOf("conditions-alert", start);
  const block = page.slice(start, end === -1 ? undefined : end);

  const found = new Map<string, number>();
  for (const m of Array.from(
    block.matchAll(
      /<p>\s*([^<]+?)\s*<\/p>\s*<h3 class=['"]metric['"]>\s*(\d+(?:\.\d+)?)\s*cm/gi
    )
  )) {
    found.set(decode(m[1]).toLowerCase(), Number(m[2]));
  }

  // An empty block, or one without depths, means nothing is posted yet.
  const depths = pick(found, [
    ["Depth Peak", "Peak"],
    ["Depth Plateau", "Plateau"],
  ]);
  if (depths.length === 0) return { status: "not-posted", url };

  return {
    status: "ok",
    depths,
    snowfall: pick(found, [
      ["24hrs", "24 hours"],
      ["48hrs", "48 hours"],
      ["Seven Days", "7 days"],
    ]),
    updated: null, // Grouse doesn't timestamp its report
    url,
  };
}

const READERS: Record<MountainId, () => Promise<SnowReport>> = {
  // Cypress loads its numbers in the browser from a feed behind its site, so
  // they aren't in the page HTML. Link to its report until there's a reader.
  cypress: async () => ({ status: "unsupported", url: REPORT_PAGES.cypress }),
  grouse,
  seymour,
};

// The resort's own snow report, or null outside the snow season (without
// fetching anything).
export async function getSnowReport(id: MountainId): Promise<SnowReport | null> {
  "use cache";
  // Resorts update once or twice a day, usually early morning.
  cacheLife({ stale: 300, revalidate: 1800, expire: 3 * 3600 });

  if (!isSnowSeason(new Date())) return null;
  return READERS[id]();
}
