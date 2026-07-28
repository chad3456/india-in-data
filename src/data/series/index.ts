import type { SeriesSpec } from '../types'
import * as global from './global'
import * as living from './living'
import * as defence from './defence'
import * as economy from './economy'
import * as law from './law'

export interface RegisteredSeries {
  spec: SeriesSpec
  chapterId: string
  chapterTitle: string
  chapterPath: string
}

function collect(
  mod: Record<string, unknown>,
  chapterId: string,
  chapterTitle: string,
  chapterPath: string,
): RegisteredSeries[] {
  return Object.values(mod)
    .filter((v): v is SeriesSpec => {
      if (typeof v !== 'object' || v === null) return false
      const candidate = v as Partial<SeriesSpec>
      return typeof candidate.id === 'string' && Array.isArray(candidate.snapshot)
    })
    .map((spec) => ({ spec, chapterId, chapterTitle, chapterPath }))
}

/**
 * Every series the site can render. The Sources page inverts this to show, for
 * each source, exactly which figures depend on it — so the register is a live
 * index of the site rather than a hand-maintained bibliography.
 */
export const ALL_SERIES: RegisteredSeries[] = [
  ...collect(global, 'global', 'India on the global stage', '/global-stage'),
  ...collect(living, 'living', 'What a household actually has', '/living-standards'),
  ...collect(defence, 'defence', 'Defence', '/defence'),
  ...collect(economy, 'economy', 'Economic reform', '/economic-reform'),
  ...collect(law, 'law', 'Law and order', '/law-and-order'),
]

export interface SourceUsage {
  chapters: { id: string; title: string; path: string }[]
  seriesCount: number
  liveCount: number
}

const usage = new Map<string, SourceUsage>()

for (const entry of ALL_SERIES) {
  const ids = [entry.spec.sourceId, ...(entry.spec.alsoSourceIds ?? [])]
  for (const id of ids) {
    const current = usage.get(id) ?? { chapters: [], seriesCount: 0, liveCount: 0 }
    current.seriesCount += 1
    if (entry.spec.live) current.liveCount += 1
    if (!current.chapters.some((c) => c.id === entry.chapterId)) {
      current.chapters.push({
        id: entry.chapterId,
        title: entry.chapterTitle,
        path: entry.chapterPath,
      })
    }
    usage.set(id, current)
  }
}

export function usageFor(sourceId: string): SourceUsage | undefined {
  return usage.get(sourceId)
}

export const SERIES_TOTALS = {
  total: ALL_SERIES.length,
  live: ALL_SERIES.filter((s) => s.spec.live).length,
  curated: ALL_SERIES.filter((s) => !s.spec.live).length,
}
