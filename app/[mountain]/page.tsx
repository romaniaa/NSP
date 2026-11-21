import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ElevationVisualizer from "@/components/ElevationVisualizer";
import FreezingChart from "@/components/FreezingChart";
import LiftTable from "@/components/LiftTable";
import LiftTemperatureChart from "@/components/LiftTemperatureChart";
import MountainIcon from "@/components/MountainIcon";
import PinButton from "@/components/PinButton";
import SnowDepthCard from "@/components/SnowDepthCard";
import SiteNav from "@/components/SiteNav";
import Summary from "@/components/Summary";
import WebcamGallery from "@/components/WebcamGallery";
import WindCard from "@/components/WindCard";
import { PageTransition, SharedTransition } from "@/components/Transitions";
import { SectionLabel, Unavailable } from "@/components/Ui";
import { LIFTS } from "@/config/lifts";
import { MOUNTAINS, type MountainConfig } from "@/config/mountains";
import { regionById } from "@/config/regions";
import { WEBCAMS } from "@/config/webcams";
import { extremes, fmt, verdict, vertical } from "@/lib/Conditions";
import DailyForecast from "@/components/DailyForecast";
import { getDailyForecast, getFreezingSeries, getMountainReadings } from "@/lib/Forecast";
import {
  HOME_TITLE,
  OPEN_GRAPH,
  SITE_NAME,
  SITE_URL,
  jsonLd,
  mountainDescription,
  mountainTitle,
} from "@/lib/Site";
import { REPORT_PAGES } from "@/lib/SnowReaders";
import { hillSnow, snowFromStation, type SnowNow } from "@/lib/SnowNow";
import { getSnowReport, type SnowReport } from "@/lib/SnowReport";
import { getHillSnowStation } from "@/lib/Stations";
import { getMountainWeather } from "@/lib/Weather";

export function generateStaticParams() {
  return MOUNTAINS.map((m) => ({ mountain: m.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ mountain: string }>;
}): Promise<Metadata> {
  const { mountain } = await params;
  const m = MOUNTAINS.find((x) => x.id === mountain);
  if (!m) return {};

  const title = mountainTitle(m);
  const description = mountainDescription(m);
  return {
    title,
    description,
    alternates: { canonical: `/${m.id}` },
    openGraph: {
      ...OPEN_GRAPH,
      title: `${title} | ${SITE_NAME}`,
      description,
      url: `/${m.id}`,
    },
  };
}

// Tells search engines what the page is about: a conditions page for a
// named ski area, sitting under the overview.
function structuredData(m: MountainConfig) {
  const url = `${SITE_URL}/${m.id}`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": url,
        url,
        name: mountainTitle(m),
        description: mountainDescription(m),
        inLanguage: "en-CA",
        isPartOf: { "@id": `${SITE_URL}/#website` },
        about: { "@id": `${url}#resort` },
        breadcrumb: { "@id": `${url}#breadcrumb` },
      },
      {
        "@type": "SkiResort",
        "@id": `${url}#resort`,
        name: m.fullName,
        url: m.website,
        geo: {
          "@type": "GeoCoordinates",
          latitude: m.lat,
          longitude: m.lon,
          elevation: m.lifts.top.elevation,
        },
        address: {
          "@type": "PostalAddress",
          addressLocality: m.locality,
          addressRegion: m.province,
          addressCountry: m.country,
        },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${url}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: HOME_TITLE, item: `${SITE_URL}/` },
          {
            "@type": "ListItem",
            position: 2,
            name: `${regionById(m.region).name} ski conditions`,
            item: `${SITE_URL}/${m.region}`,
          },
          { "@type": "ListItem", position: 3, name: m.fullName, item: url },
        ],
      },
    ],
  };
}

// Navigations into this page wait for it rather than showing a loading skeleton
// first. The page is static and served from the CDN, so the wait is short, and
// the whole page then arrives in one commit: the card-to-page morph (the shared
// <ViewTransition> names) only forms when the destination's content is there in
// the same commit as the navigation. Opting out also tells Next's instant-
// navigation check that reading params outside <Suspense> here is deliberate.
export const instant = false;

// The hill is looked up before anything renders, so an unknown URL shows the
// not-found page with a noindex tag.
export default async function MountainPage({
  params,
}: {
  params: Promise<{ mountain: string }>;
}) {
  const { mountain: id } = await params;
  const config = MOUNTAINS.find((m) => m.id === id);
  if (!config) notFound();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(structuredData(config)) }}
      />
      <SiteNav />
      <PageTransition>
        <main className="min-h-screen px-4 py-8 text-ink md:px-10">
          <div className="mx-auto max-w-8xl space-y-5">
            <MountainContent config={config} />
          </div>
        </main>
      </PageTransition>
    </>
  );
}

// "Dry · fog" → "dry with fog", "Snow above 1630 m" → "snow above 1630 m".
function phrase(v: string) {
  const [first, sky] = v.split(" · ");
  const lead = first.charAt(0).toLowerCase() + first.slice(1);
  if (!sky) return lead;
  return sky === "fog" ? `${lead} with fog` : `${lead} and ${sky}`;
}

// One plain-language paragraph of current conditions. It gives search engines
// and people a readable answer before the charts.
function Intro({
  config,
  sky,
  freezingLevel,
  snow,
  stationSnow,
}: {
  config: MountainConfig;
  sky: { precipitation: number; cloud: number | null; code: number | null } | null;
  freezingLevel: number | null;
  snow: SnowReport | null;
  stationSnow: SnowNow | undefined; // the sensor beside the hill, when reporting
}) {
  const now =
    freezingLevel != null
      ? `Right now on ${config.fullName}: ${phrase(verdict(config, freezingLevel, sky ?? undefined))}. Freezing level ${fmt(freezingLevel)} m.`
      : null;
  const depth =
    snow?.status === "ok"
      ? `The resort reports ${snow.depths
          .map((d) => `${fmt(d.cm)} cm at the ${d.label.toLowerCase()}`)
          .join(" and ")}.`
      : stationSnow
        ? `The snow sensor beside the hill (${stationSnow.where}) reads ${fmt(stationSnow.cm)} cm.`
        : null;

  const cams = (WEBCAMS[config.id]?.cams.length ?? 0) > 0;

  return (
    <p className="mt-3 max-w-3xl text-ink-2">
      {[now, depth].filter(Boolean).join(" ")}{" "}
      Below: {cams ? "live webcams, " : ""}rain or snow at each lift and a 7-day
      forecast for this {config.locality} ski area, updated hourly.
    </p>
  );
}

async function MountainContent({ config }: { config: MountainConfig }) {
  const lifts = LIFTS[config.id];
  const webcams = WEBCAMS[config.id];

  const [weatherRes, stationsRes, freezingRes, snowRes, dailyRes, snowStationRes] =
    await Promise.allSettled([
      getMountainWeather(config),
      getMountainReadings(config.id),
      getFreezingSeries([config.id]),
      getSnowReport(config.id),
      getDailyForecast(config.id),
      getHillSnowStation(config.id),
    ]);
  for (const r of [weatherRes, stationsRes, freezingRes, snowRes, dailyRes, snowStationRes]) {
    if (r.status === "rejected") console.error("Fetch failure:", r.reason);
  }

  const weather = weatherRes.status === "fulfilled" ? weatherRes.value : null;
  const stations = stationsRes.status === "fulfilled" ? stationsRes.value : null;
  const freezing = freezingRes.status === "fulfilled" ? freezingRes.value : null;
  // null when fulfilled means it's outside the snow season, so the section is hidden.
  const snowFailed = snowRes.status === "rejected";
  const snow = snowRes.status === "fulfilled" ? snowRes.value : null;
  const daily = dailyRes.status === "fulfilled" ? dailyRes.value : null;
  // The snow sensor beside the hill, used in the snow season when the resort has
  // no figures (and shown as a check when it does).
  const inSeason = snow != null || snowFailed;
  const snowStation =
    inSeason && snowStationRes.status === "fulfilled" ? snowStationRes.value : null;

  const freezingLevel = weather?.freezingLevel ?? freezing?.current ?? null;
  const { low, high } = extremes(config);

  // Reading at the highest station, used for wind and the summary.
  const topStation = stations?.[0] ?? null;

  return (
    <>
          <header className="flex flex-wrap items-end justify-between gap-3 pb-2">
            <div>
              <h1 className="flex items-center gap-3 text-4xl sm:gap-4 sm:text-5xl md:text-6xl font-bold">
                <MountainIcon
                  id={config.id}
                  color={config.color}
                  className="h-8 w-[43px] sm:h-10 sm:w-[54px]"
                />
                <span className="min-w-0">{config.fullName}</span>
              </h1>
              <p className="mt-2 text-sm tabular-nums text-muted">
                {fmt(low)}–{fmt(high)} m lifts · {fmt(vertical(config))} m
                vertical · {config.lat.toFixed(3)}°N{" "}
                {Math.abs(config.lon).toFixed(3)}°W
              </p>
              <Intro
                config={config}
                sky={weather}
                freezingLevel={freezingLevel}
                snow={snow}
                stationSnow={snowFromStation(snowStation)}
              />
              <div className="mt-4">
                <PinButton id={config.id} name={config.fullName} color={config.color} size="large" />
              </div>
            </div>
            {freezing && (
              <p className="text-xs text-faint">
                Model data · updated {freezing.updated}
              </p>
            )}
          </header>

          {/* Summary and snow depth share a row on desktop. Outside the snow
              season there is no depth card, so the summary takes the full width. */}
          <div
            className={`grid grid-cols-1 gap-4 ${
              inSeason ? "lg:grid-cols-5" : ""
            }`}
          >
            <div className="lg:col-span-3">
              {freezing && weather && topStation ? (
                <Summary
                  compact
                  title={`${config.name} summary`}
                  freezing={freezing}
                  precip={[
                    { name: config.name, precipitation: weather.precipitation },
                  ]}
                  gusts={[{ name: config.name, gust: topStation.gust }]}
                  cloud={topStation.cloud}
                />
              ) : (
                <Unavailable title={`${config.name} summary`} />
              )}
            </div>
            {inSeason && (
              <div className="lg:col-span-2">
                <SnowDepthCard
                  name={config.name}
                  report={snow}
                  station={snowStation}
                  url={REPORT_PAGES[config.id]}
                  timeZone={config.timeZone}
                />
              </div>
            )}
          </div>

          {webcams && (
            <>
              <SectionLabel>Webcams</SectionLabel>
              <WebcamGallery name={config.name} webcams={webcams} />
            </>
          )}

          <SectionLabel>Rain and snow line, and lifts</SectionLabel>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <SharedTransition name={`resort-${config.id}`}>
              <ElevationVisualizer config={config} weather={weather} snow={hillSnow(snow, snowStation)} />
            </SharedTransition>
            <div className="lg:col-span-2">
              {stations && freezingLevel != null ? (
                <LiftTable
                  lifts={lifts}
                  stations={stations}
                  freezingLevel={freezingLevel}
                  color={config.color}
                />
              ) : (
                <Unavailable title="Lifts" />
              )}
            </div>
          </div>

          <SectionLabel>Forecast</SectionLabel>
          {daily && daily.days.length > 0 ? (
            <DailyForecast
              days={daily.days}
              top={{ label: "Top", elevation: config.lifts.top.elevation }}
              bottom={{ label: "Base", elevation: config.lifts.bottom.elevation }}
              color={config.color}
            />
          ) : (
            <Unavailable title="Forecast" />
          )}

          <SectionLabel>Freezing level</SectionLabel>
          {freezing ? (
            <SharedTransition name="freezing">
              <FreezingChart
                series={freezing}
                note={`Daily low–high range at ${config.fullName} · Open-Meteo model`}
              />
            </SharedTransition>
          ) : (
            <Unavailable title="Freezing level" />
          )}

          <SectionLabel>Temperature and wind</SectionLabel>
          {stations && topStation ? (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <LiftTemperatureChart
                lifts={lifts}
                stations={stations}
                color={config.color}
                mountain={config.id}
              />
              <WindCard station={topStation} color={config.color} />
            </div>
          ) : (
            <Unavailable title="Temperature and wind" />
          )}

          <footer className="pb-4 pt-2 text-xs text-faint">
            Model estimates, not station observations. Snow line is estimated at
            150 m below the freezing level. Weather data by{" "}
            <a
              href="https://open-meteo.com"
              className="underline hover:text-ink"
            >
              Open-Meteo.com
            </a>
            .
          </footer>
    </>
  );
}