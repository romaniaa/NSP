import { Card } from "@/components/Ui";
import { fmt } from "@/lib/Conditions";
import type { DayStat, FreezingSeries } from "@/lib/Forecast";

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

// A change in metres as a short arrow reading; under 100 m counts as steady.
function change(delta: number | null) {
  if (delta == null) return "–";
  const m = Math.round(Math.abs(delta) / 10) * 10;
  if (m < 100) return "Steady";
  return `${delta > 0 ? "↑" : "↓"} ${fmt(m)} m`;
}

// One card for the freezing level: the current value, its trend either side of
// now, and a single timeline of daily low–high ranges from the past 10 days
// through the forecast, split at today.
export default function FreezingChart({
  series,
  note,
}: {
  series: FreezingSeries;
  note: string;
}) {
  const { current, deltaPast25, deltaNext24, history, forecast, updated } = series;

  // history ends with today and forecast starts with it; keep one copy.
  const seen = new Set<string>();
  const days: DayStat[] = [...history, ...forecast].filter(
    (d) => !seen.has(d.key) && seen.add(d.key)
  );
  const todayIdx = Math.max(0, history.length - 1);

  const lowest = Math.min(...days.map((d) => d.low));
  const highest = Math.max(...days.map((d) => d.high));
  const yMin = Math.floor(lowest / 500) * 500;
  let yMax = Math.ceil(highest / 500) * 500;
  // keep at least two gridline intervals so the chart doesn't look flat
  if (yMax - yMin < 1000) yMax = yMin + 1000;

  const yPct = (v: number) => 92 - ((v - yMin) / (yMax - yMin)) * 84;
  const xPct = (i: number) => (days.length === 1 ? 0 : (i / (days.length - 1)) * PLOT_W);

  const high: Pt[] = days.map((d, i) => [xPct(i), yPct(d.high)]);
  const low: Pt[] = days.map((d, i) => [xPct(i), yPct(d.low)]);
  const band = `${smooth(high)} ${smooth([...low].reverse()).replace("M", "L")} Z`;

  const grid: number[] = [];
  for (let v = yMin; v <= yMax; v += 500) grid.push(v);

  // Label every few days, counted from today so today always gets one.
  const labelStep = days.length > 10 ? 3 : days.length > 6 ? 2 : 1;
  const todayX = xPct(todayIdx);

  return (
    <Card className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(13rem,auto)_1fr] lg:gap-8">
      <div className="flex flex-wrap items-end gap-x-6 gap-y-3 lg:flex-col lg:items-start lg:justify-start lg:gap-y-5">
        <div>
          <h3 className="font-semibold text-ink">Freezing level now</h3>
          <p className="mt-1 font-display text-6xl font-bold tabular-nums text-ink">
            {fmt(current)}
            <span className="ml-1 text-2xl text-muted">m</span>
          </p>
        </div>
        <dl className="grid grid-cols-[auto_auto] gap-x-4 gap-y-1 text-sm">
          <dt className="text-muted">Past 25 h</dt>
          <dd className="font-semibold tabular-nums text-ink">{change(deltaPast25)}</dd>
          <dt className="text-muted">Next 24 h</dt>
          <dd className="font-semibold tabular-nums text-ink">{change(deltaNext24)}</dd>
        </dl>
      </div>

      <div className="min-w-0">
        <div
          className="relative h-40"
          role="img"
          aria-label={`Freezing level, past ${history.length} days and ${Math.max(0, forecast.length - 1)}-day forecast: from ${fmt(lowest)} to ${fmt(highest)} metres`}
        >
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="absolute inset-0 h-full w-full"
            aria-hidden="true"
          >
            {/* The forecast side, shaded faintly. */}
            {todayIdx < days.length - 1 && (
              <rect x={todayX} y={0} width={PLOT_W - todayX} height={100} className="fill-cool" fillOpacity="0.06" />
            )}
            {grid.map((v) => (
              <line
                key={v}
                x1={0}
                x2={PLOT_W}
                y1={yPct(v)}
                y2={yPct(v)}
                className="stroke-edge"
                strokeWidth="1"
                strokeDasharray="2 4"
                vectorEffect="non-scaling-stroke"
              />
            ))}
            <line
              x1={todayX}
              x2={todayX}
              y1={0}
              y2={100}
              className="stroke-cool"
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
            />
            <path d={band} className="fill-chart-band" fillOpacity="0.16" />
            <path
              d={smooth(low)}
              fill="none"
              className="stroke-chart-line"
              strokeWidth="1.5"
              vectorEffect="non-scaling-stroke"
            />
            <path
              d={smooth(high)}
              fill="none"
              className="stroke-ink"
              strokeWidth="1.5"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
          {todayIdx < days.length - 1 && (
            <span
              className="absolute top-0 pl-1.5 text-[10px] font-semibold uppercase tracking-wide text-cool"
              style={{ left: `${todayX}%` }}
            >
              Forecast
            </span>
          )}
          {grid.map((v) => (
            <span
              key={v}
              className="absolute -translate-y-1/2 pl-2 text-xs tabular-nums text-muted"
              style={{ top: `${yPct(v)}%`, left: `${PLOT_W}%` }}
            >
              {fmt(v)}m
            </span>
          ))}
        </div>

        <div className="relative mt-1.5 h-4 text-xs text-muted">
          {days.map((d, i) =>
            (i - todayIdx) % labelStep === 0 ? (
              <span
                key={d.key}
                className={`absolute whitespace-nowrap ${i === 0 ? "" : "-translate-x-1/2"} ${i === todayIdx ? "font-semibold text-ink" : ""}`}
                style={{ left: `${xPct(i)}%` }}
              >
                {i === todayIdx ? "Today" : `${d.weekday} ${d.day}`}
              </span>
            ) : null
          )}
        </div>

        <p className="mt-3 text-xs text-faint">
          {note} · Updated {updated}
        </p>
      </div>
    </Card>
  );
}
