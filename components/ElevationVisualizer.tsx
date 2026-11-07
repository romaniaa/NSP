import type { MountainConfig } from "@/config/mountains";
import type { MountainWeather } from "@/lib/Weather";
import {
  CONDITION,
  PRECIP,
  SNOW_LINE_OFFSET,
  extremes,
  fmt,
  conditionAt,
  verdict,
  vertical,
} from "@/lib/Conditions";

// Simple line-art ridge. Heights match the real elevations, so the peaks sit at the right level.
function Ridge({
  profile,
  pct,
  color,
}: {
  profile: [number, number][];
  pct: (m: number) => number;
  color: string;
}) {
  const line = (pts: [number, number][]) =>
    pts.map(([x, e], i) => `${i ? "L" : "M"}${x} ${100 - pct(e)}`).join(" ");

  // A fainter ridge behind, shifted and lowered, for depth.
  const back: [number, number][] = profile.map(([x, e]) => [
    Math.min(100, Math.max(0, 100 - x * 0.9 - 4)),
    e - 90,
  ]);
  back.sort((a, b) => a[0] - b[0]);

  // Fading echoes below the ridge line, drawn like contour strata.
  const span = profile.reduce((hi, [, e]) => Math.max(hi, e), 0) -
    profile.reduce((lo, [, e]) => Math.min(lo, e), Infinity);
  const strata = [1, 2, 3, 4].map((k) =>
    profile.map(([x, e]): [number, number] => [x, e - (k * span) / 7])
  );

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
        stroke={color}
        strokeOpacity="0.3"
        strokeWidth="1"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
      <path
        d={`${line(profile)} L100 100 L0 100 Z`}
        fill="black"
        fillOpacity="0.45"
        stroke={color}
        strokeOpacity="0.9"
        strokeWidth="1.25"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
      {strata.map((pts, k) => (
        <path
          key={k}
          d={line(pts)}
          fill="none"
          stroke={color}
          strokeOpacity={0.28 - k * 0.05}
          strokeWidth="1"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      ))}
    </svg>
  );
}

// Height of the ridge at x (0–100), read off the straight segments of the profile.
function ridgeAt(profile: [number, number][], x: number) {
  for (let i = 1; i < profile.length; i++) {
    const [x0, e0] = profile[i - 1];
    const [x1, e1] = profile[i];
    if (x <= x1) return e0 + ((e1 - e0) * (x - x0)) / (x1 - x0 || 1);
  }
  return profile[profile.length - 1][1];
}

// Small seeded random generator (mulberry32). Seeding it with the hill's id gives
// each hill its own scatter that stays put between renders and refreshes.
function seeded(key: string) {
  let a = [...key].reduce((h, c) => Math.imul(h ^ c.charCodeAt(0), 2654435761), 7);
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface Tree {
  x: number; // % from the left
  y: number; // % from the bottom, where the trunk meets the ground
  size: number; // px tall
  opacity: number;
}

// Trees on the ridge line, plus a scatter down the slope below it. Lower trees
// are nearer the viewer, so they're drawn larger and stronger. Trees too close
// to one already placed are skipped so the scatter doesn't clump.
function placeTrees(
  key: string,
  profile: [number, number][],
  pct: (m: number) => number
): Tree[] {
  const rand = seeded(key);
  const trees: Tree[] = [];
  const clear = (x: number, y: number) =>
    trees.every((t) => Math.abs(t.x - x) > 5 || Math.abs(t.y - y) > 8);

  // Along the ridge, keeping clear of the elevation ticks on the left edge.
  for (let i = 0; i < 40 && trees.length < 9; i++) {
    const x = 6 + rand() * 91;
    const y = pct(ridgeAt(profile, x));
    if (clear(x, y)) trees.push({ x, y, size: 18 + rand() * 6, opacity: 0.8 });
  }

  // Down the slope: depth runs from just under the ridge (0) to the foot of the card (1).
  const ridgeCount = trees.length;
  for (let i = 0; i < 200 && trees.length < ridgeCount + 18; i++) {
    const x = 6 + rand() * 91;
    const depth = 0.12 + rand() * 0.8;
    const y = pct(ridgeAt(profile, x)) * (1 - depth);
    if (y < 3 || !clear(x, y)) continue;
    trees.push({
      x,
      y,
      size: 18 + depth * 18 + rand() * 4,
      opacity: 0.45 + depth * 0.4,
    });
  }
  return trees;
}

// Line-drawn spruce: a straight trunk with pairs of drooping branches that
// leave the trunk heading down and sweep outward, longer toward the base.
// Built once on a 20 x 32 grid; each branch is a quadratic curve.
const SPRUCE = (() => {
  const cx = 10;
  const parts = [`M${cx} 2V31`];
  for (let i = 0; i < 5; i++) {
    const y = 4 + i * 4.5; // where the branch leaves the trunk
    const reach = 3.5 + i * 1.6; // how far out it goes
    const drop = 4 + i * 0.8; // how far it falls on the way
    for (const dir of [-1, 1]) {
      parts.push(
        `M${cx} ${y}Q${cx + dir * reach * 0.15} ${y + drop * 0.9} ${cx + dir * reach} ${y + drop}`
      );
    }
  }
  return parts.join("");
})();

// Drawn as its own small SVG so it keeps its shape while the ridge beneath it
// stretches to fit the card.
function Spruce({ size, color }: { size: number; color: string }) {
  return (
    <svg
      viewBox="0 0 20 32"
      width={size * (20 / 32)}
      height={size}
      fill="none"
      stroke={color}
      strokeWidth="1"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d={SPRUCE} vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

function Trees({
  id,
  profile,
  pct,
  color,
}: {
  id: string;
  profile: [number, number][];
  pct: (m: number) => number;
  color: string;
}) {
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      {placeTrees(id, profile, pct).map((t, i) => (
        <div
          key={i}
          className="absolute flex -translate-x-1/2 translate-y-[1px]"
          style={{ left: `${t.x}%`, bottom: `${t.y}%`, opacity: t.opacity }}
        >
          <Spruce size={Math.round(t.size)} color={color} />
        </div>
      ))}
    </div>
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
      <section
      className="border border-[#232a31] bg-[#13181d] p-5"
      style={{ borderTop: `3px solid ${config.color}` }}
    >
        <h2 className="text-lg font-semibold text-white">{name}</h2>
        <p className="mt-3 text-sm text-[#8f8f8f]">
          Weather data is unavailable. It will retry on the next refresh.
        </p>
      </section>
    );
  }

  // Altimeter ticks every 100 m, longer at each 500 m.
  const ticks: number[] = [];
  for (let m = Math.ceil(minElevation / 100) * 100; m <= maxElevation; m += 100) {
    ticks.push(m);
  }

  const fl = weather.freezingLevel;
  const snowLine = fl - SNOW_LINE_OFFSET;
  const sky = {
    precipitation: weather.precipitation,
    cloud: weather.cloud,
    code: weather.code,
  };

  return (
    <section
      className="border border-[#232a31] bg-[#13181d] p-5"
      style={{ borderTop: `3px solid ${config.color}` }}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-3xl font-bold text-white">{name}</h2>
            {isTallest && (
              <span className="chip bg-white/10 text-white">Highest peak</span>
            )}
          </div>
          <p className="font-sans text-xs tabular-nums text-[#8f8f8f]">
            {fmt(extremes(config).low)}–{fmt(extremes(config).high)} m lifts ·{" "}
            {fmt(vertical(config))} m vertical
          </p>
          <p className="mt-1 text-sm text-[#d4d4d4]">{verdict(config, fl, sky)}</p>
        </div>
        <div className="text-right">
          <p className="font-display text-4xl font-bold tabular-nums text-white">
            {fl.toLocaleString("en-CA")}
            <span className="ml-0.5 text-sm font-normal text-[#8f8f8f]">m</span>
          </p>
          <p className="text-xs text-[#8f8f8f]">Freezing level</p>
        </div>
      </div>

      <div
        className="relative mt-5 h-96 overflow-hidden border border-[#2f3840] bg-black"
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

        <Ridge profile={profile} pct={pct} color={config.color} />
        <Trees id={config.id} profile={profile} pct={pct} color={config.color} />

        <div
          className="absolute inset-x-0 border-t border-dashed border-white/70"
          style={{ bottom: `${pct(fl)}%` }}
        />

        {ticks.map((m) => (
          <div
            key={m}
            className="absolute left-0 border-t border-white/40"
            style={{ bottom: `${pct(m)}%`, width: m % 500 === 0 ? 10 : 5 }}
          />
        ))}

        {landmarks.map((l) => {
          const p = conditionAt(l.elevation, fl, sky);
          return (
            <div
              key={l.name}
              className="absolute left-4 right-2 flex -translate-y-1/2 items-center justify-between gap-2 text-xs"
              style={{ bottom: `${Math.min(91, Math.max(9, pct(l.elevation)))}%` }}
            >
              <span className="bg-black/90 px-2 py-1 text-white">
                {l.name}{" "}
                <span className="tabular-nums text-[#8f8f8f]">
                  {l.elevation} m
                </span>
              </span>
              <span
                className={`chip ${CONDITION[p].chip}`}
              >
                {CONDITION[p].label}
              </span>
            </div>
          );
        })}
      </div>

      <p className="mt-2 text-xs text-[#7d8da1]">
        Shaded bands show what would fall at each height. Chips show what is
        happening now.
      </p>

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
          const p = conditionAt(lift.elevation, fl, sky);
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
                  className={`chip ${CONDITION[p].chip}`}
                >
                  {CONDITION[p].label}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}