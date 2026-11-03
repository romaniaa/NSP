export const trendWord = (
  delta: number | null,
  up: string,
  down: string,
  flat: string
) =>
  delta == null ? flat : Math.abs(delta) < 100 ? flat : delta > 0 ? up : down;

export const trendDetail = (delta: number | null, when: string) => {
  if (delta == null) return "";
  const m = Math.round(Math.abs(delta) / 10) * 10;
  if (m < 100) return `Little change over ${when}.`;
  return `${delta > 0 ? "Up" : "Down"} ${m} m over ${when}.`;
};
