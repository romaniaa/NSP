import type { MountainId } from "@/config/mountains";

// Silhouettes drawn from each mountain's real shape, on a 24 x 18 grid.
const PATHS: Record<MountainId, string[]> = {
  // Twin summits of Mt. Strachan.
  cypress: ["M0 18 7 5.5l3.2 5L15.5 1 24 18Z"],
  // A single steep peak with an eastern shoulder.
  grouse: ["M0 18 13 1l3.8 5.2 2.2-.7L24 18Z"],
  // The three rounded domes of the First, Second and Third Pumps.
  seymour: [
    "M0 18v-2c2-6 5-7.5 7-5 1.5-4.5 4.5-6 6.5-3 1.5-5 5.5-6.5 7.5-2 1.5 4 2.5 8 3 12Z",
  ],
};

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
      {PATHS[id].map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}
