// Regions are the site's top-level grouping: each has a page (/coast,
// /okanagan…) and a tab in the nav. Areas are the smaller groups within a region
// that its page and the menus are sectioned by; outside the Coast, a region is a
// single area of the same name. Weather is fetched per place, not per region.

export type RegionId = "coast" | "vancouver-island" | "okanagan" | "kootenays" | "rockies";

export type AreaId =
  | "north-shore"
  | "sea-to-sky"
  | "duffey"
  | "fraser-valley"
  | "coquihalla"
  | "manning"
  | "baker"
  | "vancouver-island"
  | "okanagan"
  | "kootenays"
  | "rockies";

export interface RegionConfig {
  id: RegionId; // also its URL: /<id>
  name: string; // nav tab and headings
  title: string; // page <title>
  description: string; // meta description
  intro: string; // the paragraph under the page heading
}

export interface AreaConfig {
  id: AreaId;
  name: string;
  region: RegionId;
}

// In nav order, roughly by distance from Vancouver.
export const REGIONS: RegionConfig[] = [
  {
    id: "coast",
    name: "Coast",
    title: "Coast Ski Conditions: North Shore, Whistler, Sasquatch, Manning & Baker",
    description:
      "Rain or snow, freezing level, temperature and snow depth right now at Cypress, Grouse, Seymour, Whistler Blackcomb, Sasquatch, Manning Park and Mt. Baker, plus avalanche danger for the Coast backcountry. Updated hourly.",
    intro:
      "The ski hills within a few hours of Vancouver, from the North Shore up the Sea to Sky to Whistler, out the Fraser Valley to Sasquatch and Manning, and across the border at Mt. Baker. On the Coast the rain-or-snow line decides the day.",
  },
  {
    id: "vancouver-island",
    name: "Vancouver Island",
    title: "Vancouver Island Ski Conditions: Mt. Washington & Mt. Cain",
    description:
      "Rain or snow, freezing level, temperature and snow depth right now at Mount Washington and Mount Cain on Vancouver Island. Updated hourly.",
    intro:
      "Mount Washington above the Comox Valley and community-run Mount Cain on the North Island, both close to the ocean and so often right at the rain-or-snow line.",
  },
  {
    id: "okanagan",
    name: "Okanagan",
    title: "Okanagan Ski Conditions: Big White, SilverStar, Sun Peaks & Apex",
    description:
      "Temperature, freezing level, rain or snow and snow depth right now at Big White, SilverStar, Sun Peaks and Apex in BC's Thompson Okanagan. Updated hourly.",
    intro:
      "The Thompson Okanagan's big four: Big White, SilverStar, Sun Peaks and Apex. Drier and colder than the Coast, known for light snow and valley cloud.",
  },
  {
    id: "kootenays",
    name: "Kootenays",
    title: "Kootenay Ski Conditions: Revelstoke, Kicking Horse, RED, Whitewater & More",
    description:
      "Temperature, freezing level, snow depth and rain or snow right now at Revelstoke, Kicking Horse, RED, Whitewater, Panorama and Kimberley, plus Rogers Pass avalanche danger. Updated hourly.",
    intro:
      "The Powder Highway through the Monashees, Selkirks and Purcells: Revelstoke, Kicking Horse, RED, Whitewater, Panorama and Kimberley, and the Rogers Pass backcountry.",
  },
  {
    id: "rockies",
    name: "Rockies",
    title: "Canadian Rockies Ski Conditions: Lake Louise, Sunshine, Norquay, Fernie & More",
    description:
      "Temperature, freezing level, snow depth and rain or snow right now at Lake Louise, Sunshine, Norquay, Marmot Basin, Nakiska, Castle and Fernie, plus Kananaskis and Icefields Parkway avalanche danger. Updated hourly.",
    intro:
      "From Fernie and Castle in the south through Kananaskis and Banff to Lake Louise and Marmot Basin in Jasper, with the Kananaskis and Icefields Parkway backcountry. High, cold and on Mountain time.",
  },
];

export const AREAS: AreaConfig[] = [
  { id: "north-shore", name: "North Shore", region: "coast" },
  { id: "sea-to-sky", name: "Sea to Sky", region: "coast" },
  { id: "duffey", name: "Duffey Lake", region: "coast" },
  { id: "fraser-valley", name: "Fraser Valley", region: "coast" },
  { id: "coquihalla", name: "Coquihalla", region: "coast" },
  { id: "manning", name: "Manning Park", region: "coast" },
  { id: "baker", name: "Mt. Baker", region: "coast" },
  { id: "vancouver-island", name: "Vancouver Island", region: "vancouver-island" },
  { id: "okanagan", name: "Thompson Okanagan", region: "okanagan" },
  { id: "kootenays", name: "Kootenays", region: "kootenays" },
  { id: "rockies", name: "Canadian Rockies", region: "rockies" },
];

export const regionOf = (area: AreaId): RegionId =>
  AREAS.find((a) => a.id === area)?.region ?? "coast";

export const regionById = (id: RegionId) => REGIONS.find((r) => r.id === id)!;
