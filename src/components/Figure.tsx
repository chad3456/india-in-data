import { useMemo, useState, type ReactNode } from 'react'
import { getSource } from '../data/sources'
import { PROVENANCE_EXPLAINER, PROVENANCE_LABEL, snapshotDateFor, snapshotIsGenerated } from '../data/loader'
import { useSeries } from '../data/useSeries'
import type { Provenance, SeriesSpec, Unit } from '../data/types'
import { formatDate, formatDateTime, formatValue, unitCaption } from '../lib/format'
import { slotColor, unionX, type ChartSeries } from './charts/chart-kit'

/* -- provenance badge ------------------------------------------------------ */

export function ProvenanceBadge({
  provenance,
  fetchedAt,
  snapshotAsOf,
  errors = [],
}: {
  provenance: Provenance
  fetchedAt?: string
  snapshotAsOf?: string
  errors?: string[]
}) {
  const modifier =
    provenance === 'live' || provenance === 'live-cached'
      ? 'live'
      : provenance === 'curated'
        ? 'curated'
        : provenance === 'snapshot'
          ? 'snapshot'
          : 'loading'

  const detail = [
    PROVENANCE_EXPLAINER[provenance],
    fetchedAt ? `Retrieved ${formatDateTime(fetchedAt)}.` : '',
    provenance === 'snapshot' && snapshotAsOf ? `Snapshot dated ${formatDate(snapshotAsOf)}.` : '',
    errors.length ? `Reason: ${errors.join('; ')}.` : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <span className={`provenance provenance--${modifier}`} title={detail}>
      <span className="provenance__dot" aria-hidden="true" />
      {PROVENANCE_LABEL[provenance]}
      <span className="sr-only"> — {detail}</span>
    </span>
  )
}

/* -- legend ---------------------------------------------------------------- */

export type LegendKind = 'line' | 'rect' | 'none'

function Legend({
  items,
  kind,
  hidden,
  onToggle,
}: {
  items: { id: string; label: string; slot: number }[]
  kind: LegendKind
  hidden: Set<string>
  onToggle: (id: string) => void
}) {
  if (kind === 'none' || items.length < 2) return null
  return (
    <div className="legend" role="group" aria-label="Series legend — activate to show or hide a series">
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          className="legend__item"
          aria-pressed={!hidden.has(item.id)}
          onClick={() => onToggle(item.id)}
        >
          <span
            className={`legend__key legend__key--${kind}`}
            style={{ color: slotColor(item.slot) }}
            aria-hidden="true"
          />
          {item.label}
        </button>
      ))}
    </div>
  )
}

/* -- source line ----------------------------------------------------------- */

function SourceLine({ sourceIds, extra }: { sourceIds: string[]; extra?: ReactNode }) {
  const sources = sourceIds.map(getSource)
  return (
    <p className="figure__source">
      <strong>Source:</strong>{' '}
      {sources.map((s, i) => (
        <span key={s.id}>
          {i > 0 && '; '}
          <a href={s.url} target="_blank" rel="noreferrer noopener">
            {s.publisher}, {s.name}
          </a>
        </span>
      ))}
      {extra ? <> · {extra}</> : null}
    </p>
  )
}

/* -- the frame ------------------------------------------------------------- */

interface FigureFrameProps {
  eyebrow?: string
  title: string
  subtitle?: string
  note?: ReactNode
  sourceIds: string[]
  sourceExtra?: ReactNode
  provenance: Provenance
  fetchedAt?: string
  snapshotAsOf?: string
  errors?: string[]
  controls?: ReactNode
  legend?: ReactNode
  children: ReactNode
  table: ReactNode
  csv?: () => string
  csvName?: string
  stale?: boolean
}

export function FigureFrame({
  eyebrow,
  title,
  subtitle,
  note,
  sourceIds,
  sourceExtra,
  provenance,
  fetchedAt,
  snapshotAsOf,
  errors,
  controls,
  legend,
  children,
  table,
  csv,
  csvName = 'india-in-data.csv',
  stale = false,
}: FigureFrameProps) {
  const [showTable, setShowTable] = useState(false)

  function download() {
    if (!csv) return
    const blob = new Blob([csv()], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = csvName
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <figure className="figure">
      <div className="figure__head">
        {eyebrow && <div className="figure__eyebrow">{eyebrow}</div>}
        <h3 className="figure__title">{title}</h3>
        {subtitle && <p className="figure__subtitle">{subtitle}</p>}
      </div>

      {controls && <div className="figure__controls">{controls}</div>}
      {legend}

      <div className="figure__plot" data-stale={stale ? 'true' : 'false'}>
        {children}
      </div>

      {note && <div className="figure__note">{note}</div>}

      {showTable && <div className="data-table-wrap">{table}</div>}

      <figcaption className="figure__foot">
        <SourceLine sourceIds={sourceIds} extra={sourceExtra} />
        <div className="figure__actions">
          <button
            type="button"
            className="text-button"
            aria-expanded={showTable}
            onClick={() => setShowTable((v) => !v)}
          >
            {showTable ? 'Hide table' : 'Table'}
          </button>
          {csv && (
            <button type="button" className="text-button" onClick={download}>
              CSV
            </button>
          )}
          <ProvenanceBadge
            provenance={provenance}
            fetchedAt={fetchedAt}
            snapshotAsOf={snapshotAsOf}
            errors={errors}
          />
        </div>
      </figcaption>
    </figure>
  )
}

/* -- the series-driven figure ---------------------------------------------- */

export interface FigureSeriesConfig {
  spec: SeriesSpec
  /** Fixed categorical slot. Travels with the entity, never with rank. */
  slot: number
  /** Override the series label for this figure. */
  label?: string
  projected?: boolean
}

interface FigureProps {
  eyebrow?: string
  title: string
  subtitle?: string
  note?: ReactNode
  unit: Unit
  config: FigureSeriesConfig[]
  legendKind?: LegendKind
  controls?: ReactNode
  formatX?: (x: string | number) => string
  children: (series: ChartSeries[]) => ReactNode
  /** Extra source ids beyond those declared by the series. */
  extraSourceIds?: string[]
  csvName?: string
}

export function Figure({
  eyebrow,
  title,
  subtitle,
  note,
  unit,
  config,
  legendKind = 'line',
  controls,
  formatX = (x) => String(x),
  children,
  extraSourceIds = [],
  csvName,
}: FigureProps) {
  const specs = useMemo(() => config.map((c) => c.spec), [config])
  const { series, provenance, loading, fetchedAt, errors } = useSeries(specs)
  const [hidden, setHidden] = useState<Set<string>>(new Set())

  const chartSeries: ChartSeries[] = useMemo(
    () =>
      series.map((loaded, i) => ({
        id: loaded.spec.id,
        label: config[i]?.label ?? loaded.spec.label,
        points: loaded.points,
        slot: config[i]?.slot ?? i + 1,
        unit: loaded.spec.unit,
        projected: config[i]?.projected,
      })),
    [series, config],
  )

  const visible = chartSeries.filter((s) => !hidden.has(s.id))
  const xs = useMemo(() => unionX(chartSeries), [chartSeries])

  const sourceIds = Array.from(
    new Set([
      ...series.flatMap((s) => [s.spec.sourceId, ...(s.spec.alsoSourceIds ?? [])]),
      ...extraSourceIds,
    ]),
  )

  const snapshotAsOf = series
    .map((s) => snapshotDateFor(s.spec))
    .sort()
    .pop()

  // The transcription warning disappears for any series whose snapshot has
  // since been regenerated from the publisher's API.
  const unverified = series.some(
    (s) =>
      s.spec.unverified &&
      !snapshotIsGenerated(s.spec) &&
      (provenance === 'snapshot' || provenance === 'curated'),
  )

  const specNotes = series.map((s) => s.spec.note).filter(Boolean) as string[]

  function csv(): string {
    const header = ['period', ...chartSeries.map((s) => s.label.replace(/,/g, ' '))]
    const lines = [header.join(',')]
    for (const x of xs) {
      const row = [String(x)]
      for (const s of chartSeries) {
        const p = s.points.find((pt) => String(pt.x) === String(x))
        row.push(p && p.y !== null ? String(p.y) : '')
      }
      lines.push(row.join(','))
    }
    return lines.join('\n')
  }

  const table = (
    <table className="data-table">
      <caption className="sr-only">{title} — full data table</caption>
      <thead>
        <tr>
          <th scope="col">Period</th>
          {chartSeries.map((s) => (
            <th key={s.id} scope="col">
              {s.label}
              {unitCaption(s.unit) ? ` (${unitCaption(s.unit)})` : ''}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {xs.map((x) => (
          <tr key={String(x)}>
            <th scope="row">{formatX(x)}</th>
            {chartSeries.map((s) => {
              const p = s.points.find((pt) => String(pt.x) === String(x))
              return <td key={s.id}>{formatValue(p?.y ?? null, s.unit)}</td>
            })}
          </tr>
        ))}
      </tbody>
    </table>
  )

  const combinedNote = (
    <>
      {note}
      {specNotes.length > 0 && (
        <>
          {note ? ' ' : ''}
          {specNotes.join(' ')}
        </>
      )}
      {unverified && (
        <>
          {' '}
          Transcribed snapshot, not yet regenerated from the API —{' '}
          <a className="link" href="#/methodology">
            what that means
          </a>
          .
        </>
      )}
    </>
  )

  return (
    <FigureFrame
      eyebrow={eyebrow}
      title={title}
      subtitle={subtitle}
      note={note || specNotes.length || unverified ? combinedNote : undefined}
      sourceIds={sourceIds}
      sourceExtra={`Measured in ${unitCaption(unit) || 'index points'}.`}
      provenance={loading ? 'loading' : provenance}
      fetchedAt={fetchedAt}
      snapshotAsOf={snapshotAsOf}
      errors={errors}
      controls={controls}
      stale={loading}
      legend={
        <Legend
          items={chartSeries.map((s) => ({ id: s.id, label: s.label, slot: s.slot }))}
          kind={legendKind}
          hidden={hidden}
          onToggle={(id) =>
            setHidden((prev) => {
              const next = new Set(prev)
              if (next.has(id)) next.delete(id)
              else if (next.size < chartSeries.length - 1) next.add(id)
              return next
            })
          }
        />
      }
      table={table}
      csv={csv}
      csvName={csvName ?? `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 48)}.csv`}
    >
      {children(visible)}
    </FigureFrame>
  )
}
