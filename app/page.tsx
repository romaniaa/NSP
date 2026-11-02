import ElevationVisualizer from "@/components/ElevationVisualizer";
import FreezingChart from "@/components/FreezingChart";
import StationTable from "@/components/StationTable";
import Summary from "@/components/Summary";
import TemperatureChart from "@/components/TemperatureChart";
import WindChart from "@/components/WindChart";
import { SectionLabel, Unavailable } from "@/components/Ui";
import { MOUNTAINS } from "@/config/mountains";
import { tallestId } from "@/lib/Conditions";
import { getFreezingSeries, getPointReadings } from "@/lib/Forecast";
import { fetchMountainWeather } from "@/lib/Weather";

const trendWord = (delta: number | null, up: string, down: string, flat: string) =>
  delta == null ? flat : Math.abs(delta) < 100 ? flat : delta > 0 ? up : down;

const trendDetail = (delta: number | null, when: string) => {
  if (delta == null) return "";
  const m = Math.round(Math.abs(delta) / 10) * 10;
  if (m < 100) return `Little change over ${when}.`;
  return `${delta > 0 ? "Up" : "Down"} ${m} m over ${when}.`;
};

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
        reading: readings.find((r) => r.id === `${m.id}-top`),
      })).filter((x) => x.reading)
    : [];

  return (
    <main className="min-h-screen bg-[#0b0e11] px-4 py-8 text-white md:px-10">
      <div className="mx-auto max-w-6xl space-y-5">
        <header className="flex flex-wrap items-end justify-between gap-3 pb-2">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              North Shore Peaks
            </h1>
            <p className="mt-1 text-sm text-[#9aa7b5]">
              Rain or snow on Cypress, Grouse and Seymour.
            </p>
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
            <ElevationVisualizer
              key={config.id}
              config={config}
              weather={weather}
              isTallest={config.id === tallest}
            />
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
          <StationTable readings={readings} freezingLevel={freezing.current} />
        ) : (
          <Unavailable title="Conditions by elevation" />
        )}

        <footer className="pb-4 pt-2 text-xs text-[#7d8da1]">
          Model estimates, not station observations. Snow line is estimated at
          150 m below the freezing level. Weather data by{" "}
          <a href="https://open-meteo.com" className="underline hover:text-white">
            Open-Meteo.com
          </a>
          .
        </footer>
      </div>
    </main>
  );
}