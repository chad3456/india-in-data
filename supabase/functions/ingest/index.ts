// ============================================================================
// ingest — refresh every API-backed series straight from the publisher.
//
// Runs on Supabase's network (which can reach the World Bank), reads the
// retrieval config out of `public.series`, and upserts the observations. A
// series that succeeds is marked `origin = 'ingested'`, which is what clears
// the "transcribed, not yet machine-verified" label in the UI.
//
// Invoke:
//   curl -X POST "$SUPABASE_URL/functions/v1/ingest" \
//        -H "Authorization: Bearer $SERVICE_ROLE_KEY"
//
// Only the service-role key can trigger it: the anon key is a valid JWT and
// would otherwise let anyone force a refresh.
// ============================================================================

import { createClient } from 'jsr:@supabase/supabase-js@2'

const WORLD_BANK = 'https://api.worldbank.org/v2'
const TIMEOUT_MS = 25_000
const RETRIES = 3

interface SeriesRow {
  id: string
  provider: string
  indicator_code: string | null
  country_code: string
  value_scale: number
  period_from: number | null
}

interface Observation {
  series_id: string
  period: string
  period_order: number
  value: number | null
  flag: string | null
}

async function getJson(url: string): Promise<unknown> {
  let lastError: unknown
  for (let attempt = 1; attempt <= RETRIES; attempt += 1) {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
    try {
      const res = await fetch(url, {
        signal: controller.signal,
        headers: { accept: 'application/json', 'user-agent': 'india-in-data-ingest/1' },
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return await res.json()
    } catch (err) {
      lastError = err
      if (attempt < RETRIES) await new Promise((r) => setTimeout(r, 2 ** (attempt - 1) * 1000))
    } finally {
      clearTimeout(timer)
    }
  }
  throw lastError
}

/** One country, one indicator. */
async function fetchWorldBank(series: SeriesRow): Promise<Observation[]> {
  const to = new Date().getFullYear()
  const from = series.period_from ?? 1990
  const url = `${WORLD_BANK}/country/${series.country_code}/indicator/${series.indicator_code}?format=json&per_page=800&date=${from}:${to}`
  const json = await getJson(url)
  if (!Array.isArray(json) || !Array.isArray(json[1])) throw new Error('unexpected payload')

  const rows = json[1] as { date?: string; value?: number | null }[]
  const points = rows
    .filter((r) => r && typeof r.date === 'string')
    .map((r) => ({
      year: Number(r.date),
      value: typeof r.value === 'number' ? r.value * series.value_scale : null,
    }))
    .filter((p) => Number.isFinite(p.year))
    .sort((a, b) => a.year - b.year)

  if (!points.some((p) => p.value !== null)) throw new Error('no observations')

  return points.map((p, index) => ({
    series_id: series.id,
    period: String(p.year),
    period_order: index,
    value: p.value,
    flag: null,
  }))
}

/** India as a percentage of the world, from one call covering both. */
async function fetchWorldBankShare(series: SeriesRow): Promise<Observation[]> {
  const to = new Date().getFullYear()
  const from = series.period_from ?? 1990
  const url = `${WORLD_BANK}/country/IND;WLD/indicator/${series.indicator_code}?format=json&per_page=1200&date=${from}:${to}`
  const json = await getJson(url)
  if (!Array.isArray(json) || !Array.isArray(json[1])) throw new Error('unexpected payload')

  const rows = json[1] as { date?: string; value?: number | null; countryiso3code?: string }[]
  const india = new Map<string, number>()
  const world = new Map<string, number>()
  for (const r of rows) {
    if (!r?.date || typeof r.value !== 'number') continue
    if (r.countryiso3code === 'IND') india.set(r.date, r.value)
    else if (r.countryiso3code === 'WLD') world.set(r.date, r.value)
  }

  const points = [...india.keys()]
    .map((year) => {
      const w = world.get(year)
      const i = india.get(year)
      return { year: Number(year), value: w && i ? (i / w) * 100 : null }
    })
    .filter((p) => Number.isFinite(p.year))
    .sort((a, b) => a.year - b.year)

  if (!points.some((p) => p.value !== null)) throw new Error('no observations')

  return points.map((p, index) => ({
    series_id: series.id,
    period: String(p.year),
    period_order: index,
    value: p.value,
    flag: null,
  }))
}

const FETCHERS: Record<string, (s: SeriesRow) => Promise<Observation[]>> = {
  worldbank: fetchWorldBank,
  worldbank_share: fetchWorldBankShare,
}

Deno.serve(async (req) => {
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  const auth = req.headers.get('Authorization') ?? ''
  if (!serviceKey || auth !== `Bearer ${serviceKey}`) {
    return new Response(JSON.stringify({ error: 'service role key required' }), {
      status: 401,
      headers: { 'content-type': 'application/json' },
    })
  }

  const supabase = createClient(Deno.env.get('SUPABASE_URL') ?? '', serviceKey, {
    auth: { persistSession: false },
  })

  const { data: run, error: runError } = await supabase
    .from('ingest_runs')
    .insert({})
    .select('id')
    .single()
  if (runError) {
    return new Response(JSON.stringify({ error: runError.message }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    })
  }

  const { data: seriesRows, error: seriesError } = await supabase
    .from('series')
    .select('id, provider, indicator_code, country_code, value_scale, period_from')
    .neq('provider', 'manual')
  if (seriesError || !seriesRows) {
    return new Response(JSON.stringify({ error: seriesError?.message ?? 'no series' }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    })
  }

  const detail: { id: string; ok: boolean; observations?: number; error?: string }[] = []
  let ok = 0
  let failed = 0
  const now = new Date().toISOString()

  for (const series of seriesRows as SeriesRow[]) {
    const fetcher = FETCHERS[series.provider]
    if (!fetcher) {
      failed += 1
      detail.push({ id: series.id, ok: false, error: `unknown provider ${series.provider}` })
      continue
    }
    try {
      const observations = await fetcher(series)

      // Replace rather than merge: a re-fetch is the whole truth for that
      // series, and leaving orphaned periods behind would silently mix
      // vintages.
      const { error: deleteError } = await supabase
        .from('observations')
        .delete()
        .eq('series_id', series.id)
      if (deleteError) throw new Error(deleteError.message)

      const { error: insertError } = await supabase.from('observations').insert(observations)
      if (insertError) throw new Error(insertError.message)

      const { error: updateError } = await supabase
        .from('series')
        .update({ origin: 'ingested', last_ingested_at: now })
        .eq('id', series.id)
      if (updateError) throw new Error(updateError.message)

      ok += 1
      detail.push({ id: series.id, ok: true, observations: observations.length })
    } catch (err) {
      failed += 1
      detail.push({ id: series.id, ok: false, error: err instanceof Error ? err.message : String(err) })
    }
  }

  await supabase
    .from('ingest_runs')
    .update({ finished_at: new Date().toISOString(), ok_count: ok, fail_count: failed, detail })
    .eq('id', run.id)

  return new Response(JSON.stringify({ run_id: run.id, ok, failed, detail }, null, 2), {
    status: failed > 0 && ok === 0 ? 502 : 200,
    headers: { 'content-type': 'application/json' },
  })
})
