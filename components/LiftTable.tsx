import { Card } from "@/components/Ui";
import type { Lift } from "@/config/lifts";
import { CONDITION, conditionAt, fmt } from "@/lib/Conditions";
import type { StationReading } from "@/lib/Forecast";

function Station({
  elevation,
  stations,
  freezingLevel,
}: {
  elevation: number | null;
  stations: StationReading[];
  freezingLevel: number;
}) {
  const s = elevation == null ? undefined : stations.find((x) => x.elevation === elevation);
  if (elevation == null || !s) return <span className="text-[#7d8da1]">—</span>;

  const c = conditionAt(elevation, freezingLevel, {
    precipitation: s.precipitation,
    cloud: s.cloud,
    code: s.code,
  });

  return (
    <div>
      <p className="text-xs tabular-nums text-[#7d8da1]">~{fmt(elevation)} m</p>
      <div className="mt-1 flex items-center gap-2">
        <span className="w-12 tabular-nums text-white">{s.temp}°</span>
        <span
          className={`chip ${CONDITION[c].chip}`}
        >
          {CONDITION[c].label}
        </span>
      </div>
    </div>
  );
}

export default function LiftTable({
  lifts,
  stations,
  freezingLevel,
  color,
}: {
  lifts: Lift[];
  stations: StationReading[];
  freezingLevel: number;
  color: string;
}) {
  return (
    <Card className="overflow-x-auto">
      <h3 className="font-semibold text-white">Lifts</h3>
      <p className="mb-4 mt-1 text-xs text-[#9aa7b5]">
        Temperature and conditions at the bottom and top station of each lift
      </p>
      <table className="w-full min-w-[620px] text-left text-sm">
        <thead>
          <tr className="text-xs text-[#9aa7b5]">
            <th className="pb-2 font-normal">Lift</th>
            <th className="pb-2 font-normal">Elevation</th>
            <th className="pb-2 font-normal">Bottom station</th>
            <th className="pb-2 font-normal">Top station</th>
          </tr>
        </thead>
        <tbody>
          {lifts.map((l) => {
            const known = l.bottom != null && l.top != null;
            return (
              <tr key={l.name} className="border-t border-[#232a31] align-top">
                <td
                  className="py-3 pl-3 pr-4"
                  style={{ borderLeft: `3px solid ${color}` }}
                >
                  <p className="text-white">{l.name}</p>
                  <p className="text-xs text-[#7d8da1]">
                    {l.kind}
                    {l.length ? ` · ${fmt(l.length)} m long` : ""}
                  </p>
                </td>
                <td className="py-3 pr-4 tabular-nums">
                  {known ? (
                    <>
                      <p className="text-white">
                        {fmt(l.bottom!)}–{fmt(l.top!)} m
                        {l.est && (
                          <span className="ml-1.5 bg-white/10 px-1.5 py-0.5 text-[10px] text-[#c9d3dd]">
                            est.
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-[#7d8da1]">
                        {fmt(l.top! - l.bottom!)} m vertical
                      </p>
                    </>
                  ) : (
                    <p className="text-xs text-[#7d8da1]">Not available</p>
                  )}
                </td>
                <td className="py-3 pr-4">
                  <Station
                    elevation={l.bottom}
                    stations={stations}
                    freezingLevel={freezingLevel}
                  />
                </td>
                <td className="py-3">
                  <Station
                    elevation={l.top}
                    stations={stations}
                    freezingLevel={freezingLevel}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="mt-4 text-xs text-[#7d8da1]">
        Elevations are approximate. Entries marked est. are estimated from lift
        length and vertical drop. Temperatures are model estimates adjusted to
        each station&rsquo;s elevation.
      </p>
    </Card>
  );
}
