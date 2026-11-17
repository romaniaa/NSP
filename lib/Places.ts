import { cacheLife } from "next/cache";
import { MOUNTAINS } from "@/config/mountains";
import { ZONES, type ZoneId } from "@/config/zones";
import {
  getAvalancheForecast,
  highestDanger,
  type AvalancheForecast,
  type DangerLevel,
} from "@/lib/Avalanche";
import { verdict } from "@/lib/Conditions";
import { DANGER_STYLE } from "@/lib/DangerStyle";
import type { PlaceId } from "@/lib/Model";
import { getSnowNow, type SnowNow } from "@/lib/SnowNow";
import { getCurrentConditions, type HillNow } from "@/lib/Weather";

export interface PlacesNow {
  now: Record<PlaceId, HillNow> | null; // null if the weather couldn't be loaded
  avalanche: Partial<Record<ZoneId, AvalancheForecast>>; // empty if it couldn't be loaded
  snow: Partial<Record<PlaceId, SnowNow>>; // places with a snow depth; empty if none loaded
}

// Current weather for every hill and zone, every zone's avalanche forecast and
// snow depths, for the pages that list them all (/hills and /dashboard). All come
// from the shared caches, so this costs no extra API calls.
export async function getPlacesNow(): Promise<PlacesNow> {
  const [nowRes, avyRes, snowRes] = await Promise.allSettled([
    getCurrentConditions(),
    Promise.all(ZONES.map(async (z) => [z.id, await getAvalancheForecast(z.id)] as const)),
    getSnowNow(),
  ]);
  for (const r of [nowRes, avyRes, snowRes]) {
    if (r.status === "rejected") console.error("Fetch failure:", r.reason);
  }
  return {
    now: nowRes.status === "fulfilled" ? nowRes.value : null,
    avalanche: avyRes.status === "fulfilled" ? Object.fromEntries(avyRes.value) : {},
    snow: snowRes.status === "fulfilled" ? snowRes.value : {},
  };
}

export interface PlaceStatus {
  freezingLevel: number | null; // m
  status: string; // hills: the rain-or-snow verdict; zones: the avalanche status
  danger: DangerLevel | null; // zones: today's highest rated danger
}

export interface NavStatus {
  asOf: string | null; // the model hour shown, e.g. "10 a.m.", Vancouver time
  places: Record<string, PlaceStatus>;
}

// One line of current status per hill and zone, for the nav drawer. Small and
// serializable, since every page sends it to the browser with the nav.
export async function getNavStatus(): Promise<NavStatus> {
  "use cache";
  cacheLife({ stale: 300, revalidate: 900, expire: 3600 });

  const { now, avalanche } = await getPlacesNow();
  const places: Record<string, PlaceStatus> = {};

  for (const m of MOUNTAINS) {
    const h = now?.[m.id];
    places[m.id] = h
      ? {
          freezingLevel: h.freezingLevel,
          status: verdict(m, h.freezingLevel, h),
          danger: null,
        }
      : { freezingLevel: null, status: "Weather unavailable", danger: null };
  }
  for (const z of ZONES) {
    const f = avalanche[z.id];
    const today = f?.status === "ok" ? f.days[0] : undefined;
    const danger = today && f?.status === "ok" && f.note == null ? highestDanger(today) : null;
    places[z.id] = {
      freezingLevel: now?.[z.id]?.freezingLevel ?? null,
      status: !f
        ? "Avalanche forecast unavailable"
        : f.status === "none"
          ? "No current avalanche forecast"
          : danger
            ? `Avalanche danger up to ${DANGER_STYLE[danger].label.replace(/^\d · /, "").toLowerCase()}`
            : `Avalanche: ${(f.note ?? "no rating").toLowerCase()}`,
      danger,
    };
  }

  const first = now ? Object.values(now)[0] : undefined;
  return {
    asOf: first
      ? new Date(first.time).toLocaleTimeString("en-CA", {
          timeZone: "America/Vancouver",
          hour: "numeric",
          minute: "2-digit",
        })
      : null,
    places,
  };
}
