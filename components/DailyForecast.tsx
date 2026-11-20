import type { ReactNode } from "react";
import { Card } from "@/components/Ui";
import { compass } from "@/components/WindCard";
import { CONDITION, PRECIP, fmt } from "@/lib/Conditions";
import type { DayForecast, HeightDay } from "@/lib/Daily";

// Day name and date for a YYYY-MM-DD, read as a calendar date (no time zone
// shift): "Today", then "Wed" and "Nov 18".
function dayLabel(date: string, i: number) {
  const d = new Date(`${date}T12:00:00Z`);
  const opts = { timeZone: "UTC" } as const;
  return {
    name: i === 0 ? "Today" : d.toLocaleDateString("en-CA", { ...opts, weekday: "short" }),
    date: d.toLocaleDateString("en-CA", { ...opts, month: "short", day: "numeric" }),
  };
}

// New snow, or rain, at one height in a day.
function Precip({ h, big }: { h: HeightDay; big?: boolean }) {
  const size = big ? "font-display text-3xl font-bold leading-none" : "text-sm";
  if (h.snow >= 1) {
    return (
      <span className={`${size} tabular-nums ${PRECIP.snow.text}`}>
        {h.snow}
        <span className="ml-0.5 text-xs font-normal">cm</span>
        {h.rain >= 1 && (
          <span className={`ml-1 text-xs font-normal ${PRECIP.rain.text}`}>+{h.rain} mm rain</span>
        )}
      </span>
    );
  }
  if (h.rain >= 1) {
    return (
      <span className={`${size} tabular-nums ${PRECIP.rain.text}`}>
        {h.rain}
        <span className="ml-0.5 text-xs font-normal">mm rain</span>
      </span>
    );
  }
  return big ? (
    <span className={`${size} tabular-nums text-faint`}>
      0<span className="ml-0.5 text-xs font-normal">cm</span>
    </span>
  ) : (
    <span className={`${size} text-faint`}>Dry</span>
  );
}

const Row = ({ label, children }: { label: string; children: ReactNode }) => (
  <div>
    <p className="text-[11px] uppercase tracking-wider text-faint">{label}</p>
    <div className="mt-0.5">{children}</div>
  </div>
);

// The next seven days at a hill's top and bottom lift (or a zone's upper and
// lower heights): sky or precipitation type, new snow, temperatures, freezing
// level and wind. One column per day; on phones the row scrolls sideways.
export default function DailyForecast({
  days,
  top,
  bottom,
  color,
}: {
  days: DayForecast[];
  top: { label: string; elevation: number }; // e.g. "Top", 2,240 m
  bottom: { label: string; elevation: number };
  color: string;
}) {
  return (
    <Card className="overflow-hidden">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h3 className="font-semibold text-ink">{days.length}-day forecast</h3>
        <p className="text-xs text-muted">
          {top.label} {fmt(top.elevation)} m · {bottom.label} {fmt(bottom.elevation)} m
        </p>
      </div>

      <div className="-mx-5 mt-4 overflow-x-auto px-5 pb-1">
        <ol className="grid min-w-[1050px] grid-cols-7 gap-px border border-line bg-line lg:min-w-[880px]">
          {days.map((d, i) => {
            const label = dayLabel(d.date, i);
            const c = CONDITION[d.condition];
            return (
              <li key={d.date} className="space-y-3 whitespace-nowrap bg-surface p-3">
                <div>
                  <p
                    className="text-sm font-semibold text-ink"
                    style={i === 0 ? { color } : undefined}
                  >
                    {label.name}
                  </p>
                  <p className="text-xs text-muted">{label.date}</p>
                </div>
                <span className={`chip ${c.chip}`}>{c.label}</span>
                <Row label={`New snow · ${top.label.toLowerCase()}`}>
                  <Precip h={d.top} big />
                </Row>
                <Row label={bottom.label}>
                  <Precip h={d.bottom} />
                </Row>
                <Row label="High / low">
                  <p className="text-sm tabular-nums text-ink">
                    {d.top.max}° / {d.top.min}°
                    <span className="ml-1 text-xs text-faint">{top.label.toLowerCase()}</span>
                  </p>
                  <p className="text-sm tabular-nums text-ink-2">
                    {d.bottom.max}° / {d.bottom.min}°
                    <span className="ml-1 text-xs text-faint">{bottom.label.toLowerCase()}</span>
                  </p>
                </Row>
                <Row label="Freezing level">
                  <p className="text-sm tabular-nums text-ink">
                    {d.freezing.min === d.freezing.max
                      ? `${fmt(d.freezing.min)} m`
                      : `${fmt(d.freezing.min)}–${fmt(d.freezing.max)} m`}
                  </p>
                </Row>
                <Row label="Wind">
                  <p className="text-sm tabular-nums text-ink">
                    Ridge {d.ridge.speed}
                    <span className="text-xs text-muted"> km/h {compass(d.ridge.dir)}</span>
                  </p>
                  <p className="text-xs tabular-nums text-muted">Gusts {d.gust} km/h</p>
                </Row>
              </li>
            );
          })}
        </ol>
      </div>

      <p className="mt-3 text-xs text-faint">
        Environment Canada&apos;s GEM model via Open-Meteo, sharpest for the first two
        days. Wind is the strongest of the day. New snow assumes about 1 cm per mm of
        water; real snow runs from half that (wet coastal snow) to double (cold, dry
        snow), so read it as a guide.
      </p>
    </Card>
  );
}
