import type { ReactNode } from "react";
import { CONDITION, fmt, type Condition } from "@/lib/Conditions";
import type { SnowNow } from "@/lib/SnowNow";

// The row of headline numbers near the top of every hill and zone card: air
// temperature at the top and bottom, and snow on the ground when a source has it.
// Three columns throughout, so the numbers line up across a row of cards.
export function StatStrip({ children }: { children: ReactNode }) {
  return (
    <dl className="mt-3 grid grid-cols-3 gap-3 border-y border-[#2f3840] py-3">{children}</dl>
  );
}

const Label = ({ children }: { children: ReactNode }) => (
  <dt className="truncate text-xs text-[#9aa7b5]">{children}</dt>
);

// Temperature at one height, with what would be falling there.
export function TempStat({
  label,
  elevation,
  temp,
  condition,
}: {
  label: string; // "Top", "Base", "Upper"…
  elevation: number; // m
  temp: number; // °C
  condition: Condition;
}) {
  return (
    <div className="min-w-0">
      <Label>
        {label} · <span className="tabular-nums">{fmt(elevation)} m</span>
      </Label>
      <dd className="font-display text-3xl font-bold leading-tight tabular-nums text-white">
        {Math.round(temp * 10) / 10}°
      </dd>
      <dd className="mt-1">
        <span className={`chip ${CONDITION[condition].chip}`}>{CONDITION[condition].label}</span>
      </dd>
    </div>
  );
}

// Snow on the ground, from the resort's report or a weather station.
export function SnowStat({ snow }: { snow: SnowNow }) {
  return (
    <div className="min-w-0">
      <Label>Snow · {snow.where}</Label>
      <dd className="font-display text-3xl font-bold leading-tight tabular-nums text-white">
        {fmt(snow.cm)}
        <span className="ml-0.5 text-sm font-normal text-[#8f8f8f]">cm</span>
      </dd>
      <dd className="mt-1 truncate text-xs tabular-nums text-[#9aa7b5]">
        {snow.new24 ? `+${snow.new24} cm in 24 h` : snow.source === "report" ? "Resort report" : "Station"}
      </dd>
    </div>
  );
}
