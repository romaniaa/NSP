import type { MountainId } from "@/config/mountains";

// Silhouettes drawn from each mountain's real shape, on a 24 x 18 grid. The
// Cypress, Grouse and Seymour ones are hand drawn. The others are terrain profiles
// sampled from Open-Meteo's 90 m elevation model along a line through each hill's
// named peaks, then simplified. Hills without one get a plain peak rather than an
// invented likeness.
const PATHS: Partial<Record<MountainId, string[]>> = {
  // Twin summits of Mt. Strachan.
  cypress: ["M0 18 7 5.5l3.2 5L15.5 1 24 18Z"],
  // A single steep peak with an eastern shoulder.
  grouse: ["M0 18 13 1l3.8 5.2 2.2-.7L24 18Z"],
  // The three rounded domes of the First, Second and Third Pumps.
  seymour: [
    "M0 18v-2c2-6 5-7.5 7-5 1.5-4.5 4.5-6 6.5-3 1.5-5 5.5-6.5 7.5-2 1.5 4 2.5 8 3 12Z",
  ],
  // Whistler Mountain and Blackcomb Peak either side of Fitzsimmons Creek.
  whistler: ["M0 18L0 12.4L5.4 4.1L6.7 7.3L7.8 6.7L10 10.9L11.6 11.8L13.8 18L16.4 10.4L19.1 7L20.5 1L22.1 3L23.2 1.8L24 3.1L24 18Z"],
  // From Hemlock Valley up past both lift tops toward Mount Klaudt.
  sasquatch: ["M0 18L0 18L4.6 4.9L6 7.6L7.5 6.5L9.3 8.3L12 4L14.8 11.4L24 1L24 18Z"],
  // Mara Peak and the Bear Chair summit either side of the Gibson Pass dip.
  manning: ["M0 18L0 2L1.6 4.7L2 3.4L3.3 4.1L4.5 7.4L4.9 5.9L8.5 17.5L9.8 18L11.8 14L13 5.6L15.9 1L19.1 9.8L20.7 9L22 2.2L23.6 3.5L24 6.4L24 18Z"],
  // The ski area's low ridges with Mt. Shuksan rising behind them to the east.
  baker: ["M0 18L0 16.7L2.2 18L4.3 15.2L5.4 16.8L6.5 14.3L8.1 15.5L10.5 13.3L12.4 15.2L12.9 13.7L15.1 14.3L17.5 11.3L20.5 1L24 5.2L24 18Z"],
};

const GENERIC = ["M0 18 12 2l12 16Z"];

export default function MountainIcon({
  id,
  color,
  className = "",
}: {
  id: MountainId;
  color: string;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 18"
      fill={color}
      className={`shrink-0 ${className}`}
      aria-hidden="true"
    >
      {(PATHS[id] ?? GENERIC).map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}
