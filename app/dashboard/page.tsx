import type { Metadata } from "next";
import type { CSSProperties, ReactNode } from "react";
import CardActions from "@/components/CardActions";
import DashboardControls, { type PickerGroup } from "@/components/DashboardControls";
import Link from "next/link";
import ElevationVisualizer from "@/components/ElevationVisualizer";
import SiteNav from "@/components/SiteNav";
import {
  NAV_FADE,
  NAV_FORWARD,
  PageTransition,
  SharedTransition,
} from "@/components/Transitions";
import ZoneDiagram from "@/components/ZoneDiagram";
import { MOUNTAINS } from "@/config/mountains";
import { REGIONS } from "@/config/regions";
import { ZONES } from "@/config/zones";
import { DASHBOARD_CSS, INLINE_SCRIPT } from "@/lib/Dashboard";
import { getPlacesNow } from "@/lib/Places";
import { weatherFrom } from "@/lib/Weather";

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

// The whole card is a link to the place's page, with the overview's hover.
function CardLink({ href, color, children }: { href: string; color: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      transitionTypes={NAV_FORWARD}
      className="group block flex-1 transition hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0_0_var(--accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
      style={{ "--accent": color } as CSSProperties}
    >
      {children}
    </Link>
  );
}

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
              <Link href="/hills" transitionTypes={NAV_FADE} className="underline hover:text-white">
                All hills
              </Link>{" "}
              or any hill&apos;s page. They&apos;ll be here whenever you come back.
            </p>

            {/* The same rain-and-snow-line cards as the overview, each linking to
                its page. Zones get the generic-ridge version with avalanche danger. */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {MOUNTAINS.map((m) => {
                const h = now?.[m.id];
                return (
                  <div key={m.id} data-place={m.id} className="flex flex-col">
                    <CardLink href={`/${m.id}`} color={m.color}>
                      <SharedTransition name={`resort-${m.id}`}>
                        <ElevationVisualizer config={m} weather={h ? weatherFrom(h, m) : null} />
                      </SharedTransition>
                    </CardLink>
                    <CardActions id={m.id} name={m.fullName} />
                  </div>
                );
              })}
              {ZONES.map((z) => (
                <div key={z.id} data-place={z.id} className="flex flex-col">
                  <CardLink href={`/backcountry/${z.id}`} color={z.color}>
                    <ZoneDiagram
                      zone={z}
                      now={now?.[z.id] ?? null}
                      forecast={avalanche[z.id] ?? null}
                    />
                  </CardLink>
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
