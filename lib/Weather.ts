import { cacheLife } from "next/cache";
import type { MountainConfig } from "@/config/mountains";

export interface MountainWeather {
  freezingLevel: number; // metres
  precipitation: number; // mm/h
  snowfall: number; // cm/h
  temperature: number; // °C at model surface
  wind: number; // km/h
  time: string; // ISO, UTC
}

// Tried in order until one returns a freezing level. The Canadian GEM models may not
// provide freezing_level_height, so fall back to Open-Meteo's default blend (undefined)
// and then GFS.
const MODELS: (string | undefined)[] = [
  "gem_hrdps_continental",
  "gem_seamless",
  undefined,
  "gfs_seamless",
];

async function fetchWithModel(m: MountainConfig, model?: string) {
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", String(m.lat));
  url.searchParams.set("longitude", String(m.lon));
  url.searchParams.set(
    "hourly",
    "temperature_2m,precipitation,snowfall,freezing_level_height,wind_speed_10m"
  );
  if (model) url.searchParams.set("models", model);
  // GMT so response times line up with new Date().toISOString()
  url.searchParams.set("timezone", "GMT");
  url.searchParams.set("forecast_days", "2");

  const res = await fetch(url);
  if (!res.ok) throw new Error(`${model ?? "default"}: ${res.status} ${res.statusText}`);
  return res.json();
}

export async function fetchMountainWeather(
  m: MountainConfig
): Promise<MountainWeather> {
  "use cache";
  // Cache for 15 min, serve stale briefly while refreshing, drop after an hour.
  cacheLife({ stale: 300, revalidate: 900, expire: 3600 });

  let lastError: unknown;

  for (const model of MODELS) {
    try {
      const data = await fetchWithModel(m, model);
      const h = data.hourly;
      const times: string[] = h.time;

      // Open-Meteo returns "YYYY-MM-DDTHH:MM" in GMT; pick the current hour.
      const nowHour = new Date().toISOString().slice(0, 13);
      let i = times.findIndex((t) => t.startsWith(nowHour));
      if (i === -1) i = 0;

      const fl = h.freezing_level_height?.[i];
      if (fl == null) throw new Error(`${model ?? "default"}: no freezing level in response`);

      return {
        freezingLevel: Math.round(fl),
        precipitation: h.precipitation?.[i] ?? 0,
        snowfall: h.snowfall?.[i] ?? 0,
        temperature: Math.round((h.temperature_2m?.[i] ?? 0) * 10) / 10,
        wind: Math.round(h.wind_speed_10m?.[i] ?? 0),
        time: times[i] + "Z",
      };
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError ?? new Error("Weather fetch failed");
}