"use client";

import type { CSSProperties } from "react";
import { useDashboard } from "@/components/useDashboard";

const Arrow = ({ flip = false }: { flip?: boolean }) => (
  <svg
    viewBox="0 0 16 16"
    className={`h-4 w-4 ${flip ? "rotate-180" : ""}`}
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M13 8H3M7 4 3 8l4 4" />
  </svg>
);

// Move and remove controls under a dashboard card, as small glass orbs. The
// dashboard's CSS shows them only in edit mode.
export default function CardActions({ id, name }: { id: string; name: string }) {
  const { ids, move, remove } = useDashboard();
  const i = ids.indexOf(id);

  return (
    <div className="card-actions mt-3 flex items-center gap-2">
      <button
        type="button"
        className="orb orb-sm"
        disabled={i <= 0}
        onClick={() => move(id, -1)}
        aria-label={`Move ${name} earlier`}
        title="Move earlier"
      >
        <Arrow />
      </button>
      <button
        type="button"
        className="orb orb-sm"
        disabled={i < 0 || i >= ids.length - 1}
        onClick={() => move(id, 1)}
        aria-label={`Move ${name} later`}
        title="Move later"
      >
        <Arrow flip />
      </button>
      <button
        type="button"
        className="orb orb-sm ml-auto"
        style={{ "--orb": "#f87171" } as CSSProperties}
        onClick={() => remove(id)}
        aria-label={`Remove ${name} from My hills`}
        title="Remove"
      >
        <svg
          viewBox="0 0 16 16"
          className="h-3.5 w-3.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <path d="m4 4 8 8M12 4l-8 8" />
        </svg>
      </button>
    </div>
  );
}
