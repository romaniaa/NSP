import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import ElevationVisualizer from "@/components/ElevationVisualizer";
import FreezingChart from "@/components/FreezingChart";
import LiftTable from "@/components/LiftTable";
import LiftTemperatureChart from "@/components/LiftTemperatureChart";
import MountainIcon from "@/components/MountainIcon";
import SnowDepthCard from "@/components/SnowDepthCard";
import SiteNav from "@/components/SiteNav";
import Summary from "@/components/Summary";
import WebcamGallery from "@/components/WebcamGallery";
import WindCard from "@/components/WindCard";
import { SectionLabel, Unavailable } from "@/components/Ui";
import { LIFTS } from "@/config/lifts";
import { MOUNTAINS, type MountainConfig } from "@/config/mountains";
import { WEBCAMS } from "@/config/webcams";
import { extremes, fmt, verdict, vertical } from "@/lib/Conditions";
import { getFreezingSeries, getMountainReadings } from "@/lib/Forecast";
import {
  HOME_TITLE,
  OPEN_GRAPH,
  SITE_NAME,
  SITE_URL,
  jsonLd,
  mountainDescription,
  mountainTitle,
} from "@/lib/Site";
import { getSnowReport, type SnowReport } from "@/lib/SnowReport";
import { trendDetail, trendWord } from "@/lib/Trend";
import { fetchMountainWeather } from "@/lib/Weather";

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
          addressRegion: "BC",
          addressCountry: "CA",
        },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${url}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: HOME_TITLE, item: `${SITE_URL}/` },
          { "@type": "ListItem", position: 2, name: m.fullName, item: url },
        ],
      },
    ],
  };
}

// The hill is looked up before the page content renders. An unknown URL shows
// the not-found page with a noindex tag, so search engines skip it, although the
// status can still be 200 because the page shell has already started streaming.
// generateStaticParams makes the param known at build time, which lets this
// await sit outside <Suspense> under cacheComponents.
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
      <main className="min-h-screen px-4 py-8 text-white md:px-10">
        <div className="mx-auto max-w-8xl space-y-5">
          <Suspense fallback={<Loading />}>
            <MountainContent config={config} />
          </Suspense>
        </div>
      </main>
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
}: {
  config: MountainConfig;
  sky: { precipitation: number; cloud: number | null; code: number | null } | null;
  freezingLevel: number | null;
  snow: SnowReport | null;
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
      : null;

  return (
    <p className="mt-3 max-w-3xl text-[#c9d3dd]">
      {[now, depth].filter(Boolean).join(" ")}{" "}
      Below: live webcams and rain or snow at each lift on this{" "}
      {config.locality} ski area, updated every 15 minutes.
    </p>
  );
}

function Loading() {
  return (
    <div className="space-y-5" aria-busy="true" aria-label="Loading">
      <div className="h-14 w-64 animate-pulse bg-[#13181d]" />
      <div className="h-36 animate-pulse bg-[#13181d]" />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="h-[34rem] animate-pulse bg-[#13181d]" />
        <div className="h-[34rem] animate-pulse bg-[#13181d] lg:col-span-2" />
      </div>
    </div>
  );
}

async function MountainContent({ config }: { config: MountainConfig }) {
  const lifts = LIFTS[config.id];

  const [weatherRes, stationsRes, freezingRes, snowRes] =
    await Promise.allSettled([
      fetchMountainWeather(config),
      getMountainReadings(config.id),
      getFreezingSeries(),
      getSnowReport(config.id),
    ]);
  for (const r of [weatherRes, stationsRes, freezingRes, snowRes]) {
    if (r.status === "rejected") console.error("Fetch failure:", r.reason);
  }

  const weather = weatherRes.status === "fulfilled" ? weatherRes.value : null;
  const stations = stationsRes.status === "fulfilled" ? stationsRes.value : null;
  const freezing = freezingRes.status === "fulfilled" ? freezingRes.value : null;
  // null when fulfilled means it's outside the snow season, so the section is hidden.
  const snowFailed = snowRes.status === "rejected";
  const snow = snowRes.status === "fulfilled" ? snowRes.value : null;

  const freezingLevel = weather?.freezingLevel ?? freezing?.current ?? null;
  const { low, high } = extremes(config);

  // Reading at the highest station, used for wind and the summary.
  const topStation = stations?.[0] ?? null;

  return (
    <>
          <header className="flex flex-wrap items-end justify-between gap-3 pb-2">
            <div>
              <h1 className="flex items-center gap-4 text-6xl font-bold">
                <MountainIcon
                  id={config.id}
                  color={config.color}
                  className="h-10 w-[54px]"
                />
                {config.fullName}
              </h1>
              <p className="mt-2 text-sm tabular-nums text-[#9aa7b5]">
                {fmt(low)}–{fmt(high)} m lifts · {fmt(vertical(config))} m
                vertical · {config.lat.toFixed(3)}°N{" "}
                {Math.abs(config.lon).toFixed(3)}°W
              </p>
              <Intro
                config={config}
                sky={weather}
                freezingLevel={freezingLevel}
                snow={snow}
              />
            </div>
            {freezing && (
              <p className="text-xs text-[#7d8da1]">
                Model data · updated {freezing.updated}
              </p>
            )}
          </header>

          {/* Summary and snow depth share a row on desktop. Outside the snow
              season there is no depth card, so the summary takes the full width. */}
          <div
            className={`grid grid-cols-1 gap-4 ${
              snow || snowFailed ? "lg:grid-cols-5" : ""
            }`}
          >
            <div className="lg:col-span-3">
              {freezing && weather && topStation ? (
                <Summary
                  compact
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
            {(snow || snowFailed) && (
              <div className="lg:col-span-2">
                {snow ? (
                  <SnowDepthCard name={config.name} report={snow} />
                ) : (
                  <Unavailable title="Snow depth" />
                )}
              </div>
            )}
          </div>

          <SectionLabel>Webcams</SectionLabel>
          <WebcamGallery name={config.name} webcams={WEBCAMS[config.id]} />

          <SectionLabel>Rain and snow line, and lifts</SectionLabel>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <ElevationVisualizer config={config} weather={weather} />
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

          <SectionLabel>Freezing level</SectionLabel>
          {freezing ? (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <FreezingChart
                title="Freezing level forecast"
                badge="6-day forecast"
                current={freezing.current}
                trend={trendWord(
                  freezing.deltaNext24,
                  "Expected to rise",
                  "Expected to fall",
                  "Holding steady"
                )}
                detail={trendDetail(freezing.deltaNext24, "the next 24 hours")}
                days={freezing.forecast}
                updated={freezing.updated}
                note="Daily low–high range · Open-Meteo model · North Shore area"
              />
              <FreezingChart
                title="Freezing level history"
                badge="10-day history"
                current={freezing.current}
                trend={trendWord(
                  freezing.deltaPast25,
                  "Rising",
                  "Falling",
                  "Steady"
                )}
                detail={trendDetail(freezing.deltaPast25, "the past 25 hours")}
                days={freezing.history}
                updated={freezing.updated}
                note="Daily low–high range · Open-Meteo model · North Shore area"
              />
            </div>
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

          <footer className="pb-4 pt-2 text-xs text-[#7d8da1]">
            Model estimates, not station observations. Snow line is estimated at
            150 m below the freezing level. Weather data by{" "}
            <a
              href="https://open-meteo.com"
              className="underline hover:text-white"
            >
              Open-Meteo.com
            </a>
            .
          </footer>
    </>
  );
}