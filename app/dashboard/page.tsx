import type { Metadata } from "next";
import CardActions from "@/components/CardActions";
import DashboardControls, { type PickerGroup } from "@/components/DashboardControls";
import Link from "next/link";
import HillCard from "@/components/HillCard";
import SiteNav from "@/components/SiteNav";
import { PageTransition } from "@/components/Transitions";
import ZoneCard from "@/components/ZoneCard";
import { MOUNTAINS } from "@/config/mountains";
import { REGIONS } from "@/config/regions";
import { ZONES } from "@/config/zones";
import { DASHBOARD_CSS, INLINE_SCRIPT } from "@/lib/Dashboard";
import { getPlacesNow } from "@/lib/Places";

// Personal, and the same cards as /hills, so kept out of search results.
export const metadata: Metadata = {
  title: "My hills",
  description: "Your own dashboard of ski hills and backcountry zones.",
  alternates: { canonical: "/dashboard" },
  robots: { index: false, follow: true },
};

const GROUPS: PickerGroup[] = REGIONS.map((r) => ({
  region: r.name,
  places: [
    ...MOUNTAINS.filter((m) => m.region === r.id).map((m) => ({
      id: m.id,
      name: m.fullName,
      color: m.color,
      kind: "Resort" as const,
    })),
    ...ZONES.filter((z) => z.region === r.id).map((z) => ({
      id: z.id,
      name: z.fullName,
      color: z.color,
      kind: "Backcountry" as const,
    })),
  ],
})).filter((g) => g.places.length > 0);

// Every card is rendered into this static page and the visitor's picks decide
// which show (lib/Dashboard.ts), so a visit costs no server work or API calls.
export default async function DashboardPage() {
  const { now, avalanche } = await getPlacesNow();

  return (
    <>
      <SiteNav />
      <PageTransition>
        <main className="min-h-screen px-4 py-8 text-white md:px-10">
          {/* data-dash is set by the inline script before React hydrates. */}
          <div id="dashboard" className="mx-auto max-w-8xl space-y-5" suppressHydrationWarning>
            <script dangerouslySetInnerHTML={{ __html: INLINE_SCRIPT }} />
            <style>{DASHBOARD_CSS}</style>

            <header className="pb-2">
              <h1 className="text-6xl font-bold">My hills</h1>
              <p className="mt-2 max-w-3xl text-[#c9d3dd]">
                The hills and backcountry zones you care about, on one page. Updated
                hourly.
              </p>
            </header>

            <DashboardControls groups={GROUPS} />

            <p className="dash-empty border border-dashed border-[#2f3840] p-6 text-[#c9d3dd]">
              Nothing picked yet. Tick hills and backcountry zones above, or use{" "}
              <span className="whitespace-nowrap text-white">+ Add to My hills</span> on{" "}
              <Link href="/hills" className="underline hover:text-white">
                All hills
              </Link>{" "}
              or any hill&apos;s page. They&apos;ll be here whenever you come back.
            </p>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {MOUNTAINS.map((m) => (
                <div key={m.id} data-place={m.id} className="flex flex-col">
                  <div className="flex-1">
                    <HillCard config={m} now={now?.[m.id] ?? null} />
                  </div>
                  <CardActions id={m.id} name={m.fullName} />
                </div>
              ))}
              {ZONES.map((z) => (
                <div key={z.id} data-place={z.id} className="flex flex-col">
                  <div className="flex-1">
                    <ZoneCard zone={z} now={now?.[z.id] ?? null} forecast={avalanche[z.id] ?? null} />
                  </div>
                  <CardActions id={z.id} name={z.fullName} />
                </div>
              ))}
            </div>

            <footer className="pb-4 pt-2 text-xs text-[#7d8da1]">
              Avalanche danger from{" "}
              <a href="https://avalanche.ca" className="underline hover:text-white">
                Avalanche Canada
              </a>
              . Weather is model estimates, not station observations. Weather data by{" "}
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
