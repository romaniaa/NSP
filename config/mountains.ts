import type { RegionId } from "@/config/regions";

export type MountainId =
  | "cypress"
  | "grouse"
  | "seymour"
  | "whistler"
  | "sasquatch"
  | "manning"
  | "baker";

export interface Landmark {
  name: string;
  elevation: number; // metres
}

export interface LiftPoint {
  label: string;
  elevation: number; // metres, approximate
}

export interface MountainConfig {
  id: MountainId;
  name: string;
  fullName: string; // the name people search for, e.g. "Cypress Mountain"
  locality: string; // municipality or area the ski area is in
  province: "BC" | "WA"; // province or state, for structured data
  country: "CA" | "US";
  region: RegionId; // the group it is listed under on the site
  website: string; // the resort's own site
  color: string; // accent colour used for this mountain across the page
  lat: number;
  lon: number;
  minElevation: number; // bottom of the diagram
  maxElevation: number; // top of the diagram
  landmarks: Landmark[];
  // Bottom station of the lowest lift and top station of the highest lift.
  lifts: { bottom: LiftPoint; top: LiftPoint };
  // Ridge outline for the diagram: [x from 0 to 100, elevation in metres].
  profile: [number, number][];
}

// Elevations come from resort trail maps and public listings and are approximate.
// Sources disagree by a few metres; verify against each resort before relying on them.
// For Whistler, Sasquatch, Manning and Baker, lift ends come from OpenStreetMap with
// elevations from Open-Meteo's 90 m terrain model, replaced by published figures where
// a resort or Wikipedia gives one. The terrain model reads sharp summits low (Whistler
// Peak by ~70 m), so treat their alpine tops as a little conservative. lat/lon is the
// model point for weather: the middle of the lift network. Their ridge outlines are
// real: the same terrain model sampled along a line through each hill's named peaks
// and lift tops, simplified (Whistler: Whistler Mountain to Blackcomb Peak; Baker:
// Panorama Dome along the Shuksan Arm; Sasquatch: Mount Davies past both lift tops
// toward Mount Klaudt; Manning: Mara Peak past both lift tops).
export const MOUNTAINS: MountainConfig[] = [
  {
    id: "cypress",
    name: "Cypress",
    fullName: "Cypress Mountain",
    locality: "West Vancouver",
    province: "BC",
    country: "CA",
    region: "north-shore",
    website: "https://www.cypressmountain.com",
    color: "#8aa583",
    lat: 49.396,
    lon: -123.204,
    minElevation: 700,
    maxElevation: 1560,
    landmarks: [
      { name: "Base lodge", elevation: 915 },
      { name: "Black Mountain", elevation: 1200 },
      { name: "Mt. Strachan", elevation: 1440 },
    ],
    lifts: {
      bottom: { label: "Eagle Express (bottom)", elevation: 921 },
      top: { label: "Sky Quad (top)", elevation: 1440 },
    },
    profile: [[0,780],[12,910],[25,1060],[38,1200],[50,1130],[62,1440],[75,1300],[88,1180],[100,1050]],
  },
  {
    id: "grouse",
    name: "Grouse",
    fullName: "Grouse Mountain",
    locality: "North Vancouver",
    province: "BC",
    country: "CA",
    region: "north-shore",
    website: "https://www.grousemountain.com",
    color: "#c4764f",
    lat: 49.379,
    lon: -123.082,
    minElevation: 200,
    maxElevation: 1350,
    landmarks: [
      { name: "Skyride base", elevation: 274 },
      { name: "Alpine chalet", elevation: 1128 },
      { name: "Peak Chair top", elevation: 1229 },
    ],
    lifts: {
      bottom: { label: "Olympic Express (bottom)", elevation: 873 },
      top: { label: "Peak Chair (top)", elevation: 1229 },
    },
    profile: [[0,200],[18,274],[40,640],[58,1128],[70,1229],[84,1110],[100,950]],
  },
  {
    id: "seymour",
    name: "Seymour",
    fullName: "Mount Seymour",
    locality: "North Vancouver",
    province: "BC",
    country: "CA",
    region: "north-shore",
    website: "https://mtseymour.ca",
    color: "#cfae6b",
    lat: 49.367,
    lon: -122.948,
    minElevation: 800,
    maxElevation: 1350,
    landmarks: [
      { name: "Bottom of mountain", elevation: 935 },
      { name: "Base area", elevation: 1020 },
      { name: "Brockton Chair top", elevation: 1265 },
    ],
    lifts: {
      bottom: { label: "Lodge Chair (bottom)", elevation: 935 },
      top: { label: "Brockton Chair (top)", elevation: 1265 },
    },
    profile: [[0,860],[15,935],[32,1020],[50,1130],[68,1265],[82,1180],[100,1040]],
  },
  {
    id: "whistler",
    name: "Whistler",
    fullName: "Whistler Blackcomb",
    locality: "Whistler",
    province: "BC",
    country: "CA",
    region: "sea-to-sky",
    website: "https://www.whistlerblackcomb.com",
    color: "#7b9cc4",
    lat: 50.092,
    lon: -122.931,
    minElevation: 600,
    maxElevation: 2500,
    landmarks: [
      { name: "Whistler Village", elevation: 675 },
      { name: "Roundhouse Lodge", elevation: 1850 },
      { name: "Whistler Peak", elevation: 2182 },
    ],
    lifts: {
      bottom: { label: "Creekside Gondola (bottom)", elevation: 653 },
      top: { label: "7th Heaven Express (top)", elevation: 2240 },
    },
    profile: [[0,1483],[22,2161],[28,1900],[33,1950],[42,1603],[48,1534],[57,1028],[69,1648],[80,1921],[85,2413],[92,2250],[97,2350],[100,2244]],
  },
  {
    id: "sasquatch",
    name: "Sasquatch",
    // Locals still call it Hemlock; hemlockresort.ca redirects here.
    fullName: "Sasquatch Mountain Resort",
    locality: "Hemlock Valley",
    province: "BC",
    country: "CA",
    region: "fraser-valley",
    website: "https://sasquatchmountain.ca",
    color: "#6aa79e",
    lat: 49.383,
    lon: -121.939,
    minElevation: 900,
    maxElevation: 1400,
    landmarks: [
      { name: "Base lodge", elevation: 980 },
      { name: "Sasquatch Triple top", elevation: 1317 },
    ],
    lifts: {
      bottom: { label: "Sasquatch Triple (bottom)", elevation: 979 },
      top: { label: "Sasquatch Triple (top)", elevation: 1317 },
    },
    profile: [[0,1235],[12,933],[29,1285],[34,1214],[39,1244],[46,1194],[53,1320],[56,1311],[66,1112],[80,1190],[90,1337],[100,1391]],
  },
  {
    id: "manning",
    name: "Manning",
    fullName: "Manning Park Resort",
    locality: "Manning Park",
    province: "BC",
    country: "CA",
    region: "manning",
    website: "https://manningpark.com",
    color: "#c98a8f",
    lat: 49.072,
    lon: -120.918,
    minElevation: 1350,
    maxElevation: 1850,
    landmarks: [
      { name: "Base area", elevation: 1453 },
      { name: "Bear Chair top", elevation: 1785 },
    ],
    lifts: {
      bottom: { label: "Blue Chair (bottom)", elevation: 1453 },
      top: { label: "Bear Chair (top)", elevation: 1785 },
    },
    profile: [[0,1771],[20,1720],[36,1565],[41,1558],[49,1611],[54,1724],[66,1785],[80,1667],[86,1678],[92,1769],[100,1713]],
  },
  {
    id: "baker",
    name: "Baker",
    fullName: "Mt. Baker Ski Area",
    locality: "Glacier, Washington",
    province: "WA",
    country: "US",
    region: "baker",
    website: "https://www.mtbaker.us",
    color: "#a68fc2",
    lat: 48.857,
    lon: -121.667,
    minElevation: 1000,
    maxElevation: 1750,
    // From the resort's snow report (feet, converted).
    landmarks: [
      { name: "White Salmon base", elevation: 1106 },
      { name: "Heather Meadows", elevation: 1283 },
      { name: "Pan Dome", elevation: 1530 },
    ],
    lifts: {
      bottom: { label: "Chair 7 (bottom)", elevation: 1108 },
      // Published summit, 5,089 ft.
      top: { label: "Chair 8 (top)", elevation: 1551 },
    },
    profile: [[0,1678],[4,1537],[11,1550],[21,1281],[29,1346],[35,1527],[38,1523],[45,1384],[49,1558],[53,1547],[54,1582],[65,1437],[69,1522],[80,1593],[81,1679],[84,1629],[88,1665],[92,1571],[97,1558],[100,1710]],
  },
];
