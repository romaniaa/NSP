import type { RegionId } from "@/config/regions";

export type ZoneId =
  | "north-shore-backcountry"
  | "spearhead"
  | "brandywine"
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
  region: RegionId; // the group it is listed under on the site
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

export const ZONES: ZoneConfig[] = [
  {
    id: "north-shore-backcountry",
    name: "North Shore",
    fullName: "North Shore backcountry",
    description:
      "Hollyburn, Mt. Strachan, the Seymour backcountry and the peaks above Vancouver.",
    region: "north-shore",
    timeZone: "America/Vancouver",
    color: "#8fb3a8",
    lat: 49.4,
    lon: -123.08,
    heights: [1600, 1300, 1000],
    stations: [11, 10],
  },
  {
    id: "spearhead",
    name: "Spearhead",
    fullName: "Spearhead Range",
    description: "The Spearhead Traverse and the Blackcomb backcountry, east of Whistler.",
    region: "sea-to-sky",
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
    region: "sea-to-sky",
    timeZone: "America/Vancouver",
    color: "#b5a3d6",
    lat: 50.08,
    lon: -123.12,
    heights: [2000, 1600, 1200],
    stations: [71],
  },
  {
    id: "duffey",
    name: "Duffey",
    fullName: "Duffey Lake Road",
    description:
      "Roadside touring off Highway 99 between Pemberton and Lillooet: Joffre, Cayoosh and Rohr.",
    region: "duffey",
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
    region: "coquihalla",
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
    region: "kootenays",
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
    region: "rockies",
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
    region: "rockies",
    timeZone: "America/Edmonton",
    color: "#8cc6e6",
    lat: 51.68,
    lon: -116.47,
    heights: [2900, 2400, 1900],
    stations: [113, 112],
  },
];
