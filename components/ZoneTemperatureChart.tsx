import BubbleChart, { niceDomain } from "@/components/BubbleChart";
import { Card } from "@/components/Ui";
import type { ZoneConfig } from "@/config/zones";
import { fmt } from "@/lib/Conditions";
import { tempAt } from "@/lib/Model";
import type { HillNow } from "@/lib/Weather";

const STEP = 200; // metres between rows

// Temperature every 200 m across a zone's terrain, highest first, from the
// model's air temperature at each height, so inversions show up as warmer air
// above colder.
export default function ZoneTemperatureChart({ zone, now }: { zone: ZoneConfig; now: HillNow }) {
  const top = Math.max(...zone.heights);
  const bottom = Math.min(...zone.heights);
  const heights: number[] = [];
  for (let h = top; h >= bottom; h -= STEP) heights.push(h);
  if (heights[heights.length - 1] !== bottom) heights.push(bottom);

  const rows = heights.map((h) => {
    const t = Math.round(tempAt(now.profile, h) * 10) / 10;
    return { label: `${fmt(h)} m`, value: t, display: `${t}°`, color: zone.color };
  });
  const { min, max, step } = niceDomain(
    rows.map((r) => r.value),
    true
  );

  return (
    <Card>
      <h3 className="font-semibold text-ink">Temperature by height</h3>
      <p className="mb-5 mt-1 text-xs text-muted">
        Model estimates every {STEP} m across this terrain, highest first
      </p>
      <BubbleChart rows={rows} min={min} max={max} step={step} axisLabel="Temperature (°C)" zeroLine />
    </Card>
  );
}
