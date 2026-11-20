// Automated weather stations near the backcountry zones, from Avalanche Canada's
// public station feed (https://avalanche.ca/api-docs). Ids, heights and positions
// are as the feed lists them (checked 2026-11-14, Rockies and Rogers Pass 2026-11-16).
// Parks Canada's stations report a relative humidity of 0 where they have no
// sensor, so humidity from them isn't usable.

export interface StationConfig {
  id: number; // Avalanche Canada station id
  name: string;
  elevation: number; // m
  lat: number;
  lon: number;
  where: string; // where it sits relative to the zone, so readings can be judged
  source: StationSource; // who runs it, for the credit line
}

export type StationSource = "BC Ministry of Transportation and Infrastructure" | "Parks Canada" | "Kananaskis Country";
const MOTI: StationSource = "BC Ministry of Transportation and Infrastructure";

export const STATIONS: StationConfig[] = [
  { id: 11, name: "Mt. Strachan", elevation: 1420, lat: 49.41003, lon: -123.19636, where: "Cypress, near the summit", source: MOTI },
  { id: 10, name: "Mt. Strachan Precip", elevation: 1220, lat: 49.40431, lon: -123.19144, where: "Cypress, lower on the mountain", source: MOTI },
  { id: 71, name: "Brandywine", elevation: 496, lat: 50.05417, lon: -123.11806, where: "Highway 99, valley floor", source: MOTI },
  { id: 74, name: "Cayoosh Summit", elevation: 1250, lat: 50.37978, lon: -122.47403, where: "Highway 99 at the pass", source: MOTI },
  { id: 20, name: "Blowdown Mid", elevation: 1890, lat: 50.40222, lon: -122.26472, where: "Blowdown Pass area, 15 km east", source: MOTI },
  { id: 19, name: "Blowdown Peak", elevation: 2320, lat: 50.40694, lon: -122.25556, where: "Blowdown Pass area, 15 km east, exposed peak", source: MOTI },
  { id: 15, name: "Coquihalla Summit", elevation: 1230, lat: 49.5941, lon: -121.09948, where: "Highway 5 at the pass", source: MOTI },
  { id: 17, name: "Little Bear", elevation: 1660, lat: 49.59924, lon: -121.17801, where: "6 km west of the pass, sheltered", source: MOTI },
  { id: 16, name: "Great Bear", elevation: 1710, lat: 49.59582, lon: -121.17805, where: "6 km west of the pass", source: MOTI },
  { id: 91, name: "Abbott", elevation: 2130, lat: 51.25187, lon: -117.51148, where: "Abbott Ridge, 5 km south of the pass", source: "Parks Canada" },
  { id: 96, name: "MacDonald West Shoulder", elevation: 1930, lat: 51.30088, lon: -117.48084, where: "Mt. Macdonald, 3 km east of the pass", source: "Parks Canada" },
  { id: 95, name: "Hermit", elevation: 1905, lat: 51.32911, lon: -117.52218, where: "Hermit Meadows, 3 km north of the pass", source: "Parks Canada" },
  { id: 93, name: "Fidelity", elevation: 1905, lat: 51.23438, lon: -117.70097, where: "Mt. Fidelity study plot, 14 km west", source: "Parks Canada" },
  { id: 98, name: "Rogers Pass", elevation: 1315, lat: 51.30042, lon: -117.51551, where: "At the pass, valley floor", source: "Parks Canada" },
  { id: 1, name: "Burstall Pass", elevation: 2300, lat: 50.75818, lon: -115.36667, where: "Burstall Pass, near treeline", source: "Kananaskis Country" },
  { id: 5, name: "Highwood Pass", elevation: 2250, lat: 50.59862, lon: -114.98721, where: "Highway 40 at the pass, 30 km southeast", source: "Kananaskis Country" },
  { id: 3, name: "Mud Lake", elevation: 1900, lat: 50.79417, lon: -115.30714, where: "Smith-Dorrien valley at the Burstall trailhead", source: "Kananaskis Country" },
  { id: 113, name: "Vulture Peak", elevation: 2930, lat: 51.6244, lon: -116.47188, where: "Wapta Icefield, exposed alpine", source: "Parks Canada" },
  { id: 112, name: "Bow Summit", elevation: 2040, lat: 51.70937, lon: -116.47904, where: "Highway 93 at Bow Summit", source: "Parks Canada" },

  // Snow sensors beside ski hills, for a hill's snow depth when its resort has no
  // report (see snowStation in config/mountains.ts). Each is within about 12 km of
  // the hill and no more than about 150 m below its lowest lift (checked 2026-11-19).
  { id: 14, name: "Apex Roadside", elevation: 1750, lat: 49.39693, lon: -119.9008, where: "Apex Mountain Road, by the village", source: MOTI },
  { id: 22, name: "Southridge", elevation: 1990, lat: 49.41778, lon: -117.16111, where: "Ridge above Whitewater, 3 km away", source: MOTI },
  { id: 122, name: "Sunshine", elevation: 2200, lat: 51.078358, lon: -115.782455, where: "Sunshine Village", source: "Parks Canada" },
  { id: 130, name: "Morrissey High", elevation: 1998, lat: 49.3725, lon: -115.046944, where: "Morrissey Ridge, 10 km south of Fernie", source: MOTI },
  { id: 73, name: "Allison Pass", elevation: 1340, lat: 49.11564, lon: -120.86744, where: "Highway 3 at the pass, 6 km from the lifts", source: MOTI },
  { id: 30, name: "Toby Creek", elevation: 1180, lat: 50.45147, lon: -116.25674, where: "Toby Creek road at the base of Panorama", source: MOTI },
  { id: 75, name: "Strawberry Pass", elevation: 1575, lat: 49.20444, lon: -117.89664, where: "Highway 3B at the pass, 12 km from RED", source: MOTI },
];

export const stationById = (id: number) => STATIONS.find((s) => s.id === id);
