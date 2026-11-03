import { cacheLife } from "next/cache";
import { LIFTS } from "@/config/lifts";
import { MOUNTAINS, type MountainId } from "@/config/mountains";

const TZ = "America/Vancouver";
// Roughly central to the three mountains; freezing level barely varies between them at model resolution.
const CENTER = { lat: 49.38, lon: -123.08 };

export interface PointReading {
  id: string;
  label: string;
  mountain: string;
  color: string;
  elevation: number;
  temp: number; // °C
  rh: number; // %
  wind: number; // km/h average
  gust: number; // km/h
  dir: number; // degrees the wind comes from
  precipitation: number; // mm/h
  cloud: number | null; // %
  code: number | null; // WMO weather code
}

export interface DayStat {
  key: string;
  weekday: string;
  day: number;
  low: number;
  high: number;
}

export interface FreezingSeries {
  current: number;
  deltaNext24: number | null;
  deltaPast25: number | null;
  history: DayStat[]; // last 10 days incl. today
  forecast: DayStat[]; // today + next 5 days
  updated: string;
}

// One point per mountain at the bottom and top lift, highest first.
const POINTS = MOUNTAINS.flatMap((m) => [
  {
    id: `${m.id}-top`,
    label: `${m.name} top`,
    mountain: m.name,
    color: m.color,
    lat: m.lat,
    lon: m.lon,
    elevation: m.lifts.top.elevation,
  },
  {
    id: `${m.id}-bottom`,
    label: `${m.name} bottom`,
    mountain: m.name,
    color: m.color,
    lat: m.lat,
    lon: m.lon,
    elevation: m.lifts.bottom.elevation,
  },
]).sort((a, b) => b.elevation - a.elevation);

export async function getPointReadings(): Promise<PointReading[]> {
  "use cache";
  cacheLife({ stale: 300, revalidate: 900, expire: 3600 });

  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", POINTS.map((p) => p.lat).join(","));
  url.searchParams.set("longitude", POINTS.map((p) => p.lon).join(","));
  // Open-Meteo adjusts temperature to the elevation you give it.
  url.searchParams.set("elevation", POINTS.map((p) => p.elevation).join(","));
  url.searchParams.set(
    "current",
    "temperature_2m,relative_humidity_2m,wind_speed_10m,wind_gusts_10m,wind_direction_10m,precipitation,cloud_cover,weather_code"
  );
  url.searchParams.set("timezone", TZ);

  const res = await fetch(url);
  if (!res.ok) throw new Error(`readings: ${res.status} ${res.statusText}`);
  const json = await res.json();
  const list = Array.isArray(json) ? json : [json];

  return POINTS.map((p, i) => {
    const c = list[i]?.current;
    if (!c) throw new Error(`readings: no current data for ${p.label}`);
    return {
      id: p.id,
      label: p.label,
      mountain: p.mountain,
      color: p.color,
      elevation: p.elevation,
      temp: Math.round(c.temperature_2m * 10) / 10,
      rh: Math.round(c.relative_humidity_2m),
      wind: Math.round(c.wind_speed_10m),
      gust: Math.round(c.wind_gusts_10m),
      dir: Math.round(c.wind_direction_10m),
      precipitation: c.precipitation ?? 0,
      cloud: c.cloud_cover ?? null,
      code: c.weather_code ?? null,
    };
  });
}

export async function getFreezingSeries(): Promise<FreezingSeries> {
  "use cache";
  cacheLife({ stale: 300, revalidate: 900, expire: 3600 });

  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", String(CENTER.lat));
  url.searchParams.set("longitude", String(CENTER.lon));
  url.searchParams.set("hourly", "freezing_level_height");
  url.searchParams.set("past_days", "10");
  url.searchParams.set("forecast_days", "7");
  url.searchParams.set("timezone", TZ);

  const res = await fetch(url);
  if (!res.ok) throw new Error(`freezing: ${res.status} ${res.statusText}`);
  const json = await res.json();

  const times: string[] = json.hourly?.time ?? [];
  const vals: (number | null)[] = json.hourly?.freezing_level_height ?? [];

  const now = new Date();
  const nowKey = new Intl.DateTimeFormat("sv-SE", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    hourCycle: "h23",
  })
    .format(now)
    .replace(" ", "T");

  const idx = times.findIndex((t) => t.startsWith(nowKey));
  if (idx === -1) throw new Error("freezing: current hour not in response");

  const at = (i: number) => vals[i] ?? null;
  const current = at(idx);
  if (current == null) throw new Error("freezing: no freezing level in response");

  const next = at(idx + 24);
  const past = at(idx - 25);

  const byDay = new Map<string, number[]>();
  times.forEach((t, i) => {
    const v = vals[i];
    if (v == null) return;
    const key = t.slice(0, 10);
    const arr = byDay.get(key) ?? [];
    arr.push(v);
    byDay.set(key, arr);
  });

  const days: DayStat[] = [...byDay.entries()].map(([key, vs]) => ({
    key,
    weekday: new Date(`${key}T12:00:00`).toLocaleDateString("en-CA", {
      weekday: "short",
    }),
    day: Number(key.slice(8, 10)),
    low: Math.round(Math.min(...vs)),
    high: Math.round(Math.max(...vs)),
  }));

  const todayIdx = days.findIndex((d) => d.key === nowKey.slice(0, 10));
  const start = todayIdx === -1 ? 0 : todayIdx;

  return {
    current: Math.round(current),
    deltaNext24: next == null ? null : next - current,
    deltaPast25: past == null ? null : current - past,
    history: days.slice(Math.max(0, start - 9), start + 1),
    forecast: days.slice(start, start + 6),
    updated: now.toLocaleString("en-CA", {
      timeZone: TZ,
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }),
  };
}

export interface StationReading {
  elevation: number;
  temp: number;
  rh: number;
  wind: number;
  gust: number;
  dir: number;
  precipitation: number;
  cloud: number | null;
  code: number | null;
}

// Current model readings at every lift station elevation on one mountain.
export async function getMountainReadings(
  id: MountainId
): Promise<StationReading[]> {
  "use cache";
  cacheLife({ stale: 300, revalidate: 900, expire: 3600 });

  const m = MOUNTAINS.find((x) => x.id === id);
  if (!m) throw new Error(`unknown mountain: ${id}`);

  const elevations = [
    ...new Set(
      LIFTS[id]
        .flatMap((l) => [l.bottom, l.top])
        .filter((e): e is number => e != null)
    ),
  ].sort((a, b) => b - a);
  if (elevations.length === 0) return [];

  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", elevations.map(() => m.lat).join(","));
  url.searchParams.set("longitude", elevations.map(() => m.lon).join(","));
  url.searchParams.set("elevation", elevations.join(","));
  url.searchParams.set(
    "current",
    "temperature_2m,relative_humidity_2m,wind_speed_10m,wind_gusts_10m,wind_direction_10m,precipitation,cloud_cover,weather_code"
  );
  url.searchParams.set("timezone", TZ);

  const res = await fetch(url);
  if (!res.ok) throw new Error(`stations: ${res.status} ${res.statusText}`);
  const json = await res.json();
  const list = Array.isArray(json) ? json : [json];

  return elevations.map((elevation, i) => {
    const c = list[i]?.current;
    if (!c) throw new Error(`stations: no data at ${elevation} m`);
    return {
      elevation,
      temp: Math.round(c.temperature_2m * 10) / 10,
      rh: Math.round(c.relative_humidity_2m),
      wind: Math.round(c.wind_speed_10m),
      gust: Math.round(c.wind_gusts_10m),
      dir: Math.round(c.wind_direction_10m),
      precipitation: c.precipitation ?? 0,
      cloud: c.cloud_cover ?? null,
      code: c.weather_code ?? null,
    };
  });
}
