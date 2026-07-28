import { useMemo, useState } from 'react'
import { scaleLinear } from 'd3-scale'
import { formatValue } from '../../lib/format'
import type { Unit } from '../../data/types'
import { slotColor, useMeasuredWidth } from './chart-kit'

export interface SlopeRow {
  id: string
  label: string
  from: number
  to: number
  /** Fixed categorical slot; travels with the row. */
  slot: number
}

interface SlopeChartProps {
  rows: SlopeRow[]
  unit: Unit
  fromLabel: string
  toLabel: string
  height?: number
  /** Direction that counts as improvement, for the delta wording only. */
  betterWhen?: 'higher' | 'lower'
}

/**
 * Two periods, one line each. The right form when the story is "these all
 * moved, and here is how far" — it puts the change itself on screen instead
 * of asking the reader to subtract two bars.
 */
export function SlopeChart({
  rows,
  unit,
  fromLabel,
  toLabel,
  height = 340,
  betterWhen = 'higher',
}: SlopeChartProps) {
  const [wrapRef, width] = useMeasuredWidth()
  const [active, setActive] = useState<string | null>(null)

  // The right gutter has to hold the end value AND the row label, so it is
  // sized from the longest label and the label is truncated to what fits.
  const longest = rows.reduce<number>((m, r) => Math.max(m, r.label.length), 0)
  const gutter = Math.max(150, Math.min(width * 0.42, 66 + longest * 6.6))
  const margins = { top: 34, right: gutter, bottom: 26, left: 74 }
  const labelBudget = Math.max(6, Math.floor((gutter - 74) / 6.6))
  const innerW = Math.max(60, width - margins.left - margins.right)
  const innerH = height

  const [lo, hi] = useMemo(() => {
    const values = rows.flatMap((r) => [r.from, r.to])
    const min = Math.min(...values)
    const max = Math.max(...values)
    const pad = (max - min) * 0.12 || 1
    return [min - pad, max + pad]
  }, [rows])

  const y = scaleLinear().domain([lo, hi]).range([innerH, 0])

  /**
   * Right-hand labels are pushed apart to a minimum gap and joined back to
   * their end dot with a leader line. Nudging a label without a connector
   * detaches it from its series and reads as noise, so the connector is not
   * optional here.
   */
  const labelY = useMemo(() => {
    const MIN_GAP = 15
    const ordered = rows
      .map((r) => ({ id: r.id, target: y(r.to) }))
      .sort((a, b) => a.target - b.target)

    let previous = -Infinity
    for (const item of ordered) {
      const placed = Math.max(item.target, previous + MIN_GAP)
      previous = placed
      item.target = placed
    }
    // If the pass pushed labels past the bottom, slide the whole stack back up.
    const overflow = previous - innerH
    if (overflow > 0) ordered.forEach((item) => (item.target -= overflow))

    return new Map(ordered.map((item) => [item.id, item.target]))
  }, [rows, y, innerH])

  return (
    <div ref={wrapRef} style={{ position: 'relative' }}>
      <svg
        className="chart"
        width={width}
        height={innerH + margins.top + margins.bottom}
        role="img"
        aria-label={`Slope chart comparing ${fromLabel} with ${toLabel}. Values shown in the table below the chart.`}
      >
        <g transform={`translate(${margins.left},${margins.top})`}>
          <g className="chart__axis">
            <line x1={0} x2={0} y1={-10} y2={innerH} />
            <line x1={innerW} x2={innerW} y1={-10} y2={innerH} />
          </g>

          <text className="chart__axis-title" x={0} y={-20} textAnchor="middle">
            {fromLabel}
          </text>
          <text className="chart__axis-title" x={innerW} y={-20} textAnchor="middle">
            {toLabel}
          </text>

          {rows.map((r) => {
            const dim = active !== null && active !== r.id
            const improved = betterWhen === 'higher' ? r.to > r.from : r.to < r.from
            return (
              <g
                key={r.id}
                opacity={dim ? 0.28 : 1}
                tabIndex={0}
                role="button"
                aria-label={`${r.label}: ${formatValue(r.from, unit)} in ${fromLabel}, ${formatValue(
                  r.to,
                  unit,
                )} in ${toLabel}. ${improved ? 'Improved' : 'Worsened'}.`}
                onPointerEnter={() => setActive(r.id)}
                onPointerLeave={() => setActive(null)}
                onFocus={() => setActive(r.id)}
                onBlur={() => setActive(null)}
              >
                <line
                  x1={0}
                  x2={innerW}
                  y1={y(r.from)}
                  y2={y(r.to)}
                  stroke={slotColor(r.slot)}
                  strokeWidth={2}
                  strokeLinecap="round"
                />
                <circle className="chart__marker" cx={0} cy={y(r.from)} r={4.5} fill={slotColor(r.slot)} />
                <circle className="chart__marker" cx={innerW} cy={y(r.to)} r={4.5} fill={slotColor(r.slot)} />

                <text
                  className="chart__label"
                  x={-12}
                  y={y(r.from)}
                  textAnchor="end"
                  dominantBaseline="middle"
                >
                  {formatValue(r.from, unit, { compact: true })}
                </text>
                {Math.abs((labelY.get(r.id) ?? y(r.to)) - y(r.to)) > 1.5 && (
                  <polyline
                    points={`${innerW + 5},${y(r.to)} ${innerW + 8},${labelY.get(r.id)} ${innerW + 11},${labelY.get(r.id)}`}
                    fill="none"
                    stroke={slotColor(r.slot)}
                    strokeWidth={1}
                    opacity={0.6}
                  />
                )}
                <text
                  className="chart__label--strong"
                  x={innerW + 12}
                  y={labelY.get(r.id) ?? y(r.to)}
                  dominantBaseline="middle"
                >
                  {formatValue(r.to, unit, { compact: true })}
                </text>
                <text
                  className="chart__label"
                  x={innerW + 64}
                  y={labelY.get(r.id) ?? y(r.to)}
                  dominantBaseline="middle"
                >
                  {r.label.length > labelBudget ? `${r.label.slice(0, labelBudget - 1)}…` : r.label}
                </text>
                {/* Hit target spanning the whole slope, well above 24px. */}
                <line
                  x1={0}
                  x2={innerW}
                  y1={y(r.from)}
                  y2={y(r.to)}
                  stroke="transparent"
                  strokeWidth={26}
                  style={{ cursor: 'pointer' }}
                />
              </g>
            )
          })}
        </g>
      </svg>
    </div>
  )
}
