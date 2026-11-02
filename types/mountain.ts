export interface MountainReport {
  id: 'cypress' | 'grouse' | 'seymour';
  name: string;
  elevation: {
    base: number; // in meters (e.g., Cypress: 910m, Grouse: 274m/Chalet 1128m, Seymour: 935m)
    summit: number; // Cypress: 1440m, Grouse: 1250m, Seymour: 1265m
  };
  snowfall: {
    new24h: number; // in cm
    new48h: number;
    baseDepth: number;
  };
  temperatures: {
    base: number;
    summit?: number;
  };
  operations: {
    liftsOpen: number;
    liftsTotal: number;
    runsOpen: number;
    runsTotal: number;
    nightSkiing: boolean;
  };
  webcams: Array<{
    name: string;
    imageUrl: string;
    streamUrl?: string;
  }>;
  lastUpdated: string;
}