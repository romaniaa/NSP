// Air temperature and wind against height from the weather model's pressure
// levels, and the freezing level from them. Pure functions with no server
// imports, so cards rendered in the browser can use them (lib/Model.ts fetches
// the data and re-exports these).

// Air temperature (°C) against height (m), lowest first.
export interface Profile {
  z: number[];
  t: number[];
  // Height (m) of the model's ground at this point. Pressure levels below it are
  // filled in by the model, not real air. Absent if the model didn't give one.
  ground?: number;
}

// Temperature at a height: linear between pressure levels, extended from the end
// segments beyond them.
export function tempAt(p: Profile, height: number): number {
  const { z, t } = p;
  let i = 1;
  while (i < z.length - 1 && z[i] < height) i++;
  return t[i - 1] + ((t[i] - t[i - 1]) * (height - z[i - 1])) / (z[i] - z[i - 1]);
}

// Height (m) of the 0 °C level: where the air turns from above to below freezing
// going up, interpolated between levels. Normally the lowest such crossing, the
// same definition Open-Meteo uses; a second crossing above a warm layer aloft is
// ignored.
//
// Pressure levels below the model's ground are filled in by the model, not real
// air, and in the Interior and the Rockies they can cross 0 °C far from the
// crossing that matters, so the ground decides which crossing counts:
// - air at the ground above freezing: the lowest crossing above the ground.
//   (Rogers Pass, Nov 2026: a crossing at 548 m below the ground had been taken,
//   against +0.6 °C at the 1,315 m pass; the one above the ground was ~1,340 m.)
// - air at the ground below freezing: the highest crossing below it, nearest
//   the valleys. (Kicking Horse: the ground at ~1,710 m was below freezing over
//   a warm layer at 1,000–1,460 m around the 1,190 m base, with another crossing
//   at 390 m under that; the level is ~1,600 m, matching the +2.4 °C at the base.)
// Either way the level agrees with tempAt at every height near the terrain.
export function freezingLevel(p: Profile): number {
  const { z, t } = p;
  const crossings: number[] = [];
  for (let i = 1; i < z.length; i++) {
    if (t[i - 1] >= 0 && t[i] < 0) {
      crossings.push(Math.round(z[i - 1] + ((z[i] - z[i - 1]) * t[i - 1]) / (t[i - 1] - t[i])));
    }
  }
  const g = p.ground;
  if (g != null && g > z[0] && g < z[z.length - 1]) {
    const pick =
      tempAt(p, g) >= 0
        ? crossings.find((c) => c >= g)
        : crossings.filter((c) => c <= g).at(-1);
    if (pick != null) return pick;
  }
  if (crossings.length) return crossings[0];
  // No crossing between levels. Below freezing at the lowest level means the 0 °C
  // level is lower still; otherwise the air is above freezing all the way up.
  // Either way, extend the nearest end segment.
  const n = z.length;
  const [a, b] = t[0] < 0 ? [0, 1] : [n - 2, n - 1];
  const slope = (t[b] - t[a]) / (z[b] - z[a]); // °C per m, negative when cooling with height
  if (slope >= 0) return t[0] < 0 ? 0 : z[n - 1];
  return Math.max(0, Math.round(z[a] - t[a] / slope));
}

// Free-air wind by height, lowest first, as east (u) and north (v) components in
// km/h so direction interpolates correctly.
export interface WindProfile {
  z: number[];
  u: number[];
  v: number[];
}

// Free-air wind at a height: interpolated between levels and held at the end
// levels beyond them (no extrapolation, which would exaggerate).
export function windAloft(w: WindProfile, height: number): { speed: number; dir: number } {
  const at = (vals: number[]) => {
    if (height <= w.z[0]) return vals[0];
    for (let i = 1; i < w.z.length; i++) {
      if (height <= w.z[i]) {
        return vals[i - 1] + ((vals[i] - vals[i - 1]) * (height - w.z[i - 1])) / (w.z[i] - w.z[i - 1]);
      }
    }
    return vals[vals.length - 1];
  };
  const u = at(w.u);
  const v = at(w.v);
  const dir = ((Math.atan2(-u, -v) * 180) / Math.PI + 360) % 360;
  return { speed: Math.round(Math.hypot(u, v)), dir: Math.round(dir) };
}
