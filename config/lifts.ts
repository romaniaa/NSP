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
};
