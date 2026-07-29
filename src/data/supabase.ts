/* ==========================================================================
   Supabase — the canonical store.
   ==========================================================================

   Postgres holds the catalogue: sources, series and observations. The browser
   reads it with the anon key over PostgREST. Row-level security allows SELECT
   and nothing else, so the anon key cannot alter a single number even if it
   leaks — writes happen only through the ingest edge function, which holds the
   service-role key.

   The client is optional by design. With no environment variables configured
   the site still renders from the committed snapshot, which keeps `npm run
   dev` working for anyone who clones the repo without credentials.
   ========================================================================== */

import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Point } from './types'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const supabaseConfigured = Boolean(url && anonKey)

export const supabase: SupabaseClient | null = supabaseConfigured
  ? createClient(url as string, anonKey as string, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { headers: { 'x-application-name': 'india-in-data' } },
    })
  : null

/* -- shapes ---------------------------------------------------------------- */

export interface DbSeriesMeta {
  id: string
  origin: 'transcribed' | 'ingested'
  last_ingested_at: string | null
  transcribed_as_of: string | null
  provider: string
}

export interface DbSeriesResult {
  meta: DbSeriesMeta
  points: Point[]
}

/**
 * Fetch several series and their observations in two round trips, not 2N.
 * PostgREST orders observations by the explicit `period_order` column so the
 * x-axis never depends on string collation.
 */
export async function fetchSeriesFromDatabase(
  ids: string[],
  signal: AbortSignal,
): Promise<Map<string, DbSeriesResult>> {
  if (!supabase || ids.length === 0) return new Map()

  const [metaResponse, observationResponse] = await Promise.all([
    supabase
      .from('series')
      .select('id, origin, last_ingested_at, transcribed_as_of, provider')
      .in('id', ids)
      .abortSignal(signal),
    supabase
      .from('observations')
      .select('series_id, period, period_order, value, flag')
      .in('series_id', ids)
      .order('series_id')
      .order('period_order')
      // PostgREST caps responses at 1000 rows by default and truncates
      // silently. A batch is at most a few hundred rows today, but a silently
      // short series is exactly the failure this site must not have.
      .limit(20000)
      .abortSignal(signal),
  ])

  if (metaResponse.error) throw new Error(metaResponse.error.message)
  if (observationResponse.error) throw new Error(observationResponse.error.message)

  const out = new Map<string, DbSeriesResult>()
  for (const meta of (metaResponse.data ?? []) as DbSeriesMeta[]) {
    out.set(meta.id, { meta, points: [] })
  }

  for (const row of (observationResponse.data ?? []) as {
    series_id: string
    period: string
    value: number | null
    flag: string | null
  }[]) {
    const entry = out.get(row.series_id)
    if (!entry) continue
    // Numeric-looking periods become numbers so the charts can use a linear
    // time axis; fiscal-year labels stay as strings.
    const numeric = Number(row.period)
    entry.points.push({
      x: /^-?\d+$/.test(row.period) && Number.isFinite(numeric) ? numeric : row.period,
      y: row.value,
      ...(row.flag ? { flag: row.flag } : {}),
    })
  }

  // A series row with no observations is not usable data.
  for (const [id, entry] of out) {
    if (entry.points.length === 0) out.delete(id)
  }

  return out
}

/** Site-wide freshness for the footer strip. */
export async function fetchCatalogueHealth(): Promise<{
  series_total: number
  series_ingested: number
  series_transcribed: number
  last_ingested_at: string | null
} | null> {
  if (!supabase) return null
  const { data, error } = await supabase.from('catalogue_health').select('*').single()
  if (error) return null
  return data as never
}
