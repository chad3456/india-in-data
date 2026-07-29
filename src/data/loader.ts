/* ==========================================================================
   The retrieval mechanism.

   One rule governs every figure on this site:

     try live  →  fall back to this browser's cached live values
               →  fall back to the snapshot committed in the repository

   and whichever of those three produced the numbers is stated on the figure.
   A chart is never allowed to look identical whether its data is fresh or
   eighteen months old.
   ========================================================================== */

import type { LoadedSeries, Point, Provenance, SeriesSpec } from './types'
import generated from './snapshots/generated.json'
import { fetchSeriesFromDatabase, supabaseConfigured, type DbSeriesResult } from './supabase'

/* -- the generated snapshot ----------------------------------------------- */

interface GeneratedEntry {
  points: Point[]
  fetchedAt: string
  endpoint?: string
}

const GENERATED = generated as {
  generatedAt: string | null
  series: Record<string, GeneratedEntry | undefined>
}

/**
 * The fallback actually used for a series. `npm run refresh-data` writes
 * machine-retrieved values into generated.json; where an entry exists it
 * supersedes the hand-transcribed literal in the series definition.
 */
export function snapshotFor(spec: SeriesSpec): Point[] {
  return GENERATED.series[spec.id]?.points ?? spec.snapshot
}

/** Whether this series' fallback came from the API rather than a transcription. */
export function snapshotIsGenerated(spec: SeriesSpec): boolean {
  return Boolean(GENERATED.series[spec.id])
}

export function snapshotDateFor(spec: SeriesSpec): string {
  return GENERATED.series[spec.id]?.fetchedAt ?? spec.snapshotAsOf
}

export const SNAPSHOT_GENERATED_AT: string | null = GENERATED.generatedAt

const CACHE_PREFIX = 'iid:v1:'
const CACHE_TTL_MS = 12 * 60 * 60 * 1000 // 12 hours

interface CacheEntry {
  at: string
  points: Point[]
}

function readCache(id: string): CacheEntry | null {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + id)
    if (!raw) return null
    const parsed = JSON.parse(raw) as CacheEntry
    if (!parsed || !Array.isArray(parsed.points) || typeof parsed.at !== 'string') return null
    return parsed
  } catch {
    return null
  }
}

function writeCache(id: string, points: Point[]): void {
  try {
    localStorage.setItem(CACHE_PREFIX + id, JSON.stringify({ at: new Date().toISOString(), points }))
  } catch {
    /* Storage full or blocked — the cache is an optimisation, never a requirement. */
  }
}

function isFresh(entry: CacheEntry): boolean {
  const age = Date.now() - Date.parse(entry.at)
  return Number.isFinite(age) && age >= 0 && age < CACHE_TTL_MS
}

/* -- site-wide health registry -------------------------------------------- */

export interface HealthCounts {
  live: number
  snapshot: number
  curated: number
  total: number
}

const health = new Map<string, Provenance>()
const listeners = new Set<() => void>()

// `useSyncExternalStore` requires a referentially stable snapshot, so the
// counts object is recomputed only when a series actually changes state.
let cachedCounts: HealthCounts = { live: 0, snapshot: 0, curated: 0, total: 0 }

function recount(): void {
  let live = 0
  let snapshot = 0
  let curated = 0
  for (const p of health.values()) {
    if (p === 'live' || p === 'live-cached') live += 1
    else if (p === 'database') live += 1
    else if (p === 'snapshot') snapshot += 1
    else if (p === 'curated') curated += 1
  }
  cachedCounts = { live, snapshot, curated, total: live + snapshot + curated }
}

function publish(id: string, provenance: Provenance): void {
  if (health.get(id) === provenance) return
  health.set(id, provenance)
  recount()
  listeners.forEach((fn) => fn())
}

export function subscribeHealth(fn: () => void): () => void {
  listeners.add(fn)
  return () => {
    listeners.delete(fn)
  }
}

export function healthSnapshot(): HealthCounts {
  return cachedCounts
}

/* -- the database tier ---------------------------------------------------- */
// Supabase is the canonical store, so it is tried first and in one batched
// round trip per figure rather than one call per series.

const dbCache = new Map<string, DbSeriesResult | null>()
let dbReachable = supabaseConfigured

export async function primeDatabase(ids: string[], signal: AbortSignal): Promise<void> {
  if (!dbReachable) return
  const missing = ids.filter((id) => !dbCache.has(id))
  if (missing.length === 0) return
  try {
    const found = await fetchSeriesFromDatabase(missing, signal)
    for (const id of missing) dbCache.set(id, found.get(id) ?? null)
  } catch {
    // One failure is enough: stop hammering a database that is not answering
    // and let every series fall through to the tiers below.
    dbReachable = false
  }
}

export function databaseIsReachable(): boolean {
  return dbReachable
}

/* -- the loader ----------------------------------------------------------- */

/** In-flight requests, so two figures sharing a series make one call. */
const inflight = new Map<string, Promise<LoadedSeries>>()

export function loadSeries(spec: SeriesSpec, signal: AbortSignal): Promise<LoadedSeries> {
  const existing = inflight.get(spec.id)
  if (existing) return existing

  const run = (async (): Promise<LoadedSeries> => {
    // The canonical store answers first when it has the series.
    const fromDb = dbCache.get(spec.id)
    if (fromDb) {
      publish(spec.id, 'database')
      return {
        spec,
        points: fromDb.points,
        provenance: 'database',
        fetchedAt: fromDb.meta.last_ingested_at ?? undefined,
      }
    }

    // No live provider: the publisher has no API. Values are transcribed from
    // a cited release, which is a legitimate provenance, not a failure.
    if (!spec.live) {
      publish(spec.id, 'curated')
      return { spec, points: snapshotFor(spec), provenance: 'curated' }
    }

    const cached = readCache(spec.id)
    if (cached && isFresh(cached)) {
      publish(spec.id, 'live-cached')
      return { spec, points: cached.points, provenance: 'live-cached', fetchedAt: cached.at }
    }

    try {
      const points = await spec.live.fetch(signal)
      writeCache(spec.id, points)
      publish(spec.id, 'live')
      return { spec, points, provenance: 'live', fetchedAt: new Date().toISOString() }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)

      // A stale cache still beats a snapshot: it is real data from the
      // publisher, just older than the TTL.
      if (cached) {
        publish(spec.id, 'live-cached')
        return {
          spec,
          points: cached.points,
          provenance: 'live-cached',
          fetchedAt: cached.at,
          error: message,
        }
      }

      publish(spec.id, 'snapshot')
      return { spec, points: snapshotFor(spec), provenance: 'snapshot', error: message }
    }
  })()

  inflight.set(spec.id, run)
  // Keep the resolved promise around: within a session a series is fetched once.
  run.catch(() => inflight.delete(spec.id))
  return run
}

/* -- helpers -------------------------------------------------------------- */

/** The weakest provenance across a set of series governs the figure's badge. */
export function combineProvenance(series: LoadedSeries[]): Provenance {
  if (series.length === 0) return 'loading'
  const order: Provenance[] = ['snapshot', 'curated', 'live-cached', 'live', 'database']
  let worst = order.length - 1
  for (const s of series) {
    const rank = order.indexOf(s.provenance)
    if (rank >= 0 && rank < worst) worst = rank
  }
  return order[worst]
}

export const PROVENANCE_LABEL: Record<Provenance, string> = {
  database: 'Supabase',
  live: 'Live',
  'live-cached': 'Live · cached',
  curated: 'Cited release',
  snapshot: 'Repo snapshot',
  loading: 'Loading',
}

export const PROVENANCE_EXPLAINER: Record<Provenance, string> = {
  database:
    "Read from this project's Supabase catalogue, which an ingest job refreshes from the publisher. The retrieval date is shown alongside.",
  live: "Fetched from the publisher's API in your browser just now.",
  'live-cached':
    "Fetched from the publisher's API in this browser earlier and reused from local cache.",
  curated:
    'This publisher offers no machine-readable API. The values are transcribed from the cited release and versioned in the repository.',
  snapshot:
    'The live call did not succeed, so the values committed in the repository are being shown instead. They are dated below.',
  loading: 'Retrieving…',
}
