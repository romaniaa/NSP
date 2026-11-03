import MountainIcon from "@/components/MountainIcon";
import { Card } from "@/components/Ui";
import { MOUNTAINS } from "@/config/mountains";
import {
  CONDITION,
  conditionAt,
  extremes,
  fmt,
  vertical,
} from "@/lib/Conditions";
import type { PointReading } from "@/lib/Forecast";

function Gust({ value, dir }: { value: number; dir: number }) {
  return (
    <div className="relative flex h-12 w-12 items-center justify-center rounded-full border border-[#3a444d] bg-[#0f1316] text-sm font-semibold tabular-nums text-white">
      {value}
      {/* Marker sits on the rim at the direction the wind blows from */}
      <span
        className="absolute inset-0"
        style={{ transform: `rotate(${dir}deg)` }}
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 10 10"
          className="absolute -top-1 left-1/2 h-2.5 w-2.5 -translate-x-1/2"
        >
          <polygon points="0,0 10,0 5,9" fill="#b3413f" />
        </svg>
      </span>
    </div>
  );
}

export default function StationTable({
  readings,
  freezingLevel,
}: {
  readings: PointReading[];
  freezingLevel: number;
}) {
  // One group per mountain (in config order), top lift first.
  const groups = MOUNTAINS.map((mountain) => ({
    mountain,
    rows: readings
      .filter((r) => r.id.startsWith(`${mountain.id}-`))
      .sort((a, b) => b.elevation - a.elevation),
  })).filter((g) => g.rows.length > 0);

  return (
    <Card className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead>
          <tr className="text-xs text-[#9aa7b5]">
            <th className="pb-2 font-normal">Location</th>
            <th className="pb-2 text-center font-normal">Temp °C</th>
            <th className="pb-2 font-normal">Conditions</th>
            <th className="pb-2 text-right font-normal">RH %</th>
            <th className="pb-2 text-right font-normal">Avg wind</th>
            <th className="pb-2 text-center font-normal">Gusts km/h</th>
          </tr>
        </thead>
        {groups.map(({ mountain, rows }) => {
          const { low, high } = extremes(mountain);
          return (
            <tbody key={mountain.id}>
              <tr>
                <th
                  colSpan={6}
                  scope="colgroup"
                  className="pb-1 pt-5 text-left font-normal"
                >
                  <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span className="flex items-center gap-2 font-display text-xl font-bold uppercase tracking-wide text-white">
                      <MountainIcon
                        id={mountain.id}
                        color={mountain.color}
                        className="h-4 w-[21px]"
                      />
                      {mountain.name}
                    </span>
                    <span className="text-xs tabular-nums text-[#7d8da1]">
                      {fmt(low)}–{fmt(high)} m · {fmt(vertical(mountain))} m
                      vertical
                    </span>
                  </span>
                </th>
              </tr>
              {rows.map((r) => {
                const p = conditionAt(r.elevation, freezingLevel, {
                  precipitation: r.precipitation,
                  cloud: r.cloud,
                  code: r.code,
                });
                const cold = r.temp <= 0;
                return (
                  <tr key={r.id}>
                    <td
                      className="py-2.5 pl-4 pr-4"
                      style={{ borderLeft: `3px solid ${mountain.color}` }}
                    >
                      <p className="text-white">
                        {r.id.endsWith("-top") ? "Top lift" : "Lowest lift"}
                      </p>
                      <p className="text-xs tabular-nums text-[#7d8da1]">
                        ~{fmt(r.elevation)} m
                      </p>
                    </td>
                    <td className="py-2.5">
                      <div
                        className={`mx-auto flex h-9 w-14 items-center justify-center border-l-[3px] bg-[#0f1316] text-sm font-medium tabular-nums text-white ${
                          cold ? "border-[#4f7cff]" : "border-[#f87171]"
                        }`}
                      >
                        {r.temp}°
                      </div>
                    </td>
                    <td className="py-2.5">
                      <span
                        className={`chip ${CONDITION[p].chip}`}
                      >
                        {CONDITION[p].label}
                      </span>
                    </td>
                    <td className="py-2.5 text-right tabular-nums text-white">
                      {r.rh}%
                    </td>
                    <td className="py-2.5 text-right tabular-nums text-white">
                      {r.wind}
                      <span className="ml-1 text-xs text-[#7d8da1]">km/h</span>
                    </td>
                    <td className="py-2.5">
                      <div className="mx-auto w-12">
                        <Gust value={r.gust} dir={r.dir} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          );
        })}
      </table>
    </Card>
  );
}