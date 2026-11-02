import type { MountainConfig } from "@/config/mountains";
import type { MountainWeather } from "@/lib/Weather";
import {
  PRECIP,
  SNOW_LINE_OFFSET,
  extremes,
  fmt,
  precipAt,
  verdict,
  vertical,
} from "@/lib/Conditions";

// Simple line-art ridge. Heights match the real elevations, so the peaks sit at the right level.
function Ridge({
  profile,
  pct,
}: {
  profile: [number, number][];
  pct: (m: number) => number;
}) {
  const line = (pts: [number, number][]) =>
    pts.map(([x, e], i) => `${i ? "L" : "M"}${x} ${100 - pct(e)}`).join(" ");

  // A fainter ridge behind, shifted and lowered, for depth.
  const back: [number, number][] = profile.map(([x, e]) => [
    Math.min(100, Math.max(0, 100 - x * 0.9 - 4)),
    e - 90,
  ]);
  back.sort((a, b) => a[0] - b[0]);

  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className="pointer-events-none absolute inset-0 h-full w-full"
      aria-hidden="true"
    >
      <path
        d={line(back)}
        fill="none"
        stroke="white"
        strokeOpacity="0.12"
        strokeWidth="1"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
      <path
        d={`${line(profile)} L100 100 L0 100 Z`}
        fill="black"
        fillOpacity="0.45"
        stroke="white"
        strokeOpacity="0.4"
        strokeWidth="1.25"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

interface Props {
  config: MountainConfig;
  weather: MountainWeather | null;
  isTallest?: boolean;
}

export default function ElevationVisualizer({
  config,
  weather,
  isTallest = false,
}: Props) {
  const { minElevation, maxElevation, landmarks, name, profile } = config;
  const range = maxElevation - minElevation;
  const pct = (m: number) =>
    ((Math.min(maxElevation, Math.max(minElevation, m)) - minElevation) /
      range) *
    100;

  if (!weather) {
    return (
      <section className="rounded-2xl bg-[#1d2227] p-5">
        <h2 className="text-lg font-semibold text-white">{name}</h2>
        <p className="mt-3 text-sm text-[#8f8f8f]">
          Weather data is unavailable. It will retry on the next refresh.
        </p>
      </section>
    );
  }

  const fl = weather.freezingLevel;
  const snowLine = fl - SNOW_LINE_OFFSET;

  return (
    <section className="rounded-2xl bg-[#1d2227] p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-semibold text-white">{name}</h2>
            {isTallest && (
              <span className="rounded bg-white/10 px-1.5 py-0.5 text-xs text-white">
                Highest peak
              </span>
            )}
          </div>
          <p className="text-xs tabular-nums text-[#8f8f8f]">
            {fmt(extremes(config).low)}–{fmt(extremes(config).high)} m lifts ·{" "}
            {fmt(vertical(config))} m vertical
          </p>
          <p className="mt-1 text-sm text-[#d4d4d4]">{verdict(config, fl)}</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-semibold tabular-nums text-white">
            {fl.toLocaleString("en-CA")}
            <span className="ml-0.5 text-sm font-normal text-[#8f8f8f]">m</span>
          </p>
          <p className="text-xs text-[#8f8f8f]">Freezing level</p>
        </div>
      </div>

      <div
        className="relative mt-5 h-72 overflow-hidden rounded-lg border border-[#2f3840] bg-black"
        role="img"
        aria-label={`${name} elevation diagram. Freezing level ${fl} metres.`}
      >
        <div
          className={`absolute inset-x-0 bottom-0 ${PRECIP.rain.band}`}
          style={{ height: `${pct(snowLine)}%` }}
        />
        <div
          className={`absolute inset-x-0 ${PRECIP.mixed.band}`}
          style={{
            bottom: `${pct(snowLine)}%`,
            height: `${pct(fl) - pct(snowLine)}%`,
          }}
        />
        <div
          className={`absolute inset-x-0 top-0 ${PRECIP.snow.band}`}
          style={{ height: `${100 - pct(fl)}%` }}
        />

        <Ridge profile={profile} pct={pct} />

        <div
          className="absolute inset-x-0 border-t border-dashed border-white/70"
          style={{ bottom: `${pct(fl)}%` }}
        />

        {landmarks.map((l) => {
          const p = precipAt(l.elevation, fl);
          return (
            <div
              key={l.name}
              className="absolute inset-x-2 flex -translate-y-1/2 items-center justify-between gap-2 text-xs"
              style={{ bottom: `${Math.min(91, Math.max(9, pct(l.elevation)))}%` }}
            >
              <span className="rounded bg-black/90 px-2 py-1 text-white">
                {l.name}{" "}
                <span className="tabular-nums text-[#8f8f8f]">
                  {l.elevation} m
                </span>
              </span>
              <span
                className={`rounded px-2 py-1 font-medium ${PRECIP[p].chip}`}
              >
                {PRECIP[p].label}
              </span>
            </div>
          );
        })}
      </div>

      <dl className="mt-4 grid grid-cols-3 gap-2 text-sm">
        <div>
          <dt className="text-xs text-[#8f8f8f]">Precip</dt>
          <dd className="tabular-nums text-white">
            {weather.precipitation > 0 ? `${weather.precipitation} mm/h` : "None"}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-[#8f8f8f]">Wind</dt>
          <dd className="tabular-nums text-white">{weather.wind} km/h</dd>
        </div>
        <div>
          <dt className="text-xs text-[#8f8f8f]">Snow line (est.)</dt>
          <dd className="tabular-nums text-white">~{snowLine} m</dd>
        </div>
      </dl>

      <div className="mt-4 space-y-3 border-t border-[#2f3840] pt-4 text-sm">
        {(
          [
            ["Top lift", config.lifts.top],
            ["Lowest lift", config.lifts.bottom],
          ] as const
        ).map(([title, lift]) => {
          const p = precipAt(lift.elevation, fl);
          return (
            <div
              key={title}
              className="flex items-center justify-between gap-3"
            >
              <div>
                <p className="text-xs text-[#8f8f8f]">{title}</p>
                <p className="text-white">{lift.label}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="tabular-nums text-white">
                  ~{lift.elevation.toLocaleString("en-CA")} m
                </span>
                <span
                  className={`rounded px-2 py-1 text-xs font-medium ${PRECIP[p].chip}`}
                >
                  {PRECIP[p].label}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}