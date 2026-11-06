import type { CSSProperties } from "react";
import Link from "next/link";
import ElevationVisualizer from "@/components/ElevationVisualizer";
import FreezingChart from "@/components/FreezingChart";
import MountainIcon from "@/components/MountainIcon";
import SiteNav from "@/components/SiteNav";
import StationTable from "@/components/StationTable";
import Summary from "@/components/Summary";
import TemperatureChart from "@/components/TemperatureChart";
import WindChart from "@/components/WindChart";
import { SectionLabel, Unavailable } from "@/components/Ui";
import { MOUNTAINS } from "@/config/mountains";
import { tallestId } from "@/lib/Conditions";
import { getFreezingSeries, getPointReadings } from "@/lib/Forecast";
import { trendDetail, trendWord } from "@/lib/Trend";
import { fetchMountainWeather } from "@/lib/Weather";

export default async function Home() {
  const [mountainResults, readingsResult, freezingResult] = await Promise.all([
    Promise.allSettled(MOUNTAINS.map((m) => fetchMountainWeather(m))),
    Promise.allSettled([getPointReadings()]).then((r) => r[0]),
    Promise.allSettled([getFreezingSeries()]).then((r) => r[0]),
  ]);

  for (const r of [...mountainResults, readingsResult, freezingResult]) {
    if (r.status === "rejected") console.error("Fetch failure:", r.reason);
  }

  const readings =
    readingsResult.status === "fulfilled" ? readingsResult.value : null;
  const freezing =
    freezingResult.status === "fulfilled" ? freezingResult.value : null;

  const rows = MOUNTAINS.map((config, i) => {
    const r = mountainResults[i];
    return { config, weather: r.status === "fulfilled" ? r.value : null };
  });
  const tallest = tallestId(MOUNTAINS);

  const tops = readings
    ? MOUNTAINS.map((m) => ({
        name: m.name,
        mountain: m.id,
        color: m.color,
        reading: readings.find((r) => r.id === `${m.id}-top`),
      })).filter((x) => x.reading)
    : [];

  const clouds = tops
    .map((t) => t.reading!.cloud)
    .filter((c): c is number => c != null);
  const cloud = clouds.length
    ? clouds.reduce((a, b) => a + b, 0) / clouds.length
    : null;

  return (
    <>
      <SiteNav />
      <main className="min-h-screen px-4 py-8 text-white md:px-10">
        <div className="mx-auto max-w-8xl space-y-5">
          <header className="flex flex-wrap items-end justify-between gap-3 pb-2">
            <div>
              <h1 className="text-6xl font-bold">Overview</h1>
              <p className="mt-1 text-[#c9d3dd]">
                Rain or snow on Cypress, Grouse and Seymour.
              </p>
              <ul className="mt-3 flex flex-wrap items-center gap-4 text-xs text-[#c9d3dd]">
                {MOUNTAINS.map((m) => (
                  <li key={m.id} className="flex items-center gap-1.5">
                    <MountainIcon id={m.id} color={m.color} className="h-3 w-4" />
                    {m.name}
                  </li>
                ))}
              </ul>
            </div>
            {freezing && (
              <p className="text-xs text-[#7d8da1]">
                Model data · updated {freezing.updated}
              </p>
            )}
          </header>

          {freezing && readings && tops.length > 0 ? (
            <Summary
              freezing={freezing}
              precip={rows
                .filter((r) => r.weather)
                .map((r) => ({
                  name: r.config.name,
                  precipitation: r.weather!.precipitation,
                }))}
              cloud={cloud}
              gusts={tops.map((t) => ({
                name: t.name,
                gust: t.reading!.gust,
              }))}
            />
          ) : (
            <Unavailable title="North Shore summary" />
          )}

          <SectionLabel>Rain and snow line</SectionLabel>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {rows.map(({ config, weather }) => (
              <Link
                key={config.id}
                href={`/${config.id}`}
                className="group block transition hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0_0_var(--accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                style={{ "--accent": config.color } as CSSProperties}
              >
                <ElevationVisualizer
                  config={config}
                  weather={weather}
                  isTallest={config.id === tallest}
                />
              </Link>
            ))}
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
                note="Daily low–high range · Open-Meteo model"
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
                note="Daily low–high range · Open-Meteo model"
              />
            </div>
          ) : (
            <Unavailable title="Freezing level" />
          )}

          <SectionLabel>Temperature and wind</SectionLabel>
          {readings ? (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <TemperatureChart readings={readings} />
              <WindChart
                rows={tops.map((t) => ({
                  label: t.name,
                  mountain: t.mountain,
                  color: t.color,
                  avg: t.reading!.wind,
                  gust: t.reading!.gust,
                }))}
              />
            </div>
          ) : (
            <Unavailable title="Temperature and wind" />
          )}

          <SectionLabel>Conditions by elevation</SectionLabel>
          {readings && freezing ? (
            <StationTable
              readings={readings}
              freezingLevel={freezing.current}
            />
          ) : (
            <Unavailable title="Conditions by elevation" />
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
        </div>
      </main>
    </>
  );
}