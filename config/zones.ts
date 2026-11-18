import { regionOf, type AreaId, type RegionId } from "@/config/regions";

export type ZoneId =
  | "strachan"
  | "spearhead"
  | "brandywine"
  | "tetrahedron"
  | "knuckleheads"
  | "duffey"
  | "coquihalla"
  | "rogers-pass"
  | "kananaskis"
  | "icefields-parkway";

export interface ZoneConfig {
  id: ZoneId; // URL slug under /backcountry
  name: string; // short, for cards and the nav
  fullName: string;
  description: string; // the terrain it covers, in one sentence
  area: AreaId; // the group it is listed under on its region's page and in menus
  region: RegionId; // derived from the area
  timeZone: string; // IANA zone for days and times shown for this zone
  color: string;
  // Used both to look up the avalanche forecast and as the weather model point,
  // so it sits in the middle of the terrain people tour.
  lat: number;
  lon: number;
  // Heights (m) to show temperature and rain or snow at, spanning the terrain
  // from below treeline into the alpine. Round numbers, not exact band limits;
  // Avalanche Canada's elevation bands vary by region and aren't in its API.
  heights: number[];
  // Avalanche Canada weather stations to show measurements from (config/stations.ts).
  stations: number[];
}

const LIST: Omit<ZoneConfig, "region">[] = [
  {
    id: "strachan",
    name: "Strachan",
    fullName: "Mt. Strachan",
    description:
      "Mt. Strachan and Hollyburn Mountain above Cypress, the closest touring to Vancouver.",
    area: "north-shore",
    timeZone: "America/Vancouver",
    color: "#8fb3a8",
    // Between the summit (about 1,450 m) and Cypress's base.
    lat: 49.405,
    lon: -123.195,
    heights: [1400, 1200, 1000],
    stations: [11, 10],
  },
  {
    id: "spearhead",
    name: "Spearhead",
    fullName: "Spearhead Range",
    description: "The Spearhead Traverse and the Blackcomb backcountry, east of Whistler.",
    area: "sea-to-sky",
    timeZone: "America/Vancouver",
    color: "#8aa9d6",
    lat: 50.07,
    lon: -122.86,
    heights: [2300, 1900, 1500],
    // No public station nearby; Brandywine (496 m, 18 km) is too far and too low.
    stations: [],
  },
  {
    id: "brandywine",
    name: "Brandywine",
    fullName: "Brandywine and Callaghan",
    description: "Brandywine Meadows and the Callaghan Valley, southwest of Whistler.",
    area: "sea-to-sky",
    timeZone: "America/Vancouver",
    color: "#b5a3d6",
    lat: 50.08,
    lon: -123.12,
    heights: [2000, 1600, 1200],
    stations: [71],
  },
  {
    id: "tetrahedron",
    name: "Tetrahedron",
    fullName: "Tetrahedron Provincial Park",
    description:
      "Mt. Steele, Tetrahedron Peak and the club cabins above Sechelt, reached by a 4x4 road.",
    area: "sunshine-coast",
    timeZone: "America/Vancouver",
    color: "#a6d0b8",
    // Between Edwards Lake and Mt. Steele cabin (about 1,500 m); the road ends
    // near 1,100 m and the peaks reach about 1,700 m.
    lat: 49.605,
    lon: -123.615,
    heights: [1700, 1400, 1100],
    // No public station nearby; the closest are at sea level.
    stations: [],
  },
  {
    id: "knuckleheads",
    name: "Knuckleheads",
    fullName: "Knuckleheads Recreation Area",
    description:
      "Ridges and free winter cabins above Lois Lake, northeast of Powell River, reached by logging roads with weekday restrictions.",
    area: "sunshine-coast",
    timeZone: "America/Vancouver",
    color: "#d0c08f",
    // Near Vic Cole Lodge (about 1,420 m); people stage around 1,100 m on the
    // Vic Cole road and the ridges reach about 1,650 m.
    lat: 49.93,
    lon: -124.175,
    heights: [1700, 1400, 1100],
    // No public station nearby.
    stations: [],
  },
  {
    id: "duffey",
    name: "Duffey",
    fullName: "Duffey Lake Road",
    description:
      "Roadside touring off Highway 99 between Pemberton and Lillooet: Joffre, Cayoosh and Rohr.",
    area: "duffey",
    timeZone: "America/Vancouver",
    color: "#d6b48a",
    lat: 50.38,
    lon: -122.47,
    heights: [2300, 1800, 1300],
    stations: [19, 20, 74],
  },
  {
    id: "coquihalla",
    name: "Coquihalla",
    fullName: "Coquihalla Pass",
    description: "Zupjok, Thar and Yak peaks along Highway 5 near the Coquihalla summit.",
    area: "coquihalla",
    timeZone: "America/Vancouver",
    color: "#d69a8a",
    lat: 49.6,
    lon: -121.1,
    heights: [2000, 1600, 1200],
    stations: [16, 17, 15],
  },
  {
    id: "rogers-pass",
    name: "Rogers Pass",
    fullName: "Rogers Pass",
    description:
      "Glacier National Park off Highway 1: the Asulkan, Connaught and Hermit areas. Parks Canada requires a winter permit.",
    area: "kootenays",
    timeZone: "America/Vancouver",
    color: "#d6a0b8",
    lat: 51.3,
    lon: -117.52,
    heights: [2500, 2000, 1500],
    stations: [91, 96, 95, 93, 98],
  },
  {
    id: "kananaskis",
    name: "Kananaskis",
    fullName: "Kananaskis Country",
    description:
      "Burstall Pass, Chester Lake and the peaks along the Smith-Dorrien Trail and Highwood Pass.",
    area: "rockies",
    timeZone: "America/Edmonton",
    color: "#9cc29a",
    lat: 50.77,
    lon: -115.35,
    heights: [2700, 2300, 1900],
    stations: [1, 5, 3],
  },
  {
    id: "icefields-parkway",
    name: "Icefields Parkway",
    fullName: "Icefields Parkway",
    description:
      "Bow Summit, Observation Peak and the Wapta Icefield approaches along Highway 93 North.",
    area: "rockies",
    timeZone: "America/Edmonton",
    color: "#8cc6e6",
    lat: 51.68,
    lon: -116.47,
    heights: [2900, 2400, 1900],
    stations: [113, 112],
  },
];

export const ZONES: ZoneConfig[] = LIST.map((z) => ({ ...z, region: regionOf(z.area) }));
