#!/usr/bin/env node
/**
 * Structural checks that keep the sourcing claim honest. Run in CI.
 *
 *   1. Every series declares a sourceId that exists in the register.
 *   2. Every series appears in the refresh manifest or the curated-only list,
 *      so nothing can quietly stop being refreshed.
 *   3. Every World Bank indicator code in the TypeScript matches the manifest,
 *      so the browser and the refresh script never fetch different things.
 *   4. Every source in the register carries a URL, a licence and a cadence.
 */

import { readFile, readdir } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join, resolve } from 'node:path'
import { CURATED_ONLY, MANIFEST } from './manifest.mjs'

const here = dirname(fileURLToPath(import.meta.url))
const SERIES_DIR = resolve(here, '../src/data/series')
const SOURCES_FILE = resolve(here, '../src/data/sources.ts')

const problems = []
const note = (msg) => problems.push(msg)

/* -- read the source register -------------------------------------------- */

const sourcesSrc = await readFile(SOURCES_FILE, 'utf8')
const sourceIds = new Set([...sourcesSrc.matchAll(/^\s{4}id: '([^']+)',$/gm)].map((m) => m[1]))
if (sourceIds.size === 0) note('Could not parse any source ids out of src/data/sources.ts')

for (const field of ['url', 'licence', 'cadence']) {
  const count = [...sourcesSrc.matchAll(new RegExp(`^\\s{4}${field}:`, 'gm'))].length
  if (count < sourceIds.size) {
    note(`${sourceIds.size - count} source(s) are missing a "${field}" field`)
  }
}

/* -- read the series definitions ------------------------------------------ */

const files = (await readdir(SERIES_DIR)).filter(
  (f) => f.endsWith('.ts') && f !== 'kit.ts' && f !== 'index.ts',
)

const seen = new Map() // seriesId -> { file, sourceId, indicator }

for (const file of files) {
  const src = await readFile(join(SERIES_DIR, file), 'utf8')
  // Each series is an exported const with an `id:` and a `sourceId:`.
  const blocks = src.split(/export const /).slice(1)
  for (const block of blocks) {
    const id = block.match(/\n\s*id: '([^']+)',/)?.[1]
    if (!id) continue
    const sourceId = block.match(/\n\s*sourceId: '([^']+)',/)?.[1]
    const indicator = block.match(/worldBank(?:ShareOfWorld)?\('([^']+)'/)?.[1]
    const alsoIds = [...block.matchAll(/alsoSourceIds: \[([^\]]*)\]/g)]
      .flatMap((m) => [...m[1].matchAll(/'([^']+)'/g)].map((x) => x[1]))

    if (seen.has(id)) note(`Duplicate series id "${id}" (${file} and ${seen.get(id).file})`)
    seen.set(id, { file, sourceId, indicator })

    if (!sourceId) {
      note(`Series "${id}" (${file}) declares no sourceId`)
    } else if (!sourceIds.has(sourceId)) {
      note(`Series "${id}" cites unknown source "${sourceId}"`)
    }
    for (const extra of alsoIds) {
      if (!sourceIds.has(extra)) note(`Series "${id}" cites unknown source "${extra}"`)
    }
  }
}

if (seen.size === 0) note('Could not parse any series out of src/data/series')

/* -- reconcile against the refresh manifest ------------------------------- */

const manifestById = new Map(MANIFEST.map((m) => [m.id, m]))
const curated = new Set(CURATED_ONLY)

for (const [id, info] of seen) {
  const inManifest = manifestById.get(id)
  const isCurated = curated.has(id)

  if (!inManifest && !isCurated) {
    note(`Series "${id}" is in neither the refresh manifest nor CURATED_ONLY (scripts/manifest.mjs)`)
  }
  if (inManifest && isCurated) {
    note(`Series "${id}" is listed both in the refresh manifest and in CURATED_ONLY`)
  }
  if (info.indicator && !inManifest) {
    note(`Series "${id}" fetches World Bank ${info.indicator} in the browser but is not refreshed`)
  }
  if (inManifest && info.indicator && inManifest.indicator !== info.indicator) {
    note(
      `Series "${id}" indicator drift: TypeScript uses ${info.indicator}, manifest uses ${inManifest.indicator}`,
    )
  }
}

for (const id of manifestById.keys()) {
  if (!seen.has(id)) note(`Refresh manifest lists "${id}", which no series defines`)
}
for (const id of curated) {
  if (!seen.has(id)) note(`CURATED_ONLY lists "${id}", which no series defines`)
}

/* -- report --------------------------------------------------------------- */

if (problems.length) {
  console.error(`verify-sources: ${problems.length} problem(s)\n`)
  problems.forEach((p) => console.error(`  - ${p}`))
  process.exit(1)
}

console.log(
  `verify-sources: OK — ${seen.size} series, ${sourceIds.size} sources, ${MANIFEST.length} refreshable.`,
)
