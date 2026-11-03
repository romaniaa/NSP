import { Card } from "@/components/Ui";
import type { StationReading } from "@/lib/Forecast";

const POINTS = [
  "N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE",
  "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW",
];
const compass = (deg: number) => POINTS[Math.round(deg / 22.5) % 16];

export default function WindCard({
  station,
  color,
}: {
  station: StationReading;
  color: string;
}) {
  return (
    <Card>
      <h3 className="font-semibold text-white">Wind</h3>
      <p className="mt-1 text-xs text-[#9aa7b5]">
        Model wind at 10 m above ground
      </p>

      <div className="mt-6 flex items-center justify-between gap-6">
        <div className="space-y-4">
          <div>
            <p className="text-xs text-[#9aa7b5]">Average</p>
            <p className="font-display text-5xl font-bold tabular-nums text-white">
              {station.wind}
              <span className="ml-1 text-base font-normal text-[#9aa7b5]">
                km/h
              </span>
            </p>
          </div>
          <div>
            <p className="text-xs text-[#9aa7b5]">Gusts</p>
            <p className="font-display text-5xl font-bold tabular-nums text-white">
              {station.gust}
              <span className="ml-1 text-base font-normal text-[#9aa7b5]">
                km/h
              </span>
            </p>
          </div>
        </div>

        <div className="text-center">
          <div
            className="relative h-28 w-28 rounded-full border border-[#2f3840]"
            role="img"
            aria-label={`Wind from the ${compass(station.dir)}`}
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
                  stroke="#5f6e7b"
                  transform={`rotate(${i * 22.5} 50 50)`}
                />
              ))}
            </svg>
            <span className="absolute left-1/2 top-2.5 -translate-x-1/2 text-[10px] text-[#7d8da1]">
              N
            </span>
            {/* The arrow points the way the wind is blowing toward */}
            <svg
              viewBox="0 0 100 100"
              className="absolute inset-0 h-full w-full"
              style={{ transform: `rotate(${station.dir + 180}deg)` }}
              aria-hidden="true"
            >
              <line x1="50" y1="78" x2="50" y2="26" stroke={color} strokeWidth="3" strokeLinecap="round" />
              <polygon points="50,18 40,34 60,34" fill={color} />
            </svg>
          </div>
          <p className="mt-2 text-sm text-[#c9d3dd]">
            From the {compass(station.dir)}
          </p>
        </div>
      </div>

      <p className="mt-5 text-sm text-[#9aa7b5]">
        Humidity <span className="tabular-nums text-white">{station.rh}%</span>
      </p>
    </Card>
  );
}
