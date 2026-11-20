import type { MountainConfig } from "@/config/mountains";
import type { MountainWeather } from "@/lib/Weather";
import { PRECIP, extremes, precipAt, verdict } from "@/lib/Conditions";

interface Row {
  config: MountainConfig;
  weather: MountainWeather | null;
}

function Chip({ elevation, fl }: { elevation: number; fl: number }) {
  const p = precipAt(elevation, fl);
  return (
    <span
      className={`chip ${PRECIP[p].chip}`}
    >
      <span className={`h-1.5 w-1.5 ${PRECIP[p].dot}`} />
      {PRECIP[p].label}
    </span>
  );
}

export default function SummaryTable({ rows }: { rows: Row[] }) {
  return (
    <div className="overflow-x-auto border border-line bg-sunken">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead>
          <tr className="border-b border-line text-xs text-muted">
            <th className="px-5 py-3 font-normal">Mountain</th>
            <th className="px-3 py-3 font-normal">Right now</th>
            <th className="px-3 py-3 text-right font-normal">Freezing level</th>
            <th className="px-3 py-3 font-normal">Lowest lift</th>
            <th className="px-3 py-3 font-normal">Top lift</th>
            <th className="px-3 py-3 text-right font-normal">Precip</th>
            <th className="px-5 py-3 text-right font-normal">Wind</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ config, weather }) => {
            const { low, high } = extremes(config);
            return (
              <tr
                key={config.id}
                className="border-b border-line last:border-0"
              >
                <td className="px-5 py-4 font-semibold text-ink">
                  {config.name}
                </td>
                {weather ? (
                  <>
                    <td className="px-3 py-4 text-ink-2">
                      {verdict(config, weather.freezingLevel)}
                    </td>
                    <td className="px-3 py-4 text-right tabular-nums text-ink">
                      {weather.freezingLevel.toLocaleString("en-CA")} m
                    </td>
                    <td className="px-3 py-4">
                      <Chip elevation={low} fl={weather.freezingLevel} />
                    </td>
                    <td className="px-3 py-4">
                      <Chip elevation={high} fl={weather.freezingLevel} />
                    </td>
                    <td className="px-3 py-4 text-right tabular-nums text-ink">
                      {weather.precipitation > 0
                        ? `${weather.precipitation} mm/h`
                        : "None"}
                    </td>
                    <td className="px-5 py-4 text-right tabular-nums text-ink">
                      {weather.wind} km/h
                    </td>
                  </>
                ) : (
                  <td colSpan={6} className="px-3 py-4 text-muted">
                    Data unavailable
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}