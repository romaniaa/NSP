import { cacheLife } from "next/cache";
import { ZONES, type ZoneId } from "@/config/zones";

// Avalanche danger from Avalanche Canada's public forecast API (no key needed,
// https://avalanche.ca/api-docs). Forecast regions merge and split from day to day,
// so each zone is looked up by its point rather than a fixed region id.
//
// Only the danger ratings and the problem types are shown, with a link to the full
// forecast. Avalanche Canada's terms require written consent to reproduce their
// material: get it (info@avalanche.ca) before this goes live.

const API = "https://api.avalanche.ca/forecasts/en/products/point";
const MAP_URL = "https://avalanche.ca/map";

// North American Public Avalanche Danger Scale.
export type DangerLevel = "low" | "moderate" | "considerable" | "high" | "extreme";
export const DANGER_LEVELS: DangerLevel[] = ["low", "moderate", "considerable", "high", "extreme"];

export interface Danger {
  value: string; // a DangerLevel, or "earlyseason", "norating", "noforecast", "spring"…
  display: string; // as Avalanche Canada words it
}

export interface DangerDay {
  date: string; // ISO, start of the day the rating is for
  label: string; // e.g. "Saturday"
  alp: Danger; // alpine
  tln: Danger; // treeline
  btl: Danger; // below treeline
}

export interface Problem {
  type: string; // e.g. "Wind Slab"
  elevations: string[]; // e.g. ["Alpine", "Treeline"]
  aspects: string[]; // e.g. ["North", "Northeast"]
  likelihood: string | null; // e.g. "likely"
  size: { min: string; max: string } | null; // destructive size range
}

export type AvalancheForecast =
  | {
      status: "ok";
      title: string;
      owner: string; // e.g. "Avalanche Canada" or "Parks Canada"
      url: string; // the full forecast
      issued: string; // ISO
      validUntil: string; // ISO
      days: DangerDay[]; // today first, ratings from today on
      // When no current day carries a rating: the forecast's status instead, as
      // Avalanche Canada words it, e.g. "Early Season" or "No Rating".
      note: string | null;
      problems: Problem[];
    }
  // No current forecast covers this zone (none issued, or the last one expired).
  | { status: "none"; url: string };

interface RawDanger {
  rating?: { value?: string; display?: string };
}
interface RawProduct {
  url?: string;
  owner?: { display?: string };
  report?: {
    title?: string;
    dateIssued?: string;
    validUntil?: string;
    dangerRatings?: {
      date?: { value?: string; display?: string };
      ratings?: { alp?: RawDanger; tln?: RawDanger; btl?: RawDanger };
    }[];
    problems?:
      | {
          type?: { display?: string };
          data?: {
            elevations?: { display?: string }[];
            aspects?: { display?: string }[];
            likelihood?: { display?: string };
            expectedSize?: { min?: string; max?: string };
          };
        }[]
      | null;
  } | null;
}

const danger = (d?: RawDanger): Danger => ({
  value: d?.rating?.value ?? "norating",
  display: d?.rating?.display ?? "No rating",
});

const displays = (xs?: { display?: string }[]) =>
  (xs ?? []).map((x) => x.display).filter((x): x is string => !!x);

function parse(raw: RawProduct): AvalancheForecast {
  const r = raw.report;
  // A point with no forecast region (e.g. across the US border) comes back empty.
  if (!r?.validUntil || !r.dateIssued || !raw.url) return { status: "none", url: MAP_URL };

  return {
    status: "ok",
    title: r.title ?? "Avalanche forecast",
    owner: raw.owner?.display ?? "Avalanche Canada",
    url: raw.url,
    issued: r.dateIssued,
    validUntil: r.validUntil,
    note: null,
    days: (r.dangerRatings ?? []).flatMap((d) =>
      d.date?.value
        ? [
            {
              date: d.date.value,
              label: d.date.display ?? "",
              alp: danger(d.ratings?.alp),
              tln: danger(d.ratings?.tln),
              btl: danger(d.ratings?.btl),
            },
          ]
        : []
    ),
    problems: (r.problems ?? []).map((p) => ({
      type: p.type?.display ?? "Avalanche problem",
      elevations: displays(p.data?.elevations),
      aspects: displays(p.data?.aspects),
      likelihood: p.data?.likelihood?.display ?? null,
      size:
        p.data?.expectedSize?.min && p.data.expectedSize.max
          ? { min: p.data.expectedSize.min, max: p.data.expectedSize.max }
          : null,
    })),
  };
}

// The latest forecast for every zone, refreshed hourly and shared between server
// instances. Forecasts are issued once a day, usually mid-afternoon Pacific time.
// One small request per zone: about 120 a day for five zones.
export async function fetchAvalancheForecasts(): Promise<Record<ZoneId, AvalancheForecast>> {
  "use cache: remote";
  cacheLife({ stale: 300, revalidate: 3600, expire: 6 * 3600 });

  const entries = await Promise.all(
    ZONES.map(async (z) => {
      const url = `${API}?lat=${z.lat}&long=${z.lon}`;
      const res = await fetch(url, { signal: AbortSignal.timeout(15_000) });
      if (!res.ok) throw new Error(`avalanche ${z.id}: ${res.status} ${res.statusText}`);
      return [z.id, parse(await res.json())] as const;
    })
  );
  return Object.fromEntries(entries) as Record<ZoneId, AvalancheForecast>;
}

// The forecast for one zone as it stands now: expired forecasts become "none" and
// days that have passed are dropped.
export async function getAvalancheForecast(id: ZoneId): Promise<AvalancheForecast> {
  "use cache";
  cacheLife({ stale: 300, revalidate: 900, expire: 3600 });

  const f = (await fetchAvalancheForecasts())[id];
  const now = Date.now();
  if (f.status !== "ok") return f;
  if (Date.parse(f.validUntil) <= now) return { status: "none", url: f.url };

  // An early-season forecast runs for weeks with day entries only for its first
  // few days, so its status comes from the latest entry once those have passed.
  const DAY = 24 * 3600 * 1000;
  const days = f.days.filter((d) => Date.parse(d.date) + DAY > now);
  const latest = days[0] ?? f.days.at(-1);
  const rated = days.some((d) => [d.alp, d.tln, d.btl].some(isRated));
  return { ...f, days, note: !rated && latest ? latest.alp.display : null };
}

// Ratings that sit on the danger scale, as opposed to "early season" and the like.
export const isRated = (d: Danger): d is Danger & { value: DangerLevel } =>
  (DANGER_LEVELS as string[]).includes(d.value);

// Highest rated danger across the bands for a day, or null if none is rated.
export function highestDanger(day: DangerDay): DangerLevel | null {
  const rated = [day.alp, day.tln, day.btl].filter(isRated).map((d) => d.value);
  if (rated.length === 0) return null;
  return rated.reduce((a, b) => (DANGER_LEVELS.indexOf(b) > DANGER_LEVELS.indexOf(a) ? b : a));
}
