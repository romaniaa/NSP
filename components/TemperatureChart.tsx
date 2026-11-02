import BubbleChart, { niceDomain } from "@/components/BubbleChart";
import { Card } from "@/components/Ui";
import type { PointReading } from "@/lib/Forecast";

export default function TemperatureChart({
  readings,
}: {
  readings: PointReading[];
}) {
  const { min, max, step } = niceDomain(
    readings.map((r) => r.temp),
    true
  );

  return (
    <Card>
      <h3 className="font-semibold text-white">Temperature by elevation</h3>
      <p className="mb-5 mt-1 text-xs text-[#9aa7b5]">
        Model estimates at each lift, not station readings
      </p>
      <BubbleChart
        rows={readings.map((r) => ({
          label: r.label,
          value: r.temp,
          display: `${r.temp}°`,
          warm: r.temp > 0,
        }))}
        min={min}
        max={max}
        step={step}
        axisLabel="Temperature (°C)"
        zeroLine
      />
    </Card>
  );
}