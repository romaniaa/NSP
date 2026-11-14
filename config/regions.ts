export type RegionId =
  | "north-shore"
  | "sea-to-sky"
  | "fraser-valley"
  | "duffey"
  | "coquihalla"
  | "manning"
  | "baker";

// Regions group hills and backcountry zones on the site (the nav drawer, /hills,
// the dashboard picker). Weather is fetched per place, not per region.
export interface RegionConfig {
  id: RegionId;
  name: string;
}

// In the order they're listed on the site, roughly by distance from Vancouver.
export const REGIONS: RegionConfig[] = [
  { id: "north-shore", name: "North Shore" },
  { id: "sea-to-sky", name: "Sea to Sky" },
  { id: "duffey", name: "Duffey Lake" },
  { id: "fraser-valley", name: "Fraser Valley" },
  { id: "coquihalla", name: "Coquihalla" },
  { id: "manning", name: "Manning Park" },
  { id: "baker", name: "Mt. Baker" },
];
