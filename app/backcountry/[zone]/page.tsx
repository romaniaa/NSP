import type { Metadata } from "next";
import { notFound } from "next/navigation";
import AvalancheCard from "@/components/AvalancheCard";
import FreezingChart from "@/components/FreezingChart";
import PinButton from "@/components/PinButton";
import RangeIcon from "@/components/RangeIcon";
import SiteNav from "@/components/SiteNav";
import { PageTransition } from "@/components/Transitions";
import { compass } from "@/components/WindCard";
import ZoneDiagram from "@/components/ZoneDiagram";
import ZoneTemperatureChart from "@/components/ZoneTemperatureChart";
import ZoneStations from "@/components/ZoneStations";
import ZoneWindCard from "@/components/ZoneWindCard";
import { Card, SectionLabel, Unavailable } from "@/components/Ui";
import { ZONES, type ZoneConfig } from "@/config/zones";
import { getAvalancheForecast } from "@/lib/Avalanche";
import { getZoneStations } from "@/lib/Stations";
import { CONDITION, conditionAt, fmt } from "@/lib/Conditions";
import DailyForecast from "@/components/DailyForecast";
import { getDailyForecast, getFreezingSeries } from "@/lib/Forecast";
import { tempAt, windAloft } from "@/lib/Model";
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

// Navigations into this page wait for it rather than showing a loading skeleton
// first. The page is static and served from the CDN, so the wait is short, and
// the whole page then arrives in one commit: the card-to-page morph (the shared
// <ViewTransition> names) only forms when the destination's content is there in
// the same commit as the navigation. Opting out also tells Next's instant-
// navigation check that reading params outside <Suspense> here is deliberate.
export const instant = false;

export default async function ZonePage({ params }: { params: Promise<{ zone: string }> }) {
  const { zone: id } = await params;
  const zone = ZONES.find((z) => z.id === id);
  if (!zone) notFound();

  return (
    <>
      <SiteNav />
      <PageTransition>
        <main className="min-h-screen px-4 py-8 text-ink md:px-10">
          <div className="mx-auto max-w-8xl space-y-5">
            <header className="pb-2">
              <p className="text-xs uppercase tracking-widest text-muted">Backcountry</p>
              <h1 className="flex items-center gap-4 text-6xl font-bold">
                <RangeIcon color={zone.color} className="h-10 w-[54px]" />
                {zone.fullName}
              </h1>
              <p className="mt-2 max-w-3xl text-ink-2">{zone.description}</p>
              <div className="mt-4">
                <PinButton id={zone.id} name={zone.fullName} color={zone.color} size="large" />
              </div>
            </header>
            <ZoneContent zone={zone} />
          </div>
        </main>
      </PageTransition>
    </>
  );
}

function ElevationTable({ zone, now }: { zone: ZoneConfig; now: HillNow }) {
  const sky = { precipitation: now.precipitation, cloud: now.cloud, code: now.code };
  const ridge = windAloft(now.aloft, Math.max(...zone.heights));
  return (
    <Card>
      <h3 className="font-semibold text-ink">Conditions by elevation</h3>
      <p className="mb-4 mt-1 text-xs text-muted">
        Model estimates at heights across this terrain, highest first
      </p>
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="text-xs text-muted">
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
                <tr key={h} className="border-t border-line">
                  <td className="py-2 tabular-nums text-ink">{fmt(h)} m</td>
                  <td className="py-2 tabular-nums text-ink">
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
      <dl className="mt-4 grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">
        <div>
          <dt className="text-muted">Freezing level</dt>
          <dd className="mt-1 tabular-nums text-ink">{fmt(now.freezingLevel)} m</dd>
        </div>
        <div>
          <dt className="text-muted">Precipitation</dt>
          <dd className="mt-1 tabular-nums text-ink">
            {now.precipitation > 0 ? `${now.precipitation} mm/h` : "None"}
          </dd>
        </div>
        <div>
          <dt className="text-muted">Ridgetop wind</dt>
          <dd className="mt-1 tabular-nums text-ink">
            {ridge.speed} km/h {compass(ridge.dir)}
          </dd>
        </div>
        <div>
          <dt className="text-muted">Near-surface wind</dt>
          <dd className="mt-1 tabular-nums text-ink">
            {Math.round(now.wind)} km/h · gusts {Math.round(now.gust)}
          </dd>
        </div>
      </dl>
    </Card>
  );
}

async function ZoneContent({ zone }: { zone: ZoneConfig }) {
  const [avyRes, nowRes, freezingRes, stationsRes, dailyRes] = await Promise.allSettled([
    getAvalancheForecast(zone.id),
    getCurrentConditions().then((c) => c[zone.id]),
    getFreezingSeries([zone.id]),
    getZoneStations(zone.id),
    getDailyForecast(zone.id),
  ]);
  for (const r of [avyRes, nowRes, freezingRes, stationsRes, dailyRes]) {
    if (r.status === "rejected") console.error("Fetch failure:", r.reason);
  }
  const forecast = avyRes.status === "fulfilled" ? avyRes.value : null;
  const now = nowRes.status === "fulfilled" ? nowRes.value : null;
  const freezing = freezingRes.status === "fulfilled" ? freezingRes.value : null;
  const stations = stationsRes.status === "fulfilled" ? stationsRes.value : null;
  const daily = dailyRes.status === "fulfilled" ? dailyRes.value : null;

  return (
    <>
      {forecast ? (
        <AvalancheCard name={zone.fullName} forecast={forecast} timeZone={zone.timeZone} />
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

      <SectionLabel>Forecast</SectionLabel>
      {daily && daily.days.length > 0 ? (
        <DailyForecast
          days={daily.days}
          top={{ label: "Upper", elevation: Math.max(...zone.heights) }}
          bottom={{ label: "Lower", elevation: Math.min(...zone.heights) }}
          color={zone.color}
        />
      ) : (
        <Unavailable title="Forecast" />
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
            note={`Daily low–high range at ${zone.fullName} · Open-Meteo model`}
          />
          <FreezingChart
            title="Freezing level history"
            badge="10-day history"
            current={freezing.current}
            trend={trendWord(freezing.deltaPast25, "Rising", "Falling", "Steady")}
            detail={trendDetail(freezing.deltaPast25, "the past 25 hours")}
            days={freezing.history}
            updated={freezing.updated}
            note={`Daily low–high range at ${zone.fullName} · Open-Meteo model`}
          />
        </div>
      ) : (
        <Unavailable title="Freezing level" />
      )}

      <SectionLabel>Temperature and wind</SectionLabel>
      {now ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <ZoneTemperatureChart zone={zone} now={now} />
          <ZoneWindCard zone={zone} now={now} />
        </div>
      ) : (
        <Unavailable title="Temperature and wind" />
      )}

      {zone.stations.length > 0 && (
        <>
          <SectionLabel>Weather stations</SectionLabel>
          {stations ? (
            <ZoneStations stations={stations} now={now} timeZone={zone.timeZone} />
          ) : (
            <Unavailable title="Weather stations" />
          )}
        </>
      )}

      <footer className="pb-4 pt-2 text-xs text-faint">
        Avalanche danger ratings from{" "}
        <a href="https://avalanche.ca" className="underline hover:text-ink">
          Avalanche Canada
        </a>
        . Weather is model estimates, not station observations; the snow line is
        estimated at 150 m below the freezing level. Weather data by{" "}
        <a href="https://open-meteo.com" className="underline hover:text-ink">
          Open-Meteo.com
        </a>
        .
      </footer>
    </>
  );
}
