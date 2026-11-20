import { Card } from "@/components/Ui";
import type { StationReading } from "@/lib/Forecast";

const POINTS = [
  "N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE",
  "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW",
];
export const compass = (deg: number) => POINTS[Math.round(deg / 22.5) % 16];

// A compass with an arrow pointing where the wind blows to, and its source below.
export function Compass({ dir, color }: { dir: number; color: string }) {
  return (
    <div className="text-center">
      <div
        className="relative h-28 w-28 rounded-full border border-line-2"
        role="img"
        aria-label={`Wind from the ${compass(dir)}`}
      >
        <svg
          viewBox="0 0 100 100"
          className="absolute inset-0 h-full w-full"
          aria-hidden="true"
        >
          {POINTS.map((p, i) => (
            <line
              key={p}
              x1="50"
              x2="50"
              y1="1"
              y2={i % 4 === 0 ? 8 : 5}
              className="stroke-tick"
              transform={`rotate(${i * 22.5} 50 50)`}
            />
          ))}
        </svg>
        <span className="absolute left-1/2 top-2.5 -translate-x-1/2 text-[10px] text-faint">
          N
        </span>
        {/* The arrow points the way the wind is blowing toward */}
        <svg
          viewBox="0 0 100 100"
          className="absolute inset-0 h-full w-full"
          style={{ transform: `rotate(${dir + 180}deg)` }}
          aria-hidden="true"
        >
          <line x1="50" y1="78" x2="50" y2="26" stroke={color} strokeWidth="3" strokeLinecap="round" />
          <polygon points="50,18 40,34 60,34" fill={color} />
        </svg>
      </div>
      <p className="mt-2 text-sm text-ink-2">
        From the {compass(dir)}
      </p>
    </div>
  );
}


export default function WindCard({
  station,
  color,
}: {
  station: StationReading;
  color: string;
}) {
  return (
    <Card>
      <h3 className="font-semibold text-ink">Wind</h3>
      <p className="mt-1 text-xs text-muted">
        Model wind at 10 m above ground
      </p>

      <div className="mt-6 flex items-center justify-between gap-6">
        <div className="space-y-4">
          <div>
            <p className="text-xs text-muted">Average</p>
            <p className="font-display text-5xl font-bold tabular-nums text-ink">
              {station.wind}
              <span className="ml-1 text-base font-normal text-muted">
                km/h
              </span>
            </p>
          </div>
          <div>
            <p className="text-xs text-muted">Gusts</p>
            <p className="font-display text-5xl font-bold tabular-nums text-ink">
              {station.gust}
              <span className="ml-1 text-base font-normal text-muted">
                km/h
              </span>
            </p>
          </div>
        </div>

        <Compass dir={station.dir} color={color} />
      </div>

      <p className="mt-5 text-sm text-muted">
        Humidity <span className="tabular-nums text-ink">{station.rh}%</span>
      </p>
    </Card>
  );
}
