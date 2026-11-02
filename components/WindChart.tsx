"use client";

import { useState } from "react";
import BubbleChart from "@/components/BubbleChart";
import { Card } from "@/components/Ui";

export interface WindRow {
  label: string;
  avg: number;
  gust: number;
}

export default function WindChart({ rows }: { rows: WindRow[] }) {
  const [mode, setMode] = useState<"avg" | "gust">("gust");
  const values = rows.map((r) => (mode === "avg" ? r.avg : r.gust));
  const max = Math.max(20, Math.ceil((Math.max(...values) + 5) / 10) * 10);
  const step = max > 60 ? 20 : 10;

  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-white">Wind speed</h3>
          <p className="mt-1 text-xs text-[#9aa7b5]">
            Model wind at 10 m above ground
          </p>
        </div>
        <div className="flex rounded-full bg-[#2a3138] p-1 text-xs">
          {(["avg", "gust"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              aria-pressed={mode === m}
              className={`rounded-full px-3 py-1 font-semibold ${
                mode === m ? "bg-[#3b4651] text-white" : "text-[#9aa7b5]"
              }`}
            >
              {m === "avg" ? "Average" : "Gusts"}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-5">
        <BubbleChart
          rows={rows.map((r, i) => ({ label: r.label, value: values[i] }))}
          min={0}
          max={max}
          step={step}
          axisLabel={mode === "avg" ? "Average wind (km/h)" : "Gust speed (km/h)"}
        />
      </div>
    </Card>
  );
}