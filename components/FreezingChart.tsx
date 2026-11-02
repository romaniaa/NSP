import { Card } from "@/components/Ui";
import { fmt } from "@/lib/Conditions";
import type { DayStat } from "@/lib/Forecast";

type Pt = [number, number];

// Catmull-Rom spline converted to cubic Béziers for a smooth line through the points.
function smooth(pts: Pt[]) {
  if (pts.length < 2) return "";
  let d = `M${pts[0][0]} ${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C${c1x} ${c1y}, ${c2x} ${c2y}, ${p2[0]} ${p2[1]}`;
  }
  return d;
}

const PLOT_W = 88; // % of width used by the plot; the rest holds y-axis labels

interface Props {
  title: string;
  badge: string;
  current: number;
  trend: string;
  detail: string;
  days: DayStat[];
  updated: string;
  note: string;
}

export default function FreezingChart({
  title,
  badge,
  current,
  trend,
  detail,
  days,
  updated,
  note,
}: Props) {
  const lowest = Math.min(...days.map((d) => d.low));
  const highest = Math.max(...days.map((d) => d.high));
  let yMin = Math.floor(lowest / 500) * 500;
  let yMax = Math.ceil(highest / 500) * 500;
  if (yMax === yMin) yMax = yMin + 500;
  if (yMax - yMin < 1000) {
    // keep at least two gridline intervals so the chart doesn't look flat
    yMax = yMin + 1000;
  }

  const yPct = (v: number) => 92 - ((v - yMin) / (yMax - yMin)) * 84;
  const xPct = (i: number) =>
    days.length === 1 ? 0 : (i / (days.length - 1)) * PLOT_W;

  const high: Pt[] = days.map((d, i) => [xPct(i), yPct(d.high)]);
  const low: Pt[] = days.map((d, i) => [xPct(i), yPct(d.low)]);
  const lowReversed = [...low].reverse();
  const band = `${smooth(high)} ${smooth(lowReversed).replace("M", "L")} Z`;

  const grid: number[] = [];
  for (let v = yMin; v <= yMax; v += 500) grid.push(v);

  const labelStep = days.length > 8 ? 2 : 1;

  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-semibold text-white">{title}</h3>
        <span className="text-xs text-[#7fb0ff]">{badge}</span>
      </div>

      <div className="mt-5 flex items-center gap-4">
        <p className="text-5xl font-semibold tabular-nums text-white">
          {fmt(current)}
          <span className="ml-1 text-2xl text-[#9aa7b5]">m</span>
        </p>
        <div>
          <p className="font-semibold text-white">{trend}</p>
          <p className="text-sm text-[#9aa7b5]">{detail}</p>
        </div>
      </div>

      <div
        className="relative mt-6 h-52"
        role="img"
        aria-label={`${title}: from ${fmt(lowest)} to ${fmt(highest)} metres`}
      >
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="absolute inset-0 h-full w-full"
          aria-hidden="true"
        >
          {grid.map((v) => (
            <line
              key={v}
              x1={0}
              x2={PLOT_W}
              y1={yPct(v)}
              y2={yPct(v)}
              stroke="#3a444d"
              strokeWidth="1"
              strokeDasharray="2 4"
              vectorEffect="non-scaling-stroke"
            />
          ))}
          <path d={band} fill="#94a3b8" fillOpacity="0.16" />
          <path
            d={smooth(low)}
            fill="none"
            stroke="#a9b6c4"
            strokeWidth="1.5"
            vectorEffect="non-scaling-stroke"
          />
          <path
            d={smooth(high)}
            fill="none"
            stroke="#f2994a"
            strokeWidth="1.5"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
        {grid.map((v) => (
          <span
            key={v}
            className="absolute right-0 -translate-y-1/2 text-xs tabular-nums text-[#9aa7b5]"
            style={{ top: `${yPct(v)}%` }}
          >
            {fmt(v)}m
          </span>
        ))}
      </div>

      <div className="relative mt-2 h-9 text-xs leading-tight text-[#9aa7b5]">
        {days.map((d, i) =>
          i % labelStep === 0 ? (
            <span
              key={d.key}
              className={`absolute text-center ${i === 0 ? "" : "-translate-x-1/2"}`}
              style={{ left: `${xPct(i)}%` }}
            >
              {d.weekday}
              <br />
              {d.day}
            </span>
          ) : null
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm text-[#c9d3dd]">
        <span>
          Lowest{" "}
          <b className="font-semibold text-white tabular-nums">
            {fmt(lowest)}m
          </b>
        </span>
        <span>
          Highest{" "}
          <b className="font-semibold text-white tabular-nums">
            {fmt(highest)}m
          </b>
        </span>
        <span className="text-xs text-[#9aa7b5]">{updated}</span>
      </div>
      <p className="mt-3 text-xs text-[#7d8da1]">{note}</p>
    </Card>
  );
}