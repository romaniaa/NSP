import { cacheLife } from "next/cache";
import { MOUNTAINS, type MountainId } from "@/config/mountains";
import { REGIONS, type RegionId } from "@/config/regions";
import { ZONES, type ZoneId } from "@/config/zones";

// Raw weather-model data from Open-Meteo, fetched at most once an hour and shared
// by every page through the remote cache. On Vercel that cache is shared between
// server instances, so one fetch serves the home page, every hill page and any later
// dashboard. Pages pick the current hour from it (see lib/Weather.ts).
//
// Free tier: 10,000 calls a day. Open-Meteo weights a request by its locations,
// variables (per 10) and days (per 14), so these two requests come to roughly
// 2.7 calls per place (hill or backcountry zone) and 2.4 per region, each hour.
// With 7 hills, 5 zones and 7 regions that is about 1,200 calls a day.

const API = "https://api.open-meteo.com/v1/forecast";

// Environment Canada's GEM model, whose 2.5 km HRDPS run covers the first two days.
// Checked against seven BC mountain weather stations over a week in Nov 2026 (1,117
// hours, 1,230–2,320 m): free-air temperature from its pressure levels was off by
// 1.1 °C on average with almost no bias. Open-Meteo's default model with its fixed
// lapse-rate correction, used here before, was off by 2.0 °C and read 1.7 °C cold.
// GEM doesn't provide freezing_level_height, so the freezing level is derived from
// the same pressure levels.
const MODEL = "gem_seamless";

// Pressure levels (hPa) from sea level to about 4,000 m. GEM has no 975 hPa level.
const LEVELS = [1000, 950, 925, 900, 875, 850, 800, 750, 700, 600];
const PROFILE_VARS = LEVELS.flatMap((p) => [
  `temperature_${p}hPa`,
  `geopotential_height_${p}hPa`,
]);

// Model-surface values. They don't vary with height at one point, so every lift
// on a hill shares them.
const SURFACE_VARS = [
  "relative_humidity_2m",
  "precipitation",
  "cloud_cover",
  "weather_code",
  "wind_speed_10m",
  "wind_gusts_10m",
  "wind_direction_10m",
];

// Air temperature (°C) against height (m), lowest first.
export interface Profile {
  z: number[];
  t: number[];
}

// Temperature at a height: linear between pressure levels, extended from the end
// segments beyond them.
export function tempAt(p: Profile, height: number): number {
  const { z, t } = p;
  let i = 1;
  while (i < z.length - 1 && z[i] < height) i++;
  return t[i - 1] + ((t[i] - t[i - 1]) * (height - z[i - 1])) / (z[i] - z[i - 1]);
}

// Height (m) of the 0 °C level: the lowest point where the air turns from above to
// below freezing going up, the same definition Open-Meteo uses. A second crossing
// above a warm layer aloft is ignored.
export function freezingLevel(p: Profile): number {
  const { z, t } = p;
  for (let i = 1; i < z.length; i++) {
    if (t[i - 1] >= 0 && t[i] < 0) {
      return Math.round(z[i - 1] + ((z[i] - z[i - 1]) * t[i - 1]) / (t[i - 1] - t[i]));
    }
  }
  // No crossing between levels. Below freezing at the lowest level means the 0 °C
  // level is lower still; otherwise the air is above freezing all the way up.
  // Either way, extend the nearest end segment.
  const n = z.length;
  const [a, b] = t[0] < 0 ? [0, 1] : [n - 2, n - 1];
  const slope = (t[b] - t[a]) / (z[b] - z[a]); // °C per m, negative when cooling with height
  if (slope >= 0) return t[0] < 0 ? 0 : z[n - 1];
  return Math.max(0, Math.round(z[a] - t[a] / slope));
}

type Hourly = { time: string[] } & Record<string, unknown>;

function value(h: Hourly, key: string, i: number): number | null {
  const v = (h[key] as (number | null)[] | undefined)?.[i];
  return typeof v === "number" ? v : null;
}

function profileAt(h: Hourly, i: number): Profile | null {
  const pts: [number, number][] = [];
  for (const p of LEVELS) {
    const z = value(h, `geopotential_height_${p}hPa`, i);
    const t = value(h, `temperature_${p}hPa`, i);
    if (z == null || t == null) return null;
    pts.push([Math.round(z), t]);
  }
  pts.sort((a, b) => a[0] - b[0]);
  return { z: pts.map((p) => p[0]), t: pts.map((p) => p[1]) };
}

// One request for many points. The GEM model first, then Open-Meteo's default
// model only if GEM fails or has gaps, so a normal refresh is a single call.
async function fetchPoints<T>(
  points: { lat: number; lon: number }[],
  params: Record<string, string>,
  parse: (hourly: Hourly[]) => T
): Promise<{ model: string; data: T }> {
  let lastError: unknown;
  for (const model of [MODEL, null]) {
    try {
      const url = new URL(API);
      url.searchParams.set("latitude", points.map((p) => p.lat).join(","));
      url.searchParams.set("longitude", points.map((p) => p.lon).join(","));
      for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
      if (model) url.searchParams.set("models", model);

      const res = await fetch(url, { signal: AbortSignal.timeout(30_000) });
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      const json = await res.json();
      const list: { hourly?: Hourly }[] = Array.isArray(json) ? json : [json];
      if (list.length !== points.length) {
        throw new Error(`expected ${points.length} locations, got ${list.length}`);
      }
      return {
        model: model ?? "best_match",
        data: parse(
          list.map((loc, i) => {
            if (!loc.hourly?.time) throw new Error(`no hourly data for location ${i}`);
            return loc.hourly;
          })
        ),
      };
    } catch (err) {
      lastError = new Error(`open-meteo ${model ?? "best_match"}: ${(err as Error).message}`, {
        cause: err,
      });
      console.error(lastError);
    }
  }
  throw lastError;
}

export interface ModelHour {
  time: string; // ISO, UTC, start of the hour
  profile: Profile;
  rh: number; // %
  precipitation: number; // mm in the hour
  cloud: number | null; // % total cloud cover
  code: number | null; // WMO weather code
  wind: number; // km/h at 10 m above the model surface
  gust: number; // km/h
  dir: number; // degrees the wind comes from
}

// Everywhere the site shows current weather: every hill and backcountry zone.
export type PlaceId = MountainId | ZoneId;
const PLACES: { id: PlaceId; lat: number; lon: number }[] = [...MOUNTAINS, ...ZONES];

export interface Snapshot {
  model: string;
  fetched: string; // ISO
  places: Record<PlaceId, ModelHour[]>;
}

// The hours around now for every place, from one request.
export async function fetchSnapshot(): Promise<Snapshot> {
  "use cache: remote";
  // The model runs a few times a day, so hourly is plenty. The window below covers
  // the 6 hours an entry can be served, in case refreshes fail.
  cacheLife({ stale: 300, revalidate: 3600, expire: 6 * 3600 });

  const { model, data } = await fetchPoints(
    PLACES,
    {
      hourly: [...PROFILE_VARS, ...SURFACE_VARS].join(","),
      past_hours: "2",
      forecast_hours: "8",
      timezone: "GMT",
    },
    (hourly) =>
      hourly.map((h, loc) =>
        h.time.map((time, i): ModelHour => {
          const profile = profileAt(h, i);
          const rh = value(h, "relative_humidity_2m", i);
          const wind = value(h, "wind_speed_10m", i);
          const gust = value(h, "wind_gusts_10m", i);
          const dir = value(h, "wind_direction_10m", i);
          if (!profile || rh == null || wind == null || gust == null || dir == null) {
            throw new Error(`gap at ${PLACES[loc].id} ${time}`);
          }
          return {
            time: `${time}Z`, // Open-Meteo gives "YYYY-MM-DDTHH:MM" in GMT
            profile,
            rh,
            precipitation: value(h, "precipitation", i) ?? 0,
            cloud: value(h, "cloud_cover", i),
            code: value(h, "weather_code", i),
            wind,
            gust,
            dir,
          };
        })
      )
  );

  return {
    model,
    fetched: new Date().toISOString(),
    places: Object.fromEntries(PLACES.map((p, i) => [p.id, data[i]])) as Record<
      PlaceId,
      ModelHour[]
    >,
  };
}

export interface RegionLevels {
  time: string[]; // "YYYY-MM-DDTHH:MM", Vancouver time
  level: (number | null)[]; // freezing level, m
}

export interface FreezingHistory {
  model: string;
  fetched: string; // ISO
  regions: Record<RegionId, RegionLevels>;
}

export const HISTORY_TZ = "America/Vancouver";

// Hourly freezing level for the past 10 days and next 7, for every region.
export async function fetchFreezingHistory(): Promise<FreezingHistory> {
  "use cache: remote";
  cacheLife({ stale: 300, revalidate: 3600, expire: 6 * 3600 });

  const { model, data } = await fetchPoints(
    REGIONS,
    {
      hourly: PROFILE_VARS.join(","),
      past_days: "10",
      forecast_days: "7",
      timezone: HISTORY_TZ,
    },
    (hourly) =>
      hourly.map((h, loc): RegionLevels => {
        const level = h.time.map((_, i) => {
          const p = profileAt(h, i);
          return p ? freezingLevel(p) : null;
        });
        if (level.filter((v) => v != null).length < level.length / 2) {
          throw new Error(`mostly empty freezing levels for ${REGIONS[loc].id}`);
        }
        return { time: h.time, level };
      })
  );

  return {
    model,
    fetched: new Date().toISOString(),
    regions: Object.fromEntries(REGIONS.map((r, i) => [r.id, data[i]])) as Record<
      RegionId,
      RegionLevels
    >,
  };
}
