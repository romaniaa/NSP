import { PRECIP_THRESHOLD, precipAt, type Condition } from "@/lib/Conditions";
import { tempAt, windAloft, type Profile, type WindProfile } from "@/lib/Profile";

// A day of the model forecast for one hill or zone, summarised at its top and
// bottom heights: what the forecast card on its page shows. Built from the same
// hourly GEM data as everything else (lib/Model.ts), so it costs no extra calls
// and agrees with the freezing level and current conditions on the page.

// New snow from precipitation, in cm per mm of water. 10:1 is the usual rule of
// thumb; real ratios run from about 5:1 (wet coastal snow) to 20:1 (cold, dry
// Interior snow), so treat snowfall as a rough guide. Wet snow counts half.
const SNOW_CM_PER_MM = 1;
const WET_SNOW_CM_PER_MM = 0.5;
// A day with less precipitation than this is shown by its sky, not as wet.
const WET_DAY_MM = 1;
// Shorter than this and a day is too partial to summarise (the last forecast day).
const MIN_HOURS = 18;

export interface HeightDay {
  min: number; // °C
  max: number; // °C
  snow: number; // cm of new snow, approximate
  rain: number; // mm of rain
}

export interface DayForecast {
  date: string; // YYYY-MM-DD in the place's time zone
  condition: Condition; // the precipitation type at the top on wet days, else the sky
  precip: number; // mm of water in the day
  top: HeightDay;
  bottom: HeightDay;
  freezing: { min: number; max: number }; // m
  gust: number; // km/h, strongest gust at 10 m above the model surface
  ridge: { speed: number; dir: number }; // strongest free-air wind at the top, km/h
}

export interface HourInput {
  time: string; // ISO, UTC
  profile: Profile | null;
  aloft: WindProfile | null;
  level: number | null; // freezing level, m
  precipitation: number | null; // mm
  cloud: number | null; // %
  code: number | null; // WMO
  gust: number | null; // km/h
}

const round1 = (n: number) => Math.round(n * 10) / 10;

function height(hours: HourInput[], z: number): HeightDay {
  const temps = hours.flatMap((h) => (h.profile ? [tempAt(h.profile, z)] : []));
  let snow = 0;
  let rain = 0;
  for (const h of hours) {
    const mm = h.precipitation ?? 0;
    if (mm < PRECIP_THRESHOLD || h.level == null) continue;
    const kind = precipAt(z, h.level);
    if (kind === "snow") snow += mm * SNOW_CM_PER_MM;
    else if (kind === "mixed") snow += mm * WET_SNOW_CM_PER_MM;
    else rain += mm;
  }
  return {
    min: Math.round(Math.min(...temps)),
    max: Math.round(Math.max(...temps)),
    snow: Math.round(snow),
    rain: Math.round(rain),
  };
}

function condition(hours: HourInput[], top: number, precip: number): Condition {
  if (precip >= WET_DAY_MM) {
    // The type that brought the most water at the top.
    const by = { snow: 0, mixed: 0, rain: 0 };
    for (const h of hours) {
      if (h.level != null && h.precipitation) by[precipAt(top, h.level)] += h.precipitation;
    }
    return (Object.keys(by) as (keyof typeof by)[]).reduce((a, b) => (by[b] > by[a] ? b : a));
  }
  const fog = hours.filter((h) => h.code === 45 || h.code === 48).length;
  if (fog >= hours.length / 3) return "fog";
  const clouds = hours.flatMap((h) => (h.cloud == null ? [] : [h.cloud]));
  if (clouds.length === 0) return "dry";
  const cloud = clouds.reduce((a, b) => a + b, 0) / clouds.length;
  return cloud < 20 ? "clear" : cloud < 60 ? "partly" : "cloudy";
}

// Today and the days after it, in the place's time zone, up to `days` of them.
export function summariseDays(
  hours: HourInput[],
  { top, bottom, timeZone }: { top: number; bottom: number; timeZone: string },
  now: number,
  days = 7
): DayForecast[] {
  const dayOf = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const today = dayOf.format(new Date(now));
  const byDay = new Map<string, HourInput[]>();
  for (const h of hours) {
    const key = dayOf.format(new Date(h.time));
    if (key < today) continue;
    byDay.set(key, [...(byDay.get(key) ?? []), h]);
  }

  const out: DayForecast[] = [];
  for (const [date, hs] of byDay) {
    if (hs.length < MIN_HOURS || out.length >= days) continue;
    const levels = hs.flatMap((h) => (h.level == null ? [] : [h.level]));
    const winds = hs.flatMap((h) => (h.aloft ? [windAloft(h.aloft, top)] : []));
    const ridge = winds.reduce((a, b) => (b.speed > a.speed ? b : a), { speed: 0, dir: 0 });
    const precip = round1(hs.reduce((sum, h) => sum + (h.precipitation ?? 0), 0));
    if (levels.length === 0) continue;
    out.push({
      date,
      condition: condition(hs, top, precip),
      precip,
      top: height(hs, top),
      bottom: height(hs, bottom),
      freezing: { min: Math.min(...levels), max: Math.max(...levels) },
      gust: Math.round(Math.max(0, ...hs.map((h) => h.gust ?? 0))),
      ridge,
    });
  }
  return out;
}
