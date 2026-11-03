import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import ElevationVisualizer from "@/components/ElevationVisualizer";
import FreezingChart from "@/components/FreezingChart";
import LiftTable from "@/components/LiftTable";
import LiftTemperatureChart from "@/components/LiftTemperatureChart";
import MountainIcon from "@/components/MountainIcon";
import SiteNav from "@/components/SiteNav";
import Summary from "@/components/Summary";
import WindCard from "@/components/WindCard";
import { SectionLabel, Unavailable } from "@/components/Ui";
import { LIFTS } from "@/config/lifts";
import { MOUNTAINS } from "@/config/mountains";
import { extremes, fmt, vertical } from "@/lib/Conditions";
import { getFreezingSeries, getMountainReadings } from "@/lib/Forecast";
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
  return { title: m ? `${m.name} · North Shore Peaks` : "North Shore Peaks" };
}

// The nav and page frame render instantly; everything that depends on the URL
// streams in inside <Suspense>, which cacheComponents requires.
export default function MountainPage({
  params,
}: {
  params: Promise<{ mountain: string }>;
}) {
  return (
    <>
      <SiteNav />
      <main className="min-h-screen px-4 py-8 text-white md:px-10">
        <div className="mx-auto max-w-8xl space-y-5">
          <Suspense fallback={<Loading />}>
            <MountainContent params={params} />
          </Suspense>
        </div>
      </main>
    </>
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

async function MountainContent({
  params,
}: {
  params: Promise<{ mountain: string }>;
}) {
  const { mountain: id } = await params;
  const config = MOUNTAINS.find((m) => m.id === id);
  if (!config) notFound();

  const lifts = LIFTS[config.id];

  const [weatherRes, stationsRes, freezingRes] = await Promise.allSettled([
    fetchMountainWeather(config),
    getMountainReadings(config.id),
    getFreezingSeries(),
  ]);
  for (const r of [weatherRes, stationsRes, freezingRes]) {
    if (r.status === "rejected") console.error("Fetch failure:", r.reason);
  }

  const weather = weatherRes.status === "fulfilled" ? weatherRes.value : null;
  const stations = stationsRes.status === "fulfilled" ? stationsRes.value : null;
  const freezing = freezingRes.status === "fulfilled" ? freezingRes.value : null;

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
                {config.name}
              </h1>
              <p className="mt-2 text-sm tabular-nums text-[#9aa7b5]">
                {fmt(low)}–{fmt(high)} m lifts · {fmt(vertical(config))} m
                vertical · {config.lat.toFixed(3)}°N{" "}
                {Math.abs(config.lon).toFixed(3)}°W
              </p>
            </div>
            {freezing && (
              <p className="text-xs text-[#7d8da1]">
                Model data · updated {freezing.updated}
              </p>
            )}
          </header>

          {freezing && weather && topStation ? (
            <Summary
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