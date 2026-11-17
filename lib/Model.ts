import { cacheLife } from "next/cache";
import { MOUNTAINS, type MountainId } from "@/config/mountains";
import { ZONES, type ZoneId } from "@/config/zones";

// Raw weather-model data from Open-Meteo, one request at most once an hour, shared
// by every page through the remote cache. On Vercel that cache is shared between
// server instances, so one fetch serves the home page, every hill page and any later
// dashboard. Pages pick the current hour from it (see lib/Weather.ts).
//
// Free tier: 10,000 calls a day. Open-Meteo weights a request by its locations,
// variables (per 10) and days (per 14): 36 variables over 17 days is about 4.4
// calls per place (hill or backcountry zone), each hour. With 26 hills and 8 zones
// that is about 3,570 calls a day, or twice that on an hour GEM fails and the
// fallback model is fetched too.

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

// Wind at the upper pressure levels, about 1,400 to 3,000 m. Checked against the
// same mountain stations (Nov 2026): on exposed peaks and ridges the 10 m surface
// wind read far too low (Blowdown Peak, 2,320 m: 8 km/h against 32 observed) and
// this free-air wind was much closer (42); on sheltered slopes and passes the
// surface wind was closer. So both are shown: this as "ridgetop wind", the
// surface wind as the wind near the ground.
const WIND_LEVELS = [850, 800, 750, 700];
const WIND_VARS = WIND_LEVELS.flatMap((p) => [`wind_speed_${p}hPa`, `wind_direction_${p}hPa`]);

// Model-surface values. They don't vary with height at one point, so every lift
// on a hill shares them.
const SURFACE_VARS = [
  "surface_pressure", // to find where the model's ground is (see freezingLevel)
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
  // Height (m) of the model's ground at this point. Pressure levels below it are
  // filled in by the model, not real air. Absent if the model didn't give one.
  ground?: number;
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
//
// Where the air at the model's ground is above freezing, crossings below the
// ground are skipped: those levels are filled in by the model, and in the
// Interior and the Rockies they can cross 0 °C hundreds of metres below a valley
// that is above freezing (Rogers Pass, Nov 2026: 548 m against +0.6 °C at the
// 1,315 m pass; the crossing above the ground was near 1,370 m). Over a week of
// hours at the zones this changed the level only in hours like that one.
// Temperatures are unaffected.
export function freezingLevel(p: Profile): number {
  const { z, t } = p;
  if (p.ground != null && p.ground > z[0] && p.ground < z[z.length - 1]) {
    const tg = tempAt(p, p.ground);
    if (tg >= 0) {
      const above = z.findIndex((h) => h > p.ground!);
      const zs = [p.ground, ...z.slice(above)];
      const ts = [tg, ...t.slice(above)];
      for (let i = 1; i < zs.length; i++) {
        if (ts[i - 1] >= 0 && ts[i] < 0) {
          return Math.round(zs[i - 1] + ((zs[i] - zs[i - 1]) * ts[i - 1]) / (ts[i - 1] - ts[i]));
        }
      }
    }
  }
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
  const pts: [number, number, number][] = [];
  for (const p of LEVELS) {
    const z = value(h, `geopotential_height_${p}hPa`, i);
    const t = value(h, `temperature_${p}hPa`, i);
    if (z == null || t == null) return null;
    pts.push([Math.round(z), t, p]);
  }
  pts.sort((a, b) => a[0] - b[0]);
  const z = pts.map((p) => p[0]);
  const sp = value(h, "surface_pressure", i);
  return {
    z,
    t: pts.map((p) => p[1]),
    ...(sp == null ? {} : { ground: groundHeight(z, pts.map((p) => p[2]), sp) }),
  };
}

// Height of the surface pressure among the levels: pressure falls off
// exponentially with height, so interpolate in log pressure.
function groundHeight(z: number[], hPa: number[], surface: number): number {
  const x = Math.log(surface);
  let i = 1;
  while (i < z.length - 1 && Math.log(hPa[i]) > x) i++;
  const [a, b] = [Math.log(hPa[i - 1]), Math.log(hPa[i])];
  return Math.round(z[i - 1] + ((z[i] - z[i - 1]) * (x - a)) / (b - a));
}

function windProfileAt(h: Hourly, i: number): WindProfile | null {
  const pts: [number, number, number][] = [];
  for (const p of WIND_LEVELS) {
    const z = value(h, `geopotential_height_${p}hPa`, i);
    const speed = value(h, `wind_speed_${p}hPa`, i);
    const dir = value(h, `wind_direction_${p}hPa`, i);
    if (z == null || speed == null || dir == null) return null;
    // Meteorological direction is where the wind comes from.
    const r = (dir * Math.PI) / 180;
    pts.push([Math.round(z), -speed * Math.sin(r), -speed * Math.cos(r)]);
  }
  pts.sort((a, b) => a[0] - b[0]);
  return {
    z: pts.map((p) => p[0]),
    u: pts.map((p) => Math.round(p[1] * 10) / 10),
    v: pts.map((p) => Math.round(p[2] * 10) / 10),
  };
}

// Free-air wind at a height: interpolated between levels and held at the end
// levels beyond them (no extrapolation, which would exaggerate).
export function windAloft(w: WindProfile, height: number): { speed: number; dir: number } {
  const at = (vals: number[]) => {
    if (height <= w.z[0]) return vals[0];
    for (let i = 1; i < w.z.length; i++) {
      if (height <= w.z[i]) {
        return vals[i - 1] + ((vals[i] - vals[i - 1]) * (height - w.z[i - 1])) / (w.z[i] - w.z[i - 1]);
      }
    }
    return vals[vals.length - 1];
  };
  const u = at(w.u);
  const v = at(w.v);
  const dir = ((Math.atan2(-u, -v) * 180) / Math.PI + 360) % 360;
  return { speed: Math.round(Math.hypot(u, v)), dir: Math.round(dir) };
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

      const res = await fetch(url, { signal: AbortSignal.timeout(45_000) });
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

// Free-air wind by height, lowest first, as east (u) and north (v) components in
// km/h so direction interpolates correctly.
export interface WindProfile {
  z: number[];
  u: number[];
  v: number[];
}

export interface ModelHour {
  time: string; // ISO, UTC, start of the hour
  profile: Profile;
  aloft: WindProfile;
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
const PLACES: { id: PlaceId; lat: number; lon: number; timeZone: string }[] = [
  ...MOUNTAINS,
  ...ZONES,
];

// The local time zone of a hill or zone, for days and times shown for it.
export const timeZoneOf = (id: PlaceId) =>
  PLACES.find((p) => p.id === id)?.timeZone ?? "America/Vancouver";

export interface PlaceData {
  hours: ModelHour[]; // full detail for the hours around the fetch
  // Freezing level (m) at each of the snapshot's times; null where the model has a gap.
  levels: (number | null)[];
}

export interface Snapshot {
  model: string;
  fetched: string; // ISO
  // ISO, UTC, every hour from 10 days ago to 7 days ahead. Every place shares
  // them, so they're stored once rather than per place.
  times: string[];
  places: Record<PlaceId, PlaceData>;
}

// Full detail is kept only this many hours either side of the fetch. That covers
// the 6 hours an entry can be served if refreshes fail, and keeps the entry small.
const DETAIL_BEFORE_H = 3;
const DETAIL_AFTER_H = 9;

// Everything weather for every place, from one request: the hours around now in
// full, and the freezing level for the past 10 days and next 7. Current conditions
// and the freezing-level charts come from the same data, so a page never shows
// two different freezing levels for one place.
export async function fetchSnapshot(): Promise<Snapshot> {
  "use cache: remote";
  // The model runs a few times a day, so hourly is plenty.
  cacheLife({ stale: 300, revalidate: 3600, expire: 6 * 3600 });

  const now = Date.now();
  const { model, data } = await fetchPoints(
    PLACES,
    {
      hourly: [...PROFILE_VARS, ...WIND_VARS, ...SURFACE_VARS].join(","),
      past_days: "10",
      forecast_days: "7",
      timezone: "GMT",
    },
    (hourly) =>
      hourly.map((h, loc): PlaceData & { time: string[] } => {
        const time = h.time.map((t) => `${t}Z`); // Open-Meteo gives "YYYY-MM-DDTHH:MM" in GMT
        const profiles = time.map((_, i) => profileAt(h, i));
        const level = profiles.map((p) => (p ? freezingLevel(p) : null));
        if (level.filter((v) => v != null).length < level.length / 2) {
          throw new Error(`mostly empty freezing levels for ${PLACES[loc].id}`);
        }

        const hours: ModelHour[] = [];
        time.forEach((t, i) => {
          const offset = (Date.parse(t) - now) / 3600_000;
          if (offset < -DETAIL_BEFORE_H || offset > DETAIL_AFTER_H) return;
          const profile = profiles[i];
          const aloft = windProfileAt(h, i);
          const rh = value(h, "relative_humidity_2m", i);
          const wind = value(h, "wind_speed_10m", i);
          const gust = value(h, "wind_gusts_10m", i);
          const dir = value(h, "wind_direction_10m", i);
          if (!profile || !aloft || rh == null || wind == null || gust == null || dir == null) {
            throw new Error(`gap at ${PLACES[loc].id} ${t}`);
          }
          hours.push({
            time: t,
            profile,
            aloft,
            rh,
            precipitation: value(h, "precipitation", i) ?? 0,
            cloud: value(h, "cloud_cover", i),
            code: value(h, "weather_code", i),
            wind,
            gust,
            dir,
          });
        });

        return { hours, levels: level, time };
      })
  );

  // One request, so every location comes back on the same hours.
  const times = data[0].time;
  if (data.some((d) => d.time.length !== times.length || d.time[0] !== times[0])) {
    throw new Error("open-meteo: locations on different hours");
  }
  return {
    model,
    fetched: new Date().toISOString(),
    times,
    places: Object.fromEntries(
      PLACES.map((p, i) => [p.id, { hours: data[i].hours, levels: data[i].levels }])
    ) as Record<PlaceId, PlaceData>,
  };
}
