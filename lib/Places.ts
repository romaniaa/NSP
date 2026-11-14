import { ZONES, type ZoneId } from "@/config/zones";
import { getAvalancheForecast, type AvalancheForecast } from "@/lib/Avalanche";
import type { PlaceId } from "@/lib/Model";
import { getCurrentConditions, type HillNow } from "@/lib/Weather";

export interface PlacesNow {
  now: Record<PlaceId, HillNow> | null; // null if the weather couldn't be loaded
  avalanche: Partial<Record<ZoneId, AvalancheForecast>>; // empty if it couldn't be loaded
}

// Current weather for every hill and zone, and every zone's avalanche forecast,
// for the pages that list them all (/hills and /dashboard). Both come from the
// shared hourly caches, so this costs no extra API calls.
export async function getPlacesNow(): Promise<PlacesNow> {
  const [nowRes, avyRes] = await Promise.allSettled([
    getCurrentConditions(),
    Promise.all(ZONES.map(async (z) => [z.id, await getAvalancheForecast(z.id)] as const)),
  ]);
  for (const r of [nowRes, avyRes]) {
    if (r.status === "rejected") console.error("Fetch failure:", r.reason);
  }
  return {
    now: nowRes.status === "fulfilled" ? nowRes.value : null,
    avalanche: avyRes.status === "fulfilled" ? Object.fromEntries(avyRes.value) : {},
  };
}
