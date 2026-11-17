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
  // The rest: terrain profiles along each ski area's main ridge, through its
  // highest lift top (see config/mountains.ts).
  "big-white": ["M0 18L0 11.4L3.3 8.7L5.7 4.9L6.1 3L6.9 3.1L8.1 5.2L9.8 1.4L10.6 1L11.4 1.4L13.4 6.5L13.8 6L15.5 7.1L20.7 15.4L24 18L24 18Z"],
  apex: ["M0 18L0 9.1L2.4 8.2L4.5 9.1L7.7 2.4L11 1L13 7.8L15.5 11.8L16.3 9.6L16.7 9.9L20.7 18L23.2 11.5L24 12.1L24 18Z"],
  "silver-star": ["M0 18L0 18L2.8 14.4L3.3 15.2L6.5 9.4L7.7 5.8L8.1 6.4L8.9 5.5L10.6 1.4L11.8 1L14.2 3.7L17.9 6.1L19.9 9L21.2 9.4L24 17.4L24 18Z"],
  "sun-peaks": ["M0 18L0 3L0.8 1.9L2.8 1.8L3.7 1L4.9 1.9L5.7 1.2L9.4 7.5L10.6 11L11.4 12.1L11.8 11.5L15.1 18L16.3 17.2L18.3 11.2L24 10.7L24 18Z"],
  red: ["M0 18L0 8.5L2.4 3.7L4.1 2.6L6.1 3.3L7.7 1L11 9.4L12.6 11.6L15.5 6.9L16.7 2.7L22.4 18L24 14.9L24 18Z"],
  whitewater: ["M0 18L0 18L2 13L4.1 10.6L6.5 2.9L10.2 9.6L11.4 15L12.2 15.3L17.1 1L19.9 11.3L21.6 9.7L24 3.9L24 18Z"],
  revelstoke: ["M0 18L0 18L7.7 9.4L11.4 7.4L15.5 4L17.1 1.8L19.1 1L19.5 1.6L22 1.4L24 4.8L24 18Z"],
  "kicking-horse": ["M0 18L0 13.9L4.1 9.6L7.7 2L8.9 1.1L11 4.3L11.4 3.7L11.8 4.5L12.2 4L13.4 4.7L15.1 7.1L16.7 7.9L19.5 13.1L24 18L24 18Z"],
  panorama: ["M0 18L0 18L3.7 14.6L8.5 7.6L11.8 5.2L13.8 2.2L16.7 4.7L17.1 3.9L18.3 3.5L18.7 4.2L19.9 3.5L22 1.1L24 1.3L24 18Z"],
  kimberley: ["M0 18L0 11.8L0.4 10.1L2 9.5L5.3 3.9L6.9 3.3L8.9 1L11 2.9L13.4 7.3L14.2 6L15.1 6L17.1 7.7L21.2 14.6L24 18L24 18Z"],
  fernie: ["M0 18L0 18L1.6 12.4L2.8 13.8L3.7 13.5L4.5 10.2L4.9 12.1L5.3 9L6.1 8L6.5 8.8L6.9 7.7L8.1 7.2L8.5 4.8L11.4 1L12.6 6.9L13.4 7.4L14.6 6L15.1 4.3L15.9 4.9L16.7 3.2L17.1 3.7L20.7 13.7L22 14L24 7.8L24 18Z"],
  castle: ["M0 18L0 18L4.5 6.1L5.7 5L6.9 5.2L8.9 1L11 3.7L14.2 11.8L15.5 12.1L16.7 11L17.9 3.7L19.9 6.8L21.6 4.4L24 11.1L24 18Z"],
  nakiska: ["M0 18L0 12.3L2.4 7.6L3.7 7.1L5.3 2.2L5.7 2.7L6.9 1L8.1 1.4L9.8 6.6L13.4 12.9L19.1 16.6L19.9 18L21.2 15.8L22.8 15.3L24 15.9L24 18Z"],
  norquay: ["M0 18L0 11.4L0.8 11.5L2.4 13.6L4.1 11.7L6.5 6.3L7.7 6.2L8.5 7L10.6 3.6L11.4 4.7L11.8 4.4L12.6 1.6L13.4 3.1L14.6 1L15.5 3.6L16.3 3.3L17.1 4.4L17.5 3.6L18.7 5.5L22 15.7L23.2 16.3L24 18L24 18Z"],
  sunshine: ["M0 18L0 18L1.2 17L4.9 16.2L8.5 13.7L13.4 4.8L14.6 6.7L15.5 6.8L16.3 4.4L17.5 4.9L18.3 6.9L19.5 3.9L20.7 7.6L22.4 4.6L23.2 1L24 2.2L24 18Z"],
  "lake-louise": ["M0 18L0 7.6L2 1.9L3.3 1L5.7 4.9L7.3 5.1L7.7 5.9L8.5 4.5L9.8 7.8L11 8.9L11.4 8.3L12.2 8.9L13.4 14.5L14.6 17.7L15.5 18L19.1 13.9L24 3.1L24 18Z"],
  marmot: ["M0 18L0 3.9L2 8.9L4.1 10.8L5.3 9.6L6.1 5.9L8.5 1.4L10.6 1L12.6 4.3L14.2 1.8L18.3 12L20.7 16.3L22.4 18L24 16.2L24 18Z"],
  "mt-washington": ["M0 18L0 14.4L5.7 8.8L7.3 6.1L8.5 5.9L10.2 4.6L11.4 1L14.6 8.2L15.9 4.3L17.1 4.2L17.9 5L19.5 9.8L21.6 12.3L22.4 16.3L24 18L24 18Z"],
  "mt-cain": ["M0 18L0 18L4.1 16L6.5 12.4L10.2 10.8L14.6 3L16.7 1L17.1 2L17.5 1.4L19.1 6.1L19.5 5.4L20.3 6.9L22.8 12.7L24 17.7L24 18Z"],
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
