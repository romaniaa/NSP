import { Card, PillLink } from "@/components/Ui";
import type { SnowReport } from "@/lib/SnowReport";

const cm = (n: number) => n.toLocaleString("en-CA");

function SourceLink({ name, url }: { name: string; url: string }) {
  return (
    <PillLink href={url} filled>
      {name} snow report
    </PillLink>
  );
}

export default function SnowDepthCard({
  name,
  report,
}: {
  name: string;
  report: SnowReport;
}) {
  return (
    <Card className="h-full p-4!">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-sm font-medium text-[#9aa7b5]">{name} snow depth</h3>
        <span className="chip bg-[#7dd3fc]/10 text-[#7dd3fc]">Resort report</span>
      </div>

      {report.status === "ok" ? (
        <>
          <div className="mt-3 flex flex-wrap items-end gap-x-8 gap-y-3">
            {report.depths.map((d) => (
              <div key={d.label}>
                <p className="text-xs text-[#9aa7b5]">{d.label}</p>
                <p className="font-display text-4xl font-bold tabular-nums text-white">
                  {cm(d.cm)}
                  <span className="ml-1 text-lg text-[#9aa7b5]">cm</span>
                </p>
              </div>
            ))}

            {report.snowfall.length > 0 && (
              <div className="pb-0.5">
                <p className="text-xs text-[#9aa7b5]">New snow</p>
                <div className="mt-0.5 flex gap-5">
                  {report.snowfall.map((s) => (
                    <div key={s.label}>
                      <p className="font-semibold tabular-nums text-white">
                        {cm(s.cm)} cm
                      </p>
                      <p className="text-xs text-[#7d8da1]">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <SourceLink name={name} url={report.url} />
            {report.updated && (
              <span className="text-xs text-[#7d8da1]">Updated {report.updated}</span>
            )}
          </div>
        </>
      ) : (
        <div className="mt-2 space-y-3">
          <p className="text-sm text-[#9aa7b5]">
            {report.status === "not-posted"
              ? `${name} hasn't posted a snow report yet this season.`
              : "Not available here yet."}
          </p>
          <SourceLink name={name} url={report.url} />
        </div>
      )}
    </Card>
  );
}
