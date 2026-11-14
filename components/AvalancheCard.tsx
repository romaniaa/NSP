import { Card } from "@/components/Ui";
import {
  isRated,
  type AvalancheForecast,
  type Danger,
  type DangerLevel,
} from "@/lib/Avalanche";

// Colours of the North American Public Avalanche Danger Scale, so ratings read the
// way they do on Avalanche Canada's own forecasts. Full class strings for Tailwind.
export const DANGER_STYLE: Record<DangerLevel, { cell: string; chip: string; label: string }> = {
  low: { cell: "bg-[#52ba4a] text-black", chip: "bg-[#52ba4a] text-black", label: "1 · Low" },
  moderate: { cell: "bg-[#fff300] text-black", chip: "bg-[#fff300] text-black", label: "2 · Moderate" },
  considerable: {
    cell: "bg-[#f79218] text-black",
    chip: "bg-[#f79218] text-black",
    label: "3 · Considerable",
  },
  high: { cell: "bg-[#ef1c29] text-white", chip: "bg-[#ef1c29] text-white", label: "4 · High" },
  extreme: {
    cell: "bg-[#1a1a1a] text-white outline outline-2 -outline-offset-2 outline-[#ef1c29]",
    chip: "bg-[#1a1a1a] text-white outline outline-1 outline-[#ef1c29]",
    label: "5 · Extreme",
  },
};
const UNRATED = "bg-[#2f3840] text-[#c9d3dd]";

export function dangerClass(d: Danger) {
  return isRated(d) ? DANGER_STYLE[d.value].cell : UNRATED;
}

export function dangerLabel(d: Danger) {
  return isRated(d) ? DANGER_STYLE[d.value].label : d.display;
}

const TZ = "America/Vancouver";
const when = (iso: string) =>
  new Date(iso).toLocaleString("en-CA", {
    timeZone: TZ,
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

const BANDS = [
  { key: "alp", label: "Alpine" },
  { key: "tln", label: "Treeline" },
  { key: "btl", label: "Below treeline" },
] as const;

function Disclaimer() {
  return (
    <p className="text-xs text-[#9aa7b5]">
      A summary, not the forecast. Read the full forecast before you go, and travel
      in avalanche terrain only with training and rescue gear.
    </p>
  );
}

export default function AvalancheCard({
  name,
  forecast,
}: {
  name: string;
  forecast: AvalancheForecast;
}) {
  if (forecast.status === "none") {
    return (
      <Card className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-semibold text-white">{name} avalanche danger</h3>
          <span className="chip bg-white/10 text-[#c9d3dd]">Avalanche Canada</span>
        </div>
        <p className="text-sm text-[#c9d3dd]">
          No current avalanche forecast covers this area.{" "}
          <a
            href={forecast.url}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-white"
          >
            Check Avalanche Canada&apos;s map
          </a>{" "}
          for the latest.
        </p>
        <Disclaimer />
      </Card>
    );
  }

  const days = forecast.days.slice(0, 3);
  const rated = forecast.note == null && days.length > 0;

  return (
    <Card className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-white">{name} avalanche danger</h3>
          <p className="mt-1 text-xs text-[#9aa7b5]">
            Issued {when(forecast.issued)} · valid until {when(forecast.validUntil)}
          </p>
        </div>
        <span className="chip bg-white/10 text-[#c9d3dd]">{forecast.owner}</span>
      </div>

      {rated ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[420px] border-separate border-spacing-1 text-sm">
            <thead>
              <tr className="text-xs text-[#9aa7b5]">
                <th className="text-left font-normal" />
                {days.map((d) => (
                  <th key={d.date} className="text-left font-normal">
                    {d.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {BANDS.map((b) => (
                <tr key={b.key}>
                  <th className="pr-2 text-left text-xs font-normal text-[#9aa7b5]">{b.label}</th>
                  {days.map((d) => (
                    <td key={d.date} className={`px-2 py-2 font-semibold ${dangerClass(d[b.key])}`}>
                      {dangerLabel(d[b.key])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-sm text-[#c9d3dd]">
          <span className="chip mr-2 bg-white/10 text-white">{forecast.note ?? "No rating"}</span>
          Avalanche Canada isn&apos;t issuing daily danger ratings for this area right
          now. The full forecast may still describe conditions.
        </p>
      )}

      {forecast.problems.length > 0 && (
        <div>
          <h4 className="text-xs text-[#9aa7b5]">Avalanche problems</h4>
          <ul className="mt-2 space-y-2 text-sm">
            {forecast.problems.map((p, i) => (
              <li key={`${p.type}-${i}`} className="text-[#c9d3dd]">
                <span className="font-semibold text-white">{p.type}</span>
                {[
                  p.elevations.length > 0 ? p.elevations.join(", ") : null,
                  p.aspects.length > 0 ? `${p.aspects.length === 8 ? "all aspects" : p.aspects.join(", ")}` : null,
                  p.likelihood,
                  p.size ? `size ${p.size.min}–${p.size.max}` : null,
                ]
                  .filter(Boolean)
                  .map((x) => ` · ${x}`)
                  .join("")}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="space-y-2">
        <a
          href={forecast.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block text-sm text-white underline"
        >
          Read the full forecast on Avalanche Canada
        </a>
        <Disclaimer />
      </div>
    </Card>
  );
}
