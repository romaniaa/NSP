import { ImageResponse } from "next/og";
import type { MountainConfig } from "@/config/mountains";
import { SITE_NAME } from "@/lib/Site";

// Social preview images (the card shown when a link is shared), drawn from the
// same ridge outlines as the elevation diagrams.

export const OG_SIZE = { width: 1200, height: 630 };

const W = 1200;
const RIDGE_H = 300;

// Ridge outline as a filled SVG path, scaled so every hill shares one
// elevation axis and their heights compare honestly.
function ridgePath(m: MountainConfig, x0: number, width: number, floor: number, top: number) {
  const y = (e: number) => RIDGE_H - ((e - floor) / (top - floor)) * RIDGE_H;
  const pts = m.profile.map(([x, e]) => `${x0 + (x / 100) * width},${y(e)}`);
  return `M${x0},${RIDGE_H} L${pts.join(" L")} L${x0 + width},${RIDGE_H} Z`;
}

export function ogImage({
  eyebrow,
  title,
  subtitle,
  mountains,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  mountains: MountainConfig[];
}) {
  const floor = Math.min(...mountains.flatMap((m) => m.profile.map(([, e]) => e))) - 100;
  const top = Math.max(...mountains.flatMap((m) => m.profile.map(([, e]) => e))) + 50;
  const width = W / mountains.length;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0a0d10",
          color: "white",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", padding: "64px 72px 0" }}>
          <div style={{ fontSize: 28, letterSpacing: 6, color: "#9aa7b5", textTransform: "uppercase" }}>
            {eyebrow}
          </div>
          <div style={{ fontSize: 76, fontWeight: 700, marginTop: 16, lineHeight: 1.05 }}>
            {title}
          </div>
          <div style={{ fontSize: 32, color: "#c9d3dd", marginTop: 20 }}>{subtitle}</div>
        </div>
        <svg width={W} height={RIDGE_H} viewBox={`0 0 ${W} ${RIDGE_H}`}>
          {mountains.map((m, i) => (
            <path
              key={m.id}
              d={ridgePath(m, i * width, width, floor, top)}
              fill={m.color}
              fillOpacity={0.85}
            />
          ))}
        </svg>
      </div>
    ),
    OG_SIZE
  );
}

export const ogAlt = (title: string) => `${title} · ${SITE_NAME}`;
