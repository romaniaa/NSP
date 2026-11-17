import type { RegionId } from "@/config/regions";

export type MountainId =
  | "cypress"
  | "grouse"
  | "seymour"
  | "whistler"
  | "sasquatch"
  | "manning"
  | "baker"
  | "mt-washington"
  | "mt-cain"
  | "big-white"
  | "silver-star"
  | "sun-peaks"
  | "apex"
  | "revelstoke"
  | "kicking-horse"
  | "red"
  | "whitewater"
  | "panorama"
  | "kimberley"
  | "fernie"
  | "castle"
  | "nakiska"
  | "sunshine"
  | "norquay"
  | "lake-louise"
  | "marmot";

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
  province: "BC" | "AB" | "WA"; // province or state, for structured data
  country: "CA" | "US";
  region: RegionId; // the group it is listed under on the site
  // IANA time zone for days and times shown for this hill. The Rockies and the
  // East Kootenay run on Mountain time.
  timeZone: string;
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
//
// The hills on Vancouver Island, in the Thompson Okanagan, the Kootenays and the
// Rockies (added Nov 2026) follow the same method: lift ends from OpenStreetMap,
// elevations from the terrain model, published figures where known (Big White
// summit 2,319 m; Kicking Horse base 1,190 m and Eagle's Eye 2,350 m; Mt.
// Washington summit 1,588 m). Their ridge outlines are sampled along a straight
// line through the highest lift top, aimed along the line of the upper lift tops,
// so they show the ski area's main ridge rather than a hand-picked skyline. lat/lon
// is the average of the lift ends.
export const MOUNTAINS: MountainConfig[] = [
  {
    id: "cypress",
    name: "Cypress",
    fullName: "Cypress Mountain",
    locality: "West Vancouver",
    province: "BC",
    country: "CA",
    region: "north-shore",
    timeZone: "America/Vancouver",
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
    timeZone: "America/Vancouver",
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
    timeZone: "America/Vancouver",
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
    timeZone: "America/Vancouver",
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
    timeZone: "America/Vancouver",
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
    timeZone: "America/Vancouver",
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
    timeZone: "America/Los_Angeles",
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
  {
    id: "mt-washington",
    name: "Mt. Washington",
    fullName: "Mount Washington Alpine Resort",
    locality: "Courtenay",
    province: "BC",
    country: "CA",
    region: "vancouver-island",
    timeZone: "America/Vancouver",
    website: "https://www.mountwashington.ca",
    color: "#7fa6b8",
    lat: 49.748,
    lon: -125.299,
    minElevation: 1000,
    maxElevation: 1700,
    landmarks: [
      { name: "Base area", elevation: 1110 },
      { name: "Eagle Express top", elevation: 1588 },
    ],
    lifts: {
      bottom: { label: "Sunrise Quad (bottom)", elevation: 1089 },
      top: { label: "Eagle Express (top)", elevation: 1588 },
    },
    profile: [[0,1131],[31,1406],[42,1455],[47,1574],[61,1335],[66,1463],[75,1442],[81,1282],[90,1199],[93,1068],[100,1010]],
  },
  {
    id: "mt-cain",
    name: "Mt. Cain",
    fullName: "Mount Cain",
    locality: "Woss",
    province: "BC",
    country: "CA",
    region: "vancouver-island",
    timeZone: "America/Vancouver",
    website: "https://www.mountcain.com",
    color: "#a3b37a",
    lat: 50.223,
    lon: -126.345,
    minElevation: 1100,
    maxElevation: 1800,
    landmarks: [
      { name: "Base area", elevation: 1192 },
      { name: "Upper T-bar top", elevation: 1615 },
    ],
    lifts: {
      bottom: { label: "Lower T-bar (bottom)", elevation: 1192 },
      top: { label: "Upper T-bar (top)", elevation: 1615 },
    },
    profile: [[0,930],[17,1014],[27,1169],[42,1241],[61,1576],[69,1661],[80,1441],[81,1470],[85,1407],[100,942]],
  },
  {
    id: "big-white",
    name: "Big White",
    fullName: "Big White Ski Resort",
    locality: "Kelowna",
    province: "BC",
    country: "CA",
    region: "okanagan",
    timeZone: "America/Vancouver",
    website: "https://www.bigwhite.com",
    color: "#8fb0d0",
    lat: 49.731,
    lon: -118.934,
    minElevation: 1400,
    maxElevation: 2400,
    landmarks: [
      { name: "Gem Lake Express bottom", elevation: 1511 },
      { name: "Village", elevation: 1669 },
      { name: "Alpine T-bar top", elevation: 2319 },
    ],
    lifts: {
      bottom: { label: "Gem Lake Express (bottom)", elevation: 1511 },
      top: { label: "Alpine T-bar (top)", elevation: 2319 },
    },
    profile: [[0,1942],[14,2031],[25,2216],[34,2143],[44,2280],[56,2103],[64,2083],[86,1812],[100,1729]],
  },
  {
    id: "silver-star",
    name: "SilverStar",
    fullName: "SilverStar Mountain Resort",
    locality: "Vernon",
    province: "BC",
    country: "CA",
    region: "okanagan",
    timeZone: "America/Vancouver",
    website: "https://www.skisilverstar.com",
    color: "#c48aa8",
    lat: 50.366,
    lon: -119.054,
    minElevation: 1000,
    maxElevation: 2000,
    landmarks: [
      { name: "Putnam Express bottom", elevation: 1147 },
      { name: "Village", elevation: 1600 },
      { name: "Gondola top", elevation: 1881 },
    ],
    lifts: {
      bottom: { label: "Putnam Express (bottom)", elevation: 1147 },
      top: { label: "Summit Express Gondola (top)", elevation: 1881 },
    },
    profile: [[0,1465],[14,1535],[32,1768],[49,1886],[88,1677],[100,1479]],
  },
  {
    id: "sun-peaks",
    name: "Sun Peaks",
    fullName: "Sun Peaks Resort",
    locality: "Sun Peaks",
    province: "BC",
    country: "CA",
    region: "okanagan",
    timeZone: "America/Vancouver",
    website: "https://www.sunpeaksresort.com",
    color: "#d0b65e",
    lat: 50.892,
    lon: -119.899,
    minElevation: 1100,
    maxElevation: 2200,
    landmarks: [
      { name: "Village", elevation: 1259 },
      { name: "Sunburst Express top", elevation: 1852 },
      { name: "West Bowl Express top", elevation: 2084 },
    ],
    lifts: {
      bottom: { label: "Burfield Quad (bottom)", elevation: 1198 },
      top: { label: "West Bowl Express (top)", elevation: 2084 },
    },
    profile: [[0,1983],[3,2039],[12,2041],[15,2083],[20,2040],[24,2072],[63,1234],[68,1273],[76,1573],[100,1601]],
  },
  {
    id: "apex",
    name: "Apex",
    fullName: "Apex Mountain Resort",
    locality: "Penticton",
    province: "BC",
    country: "CA",
    region: "okanagan",
    timeZone: "America/Vancouver",
    website: "https://www.apexresort.com",
    color: "#7fb08a",
    lat: 49.385,
    lon: -119.904,
    minElevation: 1500,
    maxElevation: 2300,
    landmarks: [
      { name: "Base area", elevation: 1615 },
      { name: "Quickdraw top", elevation: 2158 },
    ],
    lifts: {
      bottom: { label: "Stocks Triple (bottom)", elevation: 1615 },
      top: { label: "Quickdraw Express (top)", elevation: 2158 },
    },
    profile: [[0,1931],[10,1958],[19,1931],[32,2124],[46,2164],[54,1969],[64,1855],[69,1908],[86,1677],[97,1864],[100,1846]],
  },
  {
    id: "revelstoke",
    name: "Revelstoke",
    fullName: "Revelstoke Mountain Resort",
    locality: "Revelstoke",
    province: "BC",
    country: "CA",
    region: "kootenays",
    timeZone: "America/Vancouver",
    website: "https://www.revelstokemountainresort.com",
    color: "#9a8fd0",
    lat: 50.967,
    lon: -118.128,
    minElevation: 400,
    maxElevation: 2400,
    landmarks: [
      { name: "Gondola base", elevation: 515 },
      { name: "Gondola top", elevation: 1690 },
      { name: "The Stoke top", elevation: 2224 },
    ],
    lifts: {
      bottom: { label: "Revelation Gondola (bottom)", elevation: 515 },
      top: { label: "The Stoke (top)", elevation: 2224 },
    },
    profile: [[0,960],[32,1653],[47,1815],[71,2266],[80,2329],[81,2283],[92,2294],[100,2024]],
  },
  {
    id: "kicking-horse",
    name: "Kicking Horse",
    fullName: "Kicking Horse Mountain Resort",
    locality: "Golden",
    province: "BC",
    country: "CA",
    region: "kootenays",
    timeZone: "America/Edmonton",
    website: "https://kickinghorseresort.com",
    color: "#c98f5a",
    lat: 51.289,
    lon: -117.065,
    minElevation: 1100,
    maxElevation: 2500,
    landmarks: [
      { name: "Base area", elevation: 1190 },
      { name: "Eagle's Eye", elevation: 2350 },
    ],
    lifts: {
      bottom: { label: "Golden Eagle Express (bottom)", elevation: 1190 },
      top: { label: "Stairway to Heaven (top)", elevation: 2429 },
    },
    profile: [[0,1649],[17,1909],[32,2374],[37,2429],[46,2235],[47,2267],[49,2219],[51,2250],[56,2209],[63,2061],[69,2011],[81,1696],[100,1399]],
  },
  {
    id: "red",
    name: "RED",
    fullName: "RED Mountain Resort",
    locality: "Rossland",
    province: "BC",
    country: "CA",
    region: "kootenays",
    timeZone: "America/Vancouver",
    website: "https://www.redresort.com",
    color: "#c46b5e",
    lat: 49.105,
    lon: -117.837,
    minElevation: 1100,
    maxElevation: 2100,
    landmarks: [
      { name: "Base area", elevation: 1159 },
      { name: "Grey Mountain Chair top", elevation: 2025 },
    ],
    lifts: {
      bottom: { label: "Red Chair (bottom)", elevation: 1159 },
      top: { label: "Grey Mountain Chair (top)", elevation: 2025 },
    },
    profile: [[0,1812],[10,1959],[17,1991],[25,1970],[32,2041],[53,1716],[69,1988],[93,1519],[100,1613]],
  },
  {
    id: "whitewater",
    name: "Whitewater",
    fullName: "Whitewater Ski Resort",
    locality: "Nelson",
    province: "BC",
    country: "CA",
    region: "kootenays",
    timeZone: "America/Vancouver",
    website: "https://whitewatermountainresort.com",
    color: "#7fb7c0",
    lat: 49.443,
    lon: -117.151,
    minElevation: 1300,
    maxElevation: 2200,
    landmarks: [
      { name: "Glory Ridge bottom", elevation: 1390 },
      { name: "Base lodge", elevation: 1620 },
      { name: "Raven top", elevation: 2058 },
    ],
    lifts: {
      bottom: { label: "Glory Ridge (bottom)", elevation: 1390 },
      top: { label: "Raven (top)", elevation: 2058 },
    },
    profile: [[0,1534],[17,1761],[27,2000],[51,1618],[71,2058],[83,1741],[90,1789],[100,1970]],
  },
  {
    id: "panorama",
    name: "Panorama",
    fullName: "Panorama Mountain Resort",
    locality: "Invermere",
    province: "BC",
    country: "CA",
    region: "kootenays",
    timeZone: "America/Edmonton",
    website: "https://www.panoramaresort.com",
    color: "#82b08a",
    lat: 50.448,
    lon: -116.231,
    minElevation: 1100,
    maxElevation: 2500,
    landmarks: [
      { name: "Village", elevation: 1150 },
      { name: "Champagne Express bottom", elevation: 1516 },
      { name: "Summit Quad top", elevation: 2343 },
    ],
    lifts: {
      bottom: { label: "Toby (bottom)", elevation: 1150 },
      top: { label: "Summit Quad (top)", elevation: 2343 },
    },
    profile: [[0,1362],[58,2362],[69,2203],[71,2255],[76,2276],[78,2236],[83,2276],[92,2428],[100,2421]],
  },
  {
    id: "kimberley",
    name: "Kimberley",
    fullName: "Kimberley Alpine Resort",
    locality: "Kimberley",
    province: "BC",
    country: "CA",
    region: "kootenays",
    timeZone: "America/Edmonton",
    website: "https://skikimberley.com",
    color: "#c9b874",
    lat: 49.686,
    lon: -116.031,
    minElevation: 1100,
    maxElevation: 2000,
    landmarks: [
      { name: "Base area", elevation: 1238 },
      { name: "North Star Express top", elevation: 1786 },
      { name: "Easter top", elevation: 1909 },
    ],
    lifts: {
      bottom: { label: "North Star Express (bottom)", elevation: 1238 },
      top: { label: "Easter (top)", elevation: 1909 },
    },
    profile: [[0,1523],[22,1805],[37,1908],[56,1684],[63,1728],[71,1670],[100,1300]],
  },
  {
    id: "fernie",
    name: "Fernie",
    fullName: "Fernie Alpine Resort",
    locality: "Fernie",
    province: "BC",
    country: "CA",
    region: "rockies",
    timeZone: "America/Edmonton",
    website: "https://skifernie.com",
    color: "#c27c6a",
    lat: 49.457,
    lon: -115.103,
    minElevation: 1000,
    maxElevation: 2200,
    landmarks: [
      { name: "Base area", elevation: 1071 },
      { name: "White Pass Quad top", elevation: 1900 },
      { name: "Polar Peak Chair top", elevation: 2072 },
    ],
    lifts: {
      bottom: { label: "Elk Quad (bottom)", elevation: 1071 },
      top: { label: "Polar Peak Chair (top)", elevation: 2072 },
    },
    profile: [[0,1563],[7,1732],[15,1699],[19,1800],[20,1743],[22,1836],[34,1890],[36,1963],[47,2079],[53,1900],[56,1886],[63,1980],[66,1960],[71,1998],[86,1695],[92,1684],[100,1872]],
  },
  {
    id: "castle",
    name: "Castle",
    fullName: "Castle Mountain Resort",
    locality: "Pincher Creek",
    province: "AB",
    country: "CA",
    region: "rockies",
    timeZone: "America/Edmonton",
    website: "https://www.skicastle.ca",
    color: "#a89c7c",
    lat: 49.313,
    lon: -114.423,
    minElevation: 1300,
    maxElevation: 2400,
    landmarks: [
      { name: "Base area", elevation: 1413 },
      { name: "Tamarack Chair top", elevation: 2236 },
    ],
    lifts: {
      bottom: { label: "Huckleberry Triple Chair (bottom)", elevation: 1413 },
      top: { label: "Tamarack Chair (top)", elevation: 2236 },
    },
    profile: [[0,1504],[19,2084],[24,2138],[29,2126],[37,2333],[46,2200],[59,1807],[64,1793],[69,1847],[75,2203],[83,2051],[90,2168],[100,1841]],
  },
  {
    id: "nakiska",
    name: "Nakiska",
    fullName: "Nakiska Ski Area",
    locality: "Kananaskis",
    province: "AB",
    country: "CA",
    region: "rockies",
    timeZone: "America/Edmonton",
    website: "https://skinakiska.com",
    color: "#7f9fc9",
    lat: 50.947,
    lon: -115.165,
    minElevation: 1400,
    maxElevation: 2600,
    landmarks: [
      { name: "Base area", elevation: 1512 },
      { name: "Gold Chair top", elevation: 2245 },
    ],
    lifts: {
      bottom: { label: "Bronze Chair (bottom)", elevation: 1512 },
      top: { label: "Gold Chair (top)", elevation: 2245 },
    },
    profile: [[0,1963],[10,2176],[15,2196],[22,2421],[24,2396],[29,2474],[34,2456],[41,2222],[56,1937],[80,1768],[83,1705],[88,1806],[100,1801]],
  },
  {
    id: "sunshine",
    name: "Sunshine",
    fullName: "Sunshine Village",
    locality: "Banff",
    province: "AB",
    country: "CA",
    region: "rockies",
    timeZone: "America/Edmonton",
    website: "https://www.skibanff.com",
    color: "#d4b05c",
    lat: 51.086,
    lon: -115.774,
    minElevation: 1600,
    maxElevation: 2900,
    landmarks: [
      { name: "Gondola base", elevation: 1661 },
      { name: "Sunshine Village", elevation: 2168 },
      { name: "Great Divide top", elevation: 2683 },
    ],
    lifts: {
      bottom: { label: "Sunshine Village Gondola (bottom)", elevation: 1661 },
      top: { label: "Great Divide Express Quad (top)", elevation: 2683 },
    },
    profile: [[0,2203],[36,2359],[56,2683],[64,2613],[68,2699],[76,2609],[81,2719],[86,2583],[97,2823],[100,2780]],
  },
  {
    id: "norquay",
    name: "Norquay",
    fullName: "Mt. Norquay",
    locality: "Banff",
    province: "AB",
    country: "CA",
    region: "rockies",
    timeZone: "America/Edmonton",
    website: "https://banffnorquay.com",
    color: "#b88fb8",
    lat: 51.205,
    lon: -115.606,
    minElevation: 1500,
    maxElevation: 2300,
    landmarks: [
      { name: "Base area", elevation: 1639 },
      { name: "North American top", elevation: 2080 },
    ],
    lifts: {
      bottom: { label: "Mystic Express (bottom)", elevation: 1639 },
      top: { label: "North American (top)", elevation: 2080 },
    },
    profile: [[0,1693],[10,1594],[27,1921],[36,1891],[44,2043],[49,2010],[53,2136],[56,2067],[61,2162],[64,2044],[68,2057],[71,2008],[73,2044],[78,1959],[92,1499],[100,1395]],
  },
  {
    id: "lake-louise",
    name: "Lake Louise",
    fullName: "Lake Louise Ski Resort",
    locality: "Lake Louise",
    province: "AB",
    country: "CA",
    region: "rockies",
    timeZone: "America/Edmonton",
    website: "https://www.skilouise.com",
    color: "#6fb0a8",
    lat: 51.454,
    lon: -116.134,
    minElevation: 1600,
    maxElevation: 2800,
    landmarks: [
      { name: "Base area", elevation: 1650 },
      { name: "Grizzly Gondola top", elevation: 2384 },
      { name: "Summit Chair top", elevation: 2651 },
    ],
    lifts: {
      bottom: { label: "Grizzly Express Gondola (bottom)", elevation: 1650 },
      top: { label: "Summit Chair (top)", elevation: 2651 },
    },
    profile: [[0,2395],[8,2615],[14,2651],[24,2499],[32,2461],[36,2514],[41,2386],[51,2343],[56,2128],[64,1991],[80,2150],[100,2569]],
  },
  {
    id: "marmot",
    name: "Marmot",
    fullName: "Marmot Basin",
    locality: "Jasper",
    province: "AB",
    country: "CA",
    region: "rockies",
    timeZone: "America/Edmonton",
    website: "https://www.skimarmot.com",
    color: "#a0aab9",
    lat: 52.798,
    lon: -118.1,
    minElevation: 1600,
    maxElevation: 2600,
    landmarks: [
      { name: "Base area", elevation: 1739 },
      { name: "Paradise Quad top", elevation: 2289 },
      { name: "Knob Quad top", elevation: 2496 },
    ],
    lifts: {
      bottom: { label: "Canadian Rockies Express Quad (bottom)", elevation: 1739 },
      top: { label: "Knob Quad (top)", elevation: 2496 },
    },
    profile: [[0,2352],[8,2097],[17,1998],[36,2482],[44,2502],[53,2334],[59,2463],[86,1717],[93,1632],[100,1725]],
  },
];
