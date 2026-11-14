import type { Metadata } from "next";
import HillCard from "@/components/HillCard";
import ZoneCard from "@/components/ZoneCard";
import SiteNav from "@/components/SiteNav";
import { PageTransition } from "@/components/Transitions";
import { SectionLabel } from "@/components/Ui";
import { MOUNTAINS } from "@/config/mountains";
import { REGIONS } from "@/config/regions";
import { ZONES, type ZoneId } from "@/config/zones";
import { getAvalancheForecast, type AvalancheForecast } from "@/lib/Avalanche";
import type { PlaceId } from "@/lib/Model";
import { OPEN_GRAPH, SITE_NAME } from "@/lib/Site";
import { getCurrentConditions, type HillNow } from "@/lib/Weather";

const TITLE = "Ski & Backcountry Conditions Near Vancouver";
const DESCRIPTION =
  "Rain or snow, freezing level, temperature and wind right now at the North Shore hills, Whistler Blackcomb, Sasquatch, Manning Park and Mt. Baker, plus avalanche danger for nearby backcountry. Updated hourly.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/hills" },
  openGraph: {
    ...OPEN_GRAPH,
    title: `${TITLE} | ${SITE_NAME}`,
    description: DESCRIPTION,
    url: "/hills",
  },
};

export default async function HillsPage() {
  const [nowRes, avyRes] = await Promise.allSettled([
    getCurrentConditions(),
    Promise.all(ZONES.map(async (z) => [z.id, await getAvalancheForecast(z.id)] as const)),
  ]);
  for (const r of [nowRes, avyRes]) {
    if (r.status === "rejected") console.error("Fetch failure:", r.reason);
  }
  const now: Record<PlaceId, HillNow> | null = nowRes.status === "fulfilled" ? nowRes.value : null;
  const avalanche: Partial<Record<ZoneId, AvalancheForecast>> =
    avyRes.status === "fulfilled" ? Object.fromEntries(avyRes.value) : {};

  return (
    <>
      <SiteNav />
      <PageTransition>
        <main className="min-h-screen px-4 py-8 text-white md:px-10">
          <div className="mx-auto max-w-8xl space-y-5">
            <header className="pb-2">
              <h1 className="text-6xl font-bold">All hills and backcountry</h1>
              <p className="mt-2 max-w-3xl text-[#c9d3dd]">
                Current conditions at every ski area and backcountry zone we cover,
                grouped by region. Open one for its freezing-level forecast, and lifts
                or avalanche danger.
              </p>
            </header>

            {REGIONS.map((region) => {
              const hills = MOUNTAINS.filter((m) => m.region === region.id);
              const zones = ZONES.filter((z) => z.region === region.id);
              if (hills.length + zones.length === 0) return null;
              return (
                <section key={region.id} className="space-y-4">
                  <SectionLabel>{region.name}</SectionLabel>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {hills.map((m) => (
                      <HillCard key={m.id} config={m} now={now?.[m.id] ?? null} />
                    ))}
                    {zones.map((z) => (
                      <ZoneCard
                        key={z.id}
                        zone={z}
                        now={now?.[z.id] ?? null}
                        forecast={avalanche[z.id] ?? null}
                      />
                    ))}
                  </div>
                </section>
              );
            })}

            <footer className="pb-4 pt-2 text-xs text-[#7d8da1]">
              Avalanche danger from{" "}
              <a href="https://avalanche.ca" className="underline hover:text-white">
                Avalanche Canada
              </a>
              ; open a zone for the link to its full forecast. Weather is model
              estimates, not station observations. Snow line is estimated at
              150 m below the freezing level. Weather data by{" "}
              <a href="https://open-meteo.com" className="underline hover:text-white">
                Open-Meteo.com
              </a>
              .
            </footer>
          </div>
        </main>
      </PageTransition>
    </>
  );
}
