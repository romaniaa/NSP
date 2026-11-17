import { cacheLife } from "next/cache";
import { MOUNTAINS } from "@/config/mountains";
import { ZONES } from "@/config/zones";
import type { PlaceId } from "@/lib/Model";
import { getSnowReport, type SnowReport } from "@/lib/SnowReport";
import { getZoneStations } from "@/lib/Stations";

// Snow on the ground right now, for the cards: a hill's own snow report, or for
// a backcountry zone its highest weather station with snow on the ground. Exposed
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

// Every place with a reading. Places without one (no report reader, report not
// posted, out of season, no station with a snow sensor) are left out. Reports and
// stations are cached on their own schedules; this only reshapes them.
export async function getSnowNow(): Promise<Partial<Record<PlaceId, SnowNow>>> {
  "use cache";
  cacheLife({ stale: 300, revalidate: 900, expire: 3600 });

  const out: Partial<Record<PlaceId, SnowNow>> = {};

  const reports = await Promise.allSettled(MOUNTAINS.map((m) => getSnowReport(m.id)));
  reports.forEach((r, i) => {
    if (r.status === "rejected") {
      console.error("Snow report failure:", r.reason);
      return;
    }
    const snow = snowFromReport(r.value);
    if (snow) out[MOUNTAINS[i].id] = snow;
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
    if (!best?.reading || best.reading.snow == null) return;
    out[ZONES[i].id] = {
      cm: best.reading.snow,
      where: `${best.name} · ${fmt(best.elevation)} m`,
      // Depth change, so settling shows as a loss; only a gain counts as new snow.
      new24: best.reading.snow24 != null && best.reading.snow24 > 0 ? best.reading.snow24 : null,
      source: "station",
    };
  });

  return out;
}
