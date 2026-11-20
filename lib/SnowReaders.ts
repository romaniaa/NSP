import type { MountainId } from "@/config/mountains";

// Each resort's own snow report. Some resorts publish a data feed behind their
// site (Cypress, Silver Star, RED and the RCR resorts), which these read
// directly; the rest are read from the conditions page's markup and will need
// updating if a resort redesigns its site. A reader that can't find what it
// expects throws, and the page shows the report as unavailable.
//
// Kept free of Next imports so `npm run snow:check` can run them on their own.

const TZ = "America/Vancouver";
const USER_AGENT = "OpenPeaks/1.0 (snow report reader)";

export interface Stat {
  label: string;
  cm: number;
}

export type SnowReport =
  | {
      status: "ok";
      depths: Stat[]; // highest first, e.g. Peak and Plateau, or Alpine and Mid mountain
      snowfall: Stat[]; // recent new snow, e.g. 24 hours, 48 hours, 7 days
      updated: string | null; // as the resort words it
      url: string;
      // Set when the resort couldn't be read just now and this is the last report
      // read from it, at this time (see lib/SnowStore.ts).
      saved?: string;
    }
  // The resort hasn't published a report yet this season.
  | { status: "not-posted"; url: string }
  // No reader for this resort; link to its report instead.
  | { status: "unsupported"; url: string };

// The page each card links to: the resort's own report, for people to read.
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

async function get(url: string) {
  const res = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
  if (!res.ok) throw new Error(`snow report ${url}: ${res.status} ${res.statusText}`);
  return res;
}
const getPage = async (url: string) => (await get(url)).text();
const getJson = async <T>(url: string): Promise<T> => (await get(url)).json() as Promise<T>;

const decode = (s: string) =>
  s
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#0?39;/g, "'")
    .replace(/&#8211;|&ndash;/g, "–")
    .replace(/&Prime;/g, "″");

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

// The first number captured by `re` in `text`, or null.
const num = (text: string, re: RegExp) => {
  const m = text.match(re);
  return m ? Number(m[1]) : null;
};
// A feed value, which may be a number, a numeric string, or blank.
const feedNum = (v: unknown) => {
  if (v == null || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};
const stats = (pairs: [string, number | null][]): Stat[] =>
  pairs.flatMap(([label, cm]) => (cm == null ? [] : [{ label, cm }]));

// A report this old is last season's, left up until the resort posts again.
const STALE_REPORT_MS = 14 * 24 * 3600 * 1000;
const isStale = (at: number) => Number.isFinite(at) && Date.now() - at > STALE_REPORT_MS;

// A feed's timestamp, worded like the resorts' own, in the resort's time zone.
export const fmtTime = (at: number, timeZone: string) =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone,
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(at);

function ok(url: string, depths: Stat[], snowfall: Stat[], updated: string | null): SnowReport {
  return { status: "ok", depths, snowfall, updated, url };
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

  return ok(
    url,
    depths,
    pick(found, [
      ["24hr Snowfall", "24 hours"],
      ["48hr Snowfall", "48 hours"],
      ["7 Day Snowfall", "7 days"],
    ]),
    text.match(/Last Updated: (.+?@ ?\d{1,2}:\d{2} ?[ap]m)/i)?.[1] ?? null
  );
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

  return ok(
    url,
    depths,
    pick(found, [
      ["24hrs", "24 hours"],
      ["48hrs", "48 hours"],
      ["Seven Days", "7 days"],
    ]),
    null // Grouse doesn't timestamp its report
  );
}

// Cypress's site loads its report from a ReportPal feed, one entry per area
// (Cypress Base, Mid Mountain, Nordic) with figures in inches and centimetres.
interface ReportPalAmount {
  centimeters?: string | number | null;
}
interface ReportPalLocation {
  name: string;
  elevation?: { meters?: number };
  base?: ReportPalAmount | null;
  snowOverNight?: ReportPalAmount | null;
  snow24Hours?: ReportPalAmount | null;
  snow48Hours?: ReportPalAmount | null;
  snow7Days?: ReportPalAmount | null;
}
async function cypress(timeZone: string): Promise<SnowReport> {
  const url = REPORT_PAGES.cypress;
  const feed = await getJson<{
    updated?: string;
    currentConditions?: { resortLocations?: { location?: ReportPalLocation[] } };
  }>("https://www.cypressmountain.com/api/reportpal?resortName=cypress&useReportPal=true");
  const locations = feed.currentConditions?.resortLocations?.location;
  if (!locations?.length) throw new Error("snow report cypress: no locations in the feed");

  // Alpine areas only, highest first.
  const alpine = locations
    .filter((l) => !/nordic/i.test(l.name))
    .sort((a, b) => (b.elevation?.meters ?? 0) - (a.elevation?.meters ?? 0));
  // "Cypress Base" and "Mid Mountain" read as "Base" and "Mid mountain".
  const label = (name: string) => {
    const s = name.replace(/^Cypress /, "").toLowerCase();
    return s.charAt(0).toUpperCase() + s.slice(1);
  };
  const depths = stats(alpine.map((l) => [label(l.name), feedNum(l.base?.centimeters)]));
  const top = alpine[0];
  const updatedAt = feed.updated ? Date.parse(feed.updated) : NaN;

  return ok(
    url,
    depths,
    stats([
      ["Overnight", feedNum(top?.snowOverNight?.centimeters)],
      ["24 hours", feedNum(top?.snow24Hours?.centimeters)],
      ["48 hours", feedNum(top?.snow48Hours?.centimeters)],
      ["7 days", feedNum(top?.snow7Days?.centimeters)],
    ]),
    Number.isFinite(updatedAt) ? fmtTime(updatedAt, timeZone) : null
  );
}

// Baker tags each figure by class, in inches and centimetres:
// <span class="conditions-stat_metric_base_pan unit-m">20<span>cm</span></span>.
async function baker(): Promise<SnowReport> {
  const url = REPORT_PAGES.baker;
  const page = await getPage(url);
  const stat = (key: string) => num(page, new RegExp(`conditions-stat_metric_${key}\\b[^>]*>\\s*(\\d+(?:\\.\\d+)?)`));

  const depths = stats([
    ["Pan Dome", stat("base_pan")],
    ["Heather Meadows", stat("base_hm")],
  ]);
  if (depths.length === 0 && !page.includes("conditions-stat_metric_base")) {
    throw new Error("snow report baker: no base depths on the page");
  }
  return ok(
    url,
    depths,
    stats([
      ["24 hours", stat("snow_24")],
      ["48 hours", stat("snow_48")],
    ]),
    null // Baker doesn't timestamp the figures
  );
}

// Sasquatch's page loads its report from an admin-ajax fragment:
// "Past 24 Hours 0 cm … Snow Depth 120 cm Last updated: 29/03/2026 9:27 am".
// Before its first report it shows "- cm" and last season's date.
async function sasquatch(): Promise<SnowReport> {
  const url = REPORT_PAGES.sasquatch;
  const text = pageText(
    await getPage("https://sasquatchmountain.ca/newsite/wp-admin/admin-ajax.php?action=load_snow_report")
  );
  if (!text.includes("Snow Depth")) throw new Error("snow report sasquatch: no snow depth in the report");

  const date = text.match(/Last updated: (\d{1,2})\/(\d{1,2})\/(\d{4}) (\d{1,2}:\d{2} ?[ap]m)/i);
  if (date && isStale(Date.parse(`${date[3]}-${date[2].padStart(2, "0")}-${date[1].padStart(2, "0")}T12:00:00-08:00`))) {
    return { status: "not-posted", url };
  }
  const depth = num(text, /Snow Depth (\d+(?:\.\d+)?) ?cm/);
  if (depth == null) return { status: "not-posted", url };

  return ok(
    url,
    // Measured at the alpine weather plot, per the resort.
    [{ label: "Alpine plot", cm: depth }],
    stats([
      ["12 hours", num(text, /Past 12 Hours (\d+(?:\.\d+)?) ?cm/)],
      ["24 hours", num(text, /Past 24 Hours (\d+(?:\.\d+)?) ?cm/)],
      ["48 hours", num(text, /Past 48 Hours (\d+(?:\.\d+)?) ?cm/)],
    ]),
    date ? `${date[1]}/${date[2]}/${date[3]} ${date[4]}` : null
  );
}

// Manning lists label then value: "Current Snow Depth – Top Base 85cm" and
// "New Snowfall - Top Base (24-hour period) 0cm". The depths are blank until
// the season's first report.
async function manning(): Promise<SnowReport> {
  const url = REPORT_PAGES.manning;
  const text = pageText(await getPage(url));
  if (!/Current Snow Depth . Top Base/.test(text)) {
    throw new Error("snow report manning: snow depth not found on the page");
  }
  const depths = stats([
    ["Top", num(text, /Current Snow Depth . Top Base (\d+(?:\.\d+)?) ?cm/i)],
    ["Bottom", num(text, /Current Snow Depth . Bottom Base (\d+(?:\.\d+)?) ?cm/i)],
  ]);
  if (depths.length === 0) return { status: "not-posted", url };
  return ok(
    url,
    depths,
    stats([
      ["24 hours", num(text, /New Snowfall - Top Base \(24-hour period\) (\d+(?:\.\d+)?) ?cm/i)],
      ["48 hours", num(text, /New Snowfall - Top Base \(48-hour period\) (\d+(?:\.\d+)?) ?cm/i)],
    ]),
    null // Manning doesn't timestamp its report
  );
}

// Mt. Washington puts each figure above its label, "—" until patrol reports:
// "45 Base Depth (cm) 12 New Snow · 24h".
async function mtWashington(): Promise<SnowReport> {
  const url = REPORT_PAGES["mt-washington"];
  const text = pageText(await getPage(url));
  const m = text.match(/(\d+(?:\.\d+)?|—|-) ?(?:cm )?Base Depth \(cm\)/);
  if (!m) throw new Error("snow report mt-washington: base depth not found on the page");
  if (!/\d/.test(m[1])) return { status: "not-posted", url };
  return ok(
    url,
    [{ label: "Base", cm: Number(m[1]) }],
    stats([["24 hours", num(text, /(\d+(?:\.\d+)?) ?(?:cm )?New Snow · 24h/)]]),
    null
  );
}

// Big White lists metric first, then repeats it in inches: "New Snow (24hrs) 0 cm
// … Alpine snow Base 4 cm", dated "Last Updated: November 19th, 2026 13:40 PM MST".
async function bigWhite(): Promise<SnowReport> {
  const url = REPORT_PAGES["big-white"];
  const text = pageText(await getPage(url));
  const base = num(text, /Alpine snow Base (\d+(?:\.\d+)?) cm/i);
  if (base == null) throw new Error("snow report big-white: no base depth on the page");

  const updated = text.match(/Last Updated: (.+?\d{1,2}:\d{2} [AP]M M[SD]T)/)?.[1] ?? null;
  const day = updated?.match(/^(\w+ \d{1,2})(?:st|nd|rd|th)?, (\d{4})/);
  if (day && isStale(Date.parse(`${day[1]}, ${day[2]}`))) return { status: "not-posted", url };

  return ok(
    url,
    [{ label: "Alpine", cm: base }],
    stats([
      ["12 hours", num(text, /New Snow \(12 hrs\) (\d+(?:\.\d+)?) cm/i)],
      ["24 hours", num(text, /New Snow \(24hrs\) (\d+(?:\.\d+)?) cm/i)],
      ["7 days", num(text, /New Snow \(7 Days\) (\d+(?:\.\d+)?) cm/i)],
    ]),
    updated
  );
}

// Silver Star's site loads its reports from a POWDR feed, newest first.
interface PowdrSnowReport {
  date?: string; // "2026-11-19 09:10:22", resort time
  base_depth?: number | string | null;
  overnight_amount?: number | string | null;
  unit_of_measurement?: string;
  computed?: Record<string, number | string | null>;
}
async function silverStar(timeZone: string): Promise<SnowReport> {
  const url = REPORT_PAGES["silver-star"];
  const [latest] = await getJson<PowdrSnowReport[]>(
    "https://api.skisilverstar.com/api/v1/dor/drupal/snow-reports?sort=date&direction=desc"
  );
  if (!latest) return { status: "not-posted", url };
  if (latest.unit_of_measurement && latest.unit_of_measurement !== "cm") {
    throw new Error(`snow report silver-star: unexpected unit ${latest.unit_of_measurement}`);
  }
  const at = latest.date ? Date.parse(`${latest.date.replace(" ", "T")}-08:00`) : NaN;
  if (isStale(at)) return { status: "not-posted", url };
  const base = feedNum(latest.base_depth);
  if (base == null) return { status: "not-posted", url };

  return ok(
    url,
    [{ label: "Base", cm: base }],
    stats([
      ["Overnight", feedNum(latest.overnight_amount)],
      ["24 hours", feedNum(latest.computed?.["24_hour"])],
      ["48 hours", feedNum(latest.computed?.["48_hour"])],
      ["7 days", feedNum(latest.computed?.["7_day"])],
    ]),
    Number.isFinite(at) ? fmtTime(at, timeZone) : null
  );
}

// Sun Peaks lists label then value: "24 Hr 0 cm 48 Hr 0 cm 7 Days 1 cm Snow Base
// Mid Mountain 18 cm Alpine 25 cm", under "Updated November 19th at 7:57pm".
async function sunPeaks(): Promise<SnowReport> {
  const url = REPORT_PAGES["sun-peaks"];
  const text = pageText(await getPage(url));
  const start = text.indexOf("Snow Conditions Updated");
  if (start === -1) throw new Error("snow report sun-peaks: snow conditions not found on the page");
  const block = text.slice(start, start + 600);
  const baseAt = block.indexOf("Snow Base");
  if (baseAt === -1) throw new Error("snow report sun-peaks: no snow base on the page");
  const base = block.slice(baseAt);

  return ok(
    url,
    stats([
      ["Alpine", num(base, /Alpine (\d+(?:\.\d+)?) cm/)],
      ["Mid mountain", num(base, /Mid Mountain (\d+(?:\.\d+)?) cm/)],
    ]),
    stats([
      ["24 hours", num(block, /24 Hr (\d+(?:\.\d+)?) cm/)],
      ["48 hours", num(block, /48 Hr (\d+(?:\.\d+)?) cm/)],
      ["7 days", num(block, /7 Days (\d+(?:\.\d+)?) cm/)],
    ]),
    block.match(/Updated (\w+ \d{1,2}\w* at \d{1,2}:\d{2} ?[ap]m)/i)?.[1] ?? null
  );
}

// Revelstoke renders each stat as a title over its value:
// <h2 class="snow-report__title">Base Depth</h2> … <span class="value">36</span>.
async function revelstoke(): Promise<SnowReport> {
  const url = REPORT_PAGES.revelstoke;
  const page = await getPage(url);
  const found = new Map<string, number>();
  for (const m of Array.from(
    page.matchAll(
      /snow-report__title">\s*([^<]+?)\s*<\/h2>\s*<span class="snow-report__data">\s*<span class="value">\s*(\d+(?:\.\d+)?)/g
    )
  )) {
    found.set(decode(m[1]).toLowerCase(), Number(m[2]));
  }
  const depths = pick(found, [["Base Depth", "Base"]]);
  if (depths.length === 0) throw new Error("snow report revelstoke: no base depth on the page");
  return ok(
    url,
    depths,
    pick(found, [
      ["24 hours", "24 hours"],
      ["48 hours", "48 hours"],
      ["7 days", "7 days"],
    ]),
    null // Revelstoke doesn't timestamp the figures
  );
}

// Resorts of Canada (Fernie, Kimberley, Kicking Horse, Nakiska) fill their report
// pages from a JSON file of URL-encoded strings, saved with a JavaScript date
// ("Thu Nov 19 2026 09:58:27 GMT-0600 (Mountain Daylight Time)").
interface RcrSnowReport {
  snowPack?: string;
  newSnowOvernight?: string;
  newSnow24?: string;
  newSnow48?: string;
  newSnow7days?: string;
  saveDate?: string;
}
function rcr(id: MountainId, host: string, depthLabel: string) {
  return async (timeZone: string): Promise<SnowReport> => {
    const url = REPORT_PAGES[id];
    const feed = await getJson<RcrSnowReport>(
      `https://${host}/wp-content/themes/kallyas-child/reportData/snowReport.json`
    );
    const field = (v: string | undefined) => feedNum(v == null ? v : decodeURIComponent(v));
    const at = feed.saveDate ? Date.parse(decodeURIComponent(feed.saveDate)) : NaN;
    if (isStale(at)) return { status: "not-posted", url };
    const base = field(feed.snowPack);
    if (base == null) return { status: "not-posted", url };
    return ok(
      url,
      [{ label: depthLabel, cm: base }],
      stats([
        ["Overnight", field(feed.newSnowOvernight)],
        ["24 hours", field(feed.newSnow24)],
        ["48 hours", field(feed.newSnow48)],
        ["7 days", field(feed.newSnow7days)],
      ]),
      Number.isFinite(at) ? fmtTime(at, timeZone) : null
    );
  };
}

// RED's report page is filled from a JSON feed. Out of season it sets SummerMode
// and leaves the last report up.
async function red(timeZone: string): Promise<SnowReport> {
  const url = REPORT_PAGES.red;
  const { MountainReport: r } = await getJson<{
    MountainReport?: {
      SummerMode?: boolean;
      DateTime?: string;
      MetricAlpineSnowDepth?: number | string | null;
      MetricOvernight?: number | string | null;
      Metric24hours?: number | string | null;
      Metric48hours?: number | string | null;
      Metric7days?: number | string | null;
    };
  }>("https://api.redresort.com/report/full");
  if (!r) throw new Error("snow report red: no report in the feed");
  const at = r.DateTime ? Date.parse(r.DateTime) : NaN;
  if (r.SummerMode || isStale(at)) return { status: "not-posted", url };
  const depth = feedNum(r.MetricAlpineSnowDepth);
  if (depth == null) return { status: "not-posted", url };
  return ok(
    url,
    [{ label: "Alpine", cm: depth }],
    stats([
      ["Overnight", feedNum(r.MetricOvernight)],
      ["24 hours", feedNum(r.Metric24hours)],
      ["48 hours", feedNum(r.Metric48hours)],
      ["7 days", feedNum(r.Metric7days)],
    ]),
    Number.isFinite(at) ? fmtTime(at, timeZone) : null
  );
}

// Panorama renders each stat as "<h4>12<sup>cm</sup></h4><p>Overnight</p>", in a
// "Snow Depth" block that is empty until the season's first report.
async function panorama(): Promise<SnowReport> {
  const url = REPORT_PAGES.panorama;
  const page = await getPage(url);
  const block = (heading: string) => {
    const start = page.search(new RegExp(`>\\s*${heading}\\s*</h5>`));
    if (start === -1) return null;
    const end = page.indexOf("</h5>", page.indexOf("</h5>", start) + 5);
    return page.slice(start, end === -1 ? start + 3000 : end);
  };
  const read = (src: string) => {
    const found = new Map<string, number>();
    for (const m of Array.from(
      src.matchAll(/<h4[^>]*>\s*(\d+(?:\.\d+)?)\s*<sup[^>]*>\s*cm\s*<\/sup>\s*<\/h4>\s*<p[^>]*>\s*([^<]+?)\s*<\/p>/g)
    )) {
      found.set(decode(m[2]).toLowerCase(), Number(m[1]));
    }
    return found;
  };

  const depthBlock = block("Snow Depth");
  if (depthBlock == null) throw new Error("snow report panorama: snow depth block not found");
  const depthFound = read(depthBlock);
  if (depthFound.size === 0) {
    // Figures in a shape we don't read, rather than an empty block.
    if (/<h4/.test(depthBlock)) throw new Error("snow report panorama: snow depths not readable");
    return { status: "not-posted", url };
  }
  // Highest first, in the order the resort lists them (summit to village).
  const depths = Array.from(depthFound, ([label, cm]) => ({
    label: label.replace(/\b\w/g, (c) => c.toUpperCase()),
    cm,
  }));
  return ok(
    url,
    depths,
    pick(read(block("New Snow") ?? ""), [
      ["Overnight", "Overnight"],
      ["24 Hours", "24 hours"],
      ["48 Hours", "48 hours"],
      ["7 Days", "7 days"],
    ]),
    null
  );
}

// Lake Louise lists value first, then the same in inches, for an upper and a mid
// mountain plot: "Upper Mountain Snowfall November 19, 2026 | 10:34 am 0 cm 0.00 in
// Overnight 0 cm 0.00 in Last 24 Hours … 29 cm 11.42 in Base".
async function lakeLouise(): Promise<SnowReport> {
  const url = REPORT_PAGES["lake-louise"];
  const text = pageText(await getPage(url));
  const upperAt = text.indexOf("Upper Mountain Snowfall");
  if (upperAt === -1) throw new Error("snow report lake-louise: report block not found");
  const midAt = text.indexOf("Mid Mountain Snowfall", upperAt);
  const upper = text.slice(upperAt, midAt === -1 ? upperAt + 600 : midAt);
  const mid = midAt === -1 ? "" : text.slice(midAt, midAt + 600);
  const fig = (src: string, label: string) =>
    num(src, new RegExp(`(\\d+(?:\\.\\d+)?) cm [\\d.]+ in ${label}`, "i"));

  const date = upper.match(/Upper Mountain Snowfall (\w+ \d{1,2}, \d{4}) \| (\d{1,2}:\d{2} [ap]m)/);
  if (date && isStale(Date.parse(date[1]))) return { status: "not-posted", url };
  const depths = stats([
    ["Upper mountain", fig(upper, "Base")],
    ["Mid mountain", fig(mid, "Base")],
  ]);
  if (depths.length === 0) throw new Error("snow report lake-louise: no base depths on the page");
  return ok(
    url,
    depths,
    stats([
      ["Overnight", fig(upper, "Overnight")],
      ["24 hours", fig(upper, "Last 24 Hours")],
      ["48 hours", fig(upper, "Last 48 Hours")],
      ["7 days", fig(upper, "Last 7 Days")],
    ]),
    date ? `${date[1]}, ${date[2]}` : null
  );
}

// Marmot fills its weather panel from an HTML fragment: "Snow Report Updated
// Nov. 19, 2026, 8:09 a.m. Last 24 Hours 1cm Last 4 Days 5cm Snow Base 20 cm".
async function marmot(): Promise<SnowReport> {
  const url = REPORT_PAGES.marmot;
  const text = pageText(await getPage("https://www.skimarmot.com/site/weather/"));
  const base = num(text, /Snow Base (\d+(?:\.\d+)?) ?cm/);
  if (base == null) throw new Error("snow report marmot: no snow base in the report");
  const updated = text.match(/Snow Report Updated (\w+\.? \d{1,2}, \d{4}, \d{1,2}:\d{2} [ap]\.m\.)/)?.[1] ?? null;
  const day = updated?.match(/^(\w+)\.? (\d{1,2}), (\d{4})/);
  if (day && isStale(Date.parse(`${day[1]} ${day[2]}, ${day[3]}`))) return { status: "not-posted", url };
  return ok(
    url,
    [{ label: "Base", cm: base }],
    stats([
      ["24 hours", num(text, /Last 24 Hours (\d+(?:\.\d+)?) ?cm/)],
      ["4 days", num(text, /Last 4 Days (\d+(?:\.\d+)?) ?cm/)],
    ]),
    updated
  );
}

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
  return ok(
    url,
    depths,
    stats([
      ["Overnight", num(upper, /Overnight (\d+) cm/)],
      ["24 hours", num(upper, /24hr (\d+) cm/)],
      ["7 days", num(upper, /7 Day (\d+) cm/)],
    ]),
    text.match(/Current Conditions Updated: (.+?\d{1,2}:\d{2} [AP]M)/)?.[1] ?? null
  );
}

// Whitewater lists the figures from its 1,950 m summit plot value first:
// "0 CM 24hr 11 CM 48hr 12 CM 3 Days 18 CM 7 Days 57 CM Total Snowfall 25 CM Current Base".
async function whitewater(): Promise<SnowReport> {
  const url = REPORT_PAGES.whitewater;
  const text = pageText(await getPage(url));
  const base = num(text, /(\d+) CM Current Base/);
  if (base == null) throw new Error("snow report whitewater: no base depth on the page");
  return ok(
    url,
    [{ label: "Summit plot", cm: base }],
    stats([
      ["24 hours", num(text, /(\d+) CM 24hr/)],
      ["48 hours", num(text, /(\d+) CM 48hr/)],
      ["7 days", num(text, /(\d+) CM 7 Days/)],
    ]),
    text.match(/Updated on (.+? at \d{2}:\d{2})/)?.[1] ?? null
  );
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
  return ok(
    url,
    depths,
    stats([
      ["Overnight", num(text, /(\d+) ?cm Overnight/i)],
      ["24 hours", num(text, /(\d+) ?cm Last 24 Hours/i)],
      ["7 days", num(text, /(\d+) ?cm Last 7 Days/i)],
    ]),
    null // Norquay doesn't timestamp its report
  );
}

// Castle lists value first ("12 cm Fresh Snow (24 hrs)", "80 cm Snow Base") and
// dates its report "Last updated: 2026-04-26 - 07:57 MT". It leaves the last
// report of the season up until the next, so an old date means none yet.
async function castle(): Promise<SnowReport> {
  const url = REPORT_PAGES.castle;
  const text = pageText(await getPage(url));
  const date = text.match(/Last updated: (\d{4}-\d{2}-\d{2}) - (\d{1,2}:\d{2}) ?MT/);
  if (!date) throw new Error("snow report castle: no update date on the page");
  if (isStale(Date.parse(`${date[1]}T12:00:00-07:00`))) return { status: "not-posted", url };
  const base = num(text, /(\d+) cm Snow Base/);
  if (base == null) throw new Error("snow report castle: no base depth on the page");
  return ok(
    url,
    [{ label: "Base", cm: base }],
    stats([
      ["24 hours", num(text, /(\d+) cm Fresh Snow \(24 hrs\)/)],
      ["7 days", num(text, /(\d+) cm Last 7 days/)],
    ]),
    `${date[1]} ${date[2]} MT`
  );
}

// Every hill's reader. The three without one link to the resort instead.
export const READERS: Record<MountainId, (timeZone: string) => Promise<SnowReport>> = {
  cypress,
  grouse,
  seymour,
  // Whistler's site (Vail Resorts) turns away automated requests.
  whistler: async () => ({ status: "unsupported", url: REPORT_PAGES.whistler }),
  sasquatch,
  manning,
  baker,
  "mt-washington": mtWashington,
  // Mt. Cain doesn't publish a snow report.
  "mt-cain": async () => ({ status: "unsupported", url: REPORT_PAGES["mt-cain"] }),
  "big-white": bigWhite,
  "silver-star": silverStar,
  "sun-peaks": sunPeaks,
  // Apex's site turns away automated requests (403).
  apex: async () => ({ status: "unsupported", url: REPORT_PAGES.apex }),
  revelstoke,
  "kicking-horse": rcr("kicking-horse", "kickinghorseresort.com", "Alpine plot"),
  red,
  whitewater,
  panorama,
  kimberley: rcr("kimberley", "skikimberley.com", "Base"),
  fernie: rcr("fernie", "skifernie.com", "Base"),
  castle,
  nakiska: rcr("nakiska", "skinakiska.com", "Base"),
  sunshine,
  norquay,
  "lake-louise": lakeLouise,
  marmot,
};

// Beyond these a figure is a misread (a wrong number picked off a changed page, or
// inches taken for centimetres), not snow: the deepest bases in these ranges run
// to about 5 m, and a week's snowfall to about 3 m.
const MAX_DEPTH_CM = 800;
const MAX_SNOWFALL_CM = 400;

// The resort's report as of now, with feed timestamps shown in `timeZone` (the
// resort's own). A report whose every depth is zero is a placeholder ahead of the
// season (feeds such as ReportPal fill unset figures with 0), so it counts as not
// posted. An implausible figure throws, as a reader that can't find its figures does.
export async function readSnowReport(id: MountainId, timeZone = TZ): Promise<SnowReport> {
  const report = await READERS[id](timeZone);
  if (report.status !== "ok") return report;

  const bad = [
    ...report.depths.filter((d) => !(d.cm >= 0 && d.cm <= MAX_DEPTH_CM)),
    ...report.snowfall.filter((d) => !(d.cm >= 0 && d.cm <= MAX_SNOWFALL_CM)),
  ];
  if (bad.length) {
    throw new Error(`snow report ${id}: implausible ${bad.map((d) => `${d.label} ${d.cm} cm`).join(", ")}`);
  }
  if (report.depths.every((d) => d.cm === 0)) return { status: "not-posted", url: report.url };
  return report;
}

