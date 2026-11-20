import { cacheLife } from "next/cache";
import { MOUNTAINS, type MountainId } from "@/config/mountains";
import { fmtTime, readSnowReport, type SnowReport } from "@/lib/SnowReaders";
import { recall, remember } from "@/lib/SnowStore";

export type { SnowReport } from "@/lib/SnowReaders";

const TZ = "America/Vancouver";

// Months (1–12, Vancouver time) when the snow report is shown.
export const SNOW_SEASON_MONTHS = [11, 12, 1, 2, 3, 4];

export function isSnowSeason(now: Date) {
  const month = Number(
    new Intl.DateTimeFormat("en-CA", { timeZone: TZ, month: "numeric" }).format(now)
  );
  return SNOW_SEASON_MONTHS.includes(month);
}

// The resort's own snow report (see lib/SnowReaders.ts), or null outside the
// snow season (without fetching anything). When the resort can't be read, the
// last report read from it (lib/SnowStore.ts), marked as saved.
export async function getSnowReport(id: MountainId): Promise<SnowReport | null> {
  "use cache";
  // Resorts update once or twice a day, usually early morning.
  cacheLife({ stale: 300, revalidate: 1800, expire: 3 * 3600 });

  if (!isSnowSeason(new Date())) return null;
  const timeZone = MOUNTAINS.find((m) => m.id === id)?.timeZone ?? TZ;
  try {
    const report = await readSnowReport(id, timeZone);
    if (report.status === "ok") await remember(id, report);
    return report;
  } catch (err) {
    const last = await recall(id);
    if (!last) throw err;
    console.error(`Snow report ${id} failed; showing the one saved`, err);
    return { ...last.report, saved: fmtTime(last.readAt, timeZone) };
  }
}
