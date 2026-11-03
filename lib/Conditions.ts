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
    text: "text-[#7dd3fc]",
    chip: "bg-[#7dd3fc]/15 text-[#7dd3fc]",
    dot: "bg-[#7dd3fc]",
    band: "bg-[#7dd3fc]/10",
  },
  mixed: {
    label: "Wet snow",
    text: "text-[#c4b5fd]",
    chip: "bg-[#c4b5fd]/15 text-[#c4b5fd]",
    dot: "bg-[#c4b5fd]",
    band: "bg-[#c4b5fd]/10",
  },
  rain: {
    label: "Rain",
    text: "text-[#4f8bff]",
    chip: "bg-[#4f8bff]/15 text-[#4f8bff]",
    dot: "bg-[#4f8bff]",
    band: "bg-[#4f8bff]/10",
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
  dry: { label: "Dry", chip: "bg-white/10 text-[#d4d4d4]", dot: "bg-[#d4d4d4]" },
  clear: {
    label: "Clear",
    chip: "bg-[#f2c94c]/15 text-[#f2c94c]",
    dot: "bg-[#f2c94c]",
  },
  partly: {
    label: "Partly cloudy",
    chip: "bg-[#b8c4d0]/15 text-[#b8c4d0]",
    dot: "bg-[#b8c4d0]",
  },
  cloudy: {
    label: "Cloudy",
    chip: "bg-[#8c99a6]/20 text-[#aab6c2]",
    dot: "bg-[#8c99a6]",
  },
  fog: {
    label: "Fog",
    chip: "bg-[#c4b8a8]/15 text-[#c4b8a8]",
    dot: "bg-[#c4b8a8]",
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