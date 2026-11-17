import Link from "next/link";
import type { CSSProperties } from "react";
import { SnowStat, StatStrip, TempStat } from "@/components/CardStats";
import { DANGER_STYLE } from "@/lib/DangerStyle";
import RangeIcon from "@/components/RangeIcon";
import { NAV_FORWARD } from "@/components/Transitions";
import type { ZoneConfig } from "@/config/zones";
import { highestDanger, type AvalancheForecast } from "@/lib/Avalanche";
import { conditionAt, fmt } from "@/lib/Conditions";
import { tempAt, windAloft } from "@/lib/Model";
import { compass } from "@/components/WindCard";
import type { SnowNow } from "@/lib/SnowNow";
import type { HillNow } from "@/lib/Weather";

// Compact backcountry conditions for one zone: today's highest avalanche danger
// and weather at the top and bottom of its terrain. Used on /hills and the dashboard.
export default function ZoneCard({
  zone,
  now,
  forecast,
  snow,
}: {
  zone: ZoneConfig;
  now: HillNow | null;
  forecast: AvalancheForecast | null;
  snow?: SnowNow;
}) {
  const top = Math.max(...zone.heights);
  const bottom = Math.min(...zone.heights);
  const today = forecast?.status === "ok" ? forecast.days[0] : undefined;
  const level = today ? highestDanger(today) : null;
  const sky = now && { precipitation: now.precipitation, cloud: now.cloud, code: now.code };
  const ridge = now ? windAloft(now.aloft, top) : null;

  return (
    <Link
      href={`/backcountry/${zone.id}`}
      transitionTypes={NAV_FORWARD}
      className="group block h-full transition hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0_0_var(--accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
      style={{ "--accent": zone.color } as CSSProperties}
    >
      <section
        className="plate h-full border border-[#232a31] bg-[#13181d] p-4"
        style={{ borderTop: `3px solid ${zone.color}` }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="flex items-center gap-2 text-xl font-bold text-white">
              <RangeIcon color={zone.color} className="h-3.5 w-5" />
              <span className="truncate">{zone.fullName}</span>
            </h3>
            <p className="text-xs text-[#8f8f8f]">Backcountry · {zone.description}</p>
          </div>
          {now && (
            <div className="shrink-0 text-right">
              <p className="font-display text-3xl font-bold tabular-nums text-white">
                {fmt(now.freezingLevel)}
                <span className="ml-0.5 text-xs font-normal text-[#8f8f8f]">m</span>
              </p>
              <p className="text-xs text-[#8f8f8f]">Freezing level</p>
            </div>
          )}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
          <span className="text-[#9aa7b5]">Avalanche danger today</span>
          {forecast == null ? (
            <span className="chip bg-white/10 text-[#c9d3dd]">Unavailable</span>
          ) : level ? (
            <span className={`chip ${DANGER_STYLE[level].chip}`}>
              Up to {DANGER_STYLE[level].label}
            </span>
          ) : (
            <span className="chip bg-white/10 text-[#c9d3dd]">
              {forecast.status === "ok" ? (forecast.note ?? "No rating") : "No current forecast"}
            </span>
          )}
        </div>

        {now && sky ? (
          <>
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
            <p className="mt-3 text-sm tabular-nums text-[#9aa7b5]">
              Ridgetop wind {ridge?.speed} km/h {ridge && compass(ridge.dir)}
            </p>
          </>
        ) : (
          <p className="mt-3 text-sm text-[#8f8f8f]">
            Weather data is unavailable. It will retry on the next refresh.
          </p>
        )}
      </section>
    </Link>
  );
}
