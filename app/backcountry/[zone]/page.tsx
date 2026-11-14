import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import AvalancheCard from "@/components/AvalancheCard";
import { ElevationDiagram } from "@/components/ElevationVisualizer";
import FreezingChart from "@/components/FreezingChart";
import PinButton from "@/components/PinButton";
import RangeIcon from "@/components/RangeIcon";
import SiteNav from "@/components/SiteNav";
import { PageTransition } from "@/components/Transitions";
import { Card, SectionLabel, Unavailable } from "@/components/Ui";
import { regionById } from "@/config/regions";
import { ZONES, type ZoneConfig } from "@/config/zones";
import { getAvalancheForecast } from "@/lib/Avalanche";
import { CONDITION, conditionAt, fmt } from "@/lib/Conditions";
import { getFreezingSeries } from "@/lib/Forecast";
import { tempAt } from "@/lib/Model";
import { OPEN_GRAPH, SITE_NAME } from "@/lib/Site";
import { trendDetail, trendWord } from "@/lib/Trend";
import { getCurrentConditions, type HillNow } from "@/lib/Weather";

export function generateStaticParams() {
  return ZONES.map((z) => ({ zone: z.id }));
}

const title = (z: ZoneConfig) => `${z.fullName} Avalanche Danger & Conditions`;
const description = (z: ZoneConfig) =>
  `${z.fullName} today: Avalanche Canada danger ratings, freezing level, and temperature and rain or snow from ${fmt(Math.min(...z.heights))} to ${fmt(Math.max(...z.heights))} m. ${z.description} Updated hourly.`;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ zone: string }>;
}): Promise<Metadata> {
  const { zone } = await params;
  const z = ZONES.find((x) => x.id === zone);
  if (!z) return {};
  return {
    title: title(z),
    description: description(z),
    alternates: { canonical: `/backcountry/${z.id}` },
    openGraph: {
      ...OPEN_GRAPH,
      title: `${title(z)} | ${SITE_NAME}`,
      description: description(z),
      url: `/backcountry/${z.id}`,
    },
  };
}

export default async function ZonePage({ params }: { params: Promise<{ zone: string }> }) {
  const { zone: id } = await params;
  const zone = ZONES.find((z) => z.id === id);
  if (!zone) notFound();

  return (
    <>
      <SiteNav />
      <PageTransition>
        <main className="min-h-screen px-4 py-8 text-white md:px-10">
          <div className="mx-auto max-w-8xl space-y-5">
            <header className="pb-2">
              <p className="text-xs uppercase tracking-widest text-[#9aa7b5]">Backcountry</p>
              <h1 className="flex items-center gap-4 text-6xl font-bold">
                <RangeIcon color={zone.color} className="h-10 w-[54px]" />
                {zone.fullName}
              </h1>
              <p className="mt-2 max-w-3xl text-[#c9d3dd]">{zone.description}</p>
              <div className="mt-4">
                <PinButton id={zone.id} name={zone.fullName} size="large" />
              </div>
            </header>
            <Suspense fallback={<div className="h-96 animate-pulse bg-[#13181d]" aria-busy="true" />}>
              <ZoneContent zone={zone} />
            </Suspense>
          </div>
        </main>
      </PageTransition>
    </>
  );
}

function ElevationTable({ zone, now }: { zone: ZoneConfig; now: HillNow }) {
  const sky = { precipitation: now.precipitation, cloud: now.cloud, code: now.code };
  return (
    <Card>
      <h3 className="font-semibold text-white">Conditions by elevation</h3>
      <p className="mb-4 mt-1 text-xs text-[#9aa7b5]">
        Model estimates at heights across this terrain, highest first
      </p>
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="text-xs text-[#9aa7b5]">
            <th className="pb-2 font-normal">Elevation</th>
            <th className="pb-2 font-normal">Temperature</th>
            <th className="pb-2 font-normal">Now</th>
          </tr>
        </thead>
        <tbody>
          {[...zone.heights]
            .sort((a, b) => b - a)
            .map((h) => {
              const c = conditionAt(h, now.freezingLevel, sky);
              return (
                <tr key={h} className="border-t border-[#232a31]">
                  <td className="py-2 tabular-nums text-white">{fmt(h)} m</td>
                  <td className="py-2 tabular-nums text-white">
                    {Math.round(tempAt(now.profile, h) * 10) / 10}°
                  </td>
                  <td className="py-2">
                    <span className={`chip ${CONDITION[c].chip}`}>{CONDITION[c].label}</span>
                  </td>
                </tr>
              );
            })}
        </tbody>
      </table>
      <dl className="mt-4 grid grid-cols-3 gap-3 text-xs">
        <div>
          <dt className="text-[#9aa7b5]">Freezing level</dt>
          <dd className="mt-1 tabular-nums text-white">{fmt(now.freezingLevel)} m</dd>
        </div>
        <div>
          <dt className="text-[#9aa7b5]">Precipitation</dt>
          <dd className="mt-1 tabular-nums text-white">
            {now.precipitation > 0 ? `${now.precipitation} mm/h` : "None"}
          </dd>
        </div>
        <div>
          <dt className="text-[#9aa7b5]">Wind</dt>
          <dd className="mt-1 tabular-nums text-white">
            {Math.round(now.wind)} km/h · gusts {Math.round(now.gust)}
          </dd>
        </div>
      </dl>
    </Card>
  );
}

// A generic range outline: zones span many peaks, so no single ridge is drawn as
// a likeness. Its heights are scaled to the zone's terrain, so the snow line and
// the labelled heights sit at the right levels against it.
const GENERIC_RIDGE: [number, number][] = [
  [0, 0.25], [12, 0.5], [22, 0.85], [30, 0.62], [42, 1], [52, 0.7],
  [60, 0.78], [72, 0.45], [84, 0.66], [100, 0.35],
];
const BANDS = ["Upper", "Middle", "Lower"];

function ZoneDiagram({ zone, now }: { zone: ZoneConfig; now: HillNow }) {
  const heights = [...zone.heights].sort((a, b) => b - a);
  const top = heights[0];
  const bottom = heights[heights.length - 1];
  const lo = bottom - 250;
  const hi = top + 120;
  return (
    <section
      className="border border-[#232a31] bg-[#13181d] p-5"
      style={{ borderTop: `3px solid ${zone.color}` }}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-2xl font-bold text-white">{zone.name}</h3>
          <p className="text-xs tabular-nums text-[#8f8f8f]">
            {fmt(bottom)}–{fmt(top)} m terrain
          </p>
        </div>
        <div className="text-right">
          <p className="font-display text-4xl font-bold tabular-nums text-white">
            {fmt(now.freezingLevel)}
            <span className="ml-0.5 text-sm font-normal text-[#8f8f8f]">m</span>
          </p>
          <p className="text-xs text-[#8f8f8f]">Freezing level</p>
        </div>
      </div>
      <ElevationDiagram
        id={zone.id}
        name={zone.fullName}
        min={bottom - 400}
        max={top + 250}
        profile={GENERIC_RIDGE.map(([x, f]) => [x, Math.round(lo + f * (hi - lo))])}
        landmarks={heights.map((h, i) => ({ name: BANDS[i] ?? "", elevation: h }))}
        color={zone.color}
        freezingLevel={now.freezingLevel}
        sky={{ precipitation: now.precipitation, cloud: now.cloud, code: now.code }}
      />
      <p className="mt-1 text-xs text-[#7d8da1]">
        Heights are to scale; the ridge is a generic outline.
      </p>
    </section>
  );
}

async function ZoneContent({ zone }: { zone: ZoneConfig }) {
  const region = regionById(zone.region);
  const [avyRes, nowRes, freezingRes] = await Promise.allSettled([
    getAvalancheForecast(zone.id),
    getCurrentConditions().then((c) => c[zone.id]),
    getFreezingSeries(zone.region),
  ]);
  for (const r of [avyRes, nowRes, freezingRes]) {
    if (r.status === "rejected") console.error("Fetch failure:", r.reason);
  }
  const forecast = avyRes.status === "fulfilled" ? avyRes.value : null;
  const now = nowRes.status === "fulfilled" ? nowRes.value : null;
  const freezing = freezingRes.status === "fulfilled" ? freezingRes.value : null;

  return (
    <>
      {forecast ? (
        <AvalancheCard name={zone.fullName} forecast={forecast} />
      ) : (
        <Unavailable title={`${zone.fullName} avalanche danger`} />
      )}

      <SectionLabel>Rain and snow line, by elevation</SectionLabel>
      {now ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <ZoneDiagram zone={zone} now={now} />
          <div className="lg:col-span-2">
            <ElevationTable zone={zone} now={now} />
          </div>
        </div>
      ) : (
        <Unavailable title="Conditions by elevation" />
      )}

      <SectionLabel>Freezing level</SectionLabel>
      {freezing ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <FreezingChart
            title="Freezing level forecast"
            badge="6-day forecast"
            current={freezing.current}
            trend={trendWord(freezing.deltaNext24, "Expected to rise", "Expected to fall", "Holding steady")}
            detail={trendDetail(freezing.deltaNext24, "the next 24 hours")}
            days={freezing.forecast}
            updated={freezing.updated}
            note={`Daily low–high range · Open-Meteo model · ${region.name} area`}
          />
          <FreezingChart
            title="Freezing level history"
            badge="10-day history"
            current={freezing.current}
            trend={trendWord(freezing.deltaPast25, "Rising", "Falling", "Steady")}
            detail={trendDetail(freezing.deltaPast25, "the past 25 hours")}
            days={freezing.history}
            updated={freezing.updated}
            note={`Daily low–high range · Open-Meteo model · ${region.name} area`}
          />
        </div>
      ) : (
        <Unavailable title="Freezing level" />
      )}

      <footer className="pb-4 pt-2 text-xs text-[#7d8da1]">
        Avalanche danger ratings from{" "}
        <a href="https://avalanche.ca" className="underline hover:text-white">
          Avalanche Canada
        </a>
        . Weather is model estimates, not station observations; the snow line is
        estimated at 150 m below the freezing level. Weather data by{" "}
        <a href="https://open-meteo.com" className="underline hover:text-white">
          Open-Meteo.com
        </a>
        .
      </footer>
    </>
  );
}
