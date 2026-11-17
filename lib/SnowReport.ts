import { cacheLife } from "next/cache";
import type { MountainId } from "@/config/mountains";

// Each resort's own snow report, read from its public conditions page. None of
// them offers a data feed, so these readers depend on page markup and will need
// updating if a resort redesigns its site. A reader that can't find what it
// expects throws, and the page shows the report as unavailable.

const TZ = "America/Vancouver";
const USER_AGENT = "OpenPeaks/1.0 (snow report reader)";

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
  whistler: "https://www.whistlerblackcomb.com/the-mountain/mountain-conditions/snow-and-weather-report.aspx",
  sasquatch: "https://sasquatchmountain.ca/snow-report/",
  manning: "https://manningpark.com/weather-webcams-trail-stats/",
  baker: "https://www.mtbaker.us/snow-report/",
  // Mt. Cain has no report page, and Apex blocks automated checks, so both link to
  // the resort's home page.
  "mt-washington": "https://www.mountwashington.ca/the-mountain/snow-report/",
  "mt-cain": "https://www.mountcain.com",
  "big-white": "https://www.bigwhite.com/daily-snow-report",
  "silver-star": "https://www.skisilverstar.com/the-mountain/weather-conditions/snow-report-forecast/",
  "sun-peaks": "https://www.sunpeaksresort.com/ski-ride/weather-conditions-cams/weather-snow-report",
  apex: "https://www.apexresort.com",
  revelstoke: "https://www.revelstokemountainresort.com/mountain/conditions/snow-report/",
  "kicking-horse": "https://kickinghorseresort.com/conditions/snow-report/",
  red: "https://www.redresort.com/report/?snowreport",
  whitewater: "https://whitewatermountainresort.com/conditions/",
  panorama: "https://www.panoramaresort.com/panorama-today/daily-snow-report",
  kimberley: "https://skikimberley.com/conditions/snow-report/",
  fernie: "https://skifernie.com/conditions/snow-report/",
  castle: "https://www.skicastle.ca/snowreport/",
  nakiska: "https://skinakiska.com/conditions/snow-report/",
  sunshine: "https://www.skibanff.com/the-mountain/mountain-report/current-conditions",
  norquay: "https://banffnorquay.com/conditions/",
  "lake-louise": "https://www.skilouise.com/snow-conditions/",
  marmot: "https://www.skimarmot.com/news-snow-report/",
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

// The first number captured by `re` in `text`, or null.
const num = (text: string, re: RegExp) => {
  const m = text.match(re);
  return m ? Number(m[1]) : null;
};
const stats = (pairs: [string, number | null][]): Stat[] =>
  pairs.flatMap(([label, cm]) => (cm == null ? [] : [{ label, cm }]));

// A report this old is last season's, left up until the resort posts again.
const STALE_REPORT_MS = 14 * 24 * 3600 * 1000;

// Sunshine lists an upper and a mid-mountain report, label first:
// "Upper Mountain Snow Report Overnight 16 cm 6 in 24hr 16 cm … Base 45 cm …
// Mid Mountain Snow Report … Settled Base 29 cm".
async function sunshine(): Promise<SnowReport> {
  const url = REPORT_PAGES.sunshine;
  const text = pageText(await getPage(url));
  const upperAt = text.indexOf("Upper Mountain Snow Report");
  const midAt = text.indexOf("Mid Mountain Snow Report");
  if (upperAt === -1) throw new Error("snow report sunshine: report block not found");
  const upper = text.slice(upperAt, midAt > upperAt ? midAt : undefined);
  const mid = midAt === -1 ? "" : text.slice(midAt, midAt + 400);

  const depths = stats([
    ["Upper mountain", num(upper, /\bBase (\d+) cm/)],
    ["Mid mountain", num(mid, /Settled Base (\d+) cm/)],
  ]);
  if (depths.length === 0) return { status: "not-posted", url };
  return {
    status: "ok",
    depths,
    snowfall: stats([
      ["Overnight", num(upper, /Overnight (\d+) cm/)],
      ["24 hours", num(upper, /24hr (\d+) cm/)],
      ["7 days", num(upper, /7 Day (\d+) cm/)],
    ]),
    updated: text.match(/Current Conditions Updated: (.+?\d{1,2}:\d{2} [AP]M)/)?.[1] ?? null,
    url,
  };
}

// Whitewater lists the figures from its 1,950 m summit plot value first:
// "0 CM 24hr 11 CM 48hr 12 CM 3 Days 18 CM 7 Days 57 CM Total Snowfall 25 CM Current Base".
async function whitewater(): Promise<SnowReport> {
  const url = REPORT_PAGES.whitewater;
  const text = pageText(await getPage(url));
  const base = num(text, /(\d+) CM Current Base/);
  if (base == null) throw new Error("snow report whitewater: no base depth on the page");
  return {
    status: "ok",
    depths: [{ label: "Summit plot", cm: base }],
    snowfall: stats([
      ["24 hours", num(text, /(\d+) CM 24hr/)],
      ["48 hours", num(text, /(\d+) CM 48hr/)],
      ["7 days", num(text, /(\d+) CM 7 Days/)],
    ]),
    updated: text.match(/Updated on (.+? at \d{2}:\d{2})/)?.[1] ?? null,
    url,
  };
}

// Norquay puts each figure above its label: "35cm Upper Mountain" under the heading
// "Snow Base - Upper Mountain", and "2cm Last 24 Hours".
async function norquay(): Promise<SnowReport> {
  const url = REPORT_PAGES.norquay;
  const text = pageText(await getPage(url));
  const depths = stats([
    ["Upper mountain", num(text, /Snow Base - Upper Mountain (\d+) ?cm Upper Mountain/i)],
    ["Lower mountain", num(text, /Snow Base - Lower Mountain (\d+) ?cm Lower Mountain/i)],
  ]);
  if (depths.length === 0) throw new Error("snow report norquay: no base depths on the page");
  return {
    status: "ok",
    depths,
    snowfall: stats([
      ["Overnight", num(text, /(\d+) ?cm Overnight/i)],
      ["24 hours", num(text, /(\d+) ?cm Last 24 Hours/i)],
      ["7 days", num(text, /(\d+) ?cm Last 7 Days/i)],
    ]),
    updated: null, // Norquay doesn't timestamp its report
    url,
  };
}

// Castle lists value first ("12 cm Fresh Snow (24 hrs)", "80 cm Snow Base") and
// dates its report "Last updated: 2026-04-26 - 07:57 MT". It leaves the last
// report of the season up until the next, so an old date means none yet.
async function castle(): Promise<SnowReport> {
  const url = REPORT_PAGES.castle;
  const text = pageText(await getPage(url));
  const date = text.match(/Last updated: (\d{4}-\d{2}-\d{2}) - (\d{1,2}:\d{2}) ?MT/);
  if (!date) throw new Error("snow report castle: no update date on the page");
  if (Date.now() - Date.parse(`${date[1]}T12:00:00-07:00`) > STALE_REPORT_MS) {
    return { status: "not-posted", url };
  }
  const base = num(text, /(\d+) cm Snow Base/);
  if (base == null) throw new Error("snow report castle: no base depth on the page");
  return {
    status: "ok",
    depths: [{ label: "Base", cm: base }],
    snowfall: stats([
      ["24 hours", num(text, /(\d+) cm Fresh Snow \(24 hrs\)/)],
      ["7 days", num(text, /(\d+) cm Last 7 days/)],
    ]),
    updated: `${date[1]} ${date[2]} MT`,
    url,
  };
}

// Hills without a reader link to their resort's report instead.
const READERS: Partial<Record<MountainId, () => Promise<SnowReport>>> = {
  // Cypress loads its numbers in the browser from a feed behind its site, so
  // they aren't in the page HTML. Link to its report until there's a reader.
  cypress: async () => ({ status: "unsupported", url: REPORT_PAGES.cypress }),
  grouse,
  seymour,
  // No readers yet; link to each resort's report.
  whistler: async () => ({ status: "unsupported", url: REPORT_PAGES.whistler }),
  sasquatch: async () => ({ status: "unsupported", url: REPORT_PAGES.sasquatch }),
  manning: async () => ({ status: "unsupported", url: REPORT_PAGES.manning }),
  baker: async () => ({ status: "unsupported", url: REPORT_PAGES.baker }),
  sunshine,
  whitewater,
  norquay,
  castle,
};

// The resort's own snow report, or null outside the snow season (without
// fetching anything).
export async function getSnowReport(id: MountainId): Promise<SnowReport | null> {
  "use cache";
  // Resorts update once or twice a day, usually early morning.
  cacheLife({ stale: 300, revalidate: 1800, expire: 3 * 3600 });

  if (!isSnowSeason(new Date())) return null;
  const read = READERS[id];
  return read ? read() : { status: "unsupported", url: REPORT_PAGES[id] };
}
