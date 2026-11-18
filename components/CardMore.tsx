// The footer of a card that links to a place's page, so it reads as a link even
// on touch screens, where the hover lift never shows. A dotted trail runs from
// the label to a round arrow; on hover, focus or tap the route draws in along it
// in the place's colour (--accent, set by the card's link) and the arrow fills.
// The card's link is the `group`; this adds no link of its own.
export default function CardMore({ label = "Full report" }: { label?: string }) {
  return (
    <div className="mt-auto pt-4">
      <div className="flex items-center gap-3">
        <span className="font-display text-sm font-semibold uppercase tracking-[0.18em] text-[#c9d3dd] transition-colors group-hover:text-white group-focus-visible:text-white">
          {label}
        </span>
        <span
          aria-hidden="true"
          className="relative h-0.5 flex-1 bg-[repeating-linear-gradient(90deg,#3a4550_0_4px,transparent_4px_9px)]"
        >
          <span className="absolute inset-0 origin-left scale-x-0 bg-[var(--accent)] transition-transform duration-500 ease-out group-hover:scale-x-100 group-focus-visible:scale-x-100 group-active:scale-x-100 motion-reduce:transition-none" />
        </span>
        <span
          aria-hidden="true"
          className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-[#3a4550] bg-[#1a2026] text-[var(--accent)] transition duration-300 group-hover:translate-x-1 group-hover:border-[var(--accent)] group-hover:bg-[var(--accent)] group-hover:text-[#0a0d10] group-focus-visible:border-[var(--accent)] group-focus-visible:bg-[var(--accent)] group-focus-visible:text-[#0a0d10] group-active:border-[var(--accent)] group-active:bg-[var(--accent)] group-active:text-[#0a0d10] motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
        >
          <svg
            viewBox="0 0 16 16"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 8h10M9 4l4 4-4 4" />
          </svg>
        </span>
      </div>
    </div>
  );
}
