// Avalanche forecast shapes and danger-scale helpers. No server imports, so
// cards rendered in the browser can use them (lib/Avalanche.ts fetches the
// forecasts and re-exports these).

// North American Public Avalanche Danger Scale.
export type DangerLevel = "low" | "moderate" | "considerable" | "high" | "extreme";
export const DANGER_LEVELS: DangerLevel[] = ["low", "moderate", "considerable", "high", "extreme"];

export interface Danger {
  value: string; // a DangerLevel, or "earlyseason", "norating", "noforecast", "spring"…
  display: string; // as Avalanche Canada words it
}

export interface DangerDay {
  date: string; // ISO, start of the day the rating is for
  label: string; // e.g. "Saturday"
  alp: Danger; // alpine
  tln: Danger; // treeline
  btl: Danger; // below treeline
}

export interface Problem {
  type: string; // e.g. "Wind Slab"
  elevations: string[]; // e.g. ["Alpine", "Treeline"]
  aspects: string[]; // e.g. ["North", "Northeast"]
  likelihood: string | null; // e.g. "likely"
  size: { min: string; max: string } | null; // destructive size range
}

export type AvalancheForecast =
  | {
      status: "ok";
      title: string;
      owner: string; // e.g. "Avalanche Canada" or "Parks Canada"
      url: string; // the full forecast
      issued: string; // ISO
      validUntil: string; // ISO
      days: DangerDay[]; // today first, ratings from today on
      // When no current day carries a rating: the forecast's status instead, as
      // Avalanche Canada words it, e.g. "Early Season" or "No Rating".
      note: string | null;
      problems: Problem[];
    }
  // No current forecast covers this zone (none issued, or the last one expired).
  | { status: "none"; url: string };

// Ratings that sit on the danger scale, as opposed to "early season" and the like.
export const isRated = (d: Danger): d is Danger & { value: DangerLevel } =>
  (DANGER_LEVELS as string[]).includes(d.value);

// Highest rated danger across the bands for a day, or null if none is rated.
export function highestDanger(day: DangerDay): DangerLevel | null {
  const rated = [day.alp, day.tln, day.btl].filter(isRated).map((d) => d.value);
  if (rated.length === 0) return null;
  return rated.reduce((a, b) => (DANGER_LEVELS.indexOf(b) > DANGER_LEVELS.indexOf(a) ? b : a));
}
