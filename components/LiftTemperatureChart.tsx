import BubbleChart, { niceDomain } from "@/components/BubbleChart";
import { Card } from "@/components/Ui";
import type { Lift } from "@/config/lifts";
import type { MountainId } from "@/config/mountains";
import type { StationReading } from "@/lib/Forecast";

const MAX_LIFTS_BOTH_ENDS = 8;

export default function LiftTemperatureChart({
  lifts,
  stations,
  color,
  mountain,
}: {
  lifts: Lift[];
  stations: StationReading[];
  color: string;
  mountain: MountainId;
}) {
  // A big lift network (Whistler has 22) would make a very tall chart, so chart
  // only the top stations there. The lift table still lists both ends.
  const topsOnly = lifts.length > MAX_LIFTS_BOTH_ENDS;
  const rows = lifts
    .flatMap((l) => [
      l.top != null ? { label: `${l.short} top`, elevation: l.top } : null,
      l.bottom != null && !topsOnly
        ? { label: `${l.short} bottom`, elevation: l.bottom }
        : null,
    ])
    .filter((r): r is { label: string; elevation: number } => r != null)
    .sort((a, b) => b.elevation - a.elevation)
    .flatMap((r) => {
      const s = stations.find((x) => x.elevation === r.elevation);
      return s
        ? [{ label: r.label, value: s.temp, display: `${s.temp}°`, color, mountain }]
        : [];
    });

  if (rows.length === 0) return null;
  const { min, max, step } = niceDomain(
    rows.map((r) => r.value),
    true
  );

  return (
    <Card>
      <h3 className="font-semibold text-ink">Temperature by station</h3>
      <p className="mb-5 mt-1 text-xs text-muted">
        Model estimates at {topsOnly ? "the top of each lift" : "each lift station"},
        highest first
      </p>
      <BubbleChart
        rows={rows}
        min={min}
        max={max}
        step={step}
        axisLabel="Temperature (°C)"
        zeroLine
      />
    </Card>
  );
}
