// Automated weather stations near the backcountry zones, from Avalanche Canada's
// public station feed (https://avalanche.ca/api-docs). All are run by the BC
// Ministry of Transportation and Infrastructure. Ids, heights and positions are
// as the feed lists them (checked 2026-11-14).

export interface StationConfig {
  id: number; // Avalanche Canada station id
  name: string;
  elevation: number; // m
  lat: number;
  lon: number;
  where: string; // where it sits relative to the zone, so readings can be judged
}

export const STATIONS: StationConfig[] = [
  { id: 11, name: "Mt. Strachan", elevation: 1420, lat: 49.41003, lon: -123.19636, where: "Cypress, near the summit" },
  { id: 10, name: "Mt. Strachan Precip", elevation: 1220, lat: 49.40431, lon: -123.19144, where: "Cypress, lower on the mountain" },
  { id: 71, name: "Brandywine", elevation: 496, lat: 50.05417, lon: -123.11806, where: "Highway 99, valley floor" },
  { id: 74, name: "Cayoosh Summit", elevation: 1250, lat: 50.37978, lon: -122.47403, where: "Highway 99 at the pass" },
  { id: 20, name: "Blowdown Mid", elevation: 1890, lat: 50.40222, lon: -122.26472, where: "Blowdown Pass area, 15 km east" },
  { id: 19, name: "Blowdown Peak", elevation: 2320, lat: 50.40694, lon: -122.25556, where: "Blowdown Pass area, 15 km east, exposed peak" },
  { id: 15, name: "Coquihalla Summit", elevation: 1230, lat: 49.5941, lon: -121.09948, where: "Highway 5 at the pass" },
  { id: 17, name: "Little Bear", elevation: 1660, lat: 49.59924, lon: -121.17801, where: "6 km west of the pass, sheltered" },
  { id: 16, name: "Great Bear", elevation: 1710, lat: 49.59582, lon: -121.17805, where: "6 km west of the pass" },
];

export const stationById = (id: number) => STATIONS.find((s) => s.id === id);
