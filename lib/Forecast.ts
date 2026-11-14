import { cacheLife } from "next/cache";
import { LIFTS } from "@/config/lifts";
import { MOUNTAINS, type MountainId } from "@/config/mountains";
import type { RegionId } from "@/config/regions";
import { fetchSnapshot, tempAt, type PlaceId } from "@/lib/Model";
import { getCurrentConditions, type HillNow } from "@/lib/Weather";

const TZ = "America/Vancouver";

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
    hill: m.id,
    region: m.region,
    elevation: m.lifts.top.elevation,
  },
  {
    id: `${m.id}-bottom`,
    label: `${m.name} bottom`,
    mountain: m.name,
    color: m.color,
    hill: m.id,
    region: m.region,
    elevation: m.lifts.bottom.elevation,
  },
]).sort((a, b) => b.elevation - a.elevation);

// Reading at a lift station. Temperature comes from the model's air temperature at
// that height. The other values are the model's surface values for the hill, so
// they are the same at every station on it.
function readingAt(h: HillNow, elevation: number) {
  return {
    temp: Math.round(tempAt(h.profile, elevation) * 10) / 10,
    rh: Math.round(h.rh),
    wind: Math.round(h.wind),
    gust: Math.round(h.gust),
    dir: Math.round(h.dir),
    precipitation: h.precipitation,
    cloud: h.cloud,
    code: h.code,
  };
}

// Top and bottom lift readings for every hill in a region, highest first.
export async function getPointReadings(region: RegionId): Promise<PointReading[]> {
  const now = await getCurrentConditions();
  return POINTS.filter((p) => p.region === region).map((p) => ({
    id: p.id,
    label: p.label,
    mountain: p.mountain,
    color: p.color,
    elevation: p.elevation,
    ...readingAt(now[p.hill], p.elevation),
  }));
}

// Freezing-level history and forecast for one place, or the average of several
// (the North Shore overview). "Now" is the same model hour and value that current
// conditions use, so a page shows one freezing level throughout.
export async function getFreezingSeries(ids: PlaceId[]): Promise<FreezingSeries> {
  "use cache";
  cacheLife({ stale: 300, revalidate: 900, expire: 3600 });

  const [snapshot, now] = await Promise.all([fetchSnapshot(), getCurrentConditions()]);
  const series = ids.map((id) => snapshot.places[id].levels);
  const times = series[0].time;

  // Hourly mean across the places, skipping any gaps.
  const vals = times.map((_, i) => {
    const vs = series.map((s) => s.level[i]).filter((v): v is number => v != null);
    return vs.length ? vs.reduce((a, b) => a + b, 0) / vs.length : null;
  });

  const nowTime = now[ids[0]].time;
  const idx = times.indexOf(nowTime);
  if (idx === -1) throw new Error(`freezing: ${nowTime} not in the series`);
  const current = ids.reduce((sum, id) => sum + now[id].freezingLevel, 0) / ids.length;

  const at = (i: number) => vals[i] ?? null;
  const next = at(idx + 24);
  const past = at(idx - 25);

  // Days run midnight to midnight in Vancouver.
  const dayOf = new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const byDay = new Map<string, number[]>();
  times.forEach((t, i) => {
    const v = vals[i];
    if (v == null) return;
    const key = dayOf.format(new Date(t)); // YYYY-MM-DD
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

  const todayIdx = days.findIndex((d) => d.key === dayOf.format(new Date(nowTime)));
  const start = todayIdx === -1 ? 0 : todayIdx;

  return {
    current: Math.round(current),
    deltaNext24: next == null ? null : Math.round(next - current),
    deltaPast25: past == null ? null : Math.round(current - past),
    history: days.slice(Math.max(0, start - 9), start + 1),
    forecast: days.slice(start, start + 6),
    updated: new Date(snapshot.fetched).toLocaleString("en-CA", {
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

// Current readings at every lift station elevation on one mountain, highest first.
export async function getMountainReadings(
  id: MountainId
): Promise<StationReading[]> {
  const elevations = [
    ...new Set(
      LIFTS[id]
        .flatMap((l) => [l.bottom, l.top])
        .filter((e): e is number => e != null)
    ),
  ].sort((a, b) => b - a);

  const h = (await getCurrentConditions())[id];
  return elevations.map((elevation) => ({ elevation, ...readingAt(h, elevation) }));
}
