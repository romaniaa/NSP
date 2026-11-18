"use client";

import Link from "next/link";
import { useEffect, type CSSProperties, type ReactNode } from "react";
import CardActions from "@/components/CardActions";
import ElevationVisualizer from "@/components/ElevationVisualizer";
import { NAV_FORWARD, SharedTransition } from "@/components/Transitions";
import { useDashboard } from "@/components/useDashboard";
import ZoneDiagram from "@/components/ZoneDiagram";
import { MOUNTAINS } from "@/config/mountains";
import { ZONES } from "@/config/zones";
import type { AvalancheForecast } from "@/lib/Danger";
import { weatherFrom, type HillNow } from "@/lib/PlaceWeather";
import type { SnowNow } from "@/lib/SnowNow";

// What one card needs, for every place. A few hundred bytes each, so the page
// can carry all of them and draw whichever the visitor picked.
export interface CardData {
  now: HillNow | null;
  avalanche?: AvalancheForecast | null; // zones only, trimmed to today
  snow?: SnowNow;
}

// The whole card links to the place's page, with the overview's hover.
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

function PlaceCard({ id, data }: { id: string; data: CardData | undefined }) {
  const m = MOUNTAINS.find((x) => x.id === id);
  if (m) {
    return (
      <div data-place={id} className="flex flex-col">
        <CardLink href={`/${m.id}`} color={m.color}>
          <SharedTransition name={`resort-${m.id}`}>
            <ElevationVisualizer
              config={m}
              weather={data?.now ? weatherFrom(data.now, m) : null}
              snow={data?.snow}
              more
            />
          </SharedTransition>
        </CardLink>
        <CardActions id={m.id} name={m.fullName} />
      </div>
    );
  }
  const z = ZONES.find((x) => x.id === id);
  if (!z) return null;
  return (
    <div data-place={id} className="flex flex-col">
      <CardLink href={`/backcountry/${z.id}`} color={z.color}>
        <ZoneDiagram
          zone={z}
          now={data?.now ?? null}
          forecast={data?.avalanche ?? null}
          snow={data?.snow}
          more
        />
      </CardLink>
      <CardActions id={z.id} name={z.fullName} />
    </div>
  );
}

// The cards on My hills, in the visitor's order. On the server (and in the first
// render in the browser) that's the default North Shore hills, so the page's HTML
// holds three cards rather than every place; after hydration it's the visitor's
// own pick. Until then the inline script hides defaults that aren't picked and
// shows placeholders for picks that aren't drawn yet (lib/Dashboard.ts).
export default function MyHillsCards({ data }: { data: Record<string, CardData> }) {
  const { hydrated, ids } = useDashboard();

  useEffect(() => {
    if (hydrated) document.getElementById("dashboard")?.removeAttribute("data-pending");
  }, [hydrated]);

  return (
    <>
      {ids.map((id) => (
        <PlaceCard key={id} id={id} data={data[id]} />
      ))}
    </>
  );
}
