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

export function verdict(config: MountainConfig, freezingLevel: number) {
  const { low, high } = extremes(config);
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