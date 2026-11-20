import type { MountainId } from "@/config/mountains";
import type { SnowReport } from "@/lib/SnowReaders";

// The last good snow report read from each resort, kept in Redis so that when a
// resort's site is down or has changed, its card shows those figures (marked as
// saved) instead of nothing. Uses Upstash Redis's REST API, so no client library:
// add Upstash Redis to the Vercel project (Storage → Marketplace) and it sets the
// environment variables read below. Without them this does nothing, and a failed
// read shows as unavailable, as before.

type OkReport = Extract<SnowReport, { status: "ok" }>;

interface Saved {
  report: OkReport;
  readAt: number; // ms
}

// Older than this, a saved report is no guide to the snow now.
const KEEP_SECONDS = 3 * 24 * 3600;

const store = () => {
  const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
  return url && token ? { url, token } : null;
};

async function command(args: (string | number)[]): Promise<unknown> {
  const s = store();
  if (!s) return null;
  const res = await fetch(s.url, {
    method: "POST",
    headers: { Authorization: `Bearer ${s.token}` },
    body: JSON.stringify(args),
    signal: AbortSignal.timeout(5_000),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`snow store: ${res.status} ${res.statusText}`);
  return ((await res.json()) as { result?: unknown }).result ?? null;
}

const key = (id: MountainId) => `snow-report:${id}`;

// Figures last written from this server instance, so an unchanged report (most
// reads: resorts post once or twice a day) isn't written again.
const written = new Map<MountainId, string>();

// Keeps a report just read. Never throws: the store is a fallback, not a
// dependency.
export async function remember(id: MountainId, report: OkReport) {
  const figures = JSON.stringify([report.depths, report.snowfall, report.updated]);
  if (written.get(id) === figures) return;
  try {
    const saved: Saved = { report, readAt: Date.now() };
    await command(["SET", key(id), JSON.stringify(saved), "EX", KEEP_SECONDS]);
    written.set(id, figures);
  } catch (err) {
    console.error(`snow store: couldn't save ${id}:`, err);
  }
}

// The last report kept for a hill, or null when there's none (or no store).
export async function recall(id: MountainId): Promise<Saved | null> {
  try {
    const raw = await command(["GET", key(id)]);
    return typeof raw === "string" ? (JSON.parse(raw) as Saved) : null;
  } catch (err) {
    console.error(`snow store: couldn't read ${id}:`, err);
    return null;
  }
}
