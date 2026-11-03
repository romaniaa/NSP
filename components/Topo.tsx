import { MOUNTAINS } from "@/config/mountains";

const LEVELS = 9;
const STEPS = 96;
const MAX_RADIUS = 175;

// One closed contour line: a circle wobbled by a few sine waves. Lines around the
// same summit share a seed and only differ in radius, so they never cross.
function contour(cx: number, cy: number, radius: number, seed: number) {
  const points = Array.from({ length: STEPS }, (_, i) => {
    const a = (i / STEPS) * Math.PI * 2;
    const r =
      radius *
      (1 +
        0.16 * Math.sin(3 * a + seed) +
        0.08 * Math.sin(5 * a + seed * 2) +
        0.04 * Math.sin(9 * a + seed * 3));
    return `${(cx + r * Math.cos(a)).toFixed(1)} ${(cy + r * Math.sin(a) * 0.8).toFixed(1)}`;
  });
  return `M${points.join("L")}Z`;
}

// Decorative contour map behind the page, with one summit per mountain from west to east.
export default function Topo() {
  return (
    <svg
      viewBox="0 0 1500 560"
      preserveAspectRatio="xMidYMin slice"
      className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[560px] w-full [mask-image:linear-gradient(to_bottom,black_30%,transparent)]"
      aria-hidden="true"
    >
      {MOUNTAINS.map((m, i) => (
        <g key={m.id} fill="none" stroke={m.color} strokeOpacity="0.16">
          {Array.from({ length: LEVELS }, (_, level) => (
            <path
              key={level}
              d={contour(
                300 + i * 450,
                170 + (i % 2) * 70,
                (MAX_RADIUS * (level + 1)) / LEVELS,
                i * 2.1 + 0.7
              )}
            />
          ))}
        </g>
      ))}
    </svg>
  );
}
