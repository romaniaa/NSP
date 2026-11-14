export type RegionId =
  | "north-shore"
  | "sea-to-sky"
  | "fraser-valley"
  | "duffey"
  | "coquihalla"
  | "manning"
  | "baker";

export interface RegionConfig {
  id: RegionId;
  name: string;
  // Point the freezing-level history and forecast are taken at. The freezing level
  // varies little across a region at model resolution, so one point serves every
  // hill in it. Each region adds about 2.4 Open-Meteo calls an hour (lib/Model.ts).
  lat: number;
  lon: number;
}

// In the order they're listed on the site, roughly by distance from Vancouver.
export const REGIONS: RegionConfig[] = [
  // Roughly central to Cypress, Grouse and Seymour.
  { id: "north-shore", name: "North Shore", lat: 49.38, lon: -123.08 },
  // Between Whistler and Blackcomb mountains.
  { id: "sea-to-sky", name: "Sea to Sky", lat: 50.08, lon: -122.93 },
  // Cayoosh Pass, Duffey Lake Road.
  { id: "duffey", name: "Duffey Lake", lat: 50.38, lon: -122.47 },
  // Hemlock Valley, above Harrison.
  { id: "fraser-valley", name: "Fraser Valley", lat: 49.385, lon: -121.94 },
  // Coquihalla summit, Highway 5.
  { id: "coquihalla", name: "Coquihalla", lat: 49.6, lon: -121.1 },
  // Gibson Pass, Manning Park.
  { id: "manning", name: "Manning Park", lat: 49.075, lon: -120.915 },
  // Heather Meadows, Mt. Baker Ski Area.
  { id: "baker", name: "Mt. Baker", lat: 48.855, lon: -121.67 },
];

export function regionById(id: RegionId) {
  const r = REGIONS.find((x) => x.id === id);
  if (!r) throw new Error(`unknown region: ${id}`);
  return r;
}
