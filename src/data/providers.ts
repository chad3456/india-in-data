/* ==========================================================================
   Live providers.

   Each provider turns a publisher's API into `Point[]`. They run in the
   reader's browser, so the only ones that can exist here are publishers who
   serve permissive CORS headers. Everything else arrives through the
   snapshot pipeline (`scripts/refresh-data.mjs`) instead.
   ========================================================================== */

import type { LiveSpec, Point } from './types'

const TIMEOUT_MS = 9000

async function getJson(url: string, signal: AbortSignal): Promise<unknown> {
  const timer = new AbortController()
  const kill = setTimeout(() => timer.abort(), TIMEOUT_MS)
  const onAbort = () => timer.abort()
  signal.addEventListener('abort', onAbort)
  try {
    const res = await fetch(url, {
      signal: timer.signal,
      headers: { accept: 'application/json' },
      // The publishers below are all public; no credentials are ever sent.
      credentials: 'omit',
      mode: 'cors',
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.json()
  } finally {
    clearTimeout(kill)
    signal.removeEventListener('abort', onAbort)
  }
}

/* -- World Bank ----------------------------------------------------------- */

const WORLD_BANK_ROOT = 'https://api.worldbank.org/v2'

interface WorldBankRow {
  date?: string
  value?: number | null
}

/**
 * World Bank Indicators API. Open, keyless, CORS-enabled, and the workhorse
 * of this site: any figure built on it re-fetches itself on every page load,
 * so it stays current without anyone touching the repository.
 */
export function worldBank(
  indicator: string,
  options: { from?: number; to?: number; country?: string; scale?: number } = {},
): LiveSpec {
  const { from = 1990, to = new Date().getFullYear(), country = 'IND', scale = 1 } = options
  const url = `${WORLD_BANK_ROOT}/country/${country}/indicator/${indicator}?format=json&per_page=400&date=${from}:${to}`

  return {
    endpoint: url,
    async fetch(signal) {
      const json = await getJson(url, signal)
      if (!Array.isArray(json) || json.length < 2 || !Array.isArray(json[1])) {
        throw new Error('Unexpected World Bank payload')
      }
      const rows = json[1] as WorldBankRow[]
      const points: Point[] = rows
        .filter((r) => r && typeof r.date === 'string')
        .map((r) => ({
          x: Number(r.date),
          y: typeof r.value === 'number' ? r.value * scale : null,
        }))
        .filter((p) => Number.isFinite(p.x as number))
        .sort((a, b) => (a.x as number) - (b.x as number))

      // A response of all-nulls is a live failure, not live data.
      if (!points.some((p) => p.y !== null)) throw new Error('No observations returned')
      return points
    },
  }
}

/**
 * India as a share of the world, computed from a single World Bank call for
 * both aggregates. Doing the division here rather than shipping a ratio means
 * the share updates whenever either side is revised.
 */
export function worldBankShareOfWorld(
  indicator: string,
  options: { from?: number; to?: number; asPercent?: boolean } = {},
): LiveSpec {
  const { from = 1990, to = new Date().getFullYear(), asPercent = true } = options
  const url = `${WORLD_BANK_ROOT}/country/IND;WLD/indicator/${indicator}?format=json&per_page=800&date=${from}:${to}`

  return {
    endpoint: url,
    async fetch(signal) {
      const json = await getJson(url, signal)
      if (!Array.isArray(json) || json.length < 2 || !Array.isArray(json[1])) {
        throw new Error('Unexpected World Bank payload')
      }
      const rows = json[1] as (WorldBankRow & { countryiso3code?: string })[]
      const india = new Map<string, number>()
      const world = new Map<string, number>()
      for (const r of rows) {
        if (!r?.date || typeof r.value !== 'number') continue
        if (r.countryiso3code === 'IND') india.set(r.date, r.value)
        else if (r.countryiso3code === 'WLD') world.set(r.date, r.value)
      }
      const points: Point[] = [...india.keys()]
        .map((year) => {
          const w = world.get(year)
          const i = india.get(year)
          const share = w && i && w !== 0 ? (i / w) * (asPercent ? 100 : 1) : null
          return { x: Number(year), y: share }
        })
        .filter((p) => Number.isFinite(p.x))
        .sort((a, b) => a.x - b.x)

      if (!points.some((p) => p.y !== null)) throw new Error('No observations returned')
      return points
    },
  }
}

/* -- IMF DataMapper ------------------------------------------------------- */

const IMF_ROOT = 'https://www.imf.org/external/datamapper/api/v1'

/**
 * IMF DataMapper. Carries the World Economic Outlook aggregates, including
 * the forward projections the ranking figures need. Note the values include
 * projected years — the caller is responsible for marking them as such.
 */
export function imfDataMapper(indicator: string, iso3 = 'IND'): LiveSpec {
  const url = `${IMF_ROOT}/${indicator}/${iso3}`
  return {
    endpoint: url,
    async fetch(signal) {
      const json = (await getJson(url, signal)) as {
        values?: Record<string, Record<string, Record<string, number>>>
      }
      const byYear = json?.values?.[indicator]?.[iso3]
      if (!byYear || typeof byYear !== 'object') throw new Error('Unexpected IMF payload')
      const points = Object.entries(byYear)
        .map(([year, value]) => ({ x: Number(year), y: typeof value === 'number' ? value : null }))
        .filter((p) => Number.isFinite(p.x))
        .sort((a, b) => a.x - b.x)
      if (!points.some((p) => p.y !== null)) throw new Error('No observations returned')
      return points
    },
  }
}

/* -- data.gov.in ---------------------------------------------------------- */

/**
 * India's Open Government Data platform. Needs a key, so this provider only
 * activates when one is supplied at build time via `VITE_DATA_GOV_IN_KEY`;
 * without it the series falls through to its committed snapshot, which is
 * exactly the behaviour a public deployment without a key should have.
 */
export function dataGovIn(
  resourceId: string,
  map: (record: Record<string, string>) => Point | null,
  options: { limit?: number } = {},
): LiveSpec | undefined {
  const key = import.meta.env.VITE_DATA_GOV_IN_KEY
  const url = `https://api.data.gov.in/resource/${resourceId}?api-key=${key ?? ''}&format=json&limit=${options.limit ?? 500}`
  if (!key) return undefined

  return {
    endpoint: url.replace(key, '<api-key>'),
    async fetch(signal) {
      const json = (await getJson(url, signal)) as { records?: Record<string, string>[] }
      const records = json?.records
      if (!Array.isArray(records)) throw new Error('Unexpected data.gov.in payload')
      const points = records
        .map(map)
        .filter((p): p is Point => p !== null)
        .sort((a, b) => String(a.x).localeCompare(String(b.x), undefined, { numeric: true }))
      if (points.length === 0) throw new Error('No observations returned')
      return points
    },
  }
}

/**
 * A static snapshot shipped in the repository and served from the site's own
 * origin. Used for publishers with no API but a stable machine-readable
 * release, refreshed by `scripts/refresh-data.mjs`.
 */
export function repoSnapshot(file: string, key: string): LiveSpec {
  const url = `${import.meta.env.BASE_URL}data/${file}`
  return {
    endpoint: url,
    async fetch(signal) {
      const json = (await getJson(url, signal)) as Record<string, { points?: Point[] }>
      const points = json?.[key]?.points
      if (!Array.isArray(points) || points.length === 0) throw new Error('Snapshot file missing key')
      return points
    },
  }
}
