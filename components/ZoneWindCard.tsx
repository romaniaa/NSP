import { Card } from "@/components/Ui";
import { Compass, compass } from "@/components/WindCard";
import type { ZoneConfig } from "@/config/zones";
import { fmt } from "@/lib/Conditions";
import { windAloft } from "@/lib/Model";
import type { HillNow } from "@/lib/Weather";

// Wind for a backcountry zone, as avalanche forecasts describe it: ridgetop wind
// (free air at the top of the zone's terrain, which drives wind loading) first,
// then the near-surface wind and gusts that sheltered slopes see.
export default function ZoneWindCard({ zone, now }: { zone: ZoneConfig; now: HillNow }) {
  const top = Math.max(...zone.heights);
  const ridge = windAloft(now.aloft, top);

  return (
    <Card>
      <h3 className="font-semibold text-ink">Wind</h3>
      <p className="mt-1 text-xs text-muted">
        Model estimates. Ridgetop wind is the free air at ~{fmt(top)} m
      </p>

      <div className="mt-6 flex items-center justify-between gap-6">
        <div className="space-y-4">
          <div>
            <p className="text-xs text-muted">Ridgetop</p>
            <p className="font-display text-5xl font-bold tabular-nums text-ink">
              {ridge.speed}
              <span className="ml-1 text-base font-normal text-muted">km/h</span>
            </p>
            <p className="text-sm text-ink-2">From the {compass(ridge.dir)}</p>
          </div>
          <div>
            <p className="text-xs text-muted">Near the surface</p>
            <p className="font-display text-3xl font-bold tabular-nums text-ink">
              {Math.round(now.wind)}
              <span className="ml-1 text-base font-normal text-muted">km/h</span>
            </p>
            <p className="text-sm text-ink-2">
              Gusts {Math.round(now.gust)} km/h · from the {compass(now.dir)}
            </p>
          </div>
        </div>
        <Compass dir={ridge.dir} color={zone.color} />
      </div>

      <p className="mt-5 text-xs text-faint">
        Exposed ridges and peaks usually see the ridgetop wind; sheltered slopes and
        valleys, the near-surface wind. Humidity{" "}
        <span className="tabular-nums text-ink">{Math.round(now.rh)}%</span>.
      </p>
    </Card>
  );
}
