import { cacheLife } from "next/cache";
import { STATIONS, stationById } from "@/config/stations";
import { MOUNTAINS, type MountainId } from "@/config/mountains";
import type { ZoneId } from "@/config/zones";
import { ZONES } from "@/config/zones";

// Measured weather from automated stations near the backcountry zones, via
// Avalanche Canada's public feed. Its use falls under the same Avalanche Canada
// permission as the danger ratings (see lib/Avalanche.ts).

const API = "https://weather.prod.avalanche.ca/stations";
const DAY_MS = 24 * 3600 * 1000;
// Older than this and a reading is shown as a past report, not current.
const STALE_MS = 3 * 3600 * 1000;

export interface StationSummary {
  id: number;
  time: string; // ISO, latest reading
  temp: number | null; // °C
  tempMin24: number | null; // over the 24 hours to the latest reading
  tempMax24: number | null;
  wind: number | null; // km/h average
  dir: number | null; // degrees the wind comes from
  rh: number | null; // %
  snow: number | null; // cm on the ground
  snow24: number | null; // change in snow depth over 24 hours, cm
}

interface Measurement {
  measurementDateTime: string;
  airTempAvg?: number | null;
  airTempMin?: number | null;
  airTempMax?: number | null;
  windSpeedAvg?: number | null;
  windDirAvg?: number | null;
  relativeHumidity?: number | null;
  snowHeight?: number | null;
}

const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : null);
// Sensors report small negatives on bare ground (e.g. -1 cm); treat those as zero.
const depth = (v: unknown) => {
  const n = num(v);
  return n == null ? null : Math.max(0, Math.round(n));
};

function summarise(id: number, rows: Measurement[]): StationSummary | null {
  const sorted = rows
    .filter((r) => r.measurementDateTime)
    .sort((a, b) => b.measurementDateTime.localeCompare(a.measurementDateTime)); // newest first
  const latest = sorted[0];
  if (!latest) return null;

  const t0 = Date.parse(latest.measurementDateTime);
  const day = sorted.filter((r) => t0 - Date.parse(r.measurementDateTime) < DAY_MS);
  const temps = day
    .flatMap((r) => [num(r.airTempMin) ?? num(r.airTempAvg), num(r.airTempMax) ?? num(r.airTempAvg)])
    .filter((v): v is number => v != null);

  // Snow depth now against the reading closest to 24 hours earlier.
  const snow = depth(latest.snowHeight);
  const before = sorted.find((r) => t0 - Date.parse(r.measurementDateTime) >= DAY_MS - 3600_000);
  const snowBefore = before ? depth(before.snowHeight) : null;

  const round1 = (v: number | null) => (v == null ? null : Math.round(v * 10) / 10);
  return {
    id,
    time: latest.measurementDateTime,
    temp: round1(num(latest.airTempAvg)),
    tempMin24: temps.length ? round1(Math.min(...temps)) : null,
    tempMax24: temps.length ? round1(Math.max(...temps)) : null,
    wind: num(latest.windSpeedAvg) == null ? null : Math.round(num(latest.windSpeedAvg)!),
    dir: num(latest.windDirAvg),
    rh: num(latest.relativeHumidity) == null ? null : Math.round(num(latest.relativeHumidity)!),
    snow,
    snow24: snow != null && snowBefore != null ? snow - snowBefore : null,
  };
}

// Latest summary for every station, refreshed every 30 minutes (stations report
// hourly) and shared between server instances: one small request per station
// every half hour.
// A station that fails or has no data is null; the others still show.
export async function fetchStations(): Promise<Record<number, StationSummary | null>> {
  "use cache: remote";
  cacheLife({ stale: 300, revalidate: 1800, expire: 6 * 3600 });

  const entries = await Promise.all(
    STATIONS.map(async (s) => {
      try {
        const res = await fetch(`${API}/${s.id}/measurements`, {
          signal: AbortSignal.timeout(15_000),
        });
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
        const rows: Measurement[] = await res.json();
        return [s.id, summarise(s.id, Array.isArray(rows) ? rows : [])] as const;
      } catch (err) {
        console.error(`station ${s.id} (${s.name}):`, err);
        return [s.id, null] as const;
      }
    })
  );
  return Object.fromEntries(entries);
}

export type ZoneStation = (typeof STATIONS)[number] & {
  reading: StationSummary | null; // null: not reporting
  stale: boolean; // the latest reading is more than 3 hours old
};

// The stations for one zone with their latest readings, judged against now.
export async function getZoneStations(id: ZoneId): Promise<ZoneStation[]> {
  "use cache";
  cacheLife({ stale: 300, revalidate: 900, expire: 3600 });

  const zone = ZONES.find((z) => z.id === id);
  if (!zone || zone.stations.length === 0) return [];
  const all = await fetchStations();
  const now = Date.now();
  return zone.stations.flatMap((sid) => {
    const config = stationById(sid);
    if (!config) return [];
    const reading = all[sid] ?? null;
    return [
      { ...config, reading, stale: reading != null && now - Date.parse(reading.time) > STALE_MS },
    ];
  });
}

export type HillStation = ZoneStation & {
  km: number; // straight-line distance from the hill's weather point
};

const toRad = (d: number) => (d * Math.PI) / 180;
function distanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const a =
    Math.sin(toRad(lat2 - lat1) / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(toRad(lon2 - lon1) / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(a));
}

// The snow sensor beside a hill (config/mountains.ts snowStation) with its latest
// reading, or null when the hill has none. Its reading is null when the station
// isn't reporting, or reports no snow depth.
export async function getHillSnowStation(id: MountainId): Promise<HillStation | null> {
  "use cache";
  cacheLife({ stale: 300, revalidate: 900, expire: 3600 });

  const hill = MOUNTAINS.find((m) => m.id === id);
  const config = hill?.snowStation != null ? stationById(hill.snowStation) : undefined;
  if (!hill || !config) return null;
  const all = await fetchStations();
  const reading = all[config.id] ?? null;
  return {
    ...config,
    reading: reading?.snow != null ? reading : null,
    stale: reading != null && Date.now() - Date.parse(reading.time) > STALE_MS,
    km: Math.round(distanceKm(hill.lat, hill.lon, config.lat, config.lon)),
  };
}
