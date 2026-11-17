import { SnowStat, StatStrip, TempStat } from "@/components/CardStats";
import { ElevationDiagram } from "@/components/ElevationVisualizer";
import RangeIcon from "@/components/RangeIcon";
import type { ZoneConfig } from "@/config/zones";
import { highestDanger, type AvalancheForecast } from "@/lib/Avalanche";
import { SNOW_LINE_OFFSET, conditionAt, fmt } from "@/lib/Conditions";
import { tempAt, windAloft } from "@/lib/Model";
import { compass } from "@/components/WindCard";
import { DANGER_STYLE } from "@/lib/DangerStyle";
import type { SnowNow } from "@/lib/SnowNow";
import type { HillNow } from "@/lib/Weather";

// A generic range outline: zones span many peaks, so no single ridge is drawn as
// a likeness. Its heights are scaled to the zone's terrain, so the snow line and
// the labelled heights sit at the right levels against it.
const GENERIC_RIDGE: [number, number][] = [
  [0, 0.25], [12, 0.5], [22, 0.85], [30, 0.62], [42, 1], [52, 0.7],
  [60, 0.78], [72, 0.45], [84, 0.66], [100, 0.35],
];
const BANDS = ["Upper", "Middle", "Lower"];

// The rain-and-snow-line card for a backcountry zone, the counterpart of a hill's
// ElevationVisualizer. With `forecast` it also shows today's avalanche danger and
// the weather details, for the dashboard where it sits beside hill cards.
export default function ZoneDiagram({
  zone,
  now,
  forecast,
  snow,
}: {
  zone: ZoneConfig;
  now: HillNow | null;
  forecast?: AvalancheForecast | null;
  snow?: SnowNow; // dashboard only: snow at the zone's highest station with snow
}) {
  const heights = [...zone.heights].sort((a, b) => b - a);
  const top = heights[0];
  const bottom = heights[heights.length - 1];
  const lo = bottom - 250;
  const hi = top + 120;
  const details = forecast !== undefined;
  const sky = now && { precipitation: now.precipitation, cloud: now.cloud, code: now.code };
  const ridge = now ? windAloft(now.aloft, top) : null;

  const today = forecast?.status === "ok" ? forecast.days[0] : undefined;
  const level = today && forecast?.status === "ok" && forecast.note == null ? highestDanger(today) : null;

  return (
    <section
      className="h-full border border-[#232a31] bg-[#13181d] p-5"
      style={{ borderTop: `3px solid ${zone.color}` }}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="flex items-center gap-2 text-3xl font-bold text-white">
            {details && <RangeIcon color={zone.color} className="h-4 w-6" />}
            {zone.name}
          </h2>
          <p className="font-sans text-xs tabular-nums text-[#8f8f8f]">
            {details ? "Backcountry · " : ""}
            {fmt(bottom)}–{fmt(top)} m terrain
          </p>
        </div>
        {now && (
          <div className="text-right">
            <p className="font-display text-4xl font-bold tabular-nums text-white">
              {fmt(now.freezingLevel)}
              <span className="ml-0.5 text-sm font-normal text-[#8f8f8f]">m</span>
            </p>
            <p className="text-xs text-[#8f8f8f]">Freezing level</p>
          </div>
        )}
      </div>

      {details && now && sky && (
        <StatStrip>
          {[
            { label: "Upper", elevation: top },
            { label: "Lower", elevation: bottom },
          ].map(({ label, elevation }) => (
            <TempStat
              key={label}
              label={label}
              elevation={elevation}
              temp={tempAt(now.profile, elevation)}
              condition={conditionAt(elevation, now.freezingLevel, sky)}
            />
          ))}
          {snow && <SnowStat snow={snow} />}
        </StatStrip>
      )}

      {now ? (
        <ElevationDiagram
          id={zone.id}
          name={zone.fullName}
          min={bottom - 400}
          max={top + 250}
          profile={GENERIC_RIDGE.map(([x, f]) => [x, Math.round(lo + f * (hi - lo))])}
          landmarks={heights.map((h, i) => ({ name: BANDS[i] ?? "", elevation: h }))}
          color={zone.color}
          freezingLevel={now.freezingLevel}
          sky={{ precipitation: now.precipitation, cloud: now.cloud, code: now.code }}
        />
      ) : (
        <p className="mt-3 text-sm text-[#8f8f8f]">
          Weather data is unavailable. It will retry on the next refresh.
        </p>
      )}
      <p className="mt-1 text-xs text-[#7d8da1]">
        Heights are to scale; the ridge is a generic outline.
      </p>

      {details && (
        <>
          {now && (
            <dl className="mt-4 grid grid-cols-3 gap-2 text-sm">
              <div>
                <dt className="text-xs text-[#8f8f8f]">Precip</dt>
                <dd className="tabular-nums text-white">
                  {now.precipitation > 0 ? `${now.precipitation} mm/h` : "None"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-[#8f8f8f]">Ridgetop wind</dt>
                <dd className="tabular-nums text-white">
                  {ridge?.speed} km/h {ridge && compass(ridge.dir)}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-[#8f8f8f]">Snow line (est.)</dt>
                <dd className="tabular-nums text-white">
                  ~{now.freezingLevel - SNOW_LINE_OFFSET} m
                </dd>
              </div>
            </dl>
          )}
          <div className="mt-4 flex items-center justify-between gap-3 border-t border-[#2f3840] pt-4 text-sm">
            <div>
              <p className="text-xs text-[#8f8f8f]">Avalanche danger today</p>
              <p className="text-white">
                {forecast?.status === "ok" ? forecast.owner : "Avalanche Canada"}
              </p>
            </div>
            {forecast == null ? (
              <span className="chip bg-white/10 text-[#c9d3dd]">Unavailable</span>
            ) : level ? (
              <span className={`chip ${DANGER_STYLE[level].chip}`}>
                Up to {DANGER_STYLE[level].label}
              </span>
            ) : (
              <span className="chip bg-white/10 text-[#c9d3dd]">
                {forecast.status === "ok" ? (forecast.note ?? "No rating") : "No forecast"}
              </span>
            )}
          </div>
        </>
      )}
    </section>
  );
}
