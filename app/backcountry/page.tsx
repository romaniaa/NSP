import type { Metadata } from "next";
import PinButton from "@/components/PinButton";
import SiteNav from "@/components/SiteNav";
import { PageTransition } from "@/components/Transitions";
import { SectionLabel } from "@/components/Ui";
import ZoneCard from "@/components/ZoneCard";
import { REGIONS } from "@/config/regions";
import { ZONES } from "@/config/zones";
import { getPlacesNow } from "@/lib/Places";
import { OPEN_GRAPH, SITE_NAME } from "@/lib/Site";

const TITLE = "Backcountry Conditions & Avalanche Danger in BC and the Rockies";
const DESCRIPTION =
  "Today's avalanche danger, temperature by elevation, ridgetop wind and snow depth for the North Shore, Whistler, Duffey Lake, Coquihalla, Rogers Pass, Kananaskis and Icefields Parkway backcountry. Updated hourly.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/backcountry" },
  openGraph: {
    ...OPEN_GRAPH,
    title: `${TITLE} | ${SITE_NAME}`,
    description: DESCRIPTION,
    url: "/backcountry",
  },
};

// Every backcountry zone by region, with today's avalanche danger and weather.
export default async function BackcountryPage() {
  const { now, avalanche, snow } = await getPlacesNow();

  return (
    <>
      <SiteNav />
      <PageTransition>
        <main className="min-h-screen px-4 py-8 text-white md:px-10">
          <div className="mx-auto max-w-8xl space-y-5">
            <header className="pb-2">
              <h1 className="text-6xl font-bold">Backcountry</h1>
              <p className="mt-2 max-w-3xl text-[#c9d3dd]">
                Avalanche danger, temperature at each elevation, ridgetop wind and snow
                depth for popular touring areas. A summary, not the forecast: read the
                full avalanche forecast before heading out, and travel in avalanche
                terrain only with training and rescue gear.
              </p>
            </header>

            {REGIONS.map((region) => {
              const zones = ZONES.filter((z) => z.region === region.id);
              if (zones.length === 0) return null;
              return (
                <section key={region.id} className="space-y-4">
                  <SectionLabel>{region.name}</SectionLabel>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {zones.map((z) => (
                      <div key={z.id} className="flex flex-col gap-2">
                        <div className="flex-1">
                          <ZoneCard
                            zone={z}
                            now={now?.[z.id] ?? null}
                            forecast={avalanche[z.id] ?? null}
                            snow={snow[z.id]}
                          />
                        </div>
                        <PinButton id={z.id} name={z.fullName} color={z.color} />
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
              . Snow depth from Avalanche Canada weather stations. Weather is model
              estimates. Weather data by{" "}
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
