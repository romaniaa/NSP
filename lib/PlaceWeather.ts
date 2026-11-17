import type { MountainConfig } from "@/config/mountains";
import type { ModelHour } from "@/lib/Model";
import { tempAt } from "@/lib/Profile";

// Current conditions as the cards use them. No server imports, so cards rendered
// in the browser can use these (lib/Weather.ts picks the hour and re-exports them).

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
  // Air temperature (°C) at the top and bottom lift stations.
  temps: { top: number; bottom: number };
}

// The summary a hill card needs, from a place's current conditions.
export function weatherFrom(h: HillNow, m: MountainConfig): MountainWeather {
  const t = (z: number) => Math.round(tempAt(h.profile, z) * 10) / 10;
  return {
    temps: { top: t(m.lifts.top.elevation), bottom: t(m.lifts.bottom.elevation) },
    freezingLevel: h.freezingLevel,
    precipitation: h.precipitation,
    wind: Math.round(h.wind),
    cloud: h.cloud,
    code: h.code,
    time: h.time,
  };
}
