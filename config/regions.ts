export type RegionId = "north-shore";

export interface RegionConfig {
  id: RegionId;
  name: string;
  // Point the freezing-level history and forecast are taken at. The freezing level
  // varies little across a region at model resolution, so one point serves every
  // hill in it.
  lat: number;
  lon: number;
}

export const REGIONS: RegionConfig[] = [
  // Roughly central to Cypress, Grouse and Seymour.
  { id: "north-shore", name: "North Shore", lat: 49.38, lon: -123.08 },
];

export function regionById(id: RegionId) {
  const r = REGIONS.find((x) => x.id === id);
  if (!r) throw new Error(`unknown region: ${id}`);
  return r;
}
