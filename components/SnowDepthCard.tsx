import { Card, PillLink } from "@/components/Ui";
import type { SnowReport } from "@/lib/SnowReport";
import type { HillStation } from "@/lib/Stations";

const cm = (n: number) => n.toLocaleString("en-CA");

function SourceLink({ name, url }: { name: string; url: string }) {
  return (
    <PillLink href={url} filled>
      {name} snow report
    </PillLink>
  );
}

// Why there are no resort figures to show.
function noReport(name: string, report: SnowReport | null) {
  if (report == null) return `${name}'s snow report didn't load just now.`;
  if (report.status === "not-posted") return `${name} hasn't posted a snow report yet this season.`;
  return `${name}'s snow report can't be shown here.`;
}

// A hill's snow depth: the resort's own report when it has figures, else the
// snow sensor beside the hill, labelled as such. With both, the station is shown
// small as an independent check. `report` is null when it couldn't be read.
export default function SnowDepthCard({
  name,
  report,
  station,
  url,
  timeZone,
}: {
  name: string;
  report: SnowReport | null;
  station: HillStation | null;
  url: string; // the resort's report page
  timeZone: string;
}) {
  const ok = report?.status === "ok" ? report : null;
  const reading = station && !station.stale ? station.reading : null;
  const stationTime = reading
    ? new Intl.DateTimeFormat("en-CA", { timeZone, hour: "numeric", minute: "2-digit" }).format(
        Date.parse(reading.time)
      )
    : null;
  const stationName = station ? `${station.name} station · ${cm(station.elevation)} m` : "";

  return (
    <Card className="h-full p-4!">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-sm font-medium text-muted">{name} snow depth</h3>
        {ok ? (
          <span className="chip bg-frost/10 text-frost">
            {ok.saved ? "Saved report" : "Resort report"}
          </span>
        ) : (
          reading && <span className="chip bg-ink/10 text-ink-2">Nearby station</span>
        )}
      </div>

      {ok ? (
        <>
          <div className="mt-3 flex flex-wrap items-end gap-x-8 gap-y-3">
            {ok.depths.map((d) => (
              <div key={d.label}>
                <p className="text-xs text-muted">{d.label}</p>
                <p className="font-display text-4xl font-bold tabular-nums text-ink">
                  {cm(d.cm)}
                  <span className="ml-1 text-lg text-muted">cm</span>
                </p>
              </div>
            ))}

            {ok.snowfall.length > 0 && (
              <div className="pb-0.5">
                <p className="text-xs text-muted">New snow</p>
                <div className="mt-0.5 flex gap-5">
                  {ok.snowfall.map((s) => (
                    <div key={s.label}>
                      <p className="font-semibold tabular-nums text-ink">{cm(s.cm)} cm</p>
                      <p className="text-xs text-faint">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {ok.saved && (
            <p className="mt-3 text-xs text-ink-2">
              {name}&apos;s report didn&apos;t load just now. These are the figures it
              last showed, read {ok.saved}.
            </p>
          )}
          {reading && station && (
            <p className="mt-3 text-xs text-faint">
              Nearby, the {station.name} station ({cm(station.elevation)} m, {station.km} km
              away) reads{" "}
              <span className="tabular-nums text-ink-2">{cm(reading.snow!)} cm</span>
              {/* The time already ends in "a.m." or "p.m.". */}
              {stationTime ? ` at ${stationTime}` : "."}
            </p>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <SourceLink name={name} url={ok.url} />
            {ok.updated && <span className="text-xs text-faint">Updated {ok.updated}</span>}
          </div>
        </>
      ) : (
        <div className="mt-2 space-y-3">
          <p className="text-sm text-muted">{noReport(name, report)}</p>
          {reading && station && (
            <div>
              <p className="text-xs text-muted">{stationName}</p>
              <p className="font-display text-4xl font-bold tabular-nums text-ink">
                {cm(reading.snow!)}
                <span className="ml-1 text-lg text-muted">cm</span>
                {reading.snow24 != null && reading.snow24 > 0 && (
                  <span className="ml-3 font-sans text-sm font-semibold text-ink-2">
                    +{cm(reading.snow24)} cm in 24 h
                  </span>
                )}
              </p>
              <p className="mt-1 text-xs text-faint">
                One sensor, so snow on the slopes can differ. {station.where},{" "}
                {station.km} km from the lifts{stationTime && ` · read at ${stationTime}`}
              </p>
            </div>
          )}
          <SourceLink name={name} url={report?.url ?? url} />
        </div>
      )}
    </Card>
  );
}
