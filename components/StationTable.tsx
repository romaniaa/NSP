import { Card } from "@/components/Ui";
import { PRECIP, fmt, precipAt } from "@/lib/Conditions";
import type { PointReading } from "@/lib/Forecast";

function Gust({ value, dir }: { value: number; dir: number }) {
  return (
    <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-[#14181c] text-sm font-semibold tabular-nums text-white">
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
  return (
    <Card className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead>
          <tr className="text-xs uppercase tracking-wider text-[#7fa3d6]">
            <th className="pb-4 font-normal">Location</th>
            <th className="pb-4 text-center font-normal">Temp °C</th>
            <th className="pb-4 font-normal">Conditions</th>
            <th className="pb-4 text-right font-normal">RH %</th>
            <th className="pb-4 text-right font-normal">Avg wind</th>
            <th className="pb-4 text-center font-normal">Gusts km/h</th>
          </tr>
        </thead>
        <tbody>
          {readings.map((r) => {
            const p = precipAt(r.elevation, freezingLevel);
            const cold = r.temp <= 0;
            return (
              <tr key={r.id}>
                <td className="py-2.5 pr-4">
                  <p className="text-white">{r.label}</p>
                  <p className="text-xs tabular-nums text-[#7d8da1]">
                    ~{fmt(r.elevation)} m
                  </p>
                </td>
                <td className="py-2.5">
                  <div
                    className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full border-2 bg-[#0f1316] text-sm font-medium tabular-nums text-white ${
                      cold ? "border-[#4f7cff]" : "border-[#f2994a]"
                    }`}
                  >
                    {r.temp}°
                  </div>
                </td>
                <td className="py-2.5">
                  <span
                    className={`inline-flex rounded px-2 py-1 text-xs font-medium ${PRECIP[p].chip}`}
                  >
                    {PRECIP[p].label}
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
      </table>
    </Card>
  );
}