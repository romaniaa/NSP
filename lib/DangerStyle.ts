import type { DangerLevel } from "@/lib/Avalanche";

// Kept apart from lib/Avalanche.ts (which uses server-only caching) so client
// components such as the nav drawer can use it.
// Colours of the North American Public Avalanche Danger Scale, so ratings read the
// way they do on Avalanche Canada's own forecasts. Full class strings for Tailwind.
export const DANGER_STYLE: Record<DangerLevel, { cell: string; chip: string; label: string }> = {
  low: { cell: "bg-[#52ba4a] text-black", chip: "bg-[#52ba4a] text-black", label: "1 · Low" },
  moderate: { cell: "bg-[#fff300] text-black", chip: "bg-[#fff300] text-black", label: "2 · Moderate" },
  considerable: {
    cell: "bg-[#f79218] text-black",
    chip: "bg-[#f79218] text-black",
    label: "3 · Considerable",
  },
  high: { cell: "bg-[#ef1c29] text-white", chip: "bg-[#ef1c29] text-white", label: "4 · High" },
  extreme: {
    cell: "bg-[#1a1a1a] text-white outline outline-2 -outline-offset-2 outline-[#ef1c29]",
    chip: "bg-[#1a1a1a] text-white outline outline-1 outline-[#ef1c29]",
    label: "5 · Extreme",
  },
};
