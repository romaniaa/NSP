import BubbleChart, { niceDomain } from "@/components/BubbleChart";
import { Card } from "@/components/Ui";
import type { Lift } from "@/config/lifts";
import type { MountainId } from "@/config/mountains";
import type { StationReading } from "@/lib/Forecast";

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
  const rows = lifts
    .flatMap((l) => [
      l.top != null ? { label: `${l.short} top`, elevation: l.top } : null,
      l.bottom != null ? { label: `${l.short} bottom`, elevation: l.bottom } : null,
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
      <h3 className="font-semibold text-white">Temperature by station</h3>
      <p className="mb-5 mt-1 text-xs text-[#9aa7b5]">
        Model estimates at each lift station, highest first
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
