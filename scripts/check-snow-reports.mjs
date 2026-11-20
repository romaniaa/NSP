// Reads every resort's snow report from the live sites and prints what each
// reader found, to check the readers after a resort changes its site.
//   npm run snow:check            every resort
//   npm run snow:check -- fernie  just the ones named
import { READERS, readSnowReport } from "../lib/SnowReaders.ts";

const ids = process.argv.length > 2 ? process.argv.slice(2) : Object.keys(READERS);
const fmt = (stats) => stats.map((s) => `${s.label} ${s.cm}`).join(", ") || "—";

const results = await Promise.allSettled(ids.map((id) => readSnowReport(id)));
let failed = 0;
results.forEach((r, i) => {
  const id = ids[i].padEnd(14);
  if (r.status === "rejected") {
    failed++;
    console.log(`${id} ERROR      ${r.reason?.message ?? r.reason}`);
  } else if (r.value.status !== "ok") {
    console.log(`${id} ${r.value.status}`);
  } else {
    const v = r.value;
    console.log(`${id} ok         depth: ${fmt(v.depths)} | new: ${fmt(v.snowfall)} | ${v.updated ?? "no date"}`);
  }
});
process.exitCode = failed ? 1 : 0;
