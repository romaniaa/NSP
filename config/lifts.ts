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
};
