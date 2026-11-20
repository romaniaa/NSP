import { cacheLife } from "next/cache";
import { MOUNTAINS } from "@/config/mountains";
import { ZONES } from "@/config/zones";
import type { PlaceId } from "@/lib/Model";
import { getSnowReport, isSnowSeason, type SnowReport } from "@/lib/SnowReport";
import { getHillSnowStation, getZoneStations, type ZoneStation } from "@/lib/Stations";

// Snow on the ground right now, for the cards: a hill's own snow report (or, when
// it has none, the snow sensor beside it), or for a backcountry zone its highest
// weather station with snow on the ground. Exposed
// sensors can be blown bare (Abbott, 2,130 m, read 0 cm beside 40 cm at Fidelity
// in Nov 2026), so a bare reading is used only when no station has snow.
export interface SnowNow {
  cm: number;
  where: string; // e.g. "Peak", "Upper mountain", or "Fidelity · 1,905 m"
  new24: number | null; // new snow in 24 hours, cm, when the source gives it
  source: "report" | "station";
}

const fmt = (n: number) => n.toLocaleString("en-CA");

// A resort report's headline depth (listed first) and 24-hour snowfall.
export function snowFromReport(report: SnowReport | null): SnowNow | undefined {
  if (report?.status !== "ok" || report.depths.length === 0) return undefined;
  const [first] = report.depths;
  return {
    cm: first.cm,
    where: first.label,
    new24: report.snowfall.find((s) => s.label === "24 hours")?.cm ?? null,
    source: "report",
  };
}

// A station's current snow depth, or undefined when it isn't reporting one.
export function snowFromStation(station: ZoneStation | null | undefined): SnowNow | undefined {
  const r = station?.reading;
  if (!station || station.stale || r?.snow == null) return undefined;
  return {
    cm: r.snow,
    where: `${station.name} · ${fmt(station.elevation)} m`,
    // Depth change, so settling shows as a loss; only a gain counts as new snow.
    new24: r.snow24 != null && r.snow24 > 0 ? r.snow24 : null,
    source: "station",
  };
}

// A hill's snow: the resort's report when it has figures, else its station.
export const hillSnow = (report: SnowReport | null, station: ZoneStation | null) =>
  snowFromReport(report) ?? snowFromStation(station);

// Every place with a reading. Places without one (no report reader, report not
// posted, out of season, no station with a snow sensor) are left out. Reports and
// stations are cached on their own schedules; this only reshapes them.
export async function getSnowNow(): Promise<Partial<Record<PlaceId, SnowNow>>> {
  "use cache";
  cacheLife({ stale: 300, revalidate: 900, expire: 3600 });

  const out: Partial<Record<PlaceId, SnowNow>> = {};

  // Hills: the report, else (in the snow season only) the station beside the hill.
  const inSeason = isSnowSeason(new Date());
  const [reports, stations] = await Promise.all([
    Promise.allSettled(MOUNTAINS.map((m) => getSnowReport(m.id))),
    Promise.allSettled(MOUNTAINS.map((m) => getHillSnowStation(m.id))),
  ]);
  MOUNTAINS.forEach((m, i) => {
    const report = reports[i];
    const station = stations[i];
    if (report.status === "rejected") console.error("Snow report failure:", report.reason);
    if (station.status === "rejected") console.error("Station failure:", station.reason);
    const snow =
      (report.status === "fulfilled" ? snowFromReport(report.value) : undefined) ??
      (inSeason && station.status === "fulfilled" ? snowFromStation(station.value) : undefined);
    if (snow) out[m.id] = snow;
  });

  const zones = await Promise.allSettled(ZONES.map((z) => getZoneStations(z.id)));
  zones.forEach((r, i) => {
    if (r.status === "rejected") {
      console.error("Station failure:", r.reason);
      return;
    }
    const current = r.value
      .filter((s) => !s.stale && s.reading?.snow != null)
      .sort((a, b) => b.elevation - a.elevation);
    const best = current.find((s) => s.reading!.snow! > 0) ?? current[0];
    const snow = snowFromStation(best);
    if (snow) out[ZONES[i].id] = snow;
  });

  return out;
}
