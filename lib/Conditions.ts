import type { MountainConfig } from "@/config/mountains";

// Snow tends to survive a bit below the 0°C level; this is an estimate, not a measurement.
export const SNOW_LINE_OFFSET = 150;

export type Precip = "snow" | "mixed" | "rain";

// Snow = ice blue, wet snow = lilac, rain = blue. Change the three hex values here to recolour everything.
// Full class strings so Tailwind can see them.
export const PRECIP: Record<
  Precip,
  { label: string; text: string; chip: string; dot: string; band: string }
> = {
  snow: {
    label: "Snow",
    text: "text-frost",
    chip: "bg-frost/15 text-frost",
    dot: "bg-frost",
    band: "bg-frost/10",
  },
  mixed: {
    label: "Wet snow",
    text: "text-wet",
    chip: "bg-wet/15 text-wet",
    dot: "bg-wet",
    band: "bg-wet/10",
  },
  rain: {
    label: "Rain",
    text: "text-rain",
    chip: "bg-rain/15 text-rain",
    dot: "bg-rain",
    band: "bg-rain/10",
  },
};

// Below this rate (mm/h) we call it dry.
export const PRECIP_THRESHOLD = 0.1;

export type Condition = Precip | "dry" | "clear" | "partly" | "cloudy" | "fog";

export interface Sky {
  precipitation: number; // mm/h
  cloud: number | null; // % total cloud cover, null if the model didn't provide it
  code: number | null; // WMO weather code, null if unavailable
}

export const CONDITION: Record<
  Condition,
  { label: string; chip: string; dot: string }
> = {
  snow: PRECIP.snow,
  mixed: PRECIP.mixed,
  rain: PRECIP.rain,
  dry: { label: "Dry", chip: "bg-ink/10 text-ink-2", dot: "bg-ink-2" },
  clear: {
    label: "Clear",
    chip: "bg-sun/15 text-sun",
    dot: "bg-sun",
  },
  partly: {
    label: "Partly cloudy",
    chip: "bg-partly/15 text-partly",
    dot: "bg-partly",
  },
  cloudy: {
    label: "Cloudy",
    chip: "bg-cloud/20 text-cloud",
    dot: "bg-cloud",
  },
  fog: {
    label: "Fog",
    chip: "bg-fog/15 text-fog",
    dot: "bg-fog",
  },
};

export function precipAt(elevation: number, freezingLevel: number): Precip {
  if (elevation >= freezingLevel) return "snow";
  if (elevation >= freezingLevel - SNOW_LINE_OFFSET) return "mixed";
  return "rain";
}

export function extremes(config: MountainConfig) {
  return {
    low: config.lifts.bottom.elevation,
    high: config.lifts.top.elevation,
  };
}

export function verdict(
  config: MountainConfig,
  freezingLevel: number,
  sky?: Sky
) {
  const { low, high } = extremes(config);

  if (sky && sky.precipitation < PRECIP_THRESHOLD) {
    const c = conditionAt(high, freezingLevel, sky);
    return c === "dry" ? "Dry" : `Dry · ${CONDITION[c].label.toLowerCase()}`;
  }

  const lo = precipAt(low, freezingLevel);
  const hi = precipAt(high, freezingLevel);

  if (lo === hi) {
    return {
      snow: "Snow all the way down",
      mixed: "Wet snow throughout",
      rain: "Rain all the way up",
    }[lo];
  }
  if (hi === "snow") return `Snow above ${freezingLevel} m`;
  return "Wet snow at the top, rain below";
}

export function vertical(config: MountainConfig) {
  const { low, high } = extremes(config);
  return high - low;
}

// Id of the mountain whose top lift is highest.
export function tallestId(configs: MountainConfig[]) {
  return configs.reduce((a, b) =>
    extremes(b).high > extremes(a).high ? b : a
  ).id;
}

export function fmt(n: number) {
  return n.toLocaleString("en-CA");
}

// What is happening at an elevation right now: precipitation type if it's precipitating,
// otherwise the sky. Without `sky` it falls back to the precipitation type alone.
export function conditionAt(
  elevation: number,
  freezingLevel: number,
  sky?: Sky
): Condition {
  if (!sky || sky.precipitation >= PRECIP_THRESHOLD) {
    return precipAt(elevation, freezingLevel);
  }
  if (sky.code === 45 || sky.code === 48) return "fog";
  if (sky.cloud == null) return "dry";
  if (sky.cloud < 20) return "clear";
  if (sky.cloud < 60) return "partly";
  return "cloudy";
}