import { cacheLife } from "next/cache";
import type { MountainConfig } from "@/config/mountains";
import { fetchSnapshot, freezingLevel, type ModelHour, type PlaceId } from "@/lib/Model";

export interface HillNow extends ModelHour {
  freezingLevel: number; // metres
}

export interface MountainWeather {
  freezingLevel: number; // metres
  precipitation: number; // mm/h
  wind: number; // km/h
  cloud: number | null; // % total cloud cover
  code: number | null; // WMO weather code
  time: string; // ISO, UTC, the model hour shown
}

// Older than this and the data is treated as unavailable rather than shown as current.
const MAX_AGE_MS = 90 * 60 * 1000;

// The model hour nearest to now for every hill and backcountry zone. The model
// data refreshes hourly (lib/Model.ts); this re-picks the hour every 15 minutes
// without another API call.
export async function getCurrentConditions(): Promise<Record<PlaceId, HillNow>> {
  "use cache";
  cacheLife({ stale: 300, revalidate: 900, expire: 3600 });

  const snapshot = await fetchSnapshot();
  const now = Date.now();

  const entries = Object.entries(snapshot.places).map(([id, hours]) => {
    let best: ModelHour | null = null;
    let bestGap = Infinity;
    for (const h of hours) {
      const gap = Math.abs(Date.parse(h.time) - now);
      if (gap < bestGap) [best, bestGap] = [h, gap];
    }
    if (!best || bestGap > MAX_AGE_MS) {
      throw new Error(`no model hour near now for ${id} (fetched ${snapshot.fetched})`);
    }
    return [id, { ...best, freezingLevel: freezingLevel(best.profile) }];
  });

  return Object.fromEntries(entries) as Record<PlaceId, HillNow>;
}

export async function getMountainWeather(m: MountainConfig): Promise<MountainWeather> {
  const h = (await getCurrentConditions())[m.id];
  return {
    freezingLevel: h.freezingLevel,
    precipitation: h.precipitation,
    wind: Math.round(h.wind),
    cloud: h.cloud,
    code: h.code,
    time: h.time,
  };
}
