import { Card } from "@/components/Ui";
import { compass } from "@/components/WindCard";
import { fmt } from "@/lib/Conditions";
import { tempAt } from "@/lib/Model";
import type { ZoneStation } from "@/lib/Stations";
import type { HillNow } from "@/lib/Weather";

const TZ = "America/Vancouver";
const time = (iso: string, withDay: boolean) =>
  new Date(iso).toLocaleString("en-CA", {
    timeZone: TZ,
    ...(withDay ? { month: "short", day: "numeric" } : {}),
    hour: "numeric",
    minute: "2-digit",
  });

const dash = <span className="text-[#7d8da1]">—</span>;

// Measured readings from weather stations in and near a zone, each beside the
// model's temperature at the station's height, so the estimates elsewhere on the
// page can be judged against what's actually being recorded.
export default function ZoneStations({
  stations,
  now,
}: {
  stations: ZoneStation[];
  now: HillNow | null;
}) {
  return (
    <Card className="overflow-x-auto">
      <h3 className="font-semibold text-white">Weather stations</h3>
      <p className="mb-4 mt-1 text-xs text-[#9aa7b5]">
        Measured, not modelled. Model temperature at each station&apos;s height shown
        for comparison.
      </p>
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead>
          <tr className="text-xs text-[#9aa7b5]">
            <th className="pb-2 font-normal">Station</th>
            <th className="pb-2 font-normal">Temperature</th>
            <th className="pb-2 font-normal">24 h range</th>
            <th className="pb-2 font-normal">Wind</th>
            <th className="pb-2 font-normal">Snow depth</th>
            <th className="pb-2 font-normal">Reported</th>
          </tr>
        </thead>
        <tbody>
          {stations.map((s) => {
            const r = s.reading;
            const model = now ? Math.round(tempAt(now.profile, s.elevation) * 10) / 10 : null;
            return (
              <tr key={s.id} className="border-t border-[#232a31] align-top">
                <td className="py-2.5 pr-3">
                  <p className="text-white">
                    {s.name} <span className="tabular-nums text-[#9aa7b5]">{fmt(s.elevation)} m</span>
                  </p>
                  <p className="text-xs text-[#7d8da1]">{s.where}</p>
                </td>
                {!r ? (
                  <td colSpan={5} className="py-2.5 text-[#9aa7b5]">
                    Not reporting
                  </td>
                ) : (
                  <>
                    <td className={`py-2.5 pr-3 ${s.stale ? "opacity-60" : ""}`}>
                      <span className="tabular-nums text-white">{r.temp == null ? dash : `${r.temp}°`}</span>
                      {model != null && (
                        <span className="block text-xs tabular-nums text-[#7d8da1]">model {model}°</span>
                      )}
                    </td>
                    <td className={`py-2.5 pr-3 tabular-nums text-white ${s.stale ? "opacity-60" : ""}`}>
                      {r.tempMin24 == null ? dash : `${r.tempMin24}° to ${r.tempMax24}°`}
                    </td>
                    <td className={`py-2.5 pr-3 tabular-nums text-white ${s.stale ? "opacity-60" : ""}`}>
                      {r.wind == null ? dash : `${r.wind} km/h${r.dir == null ? "" : ` ${compass(r.dir)}`}`}
                    </td>
                    <td className={`py-2.5 pr-3 tabular-nums text-white ${s.stale ? "opacity-60" : ""}`}>
                      {r.snow == null ? (
                        dash
                      ) : (
                        <>
                          {r.snow} cm
                          {r.snow24 != null && r.snow24 !== 0 && (
                            <span className="block text-xs text-[#9aa7b5]">
                              {r.snow24 > 0 ? "+" : ""}
                              {r.snow24} cm in 24 h
                            </span>
                          )}
                        </>
                      )}
                    </td>
                    <td className="py-2.5 text-xs text-[#9aa7b5]">
                      {s.stale ? `Last report ${time(r.time, true)}` : time(r.time, false)}
                    </td>
                  </>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="mt-3 text-xs text-[#7d8da1]">
        BC Ministry of Transportation and Infrastructure stations, via{" "}
        <a href="https://avalanche.ca" className="underline hover:text-white">
          Avalanche Canada
        </a>
        . Station sites can be sheltered or exposed, so readings vary a lot over short
        distances.
      </p>
    </Card>
  );
}
