import type { RegionId } from "@/config/regions";

export type ZoneId =
  | "north-shore-backcountry"
  | "spearhead"
  | "brandywine"
  | "duffey"
  | "coquihalla";

export interface ZoneConfig {
  id: ZoneId; // URL slug under /backcountry
  name: string; // short, for cards and the nav
  fullName: string;
  description: string; // the terrain it covers, in one sentence
  region: RegionId; // the group it is listed under on the site
  color: string;
  // Used both to look up the avalanche forecast and as the weather model point,
  // so it sits in the middle of the terrain people tour.
  lat: number;
  lon: number;
  // Heights (m) to show temperature and rain or snow at, spanning the terrain
  // from below treeline into the alpine. Round numbers, not exact band limits;
  // Avalanche Canada's elevation bands vary by region and aren't in its API.
  heights: number[];
}

export const ZONES: ZoneConfig[] = [
  {
    id: "north-shore-backcountry",
    name: "North Shore",
    fullName: "North Shore backcountry",
    description:
      "Hollyburn, Mt. Strachan, the Seymour backcountry and the peaks above Vancouver.",
    region: "north-shore",
    color: "#8fb3a8",
    lat: 49.4,
    lon: -123.08,
    heights: [1600, 1300, 1000],
  },
  {
    id: "spearhead",
    name: "Spearhead",
    fullName: "Spearhead Range",
    description: "The Spearhead Traverse and the Blackcomb backcountry, east of Whistler.",
    region: "sea-to-sky",
    color: "#8aa9d6",
    lat: 50.07,
    lon: -122.86,
    heights: [2300, 1900, 1500],
  },
  {
    id: "brandywine",
    name: "Brandywine",
    fullName: "Brandywine and Callaghan",
    description: "Brandywine Meadows and the Callaghan Valley, southwest of Whistler.",
    region: "sea-to-sky",
    color: "#b5a3d6",
    lat: 50.08,
    lon: -123.12,
    heights: [2000, 1600, 1200],
  },
  {
    id: "duffey",
    name: "Duffey",
    fullName: "Duffey Lake Road",
    description:
      "Roadside touring off Highway 99 between Pemberton and Lillooet: Joffre, Cayoosh and Rohr.",
    region: "duffey",
    color: "#d6b48a",
    lat: 50.38,
    lon: -122.47,
    heights: [2300, 1800, 1300],
  },
  {
    id: "coquihalla",
    name: "Coquihalla",
    fullName: "Coquihalla Pass",
    description: "Zupjok, Thar and Yak peaks along Highway 5 near the Coquihalla summit.",
    region: "coquihalla",
    color: "#d69a8a",
    lat: 49.6,
    lon: -121.1,
    heights: [2000, 1600, 1200],
  },
];
