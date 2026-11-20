import Link from "next/link";
import type { CSSProperties } from "react";
import CardMore from "@/components/CardMore";
import { SnowStat, StatStrip, TempStat } from "@/components/CardStats";
import MountainIcon from "@/components/MountainIcon";
import { NAV_FORWARD } from "@/components/Transitions";
import type { MountainConfig } from "@/config/mountains";
import { conditionAt, extremes, fmt, verdict } from "@/lib/Conditions";
import { tempAt } from "@/lib/Model";
import type { SnowNow } from "@/lib/SnowNow";
import type { HillNow } from "@/lib/Weather";

// Compact current conditions for one hill, linking to its page. Used on /hills
// and the dashboard.
export default function HillCard({
  config,
  now,
  snow,
}: {
  config: MountainConfig;
  now: HillNow | null;
  snow?: SnowNow;
}) {
  const { low, high } = extremes(config);
  const sky = now && {
    precipitation: now.precipitation,
    cloud: now.cloud,
    code: now.code,
  };

  return (
    <Link
      href={`/${config.id}`}
      transitionTypes={NAV_FORWARD}
      className="group block h-full transition hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0_0_var(--accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/60"
      style={{ "--accent": config.color } as CSSProperties}
    >
      <section
        className="plate flex h-full flex-col border border-line bg-surface p-4"
        style={{ borderTop: `3px solid ${config.color}` }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="flex items-center gap-2 text-xl font-bold text-ink">
              <MountainIcon id={config.id} color={config.color} className="h-3.5 w-5" />
              <span className="truncate">{config.fullName}</span>
            </h3>
            <p className="text-xs tabular-nums text-muted">
              {config.locality} · {fmt(low)}–{fmt(high)} m lifts
            </p>
          </div>
          {now && (
            <div className="shrink-0 text-right">
              <p className="font-display text-3xl font-bold tabular-nums text-ink">
                {fmt(now.freezingLevel)}
                <span className="ml-0.5 text-xs font-normal text-muted">m</span>
              </p>
              <p className="text-xs text-muted">Freezing level</p>
            </div>
          )}
        </div>

        {now && sky ? (
          <>
            <StatStrip>
              {[
                { label: "Top", elevation: high },
                { label: "Base", elevation: low },
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
            <p className="mt-3 flex flex-wrap justify-between gap-x-3 gap-y-1 text-sm">
              <span className="text-ink-2">{verdict(config, now.freezingLevel, sky)}</span>
              <span className="tabular-nums text-muted">
                Wind {Math.round(now.wind)} km/h · gusts {Math.round(now.gust)}
              </span>
            </p>
          </>
        ) : (
          <p className="mt-3 text-sm text-muted">
            Weather data is unavailable. It will retry on the next refresh.
          </p>
        )}
        <CardMore />
      </section>
    </Link>
  );
}
