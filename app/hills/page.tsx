import type { Metadata } from "next";
import HillCard from "@/components/HillCard";
import SiteNav from "@/components/SiteNav";
import { PageTransition } from "@/components/Transitions";
import { SectionLabel } from "@/components/Ui";
import { MOUNTAINS, type MountainId } from "@/config/mountains";
import { REGIONS } from "@/config/regions";
import { OPEN_GRAPH, SITE_NAME } from "@/lib/Site";
import { getCurrentConditions, type HillNow } from "@/lib/Weather";

const TITLE = "Ski Conditions Near Vancouver: Every Hill";
const DESCRIPTION =
  "Rain or snow, freezing level, temperature and wind right now at the North Shore hills, Whistler Blackcomb, Sasquatch, Manning Park and Mt. Baker. Updated hourly.";

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
  let now: Record<MountainId, HillNow> | null = null;
  try {
    now = await getCurrentConditions();
  } catch (err) {
    console.error("Fetch failure:", err);
  }

  return (
    <>
      <SiteNav />
      <PageTransition>
        <main className="min-h-screen px-4 py-8 text-white md:px-10">
          <div className="mx-auto max-w-8xl space-y-5">
            <header className="pb-2">
              <h1 className="text-6xl font-bold">Every hill</h1>
              <p className="mt-2 max-w-3xl text-[#c9d3dd]">
                Current conditions at every ski area we cover, grouped by region.
                Open a hill for its lifts, freezing-level forecast and snow report.
              </p>
            </header>

            {REGIONS.map((region) => {
              const hills = MOUNTAINS.filter((m) => m.region === region.id);
              if (hills.length === 0) return null;
              return (
                <section key={region.id} className="space-y-4">
                  <SectionLabel>{region.name}</SectionLabel>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {hills.map((m) => (
                      <HillCard key={m.id} config={m} now={now?.[m.id] ?? null} />
                    ))}
                  </div>
                </section>
              );
            })}

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
      </PageTransition>
    </>
  );
}
