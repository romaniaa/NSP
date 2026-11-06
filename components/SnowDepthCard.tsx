import { Card } from "@/components/Ui";
import type { SnowReport } from "@/lib/SnowReport";

const cm = (n: number) => n.toLocaleString("en-CA");

function SourceLink({ name, url }: { name: string; url: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="underline hover:text-white"
    >
      {name}&apos;s snow report
    </a>
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
    <Card>
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-semibold text-white">{name} snow depth</h3>
        <span className="chip bg-[#7dd3fc]/10 text-[#7dd3fc]">Resort report</span>
      </div>

      {report.status === "ok" ? (
        <>
          <div className="mt-5 flex flex-wrap items-end gap-x-12 gap-y-5">
            {report.depths.map((d) => (
              <div key={d.label}>
                <p className="text-xs text-[#9aa7b5]">{d.label}</p>
                <p className="font-display text-6xl font-bold tabular-nums text-white">
                  {cm(d.cm)}
                  <span className="ml-1 text-2xl text-[#9aa7b5]">cm</span>
                </p>
              </div>
            ))}

            {report.snowfall.length > 0 && (
              <div className="pb-1">
                <p className="text-xs text-[#9aa7b5]">New snow</p>
                <div className="mt-1 flex gap-6">
                  {report.snowfall.map((s) => (
                    <div key={s.label}>
                      <p className="text-lg font-semibold tabular-nums text-white">
                        {cm(s.cm)} cm
                      </p>
                      <p className="text-xs text-[#7d8da1]">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <p className="mt-5 text-xs text-[#7d8da1]">
            From <SourceLink name={name} url={report.url} />
            {report.updated ? ` · updated ${report.updated}` : ""}.
          </p>
        </>
      ) : (
        <p className="mt-3 text-sm text-[#9aa7b5]">
          {report.status === "not-posted"
            ? `${name} hasn't posted a snow report yet this season. `
            : "Not available here yet. "}
          See <SourceLink name={name} url={report.url} />.
        </p>
      )}
    </Card>
  );
}
