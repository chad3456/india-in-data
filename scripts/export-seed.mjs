#!/usr/bin/env node
/**
 * Export the TypeScript catalogue to SQL.
 *
 *   npm run export-seed
 *
 * The series and source definitions live in TypeScript because that is where
 * the type checking is. Postgres is the runtime store. This script is the one
 * bridge between them: it bundles the TS modules with esbuild (they reference
 * `import.meta.env`, so they cannot simply be imported by Node), then emits
 * idempotent upsert SQL into supabase/seed/.
 *
 * Run it whenever a series or source changes, then apply the SQL.
 */

import { mkdir, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import * as esbuild from 'esbuild'
import { MANIFEST } from './manifest.mjs'

const here = dirname(fileURLToPath(import.meta.url))
const root = resolve(here, '..')
const outDir = resolve(root, 'supabase/seed')

/* -- load the TypeScript catalogue ---------------------------------------- */

const entry = `
  export { SOURCES } from './src/data/sources'
  export { ALL_SERIES } from './src/data/series/index'
`

const bundle = await esbuild.build({
  stdin: { contents: entry, resolveDir: root, sourcefile: 'seed-entry.ts', loader: 'ts' },
  bundle: true,
  format: 'esm',
  platform: 'neutral',
  write: false,
  logLevel: 'warning',
  define: {
    'import.meta.env.VITE_DATA_GOV_IN_KEY': 'undefined',
    'import.meta.env.VITE_SUPABASE_URL': 'undefined',
    'import.meta.env.VITE_SUPABASE_ANON_KEY': 'undefined',
    'import.meta.env.BASE_URL': '"/"',
  },
})

const code = bundle.outputFiles[0].text
const module = await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`)
const { SOURCES, ALL_SERIES } = module

/* -- SQL helpers ----------------------------------------------------------- */

const q = (value) => {
  if (value === null || value === undefined) return 'null'
  return `'${String(value).replace(/'/g, "''")}'`
}
const num = (value) =>
  value === null || value === undefined || !Number.isFinite(value) ? 'null' : String(value)
const arr = (values) =>
  values && values.length ? `array[${values.map(q).join(', ')}]::text[]` : `'{}'::text[]`

const manifestById = new Map(MANIFEST.map((m) => [m.id, m]))

/* -- sources --------------------------------------------------------------- */

const sourceRows = SOURCES.map(
  (s) =>
    `  (${q(s.id)}, ${q(s.name)}, ${q(s.publisher)}, ${q(s.url)}, ${q(s.description)}, ` +
    `${q(s.category)}, ${q(s.access)}, ${q(s.cadence)}, ${q(s.licence)}, ${q(s.caveat ?? null)})`,
)

const sourcesSql = `-- ${SOURCES.length} sources
insert into public.sources
  (id, name, publisher, url, description, category, access, cadence, licence, caveat)
values
${sourceRows.join(',\n')}
on conflict (id) do update set
  name        = excluded.name,
  publisher   = excluded.publisher,
  url         = excluded.url,
  description = excluded.description,
  category    = excluded.category,
  access      = excluded.access,
  cadence     = excluded.cadence,
  licence     = excluded.licence,
  caveat      = excluded.caveat;
`

/* -- series ---------------------------------------------------------------- */

const seriesRows = ALL_SERIES.map(({ spec, chapterId }) => {
  const m = manifestById.get(spec.id)
  const provider = m ? (m.kind === 'worldbank-share' ? 'worldbank_share' : m.kind) : 'manual'
  return (
    `  (${q(spec.id)}, ${q(spec.label)}, ${q(spec.unit)}, ${q(spec.sourceId)}, ` +
    `${arr(spec.alsoSourceIds)}, ${q(chapterId)}, ${num(spec.precision ?? null)}, ` +
    `${q(spec.note ?? null)}, ${q(provider)}, ${q(m?.indicator ?? null)}, ` +
    `${q(m?.country ?? 'IND')}, ${num(m?.scale ?? 1)}, ${num(m?.from ?? null)}, ` +
    `'transcribed', ${q(spec.snapshotAsOf)})`
  )
})

const seriesSql = `-- ${ALL_SERIES.length} series
insert into public.series
  (id, label, unit, source_id, also_source_ids, chapter_id, precision, note,
   provider, indicator_code, country_code, value_scale, period_from,
   origin, transcribed_as_of)
values
${seriesRows.join(',\n')}
on conflict (id) do update set
  label            = excluded.label,
  unit             = excluded.unit,
  source_id        = excluded.source_id,
  also_source_ids  = excluded.also_source_ids,
  chapter_id       = excluded.chapter_id,
  precision        = excluded.precision,
  note             = excluded.note,
  provider         = excluded.provider,
  indicator_code   = excluded.indicator_code,
  country_code     = excluded.country_code,
  value_scale      = excluded.value_scale,
  period_from      = excluded.period_from,
  transcribed_as_of = excluded.transcribed_as_of;
`

/* -- observations ---------------------------------------------------------- */
// `period_order` is the position in the authored array, so display order never
// depends on string collation or on guessing how "2016-17" compares to "2020".

const observationRows = []
const manualObservationRows = []
for (const { spec } of ALL_SERIES) {
  const isManual = !manifestById.has(spec.id)
  spec.snapshot.forEach((point, index) => {
    const row = `  (${q(spec.id)}, ${q(point.x)}, ${index}, ${num(point.y)}, ${q(point.flag ?? null)})`
    observationRows.push(row)
    // Series with an automated provider are deliberately left out of the manual
    // seed: the ingest function fetches those from the publisher, which is a
    // better number than any transcription of it.
    if (isManual) manualObservationRows.push(row)
  })
}

// Chunked so each statement stays comfortably inside statement size limits.
const CHUNK = 250
const chunkInserts = (rows) => {
  const out = []
  for (let i = 0; i < rows.length; i += CHUNK) {
    out.push(
      `insert into public.observations (series_id, period, period_order, value, flag)\nvalues\n` +
        `${rows.slice(i, i + CHUNK).join(',\n')}\n` +
        `on conflict (series_id, period) do update set\n` +
        `  period_order = excluded.period_order,\n` +
        `  value        = excluded.value,\n` +
        `  flag         = excluded.flag;\n`,
    )
  }
  return out
}
const observationChunks = chunkInserts(observationRows)
const manualObservationChunks = chunkInserts(manualObservationRows)

/* -- write ----------------------------------------------------------------- */

await mkdir(outDir, { recursive: true })

const header = `-- Generated by scripts/export-seed.mjs — do not edit by hand.
-- Source of truth: src/data/sources.ts and src/data/series/*.ts
-- Regenerate with: npm run export-seed
`

await writeFile(resolve(outDir, '01_sources.sql'), `${header}\n${sourcesSql}`, 'utf8')
await writeFile(resolve(outDir, '02_series.sql'), `${header}\n${seriesSql}`, 'utf8')
await writeFile(
  resolve(outDir, '03_observations.sql'),
  `${header}\n-- ${observationRows.length} observations (all series)\n\n${observationChunks.join('\n')}`,
  'utf8',
)
await writeFile(
  resolve(outDir, '03a_observations_manual.sql'),
  `${header}\n-- ${manualObservationRows.length} observations for series with no automated provider.\n` +
    `-- The remaining series are populated by the ingest edge function from the publisher API.\n\n` +
    `${manualObservationChunks.join('\n')}`,
  'utf8',
)

// A machine-readable copy, used by the apply script and handy for debugging.
await writeFile(
  resolve(outDir, 'chunks.json'),
  `${JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      counts: {
        sources: SOURCES.length,
        series: ALL_SERIES.length,
        observations: observationRows.length,
        manualObservations: manualObservationRows.length,
      },
      statements: [sourcesSql, seriesSql, ...observationChunks],
      manualStatements: [sourcesSql, seriesSql, ...manualObservationChunks],
    },
    null,
    2,
  )}\n`,
  'utf8',
)

process.stdout.write(
  `Exported ${SOURCES.length} sources, ${ALL_SERIES.length} series, ` +
    `${observationRows.length} observations ` +
    `(${observationChunks.length} observation statements) to supabase/seed/\n`,
)
