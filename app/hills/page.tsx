import type { Metadata } from "next";
import HillCard from "@/components/HillCard";
import PinButton from "@/components/PinButton";
import ZoneCard from "@/components/ZoneCard";
import SiteNav from "@/components/SiteNav";
import { PageTransition } from "@/components/Transitions";
import { SectionLabel } from "@/components/Ui";
import { MOUNTAINS } from "@/config/mountains";
import { REGIONS } from "@/config/regions";
import Link from "next/link";
import { ZONES } from "@/config/zones";
import { getPlacesNow } from "@/lib/Places";
import { OPEN_GRAPH, SITE_NAME } from "@/lib/Site";

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
  const { now, avalanche } = await getPlacesNow();

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
                or avalanche danger.{" "}
                <Link href="/dashboard" className="underline hover:text-white">
                  Pick your favourites for a dashboard
                </Link>
                .
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
                      <div key={m.id} className="flex flex-col gap-2">
                        <div className="flex-1">
                          <HillCard config={m} now={now?.[m.id] ?? null} />
                        </div>
                        <PinButton id={m.id} name={m.fullName} />
                      </div>
                    ))}
                    {zones.map((z) => (
                      <div key={z.id} className="flex flex-col gap-2">
                        <div className="flex-1">
                          <ZoneCard
                            zone={z}
                            now={now?.[z.id] ?? null}
                            forecast={avalanche[z.id] ?? null}
                          />
                        </div>
                        <PinButton id={z.id} name={z.fullName} />
                      </div>
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
