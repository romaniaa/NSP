import type { MountainId } from "@/config/mountains";

export interface Lift {
  name: string;
  short: string; // used in chart labels
  kind: string;
  length?: number; // metres
  bottom: number | null; // bottom station elevation, metres
  top: number | null; // top station elevation, metres
  est?: boolean; // true if an elevation is estimated rather than listed
}

// Elevations come from PeakVisor lift data, skiresort.info lift specs and resort trail maps.
// They are approximate and sources differ by a few metres. Entries with est: true were
// estimated from lift length and vertical drop. Magic carpets and rope tows are left out.
// Ordered by top elevation, highest first.
//
// Whistler, Sasquatch, Manning and Baker: lift ends from OpenStreetMap (Nov 2026),
// elevations from Open-Meteo's 90 m terrain model, lengths measured along the mapped
// line. Published elevations replace the model where available: Whistler Peak 2,182 m,
// 7th Heaven 2,240 m, Village 675 m, Creekside 653 m, Baker Chair 8 top 5,089 ft.
// The terrain model reads sharp summits low, so other alpine tops may be a few tens
// of metres conservative. Two-section gondolas are listed as one lift.
//
// The hills added for Vancouver Island, the Thompson Okanagan, the Kootenays and
// the Rockies (Nov 2026) come from the same sources. Lift types follow
// OpenStreetMap's tags, with chairs named "Express" taken as high-speed where it
// doesn't say. T-bars over 600 m are included (Mt. Cain has only T-bars); shorter
// surface lifts, platters and village people-movers are not. Published figures
// replace the model for Big White's Alpine T-bar (2,319 m summit), Kicking Horse's
// gondola (1,190 m base, 2,350 m Eagle's Eye) and Mt. Washington's Eagle Express
// (1,588 m summit). A lift mapped in OpenStreetMap may since have been replaced.
export const LIFTS: Record<MountainId, Lift[]> = {
  cypress: [
    { name: "Sky Quad", short: "Sky", kind: "Fixed-grip quad", length: 575, bottom: 1260, top: 1440, est: true },
    { name: "Lions Express", short: "Lions", kind: "High-speed quad", length: 1079, bottom: 927, top: 1269 },
    { name: "Eagle Express", short: "Eagle", kind: "High-speed quad", length: 847, bottom: 921, top: 1187 },
    { name: "Midway Chair", short: "Midway", kind: "Double chair", length: 290, bottom: 928, top: 1053 },
    { name: "Easy Rider Quad", short: "Easy Rider", kind: "Fixed-grip quad", length: 301, bottom: 924, top: 976, est: true },
    { name: "Raven Ridge Quad", short: "Raven Ridge", kind: "Fixed-grip quad", bottom: null, top: null },
  ],
  grouse: [
    { name: "Peak Chair", short: "Peak", kind: "Fixed-grip quad", length: 550, bottom: 1090, top: 1229 },
    { name: "Olympic Express", short: "Olympic", kind: "High-speed quad", length: 860, bottom: 873, top: 1225 },
    { name: "Gondola (Skyride)", short: "Gondola", kind: "Gondola", bottom: 274, top: 1128, est: true },
    { name: "Greenway Chair", short: "Greenway", kind: "Fixed-grip quad", length: 203, bottom: 1091, top: 1109 },
    { name: "Screaming Eagle Express", short: "Screaming Eagle", kind: "High-speed quad", length: 1015, bottom: 905, top: 1106 },
  ],
  seymour: [
    { name: "Brockton Chair", short: "Brockton", kind: "Double chair", length: 700, bottom: 1125, top: 1265, est: true },
    { name: "Mystery Peak Express", short: "Mystery Peak", kind: "High-speed quad", length: 1066, bottom: 1020, top: 1240, est: true },
    { name: "Lodge Chair", short: "Lodge", kind: "Fixed-grip quad", length: 442, bottom: 935, top: 1020 },
  ],
  whistler: [
    { name: "7th Heaven Express", short: "7th Heaven", kind: "High-speed quad", length: 1683, bottom: 1660, top: 2240 },
    { name: "Showcase", short: "Showcase", kind: "Fixed-grip quad", length: 699, bottom: 2064, top: 2247 },
    { name: "Peak Express", short: "Peak", kind: "High-speed quad", length: 935, bottom: 1755, top: 2182 },
    { name: "Glacier Express", short: "Glacier", kind: "High-speed quad", length: 1768, bottom: 1544, top: 2142 },
    { name: "Harmony 6 Express", short: "Harmony", kind: "High-speed six", length: 1628, bottom: 1594, top: 2108 },
    { name: "Symphony Express", short: "Symphony", kind: "High-speed quad", length: 2056, bottom: 1530, top: 2015 },
    { name: "Jersey Cream Express", short: "Jersey Cream", kind: "High-speed six", length: 1347, bottom: 1543, top: 1898 },
    { name: "Peak 2 Peak Gondola", short: "Peak 2 Peak", kind: "Gondola", length: 4405, bottom: 1831, top: 1867 },
    { name: "Catskinner Express", short: "Catskinner", kind: "High-speed quad", length: 1121, bottom: 1521, top: 1849 },
    { name: "Blackcomb Gondola", short: "Blackcomb Gondola", kind: "Gondola", length: 3926, bottom: 685, top: 1843 },
    { name: "Emerald 6 Express", short: "Emerald", kind: "High-speed six", length: 1775, bottom: 1399, top: 1833 },
    { name: "Big Red Express", short: "Big Red", kind: "High-speed six", length: 2404, bottom: 1285, top: 1833 },
    { name: "Franz's Chair", short: "Franz's", kind: "Fixed-grip triple", length: 1154, bottom: 1577, top: 1833 },
    { name: "Whistler Village Gondola", short: "Village Gondola", kind: "Gondola", length: 4816, bottom: 675, top: 1820 },
    { name: "Crystal Ridge Express", short: "Crystal", kind: "High-speed quad", length: 1639, bottom: 1282, top: 1788 },
    { name: "Garbanzo Express", short: "Garbanzo", kind: "High-speed quad", length: 2046, bottom: 1021, top: 1676 },
    { name: "Excelerator Express", short: "Excelerator", kind: "High-speed quad", length: 1564, bottom: 1118, top: 1606 },
    { name: "Creekside Gondola", short: "Creekside", kind: "Gondola", length: 1953, bottom: 653, top: 1285 },
    { name: "Olympic Chair", short: "Olympic", kind: "Fixed-grip triple", length: 750, bottom: 1012, top: 1141 },
    { name: "Excalibur Gondola", short: "Excalibur", kind: "Gondola", length: 2152, bottom: 687, top: 1130 },
    { name: "Fitzsimmons Express", short: "Fitzsimmons", kind: "High-speed eight", length: 1727, bottom: 680, top: 1020 },
    { name: "Magic Chair", short: "Magic", kind: "Fixed-grip triple", length: 606, bottom: 684, top: 769 },
  ],
  sasquatch: [
    { name: "Sasquatch Triple", short: "Sasquatch", kind: "Fixed-grip triple", length: 1169, bottom: 979, top: 1317 },
    { name: "Yeti Cruiser Quad", short: "Yeti", kind: "Fixed-grip quad", length: 1001, bottom: 991, top: 1285 },
    { name: "Whistlepunk Double", short: "Whistlepunk", kind: "Double chair", length: 500, bottom: 1001, top: 1082 },
  ],
  manning: [
    { name: "Bear Chair", short: "Bear", kind: "Fixed-grip quad", length: 1184, bottom: 1466, top: 1785 },
    { name: "Blue Chair", short: "Blue", kind: "Double chair", length: 685, bottom: 1453, top: 1668 },
  ],
  baker: [
    { name: "Chair 8", short: "Chair 8", kind: "Fixed-grip quad", length: 1267, bottom: 1188, top: 1551 },
    { name: "Chair 1", short: "Chair 1", kind: "Fixed-grip quad", length: 991, bottom: 1291, top: 1512 },
    { name: "Chair 6", short: "Chair 6", kind: "Fixed-grip quad", length: 1080, bottom: 1120, top: 1486 },
    { name: "Chair 5", short: "Chair 5", kind: "Fixed-grip quad", length: 881, bottom: 1116, top: 1470 },
    { name: "Chair 2", short: "Chair 2", kind: "Fixed-grip quad", length: 630, bottom: 1241, top: 1326 },
    // Chairs 3 and 4 are one lift loading from either end, unloading in the middle.
    { name: "Chair 4", short: "Chair 4", kind: "Fixed-grip quad", length: 602, bottom: 1134, top: 1301 },
    { name: "Chair 3", short: "Chair 3", kind: "Fixed-grip quad", length: 295, bottom: 1238, top: 1299 },
    { name: "Chair 7", short: "Chair 7", kind: "Fixed-grip quad", length: 670, bottom: 1108, top: 1276 },
  ],
  "big-white": [
    { name: "Alpine T-bar", short: "Alpine T", kind: "T-bar", length: 1181, bottom: 1998, top: 2319 },
    { name: "Cliff Chair", short: "Cliff", kind: "Double chair", length: 594, bottom: 2060, top: 2267 },
    { name: "Falcon Chair", short: "Falcon", kind: "Double chair", length: 732, bottom: 2006, top: 2260 },
    { name: "Gem Lake Express", short: "Gem Lake", kind: "High-speed quad", length: 2329, bottom: 1511, top: 2214 },
    { name: "Powder Chair", short: "Powder", kind: "Fixed-grip quad", length: 882, bottom: 1860, top: 2155 },
    { name: "Bullet Express", short: "Bullet", kind: "High-speed quad", length: 1726, bottom: 1765, top: 2149 },
    { name: "Snow Ghost Express", short: "Snow Ghost", kind: "High-speed six", length: 1812, bottom: 1670, top: 2105 },
    { name: "Ridge Rocket Express", short: "Ridge Rocket", kind: "High-speed quad", length: 1756, bottom: 1670, top: 2095 },
    { name: "Black Forest Express", short: "Black Forest", kind: "High-speed quad", length: 1428, bottom: 1750, top: 2058 },
    { name: "Telus Park Chair", short: "Telus Park", kind: "Double chair", length: 665, bottom: 1829, top: 1984 },
    { name: "Lara's Gondola", short: "Lara's Gondola", kind: "Gondola", length: 585, bottom: 1673, top: 1766 },
    { name: "Plaza Chair", short: "Plaza", kind: "Fixed-grip quad", length: 579, bottom: 1669, top: 1764 },
  ],
  apex: [
    { name: "Quickdraw Express", short: "Quickdraw", kind: "High-speed quad", length: 1503, bottom: 1626, top: 2158 },
    { name: "Stocks Triple", short: "Stocks", kind: "Fixed-grip triple", length: 1332, bottom: 1615, top: 1958 },
    { name: "T-bar", short: "T-bar", kind: "T-bar", length: 636, bottom: 1688, top: 1870 },
  ],
  "silver-star": [
    { name: "Summit Express Gondola", short: "Gondola", kind: "Gondola", length: 1012, bottom: 1600, top: 1881 },
    { name: "Comet Express", short: "Comet", kind: "High-speed six", length: 1783, bottom: 1415, top: 1880 },
    { name: "Attridge Chair", short: "Attridge", kind: "Fixed-grip quad", length: 766, bottom: 1634, top: 1836 },
    { name: "Home Run T-bar", short: "Home Run", kind: "T-bar", length: 769, bottom: 1705, top: 1775 },
    { name: "Putnam Express", short: "Putnam", kind: "High-speed quad", length: 2055, bottom: 1147, top: 1705 },
    { name: "Silver Queen", short: "Silver Queen", kind: "Fixed-grip quad", length: 499, bottom: 1573, top: 1636 },
    { name: "Silver Woods Express", short: "Silver Woods", kind: "High-speed quad", length: 1185, bottom: 1274, top: 1627 },
  ],
  "sun-peaks": [
    { name: "West Bowl Express", short: "West Bowl", kind: "High-speed quad", length: 1504, bottom: 1787, top: 2084 },
    { name: "Burfield Quad", short: "Burfield", kind: "Fixed-grip quad", length: 2726, bottom: 1198, top: 2072 },
    { name: "Crystal Quad", short: "Crystal", kind: "Fixed-grip quad", length: 934, bottom: 1799, top: 2065 },
    { name: "Elevation", short: "Elevation", kind: "Fixed-grip quad", length: 1063, bottom: 1576, top: 1859 },
    { name: "Sunburst Express", short: "Sunburst", kind: "High-speed quad", length: 2288, bottom: 1261, top: 1852 },
    { name: "Sundance Express", short: "Sundance", kind: "High-speed quad", length: 1957, bottom: 1259, top: 1733 },
    { name: "Morrisey Express", short: "Morrisey", kind: "High-speed quad", length: 1767, bottom: 1282, top: 1665 },
    { name: "Orient", short: "Orient", kind: "Fixed-grip quad", length: 1032, bottom: 1281, top: 1545 },
  ],
  red: [
    { name: "Grey Mountain Chair", short: "Grey Mountain", kind: "Fixed-grip quad", length: 1653, bottom: 1449, top: 2025 },
    { name: "Motherlode Chair", short: "Motherlode", kind: "Fixed-grip triple", length: 1719, bottom: 1306, top: 2016 },
    { name: "Paradise Chair", short: "Paradise", kind: "Fixed-grip triple", length: 1021, bottom: 1615, top: 1949 },
    { name: "Red Chair", short: "Red", kind: "Double chair", length: 1101, bottom: 1159, top: 1567 },
    { name: "Topping Creek", short: "Topping Creek", kind: "Fixed-grip triple", length: 961, bottom: 1276, top: 1566 },
    { name: "Silverlode Chair", short: "Silverlode", kind: "Fixed-grip quad", length: 1178, bottom: 1168, top: 1380 },
    { name: "T-bar", short: "T-bar", kind: "T-bar", length: 628, bottom: 1168, top: 1310 },
  ],
  whitewater: [
    { name: "Raven", short: "Raven", kind: "Fixed-grip quad", length: 931, bottom: 1632, top: 2058 },
    { name: "Glory Ridge", short: "Glory Ridge", kind: "Fixed-grip triple", length: 1454, bottom: 1390, top: 2001 },
    { name: "Summit Chair", short: "Summit", kind: "Fixed-grip quad", length: 823, bottom: 1620, top: 1996 },
    { name: "Silver King Chair", short: "Silver King", kind: "Double chair", length: 718, bottom: 1633, top: 1893 },
  ],
  revelstoke: [
    { name: "The Stoke", short: "The Stoke", kind: "Fixed-grip quad", length: 1790, bottom: 1582, top: 2224 },
    { name: "The Ripper", short: "The Ripper", kind: "Fixed-grip quad", length: 1800, bottom: 1440, top: 1952 },
    { name: "Stellar", short: "Stellar", kind: "Fixed-grip quad", length: 417, bottom: 1600, top: 1757 },
    { name: "Revelation Gondola", short: "Gondola", kind: "Gondola", length: 3186, bottom: 515, top: 1690 },
  ],
  "kicking-horse": [
    { name: "Stairway to Heaven", short: "Stairway to Heaven", kind: "Fixed-grip quad", length: 1350, bottom: 2061, top: 2429 },
    { name: "Golden Eagle Express", short: "Golden Eagle", kind: "Gondola", length: 3201, bottom: 1190, top: 2350 },
    { name: "Pioneer Express", short: "Pioneer Express", kind: "High-speed quad", length: 2332, bottom: 1267, top: 2056 },
    { name: "Pioneer", short: "Pioneer", kind: "Double chair", length: 1360, bottom: 1309, top: 1820 },
    { name: "Catamount", short: "Catamount", kind: "Fixed-grip quad", length: 1463, bottom: 1265, top: 1607 },
  ],
  panorama: [
    { name: "Summit Quad", short: "Summit", kind: "Fixed-grip quad", length: 829, bottom: 2038, top: 2343 },
    { name: "Champagne Express", short: "Champagne", kind: "High-speed quad", length: 1844, bottom: 1516, top: 2140 },
    { name: "Sunbird", short: "Sunbird", kind: "Fixed-grip triple", length: 1190, bottom: 1186, top: 1591 },
    { name: "Mile 1 Express", short: "Mile 1", kind: "High-speed quad", length: 1367, bottom: 1177, top: 1536 },
    { name: "Discovery", short: "Discovery", kind: "Fixed-grip quad", length: 803, bottom: 1184, top: 1334 },
    { name: "Toby", short: "Toby", kind: "Double chair", length: 504, bottom: 1150, top: 1248 },
  ],
  kimberley: [
    { name: "Easter", short: "Easter", kind: "Fixed-grip triple", length: 955, bottom: 1532, top: 1909 },
    { name: "North Star Express", short: "North Star", kind: "High-speed quad", length: 2299, bottom: 1238, top: 1786 },
    { name: "Tamarack", short: "Tamarack", kind: "Double chair", length: 1021, bottom: 1331, top: 1679 },
  ],
  fernie: [
    { name: "Polar Peak Chair", short: "Polar Peak", kind: "Fixed-grip triple", length: 596, bottom: 1860, top: 2072 },
    { name: "White Pass Quad", short: "White Pass", kind: "Fixed-grip quad", length: 1069, bottom: 1549, top: 1900 },
    { name: "Timber Bowl Express Quad", short: "Timber Bowl", kind: "High-speed quad", length: 2548, bottom: 1082, top: 1703 },
    { name: "Great Bear Express Quad", short: "Great Bear", kind: "High-speed quad", length: 1538, bottom: 1233, top: 1651 },
    { name: "Boomerang", short: "Boomerang", kind: "Fixed-grip triple", length: 1129, bottom: 1150, top: 1620 },
    { name: "Elk Quad", short: "Elk", kind: "Fixed-grip quad", length: 1364, bottom: 1071, top: 1363 },
    { name: "Deer Chair", short: "Deer", kind: "Fixed-grip triple", length: 915, bottom: 1077, top: 1284 },
  ],
  castle: [
    { name: "Tamarack Chair", short: "Tamarack", kind: "Double chair", length: 897, bottom: 1857, top: 2236 },
    { name: "Stagecoach Express", short: "Stagecoach", kind: "High-speed quad", length: 1467, bottom: 1584, top: 2143 },
    { name: "T-Rex T-bar", short: "T-Rex", kind: "T-bar", length: 1259, bottom: 1419, top: 1931 },
    { name: "Sundance Triple Chair", short: "Sundance", kind: "Fixed-grip triple", length: 1111, bottom: 1414, top: 1872 },
    { name: "Huckleberry Triple Chair", short: "Huckleberry", kind: "Fixed-grip triple", length: 1430, bottom: 1413, top: 1729 },
    { name: "Green Chair", short: "Green", kind: "Double chair", length: 217, bottom: 1413, top: 1448 },
  ],
  nakiska: [
    { name: "Gold Chair", short: "Gold", kind: "Fixed-grip quad", length: 1362, bottom: 1794, top: 2245 },
    { name: "Silver Chair", short: "Silver", kind: "Fixed-grip quad", length: 1684, bottom: 1529, top: 1950 },
    { name: "Olympic Chair", short: "Olympic", kind: "Fixed-grip quad", length: 2145, bottom: 1530, top: 1923 },
    { name: "Bronze Chair", short: "Bronze", kind: "Double chair", length: 512, bottom: 1512, top: 1579 },
  ],
  norquay: [
    { name: "North American", short: "North American", kind: "Double chair", length: 844, bottom: 1713, top: 2080 },
    { name: "Mystic Express", short: "Mystic", kind: "High-speed quad", length: 944, bottom: 1639, top: 1984 },
    { name: "Spirit", short: "Spirit", kind: "Fixed-grip quad", length: 563, bottom: 1656, top: 1832 },
    { name: "Cascade", short: "Cascade", kind: "Fixed-grip quad", length: 483, bottom: 1687, top: 1817 },
  ],
  sunshine: [
    { name: "Great Divide Express Quad", short: "Great Divide", kind: "High-speed quad", length: 1660, bottom: 2256, top: 2683 },
    { name: "Goat's Eye Express Quad", short: "Goat's Eye", kind: "High-speed quad", length: 1441, bottom: 2021, top: 2565 },
    { name: "Tee Pee Town Luxury Express Quad", short: "Tee Pee Town", kind: "High-speed quad", length: 1272, bottom: 2167, top: 2540 },
    { name: "Super Angel Express", short: "Super Angel", kind: "High-speed six", length: 1530, bottom: 2167, top: 2532 },
    { name: "Standish Express Quad", short: "Standish", kind: "High-speed quad", length: 835, bottom: 2182, top: 2370 },
    { name: "Wawa Quad Chair", short: "Wawa", kind: "Fixed-grip quad", length: 717, bottom: 2169, top: 2326 },
    { name: "Strawberry Express Quad", short: "Strawberry", kind: "High-speed quad", length: 802, bottom: 2182, top: 2299 },
    { name: "Wolverine Express Quad", short: "Wolverine", kind: "High-speed quad", length: 1181, bottom: 2044, top: 2171 },
    { name: "Jackrabbit Quad", short: "Jackrabbit", kind: "Fixed-grip quad", length: 261, bottom: 2118, top: 2171 },
    { name: "Sunshine Village Gondola", short: "Gondola", kind: "Gondola", length: 4501, bottom: 1661, top: 2168 },
  ],
  "lake-louise": [
    { name: "Summit Chair", short: "Summit", kind: "Fixed-grip quad", length: 463, bottom: 2499, top: 2651 },
    { name: "Paradise Chair", short: "Paradise", kind: "Fixed-grip triple", length: 1002, bottom: 2179, top: 2543 },
    { name: "Top of the World Express", short: "Top of the World", kind: "High-speed six", length: 1083, bottom: 2095, top: 2502 },
    { name: "Pipestone Express", short: "Pipestone", kind: "High-speed six", length: 1806, bottom: 1893, top: 2498 },
    { name: "Ptarmigan", short: "Ptarmigan", kind: "Fixed-grip quad", length: 887, bottom: 2007, top: 2405 },
    { name: "Grizzly Express Gondola", short: "Grizzly Gondola", kind: "Gondola", length: 2760, bottom: 1650, top: 2384 },
    { name: "Richardson's Ridge Express", short: "Richardson's Ridge", kind: "High-speed quad", length: 1709, bottom: 2033, top: 2375 },
    { name: "Larch Express", short: "Larch", kind: "High-speed quad", length: 1375, bottom: 1988, top: 2345 },
    { name: "Glacier Express", short: "Glacier", kind: "High-speed quad", length: 1785, bottom: 1653, top: 2124 },
    { name: "Juniper Express", short: "Juniper", kind: "High-speed quad", length: 1045, bottom: 1662, top: 1896 },
  ],
  marmot: [
    { name: "Knob Quad", short: "Knob", kind: "Fixed-grip quad", length: 1003, bottom: 2143, top: 2496 },
    { name: "Paradise Quad", short: "Paradise", kind: "Fixed-grip quad", length: 1364, bottom: 1898, top: 2289 },
    { name: "Canadian Rockies Express Quad", short: "Canadian Rockies", kind: "High-speed quad", length: 2200, bottom: 1739, top: 2275 },
    { name: "Eagle Ridge Quad", short: "Eagle Ridge", kind: "Fixed-grip quad", length: 1065, bottom: 1967, top: 2259 },
    { name: "Eagle Express Quad", short: "Eagle", kind: "High-speed quad", length: 1159, bottom: 1739, top: 2036 },
    { name: "School House Chair", short: "School House", kind: "Fixed-grip triple", length: 537, bottom: 1743, top: 1855 },
  ],
  "mt-washington": [
    { name: "Eagle Express", short: "Eagle", kind: "High-speed quad", length: 1294, bottom: 1182, top: 1588 },
    { name: "Whiskey Jack Chair", short: "Whiskey Jack", kind: "Fixed-grip triple", length: 1066, bottom: 1179, top: 1480 },
    { name: "Sunrise Quad", short: "Sunrise", kind: "Fixed-grip quad", length: 1248, bottom: 1089, top: 1463 },
    { name: "Hawk Express", short: "Hawk", kind: "High-speed six", length: 1402, bottom: 1106, top: 1415 },
    { name: "Boomerang", short: "Boomerang", kind: "Fixed-grip quad", length: 1212, bottom: 1146, top: 1367 },
  ],
  "mt-cain": [
    { name: "Upper T-bar", short: "Upper T", kind: "T-bar", length: 640, bottom: 1381, top: 1615 },
    { name: "Lower T-bar", short: "Lower T", kind: "T-bar", length: 866, bottom: 1192, top: 1385 },
  ],
};
