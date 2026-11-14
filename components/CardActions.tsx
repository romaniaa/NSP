"use client";

import { useDashboard } from "@/components/useDashboard";

// Move and remove controls under a dashboard card. The dashboard's CSS shows them
// only in edit mode.
export default function CardActions({ id, name }: { id: string; name: string }) {
  const { ids, move, remove } = useDashboard();
  const i = ids.indexOf(id);

  const btn =
    "border border-white/30 px-2.5 py-1 text-xs text-white hover:bg-white/10 disabled:opacity-40 disabled:hover:bg-transparent";

  return (
    <div className="card-actions mt-2 flex flex-wrap items-center gap-2">
      <button
        type="button"
        className={btn}
        disabled={i <= 0}
        onClick={() => move(id, -1)}
        aria-label={`Move ${name} earlier`}
      >
        ← Earlier
      </button>
      <button
        type="button"
        className={btn}
        disabled={i < 0 || i >= ids.length - 1}
        onClick={() => move(id, 1)}
        aria-label={`Move ${name} later`}
      >
        Later →
      </button>
      <button
        type="button"
        className={`${btn} ml-auto`}
        onClick={() => remove(id)}
        aria-label={`Remove ${name} from My hills`}
      >
        Remove
      </button>
    </div>
  );
}
