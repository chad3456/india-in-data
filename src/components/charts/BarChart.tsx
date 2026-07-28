import { useMemo, useState } from 'react'
import { scaleBand, scaleLinear } from 'd3-scale'
import { formatTick, formatValue } from '../../lib/format'
import type { Unit } from '../../data/types'
import { slotColor, unionX, useMeasuredWidth, valueExtent, type ChartSeries } from './chart-kit'
import { Tooltip, type TooltipRow } from './Tooltip'

const MAX_BAR = 24 // never fill the band; the leftover is air
const GAP = 2 // the surface gap that separates touching marks

/** A bar with a 4px rounded data-end and a square baseline end. */
function barPath(
  x: number,
  y: number,
  w: number,
  h: number,
  orientation: 'horizontal' | 'vertical',
): string {
  const r = Math.min(4, orientation === 'vertical' ? w / 2 : h / 2, orientation === 'vertical' ? h : w)
  if (r <= 0.5) return `M${x},${y}h${w}v${h}h${-w}Z`
  if (orientation === 'vertical') {
    // grows upward from the baseline: round the top
    return `M${x},${y + h}V${y + r}a${r},${r} 0 0 1 ${r},${-r}h${w - 2 * r}a${r},${r} 0 0 1 ${r},${r}V${y + h}Z`
  }
  // grows rightward from the baseline: round the right end
  return `M${x},${y}h${w - r}a${r},${r} 0 0 1 ${r},${r}v${h - 2 * r}a${r},${r} 0 0 1 ${-r},${r}H${x}Z`
}

interface BarChartProps {
  series: ChartSeries[]
  unit: Unit
  orientation?: 'horizontal' | 'vertical'
  /** Plot height for vertical charts; ignored for horizontal (sized by rows). */
  height?: number
  /** Print the value at the tip of each bar. */
  valueLabels?: boolean
  /**
   * Emphasis: the named categories keep their series colour, the rest fall to
   * the context grey. This is how a "where India sits" chart says one thing.
   */
  highlight?: (string | number)[]
  formatX?: (x: string | number) => string
}

export function BarChart({
  series,
  unit,
  orientation = 'vertical',
  height = 300,
  valueLabels = true,
  highlight,
  formatX = (x) => String(x),
}: BarChartProps) {
  const [wrapRef, width] = useMeasuredWidth()
  const [hover, setHover] = useState<{ x: string | number; cx: number; cy: number } | null>(null)

  const categories = useMemo(() => unionX(series), [series])
  const horizontal = orientation === 'horizontal'

  const longestLabel = categories.reduce<number>((m, c) => Math.max(m, formatX(c).length), 0)
  const margins = horizontal
    ? { top: 8, right: valueLabels ? 74 : 20, bottom: 28, left: Math.min(190, 9 + longestLabel * 7.1) }
    : { top: 20, right: 16, bottom: 40, left: 56 }

  const rowHeight = 30
  const innerH = horizontal ? Math.max(categories.length * rowHeight, 60) : height
  const innerW = Math.max(40, width - margins.left - margins.right)

  const band = useMemo(
    () =>
      scaleBand<string>()
        .domain(categories.map(String))
        .range(horizontal ? [0, innerH] : [0, innerW])
        .paddingInner(0.28)
        .paddingOuter(0.14),
    [categories, horizontal, innerH, innerW],
  )

  const [minV, maxV] = valueExtent(series)
  const value = useMemo(
    () =>
      scaleLinear()
        .domain([Math.min(0, minV), maxV * 1.02])
        .nice(5)
        .range(horizontal ? [0, innerW] : [innerH, 0]),
    [minV, maxV, horizontal, innerW, innerH],
  )

  const ticks = value.ticks(horizontal ? 4 : 5)
  const groupCount = series.length
  const slotSize = Math.min(MAX_BAR, band.bandwidth() / Math.max(groupCount, 1) - (groupCount > 1 ? GAP : 0))
  const groupWidth = slotSize * groupCount + GAP * (groupCount - 1)
  const groupOffset = (band.bandwidth() - groupWidth) / 2

  const hoverRows: TooltipRow[] = hover
    ? series.flatMap<TooltipRow>((s) => {
        const p = s.points.find((pt) => String(pt.x) === String(hover.x))
        if (!p || p.y === null) return []
        return [{ id: s.id, label: s.label, value: p.y, unit: s.unit, slot: s.slot, flag: p.flag }]
      })
    : []

  function colorFor(s: ChartSeries, x: string | number): string {
    if (!highlight) return slotColor(s.slot)
    return highlight.map(String).includes(String(x)) ? slotColor(s.slot) : slotColor(0)
  }

  return (
    <div ref={wrapRef} style={{ position: 'relative' }}>
      <svg
        className="chart"
        width={width}
        height={innerH + margins.top + margins.bottom}
        role="img"
        aria-label={`Bar chart. ${series.map((s) => s.label).join(', ')}. Values shown in the table below the chart.`}
      >
        <g transform={`translate(${margins.left},${margins.top})`}>
          <g className="chart__grid">
            {ticks.map((t) =>
              horizontal ? (
                <line key={t} x1={value(t)} x2={value(t)} y1={0} y2={innerH} />
              ) : (
                <line key={t} x1={0} x2={innerW} y1={value(t)} y2={value(t)} />
              ),
            )}
          </g>

          {categories.map((c) => {
            const base = band(String(c)) ?? 0
            return series.map((s, si) => {
              const p = s.points.find((pt) => String(pt.x) === String(c))
              if (!p || p.y === null || !Number.isFinite(p.y)) return null
              const v = p.y as number
              const off = base + groupOffset + si * (slotSize + GAP)
              const zero = value(Math.max(Math.min(0, minV), 0))

              const geom = horizontal
                ? { x: 0, y: off, w: Math.max(value(v) - zero, 0.5), h: slotSize }
                : { x: off, y: value(v), w: slotSize, h: Math.max(zero - value(v), 0.5) }

              const labelX = horizontal ? geom.w + 8 : geom.x + geom.w / 2
              const labelY = horizontal ? geom.y + geom.h / 2 : geom.y - 7

              return (
                <g
                  key={`${s.id}-${c}`}
                  className="chart__bar-group"
                  tabIndex={0}
                  role="button"
                  aria-label={`${formatX(c)}, ${s.label}: ${formatValue(v, s.unit)}`}
                  onFocus={() =>
                    setHover({
                      x: c,
                      cx: margins.left + (horizontal ? geom.w : geom.x + geom.w / 2),
                      cy: margins.top + (horizontal ? geom.y : geom.y),
                    })
                  }
                  onBlur={() => setHover(null)}
                  onPointerEnter={() =>
                    setHover({
                      x: c,
                      cx: margins.left + (horizontal ? geom.w : geom.x + geom.w / 2),
                      cy: margins.top + (horizontal ? geom.y : geom.y),
                    })
                  }
                  onPointerLeave={() => setHover(null)}
                >
                  <path
                    className="chart__bar"
                    d={barPath(geom.x, geom.y, geom.w, geom.h, orientation)}
                    fill={colorFor(s, c)}
                  />
                  {/* The hit target is bigger than the mark. */}
                  <rect
                    className="chart__mark-hit"
                    x={horizontal ? 0 : geom.x - GAP}
                    y={horizontal ? geom.y - GAP : 0}
                    width={horizontal ? innerW : geom.w + GAP * 2}
                    height={horizontal ? geom.h + GAP * 2 : innerH}
                  />
                  {valueLabels && groupCount === 1 && (
                    <text
                      className="chart__label--strong"
                      x={labelX}
                      y={labelY}
                      textAnchor={horizontal ? 'start' : 'middle'}
                      dominantBaseline={horizontal ? 'middle' : 'auto'}
                    >
                      {formatValue(v, s.unit, { compact: true })}
                    </text>
                  )}
                </g>
              )
            })
          })}

          <g className="chart__axis">
            {horizontal ? (
              <line x1={0} x2={0} y1={0} y2={innerH} />
            ) : (
              <line x1={0} x2={innerW} y1={value(Math.max(Math.min(0, minV), 0))} y2={value(Math.max(Math.min(0, minV), 0))} />
            )}
          </g>

          {horizontal
            ? categories.map((c) => (
                <text
                  key={`cl-${c}`}
                  className="chart__tick"
                  x={-10}
                  y={(band(String(c)) ?? 0) + band.bandwidth() / 2}
                  textAnchor="end"
                  dominantBaseline="middle"
                  style={{ fontVariantNumeric: 'normal' }}
                >
                  {formatX(c)}
                </text>
              ))
            : categories.map((c) => (
                <text
                  key={`cl-${c}`}
                  className="chart__tick"
                  x={(band(String(c)) ?? 0) + band.bandwidth() / 2}
                  y={innerH + 18}
                  textAnchor="middle"
                  style={{ fontVariantNumeric: 'normal' }}
                >
                  {formatX(c)}
                </text>
              ))}

          {!horizontal &&
            ticks.map((t) => (
              <text
                key={`vt-${t}`}
                className="chart__tick"
                x={-10}
                y={value(t)}
                textAnchor="end"
                dominantBaseline="middle"
              >
                {formatTick(t, unit)}
              </text>
            ))}
          {horizontal &&
            ticks.map((t) => (
              <text key={`vt-${t}`} className="chart__tick" x={value(t)} y={innerH + 18} textAnchor="middle">
                {formatTick(t, unit)}
              </text>
            ))}
        </g>
      </svg>

      {hover && hoverRows.length > 0 && (
        <Tooltip
          x={hover.cx}
          y={hover.cy}
          heading={formatX(hover.x)}
          rows={hoverRows}
          containerWidth={width}
        />
      )}
    </div>
  )
}
