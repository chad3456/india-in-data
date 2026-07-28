import { useMemo, type ReactNode } from 'react'
import { scaleLinear } from 'd3-scale'
import { line as d3line } from 'd3-shape'
import { getSource } from '../data/sources'
import { useSeries } from '../data/useSeries'
import type { SeriesSpec, Unit } from '../data/types'
import { formatValue } from '../lib/format'
import { ProvenanceBadge } from './Figure'
import { snapshotDateFor, snapshotFor } from '../data/loader'
import { slotColor } from './charts/chart-kit'
import type { Point } from '../data/types'

/* -- sparkline ------------------------------------------------------------- */

export function Sparkline({
  points,
  slot = 1,
  width = 108,
  height = 26,
}: {
  points: Point[]
  slot?: number
  width?: number
  height?: number
}) {
  const usable = points.filter((p) => p.y !== null && Number.isFinite(p.y)).slice(-12)
  const path = useMemo(() => {
    if (usable.length < 2) return null
    const ys = usable.map((p) => p.y as number)
    const x = scaleLinear().domain([0, usable.length - 1]).range([1, width - 1])
    const y = scaleLinear().domain([Math.min(...ys), Math.max(...ys)]).range([height - 3, 3])
    const gen = d3line<number>()
      .x((_, i) => x(i))
      .y((v) => y(v))
    return { d: gen(ys) ?? '', lastX: x(usable.length - 1), lastY: y(ys[ys.length - 1]) }
  }, [usable, width, height])

  if (!path) return null

  return (
    <svg width={width} height={height} aria-hidden="true" style={{ overflow: 'visible' }}>
      <path d={path.d} fill="none" stroke="var(--series-context)" strokeWidth={1.5} strokeLinejoin="round" />
      <circle cx={path.lastX} cy={path.lastY} r={3} fill={slotColor(slot)} />
    </svg>
  )
}

/* -- presentational tile --------------------------------------------------- */

interface StatTileProps {
  label: string
  value: ReactNode
  delta?: ReactNode
  deltaGood?: boolean
  foot?: ReactNode
  sparkline?: ReactNode
}

export function StatTile({ label, value, delta, deltaGood, foot, sparkline }: StatTileProps) {
  return (
    <div className="stat-tile">
      <div className="stat-tile__label">{label}</div>
      <div className="stat-tile__value">{value}</div>
      {delta && (
        <div className={`stat-tile__delta${deltaGood ? ' stat-tile__delta--good' : ''}`}>{delta}</div>
      )}
      {sparkline}
      {foot && <div className="stat-tile__foot">{foot}</div>}
    </div>
  )
}

/* -- series-driven tile ---------------------------------------------------- */

interface SeriesStatProps {
  spec: SeriesSpec
  label: string
  /** Compare the latest value against this period. */
  compareTo?: string | number
  betterWhen?: 'higher' | 'lower'
  slot?: number
  unitOverride?: Unit
  showSparkline?: boolean
}

export function SeriesStat({
  spec,
  label,
  compareTo,
  betterWhen = 'higher',
  slot = 1,
  unitOverride,
  showSparkline = true,
}: SeriesStatProps) {
  const { series, provenance, loading, fetchedAt } = useSeries(useMemo(() => [spec], [spec]))
  const loaded = series[0]
  const unit = unitOverride ?? spec.unit
  const points = loaded?.points ?? snapshotFor(spec)

  const latest = [...points].reverse().find((p) => p.y !== null && Number.isFinite(p.y))
  const base = compareTo
    ? points.find((p) => String(p.x) === String(compareTo))
    : points.find((p) => p.y !== null && Number.isFinite(p.y))

  const improved =
    latest && base && latest.y !== null && base.y !== null
      ? betterWhen === 'higher'
        ? latest.y > base.y
        : latest.y < base.y
      : false

  const source = getSource(spec.sourceId)

  return (
    <StatTile
      label={label}
      value={formatValue(latest?.y ?? null, unit)}
      delta={
        base && latest && base.y !== null && latest.y !== null && String(base.x) !== String(latest.x)
          ? `${formatValue(base.y, unit)} in ${base.x} → ${latest.x}`
          : undefined
      }
      deltaGood={improved}
      sparkline={showSparkline ? <Sparkline points={points} slot={slot} /> : undefined}
      foot={
        <>
          <a href={source.url} target="_blank" rel="noreferrer noopener">
            {source.publisher}
          </a>{' '}
          ·{' '}
          <ProvenanceBadge
            provenance={loading ? 'loading' : provenance}
            fetchedAt={fetchedAt}
            snapshotAsOf={snapshotDateFor(spec)}
          />
        </>
      }
    />
  )
}

/* -- pull statistic (prose break) ------------------------------------------ */

export function PullStat({ value, children }: { value: string; children: ReactNode }) {
  return (
    <div className="pullstat">
      <div className="pullstat__value">{value}</div>
      <p className="pullstat__body">{children}</p>
    </div>
  )
}
