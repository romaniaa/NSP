export interface BubbleRow {
  label: string;
  value: number;
  display?: string;
  warm?: boolean;
}

const ROW_H = 52;

export function niceDomain(values: number[], includeZero = false) {
  const lo0 = Math.min(...values, includeZero ? 0 : Infinity);
  const hi0 = Math.max(...values, includeZero ? 0 : -Infinity);
  const span = hi0 - lo0;
  const step = span <= 14 ? 2 : span <= 30 ? 5 : 10;
  return {
    min: Math.floor(lo0 / step) * step - step,
    max: Math.ceil(hi0 / step) * step + step,
    step,
  };
}

interface Props {
  rows: BubbleRow[];
  min: number;
  max: number;
  step: number;
  axisLabel: string;
  zeroLine?: boolean;
}

export default function BubbleChart({
  rows,
  min,
  max,
  step,
  axisLabel,
  zeroLine = false,
}: Props) {
  const ticks: number[] = [];
  for (let t = min; t <= max; t += step) ticks.push(t);
  const pct = (v: number) =>
    ((Math.min(max, Math.max(min, v)) - min) / (max - min)) * 100;

  return (
    <div
      role="img"
      aria-label={`${axisLabel}: ${rows
        .map((r) => `${r.label} ${r.display ?? r.value}`)
        .join(", ")}`}
    >
      <div className="flex">
        <div className="w-28 shrink-0 pr-2">
          {rows.map((r) => (
            <div
              key={r.label}
              className="flex items-center text-xs text-[#c9d3dd]"
              style={{ height: ROW_H }}
            >
              {r.label}
            </div>
          ))}
        </div>
        <div
          className="relative flex-1 border border-[#2f3840]"
          style={{ height: rows.length * ROW_H }}
        >
          {ticks.map((t) => (
            <div
              key={t}
              className="absolute inset-y-0 border-l border-[#2f3840]"
              style={{ left: `${pct(t)}%` }}
            />
          ))}
          {zeroLine && min < 0 && max > 0 && (
            <div
              className="absolute inset-y-0 border-l border-[#8b3a3a]"
              style={{ left: `${pct(0)}%` }}
            />
          )}
          {rows.map(
            (r, i) =>
              i > 0 && (
                <div
                  key={`line-${r.label}`}
                  className="absolute inset-x-0 border-t border-[#2f3840]"
                  style={{ top: i * ROW_H }}
                />
              )
          )}
          {rows.map((r, i) => (
            <div
              key={r.label}
              className={`absolute flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-[11px] font-semibold tabular-nums text-white ${
                r.warm ? "bg-[#a4612f]/85" : "bg-[#3b4651]"
              }`}
              style={{
                left: `${pct(r.value)}%`,
                top: i * ROW_H + ROW_H / 2,
              }}
            >
              {r.display ?? r.value}
            </div>
          ))}
        </div>
      </div>
      <div className="relative ml-28 mt-2 h-4 text-xs tabular-nums text-[#9aa7b5]">
        {ticks.map((t) => (
          <span
            key={t}
            className="absolute -translate-x-1/2"
            style={{ left: `${pct(t)}%` }}
          >
            {t}
          </span>
        ))}
      </div>
      <p className="ml-28 mt-1 text-center text-xs text-[#9aa7b5]">
        {axisLabel}
      </p>
    </div>
  );
}