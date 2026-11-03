export type MountainId = "cypress" | "grouse" | "seymour";

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
export const MOUNTAINS: MountainConfig[] = [
  {
    id: "cypress",
    name: "Cypress",
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
];
