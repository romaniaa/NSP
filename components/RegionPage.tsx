import type { Metadata } from "next";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import ElevationVisualizer from "@/components/ElevationVisualizer";
import MountainIcon from "@/components/MountainIcon";
import PinButton from "@/components/PinButton";
import RangeIcon from "@/components/RangeIcon";
import SiteNav from "@/components/SiteNav";
import TemperatureChart from "@/components/TemperatureChart";
import { NAV_FORWARD, PageTransition, SharedTransition } from "@/components/Transitions";
import { SectionLabel, Unavailable } from "@/components/Ui";
import WindChart from "@/components/WindChart";
import ZoneDiagram from "@/components/ZoneDiagram";
import { MOUNTAINS } from "@/config/mountains";
import { AREAS, regionById, type RegionId } from "@/config/regions";
import { ZONES } from "@/config/zones";
import { tallestId } from "@/lib/Conditions";
import { getPointReadings } from "@/lib/Forecast";
import { getPlacesNow } from "@/lib/Places";
import { HOME_TITLE, OPEN_GRAPH, SITE_NAME, SITE_URL, jsonLd } from "@/lib/Site";
import { weatherFrom } from "@/lib/Weather";

export function regionMetadata(id: RegionId): Metadata {
  const r = regionById(id);
  return {
    title: r.title,
    description: r.description,
    alternates: { canonical: `/${r.id}` },
    openGraph: {
      ...OPEN_GRAPH,
      title: `${r.title} | ${SITE_NAME}`,
      description: r.description,
      url: `/${r.id}`,
    },
  };
}

// The whole card links to the place's page, with the hover the site uses for cards.
function CardLink({ href, color, children }: { href: string; color: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      transitionTypes={NAV_FORWARD}
      className="group block flex-1 transition hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0_0_var(--accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/60"
      style={{ "--accent": color } as CSSProperties}
    >
      {children}
    </Link>
  );
}

// One region (/coast, /okanagan…): the rain-and-snow-line card for each hill and
// backcountry zone, sectioned by area, then temperature and wind at every lift.
// Everything comes from the shared hourly caches, so the page is static.
export default async function RegionPage({ id }: { id: RegionId }) {
  const region = regionById(id);
  const hills = MOUNTAINS.filter((m) => m.region === id);
  const zones = ZONES.filter((z) => z.region === id);
  const areas = AREAS.filter(
    (a) => hills.some((m) => m.area === a.id) || zones.some((z) => z.area === a.id)
  );

  const [placesRes, readingsRes] = await Promise.allSettled([
    getPlacesNow(),
    getPointReadings(id),
  ]);
  for (const r of [placesRes, readingsRes]) {
    if (r.status === "rejected") console.error("Fetch failure:", r.reason);
  }
  const { now, avalanche, snow } =
    placesRes.status === "fulfilled" ? placesRes.value : { now: null, avalanche: {}, snow: {} };
  const readings = readingsRes.status === "fulfilled" ? readingsRes.value : null;
  const tallest = tallestId(hills);

  const tops = readings
    ? hills.flatMap((m) => {
        const reading = readings.find((r) => r.id === `${m.id}-top`);
        return reading ? [{ m, reading }] : [];
      })
    : [];

  const url = `${SITE_URL}/${id}`;
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: HOME_TITLE, item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: `${region.name} ski conditions`, item: url },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumb) }}
      />
      <SiteNav />
      <PageTransition>
        <main className="min-h-screen px-4 py-8 text-ink md:px-10">
          <div className="mx-auto max-w-8xl space-y-5">
            <header className="pb-2">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold">{region.name} ski conditions</h1>
              <p className="mt-2 max-w-3xl text-ink-2">
                {region.intro} Rain or snow, temperature and snow depth for each, updated
                hourly.
              </p>
              <ul className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-ink-2">
                {hills.map((m) => (
                  <li key={m.id}>
                    <Link
                      href={`/${m.id}`}
                      transitionTypes={NAV_FORWARD}
                      className="flex items-center gap-1.5 hover:text-ink hover:underline"
                    >
                      <MountainIcon id={m.id} color={m.color} className="h-3 w-4" />
                      {m.fullName}
                    </Link>
                  </li>
                ))}
                {zones.map((z) => (
                  <li key={z.id}>
                    <Link
                      href={`/backcountry/${z.id}`}
                      transitionTypes={NAV_FORWARD}
                      className="flex items-center gap-1.5 hover:text-ink hover:underline"
                    >
                      <RangeIcon color={z.color} className="h-3 w-4" />
                      {z.fullName} backcountry
                    </Link>
                  </li>
                ))}
              </ul>
            </header>

            {areas.map((area) => {
              const areaHills = hills.filter((m) => m.area === area.id);
              const areaZones = zones.filter((z) => z.area === area.id);
              return (
                <section key={area.id} className="space-y-4">
                  <SectionLabel>
                    {areas.length > 1 ? area.name : "Rain and snow line"}
                  </SectionLabel>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {areaHills.map((m) => {
                      const h = now?.[m.id];
                      return (
                        <div key={m.id} className="flex flex-col gap-2">
                          <CardLink href={`/${m.id}`} color={m.color}>
                            <SharedTransition name={`resort-${m.id}`}>
                              <ElevationVisualizer
                                config={m}
                                weather={h ? weatherFrom(h, m) : null}
                                isTallest={hills.length > 1 && m.id === tallest}
                                snow={snow[m.id]}
                                more
                              />
                            </SharedTransition>
                          </CardLink>
                          <PinButton id={m.id} name={m.fullName} color={m.color} />
                        </div>
                      );
                    })}
                    {areaZones.map((z) => (
                      <div key={z.id} className="flex flex-col gap-2">
                        <CardLink href={`/backcountry/${z.id}`} color={z.color}>
                          <ZoneDiagram
                            zone={z}
                            now={now?.[z.id] ?? null}
                            forecast={avalanche[z.id] ?? null}
                            snow={snow[z.id]}
                            more
                          />
                        </CardLink>
                        <PinButton id={z.id} name={z.fullName} color={z.color} />
                      </div>
                    ))}
                  </div>
                </section>
              );
            })}

            <SectionLabel>Temperature and wind</SectionLabel>
            {readings && tops.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <TemperatureChart readings={readings} />
                <WindChart
                  rows={tops.map(({ m, reading }) => ({
                    label: m.name,
                    mountain: m.id,
                    color: m.color,
                    avg: reading.wind,
                    gust: reading.gust,
                  }))}
                />
              </div>
            ) : (
              <Unavailable title="Temperature and wind" />
            )}

            <footer className="pb-4 pt-2 text-xs text-faint">
              Model estimates, not station observations. Snow line is estimated at 150 m
              below the freezing level. Snow depth from each resort&apos;s report, and for
              the backcountry from Avalanche Canada weather stations. Avalanche danger from{" "}
              <a href="https://avalanche.ca" className="underline hover:text-ink">
                Avalanche Canada
              </a>
              . Weather data by{" "}
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
