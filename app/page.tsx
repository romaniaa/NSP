import type { Metadata } from "next";
import DashboardControls, { type PickerGroup } from "@/components/DashboardControls";
import Link from "next/link";
import MyHillsCards, { type CardData } from "@/components/MyHillsCards";
import SiteNav from "@/components/SiteNav";
import { NAV_FADE, PageTransition } from "@/components/Transitions";
import { PillLink } from "@/components/Ui";
import { MOUNTAINS } from "@/config/mountains";
import { REGIONS } from "@/config/regions";
import { ZONES, type ZoneId } from "@/config/zones";
import { DASHBOARD_CSS, INLINE_SCRIPT, PLACE_IDS } from "@/lib/Dashboard";
import type { PlaceId } from "@/lib/Model";
import { getPlacesNow } from "@/lib/Places";
import {
  HOME_DESCRIPTION,
  HOME_TITLE,
  OPEN_GRAPH,
  SITE_NAME,
  SITE_URL,
  jsonLd,
} from "@/lib/Site";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
  openGraph: {
    ...OPEN_GRAPH,
    title: `${HOME_TITLE} | ${SITE_NAME}`,
    description: HOME_DESCRIPTION,
    url: "/",
  },
};

const STRUCTURED_DATA = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE_URL}/#website`,
  url: `${SITE_URL}/`,
  name: SITE_NAME,
  description: HOME_DESCRIPTION,
  inLanguage: "en-CA",
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

// The home page is the visitor's own dashboard, My hills: the North Shore hills
// until they pick their own. It's static and served from the CDN, so a visit
// costs no server work or API calls. The HTML holds only the default cards; the
// page carries compact data for every place and draws the visitor's picks in
// the browser (components/MyHillsCards.tsx).
export default async function Home() {
  const { now, avalanche, snow } = await getPlacesNow();

  // Everything a card needs, for every place. Zones' forecasts are cut to today,
  // the only day a card shows.
  const cards: Record<string, CardData> = {};
  for (const id of PLACE_IDS) {
    const zone = ZONES.some((z) => z.id === id);
    const f = zone ? (avalanche[id as ZoneId] ?? null) : undefined;
    cards[id] = {
      now: now?.[id as PlaceId] ?? null,
      snow: snow[id as PlaceId],
      ...(zone && {
        avalanche: f?.status === "ok" ? { ...f, days: f.days.slice(0, 1), problems: [] } : f,
      }),
    };
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(STRUCTURED_DATA) }}
      />
      <SiteNav />
      <PageTransition>
        <main className="min-h-screen px-4 py-8 text-ink md:px-10">
          {/* data-dash is set by the inline script before React hydrates. */}
          <div id="dashboard" className="mx-auto max-w-8xl space-y-5" suppressHydrationWarning>
            <script dangerouslySetInnerHTML={{ __html: INLINE_SCRIPT }} />
            <style>{DASHBOARD_CSS}</style>

            <header className="pb-2">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold">My hills</h1>
              <p className="mt-2 max-w-3xl text-ink-2">
                Ski conditions for the hills and backcountry you care about, on one page:
                temperature, snow depth, rain or snow and avalanche danger, updated hourly.
                It starts with the North Shore; pick your own from any region.
              </p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {REGIONS.map((r) => (
                  <li key={r.id}>
                    <PillLink href={`/${r.id}`}>{r.name}</PillLink>
                  </li>
                ))}
                <li>
                  <PillLink href="/backcountry">Backcountry</PillLink>
                </li>
              </ul>
            </header>

            <DashboardControls groups={GROUPS} />

            <p className="dash-empty border border-dashed border-line-2 p-6 text-ink-2">
              Nothing picked yet. Tick hills and backcountry zones above, or use{" "}
              <span className="whitespace-nowrap text-ink">+ Add to My hills</span> on{" "}
              <Link href="/hills" transitionTypes={NAV_FADE} className="underline hover:text-ink">
                All hills
              </Link>{" "}
              or any hill&apos;s page. They&apos;ll be here whenever you come back.
            </p>

            {/* The same rain-and-snow-line cards as the overview, each linking to
                its page; zones get the generic-ridge version with avalanche danger.
                Drawn in the browser from compact data, so the page doesn't carry
                every card (components/MyHillsCards.tsx). */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              <MyHillsCards data={cards} />
              {[0, 1, 2].map((i) => (
                <div key={i} className="dash-skel h-[640px] border border-line bg-surface" />
              ))}
            </div>

            <footer className="pb-4 pt-2 text-xs text-faint">
              Avalanche danger from{" "}
              <a href="https://avalanche.ca" className="underline hover:text-ink">
                Avalanche Canada
              </a>
              . Weather is model estimates, not station observations. Weather data by{" "}
              <a href="https://open-meteo.com" className="underline hover:text-ink">
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
