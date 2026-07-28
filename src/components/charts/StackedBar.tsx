import { useState } from 'react'
import { formatValue } from '../../lib/format'
import type { Unit } from '../../data/types'
import { slotColor, slotInk, useMeasuredWidth } from './chart-kit'
import { Tooltip, type TooltipRow } from './Tooltip'

export interface StackSegment {
  id: string
  label: string
  value: number
  slot: number
}

export interface StackRow {
  label: string
  segments: StackSegment[]
}

interface StackedBarProps {
  rows: StackRow[]
  unit: Unit
  /** Show each row as shares of its own total. */
  normalise?: boolean
  rowHeight?: number
}

const GAP = 2 // the surface gap between touching segments

export function StackedBar({ rows, unit, normalise = true, rowHeight = 34 }: StackedBarProps) {
  const [wrapRef, width] = useMeasuredWidth()
  const [hover, setHover] = useState<{ row: string; seg: StackSegment; x: number; y: number } | null>(
    null,
  )

  const labelW = Math.min(150, Math.max(...rows.map((r) => r.label.length)) * 7.4 + 12)
  const margins = { top: 4, right: 8, bottom: 22, left: labelW }
  const innerW = Math.max(60, width - margins.left - margins.right)
  const gapPitch = rowHeight + 12
  const innerH = rows.length * gapPitch

  return (
    <div ref={wrapRef} style={{ position: 'relative' }}>
      <svg
        className="chart"
        width={width}
        height={innerH + margins.top + margins.bottom}
        role="img"
        aria-label={`Stacked composition chart. Values shown in the table below the chart.`}
      >
        <g transform={`translate(${margins.left},${margins.top})`}>
          {rows.map((row, ri) => {
            const total = row.segments.reduce((sum, s) => sum + Math.max(s.value, 0), 0) || 1
            const denominator = normalise ? total : Math.max(...rows.map((r) => r.segments.reduce((s, x) => s + Math.max(x.value, 0), 0)))
            let cursor = 0
            const y0 = ri * gapPitch

            return (
              <g key={row.label}>
                <text
                  className="chart__tick"
                  x={-10}
                  y={y0 + rowHeight / 2}
                  textAnchor="end"
                  dominantBaseline="middle"
                  style={{ fontVariantNumeric: 'normal' }}
                >
                  {row.label}
                </text>
                {row.segments.map((seg) => {
                  const w = Math.max((Math.max(seg.value, 0) / denominator) * innerW - GAP, 0)
                  const x = cursor
                  cursor += w + GAP
                  const share = (seg.value / total) * 100
                  const labelText = `${Math.round(share)}%`
                  // Only render an in-segment label when it actually fits.
                  const fits = w > labelText.length * 8 + 14

                  return (
                    <g
                      key={seg.id}
                      tabIndex={0}
                      role="button"
                      aria-label={`${row.label}, ${seg.label}: ${formatValue(seg.value, unit)}`}
                      onPointerEnter={() =>
                        setHover({
                          row: row.label,
                          seg,
                          x: margins.left + x + w / 2,
                          y: margins.top + y0,
                        })
                      }
                      onPointerLeave={() => setHover(null)}
                      onFocus={() =>
                        setHover({ row: row.label, seg, x: margins.left + x + w / 2, y: margins.top + y0 })
                      }
                      onBlur={() => setHover(null)}
                      style={{ cursor: 'pointer' }}
                    >
                      <rect
                        x={x}
                        y={y0}
                        width={w}
                        height={rowHeight}
                        fill={slotColor(seg.slot)}
                        rx={2}
                      />
                      {fits && (
                        <text
                          x={x + w / 2}
                          y={y0 + rowHeight / 2}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          style={{ fontSize: 11.5, fontWeight: 600, fill: slotInk(seg.slot) }}
                        >
                          {labelText}
                        </text>
                      )}
                    </g>
                  )
                })}
              </g>
            )
          })}
        </g>
      </svg>

      {hover && (
        <Tooltip
          x={hover.x}
          y={hover.y}
          heading={hover.row}
          rows={
            [
              {
                id: hover.seg.id,
                label: hover.seg.label,
                value: hover.seg.value,
                unit,
                slot: hover.seg.slot,
              },
            ] as TooltipRow[]
          }
          containerWidth={width}
        />
      )}
    </div>
  )
}
