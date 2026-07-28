import { formatValue } from '../../lib/format'
import type { Unit } from '../../data/types'
import { slotColor } from './chart-kit'

export interface TooltipRow {
  id: string
  label: string
  value: number | null
  unit: Unit
  slot: number
  flag?: string
}

interface TooltipProps {
  x: number
  y: number
  heading: string
  rows: TooltipRow[]
  /** Keeps the pop-up inside the plot rather than off the card edge. */
  containerWidth: number
}

export function Tooltip({ x, y, heading, rows, containerWidth }: TooltipProps) {
  // Clamp so the tooltip never leaves the figure.
  const clampedX = Math.min(Math.max(x, 90), Math.max(containerWidth - 90, 90))

  return (
    <div className="tooltip" style={{ left: clampedX, top: Math.max(y - 12, 8) }} role="status">
      <div className="tooltip__head">{heading}</div>
      {rows.map((row) => (
        <div className="tooltip__row" key={row.id}>
          <span className="tooltip__key" style={{ color: slotColor(row.slot) }} aria-hidden="true" />
          <span className="tooltip__value">{formatValue(row.value, row.unit)}</span>
          <span className="tooltip__name">{row.label}</span>
        </div>
      ))}
      {rows.some((r) => r.flag) && (
        <div className="tooltip__head" style={{ marginTop: '0.4rem', marginBottom: 0 }}>
          {rows.find((r) => r.flag)?.flag}
        </div>
      )}
    </div>
  )
}
