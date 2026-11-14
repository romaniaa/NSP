// Generic mark for backcountry zones: a range of two peaks with a snow cap, on
// the same 24 x 18 grid as the hill silhouettes in MountainIcon. Zones cover many
// peaks, so none is drawn as a likeness.
export default function RangeIcon({
  color,
  className = "",
}: {
  color: string;
  className?: string;
}) {
  return (
    <svg viewBox="0 0 24 18" className={`shrink-0 ${className}`} aria-hidden="true">
      {/* Far peak, fainter. */}
      <path d="M7 18 16 2l8 16Z" fill={color} fillOpacity="0.5" />
      {/* Near peak. */}
      <path d="M0 18 8.5 5 17 18Z" fill={color} />
      {/* Snow on the near summit. */}
      <path d="M8.5 5 11.1 9 9.8 8.4 8.5 9.6 7.2 8.4 5.9 9Z" fill="#e6edf3" fillOpacity="0.9" />
    </svg>
  );
}
