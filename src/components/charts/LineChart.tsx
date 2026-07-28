import { useMemo, useState } from 'react'
import { scaleLinear, scalePoint } from 'd3-scale'
import { line as d3line, area as d3area } from 'd3-shape'
import { formatTick, formatValue } from '../../lib/format'
import type { Point, Unit } from '../../data/types'
import {
  DEFAULT_MARGINS,
  lastDefined,
  slotColor,
  thinTicks,
  unionX,
  useMeasuredWidth,
  yDomain,
  type ChartSeries,
} from './chart-kit'
import { Tooltip, type TooltipRow } from './Tooltip'

export interface Annotation {
  x: string | number
  label: string
}

interface LineChartProps {
  series: ChartSeries[]
  unit: Unit
  height?: number
  /** Fill under the line. Only meaningful for a single series. */
  area?: boolean
  zeroBaseline?: boolean
  yAxisTitle?: string
  annotations?: Annotation[]
  /** Label the final observation of each series directly on the chart. */
  endLabels?: boolean
  formatX?: (x: string | number) => string
}

interface Segment {
  d: string
  key: string
}

export function LineChart({
  series,
  unit,
  height = 300,
  area = false,
  zeroBaseline = true,
  yAxisTitle,
  annotations = [],
  endLabels = true,
  formatX = (x) => String(x),
}: LineChartProps) {
  const [wrapRef, width] = useMeasuredWidth()
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)

  const xs = useMemo(() => unionX(series), [series])
  // Room on the right for end labels; the axis band is inside the height.
  const margins = {
    ...DEFAULT_MARGINS,
    right: endLabels && series.length <= 4 ? 92 : DEFAULT_MARGINS.right,
  }
  const innerW = Math.max(40, width - margins.left - margins.right)
  const innerH = height

  /**
   * When the x values are numeric years, position them on a linear scale.
   * A point scale would space 1990→1995 the same as 2023→2024, which
   * silently misstates the shape of every irregular series on this site.
   * Categorical x values (fiscal-year labels) keep the point scale.
   */
  const numericX = useMemo(() => xs.every((v) => Number.isFinite(Number(v))), [xs])

  const xScale = useMemo(() => {
    if (numericX) {
      const values = xs.map(Number)
      const scale = scaleLinear()
        .domain([Math.min(...values), Math.max(...values)])
        .range([0, innerW])
      return { pos: (v: string | number) => scale(Number(v)), linear: scale }
    }
    const scale = scalePoint<string>().domain(xs.map(String)).range([0, innerW])
    return { pos: (v: string | number) => scale(String(v)) ?? 0, linear: null }
  }, [xs, innerW, numericX])
  const px = xScale.pos
  const [y0, y1] = useMemo(() => yDomain(series, { zeroBaseline }), [series, zeroBaseline])
  const y = useMemo(() => scaleLinear().domain([y0, y1]).nice(6).range([innerH, 0]), [y0, y1, innerH])

  const yTicks = y.ticks(5)
  const tickBudget = width < 480 ? 4 : width < 720 ? 6 : 9
  // On a linear time axis the ticks come from the scale, not from wherever
  // the observations happen to fall — otherwise dense years collide.
  const xTickValues: (string | number)[] = xScale.linear
    ? xScale.linear.ticks(tickBudget).filter((t) => Number.isInteger(t))
    : thinTicks(xs, tickBudget)

  const segments = useMemo<Record<string, Segment[]>>(() => {
    const out: Record<string, Segment[]> = {}
    for (const s of series) {
      const runs: Point[][] = []
      let current: Point[] = []
      for (const p of s.points) {
        if (p.y === null || !Number.isFinite(p.y)) {
          if (current.length) runs.push(current)
          current = []
        } else {
          current.push(p)
        }
      }
      if (current.length) runs.push(current)

      const path = d3line<Point>()
        .x((p) => px(p.x))
        .y((p) => y(p.y as number))

      out[s.id] = runs
        .map((run, i) => ({ d: path(run) ?? '', key: `${s.id}-${i}` }))
        .filter((seg) => seg.d.length > 0)
    }
    return out
  }, [series, px, y])

  const areaPath = useMemo(() => {
    if (!area || series.length === 0) return null
    const s = series[0]
    const gen = d3area<Point>()
      .x((p) => px(p.x))
      .y0(y(Math.max(y0, 0)))
      .y1((p) => y(p.y as number))
      .defined((p) => p.y !== null && Number.isFinite(p.y))
    return gen(s.points)
  }, [area, series, px, y, y0])

  const hoverX = hoverIndex !== null ? xs[hoverIndex] : null

  const tooltipRows: TooltipRow[] =
    hoverX === null
      ? []
      : series.flatMap<TooltipRow>((s) => {
          const p = s.points.find((pt) => String(pt.x) === String(hoverX))
          if (!p || p.y === null || !Number.isFinite(p.y)) return []
          return [{ id: s.id, label: s.label, value: p.y, unit: s.unit, slot: s.slot, flag: p.flag }]
        })

  /** Nearest observation to the pointer, measured in screen space. */
  function indexFromClientX(clientX: number, rect: DOMRect): number {
    if (xs.length === 0) return 0
    const local = clientX - rect.left - margins.left
    let best = 0
    let bestDist = Infinity
    xs.forEach((value, i) => {
      const dist = Math.abs(px(value) - local)
      if (dist < bestDist) {
        bestDist = dist
        best = i
      }
    })
    return best
  }

  // End labels only when the series separate cleanly at the right edge.
  const endPoints = series
    .map((s) => ({ s, p: lastDefined(s) }))
    .filter((e): e is { s: ChartSeries; p: Point } => Boolean(e.p))
  const endYs = endPoints.map((e) => y(e.p.y as number)).sort((a, b) => a - b)
  const labelsCollide = endYs.some((v, i) => i > 0 && v - endYs[i - 1] < 15)
  const showEndLabels = endLabels && series.length <= 4 && !labelsCollide

  return (
    <div ref={wrapRef} style={{ position: 'relative' }}>
      <svg
        className="chart"
        width={width}
        height={innerH + margins.top + margins.bottom}
        role="img"
        aria-label={`Line chart. ${series.map((s) => s.label).join(', ')}. Values shown in the table below the chart.`}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
            e.preventDefault()
            setHoverIndex((prev) => {
              const base = prev ?? xs.length - 1
              const next = e.key === 'ArrowRight' ? base + 1 : base - 1
              return Math.min(xs.length - 1, Math.max(0, next))
            })
          }
          if (e.key === 'Escape') setHoverIndex(null)
        }}
        onBlur={() => setHoverIndex(null)}
      >
        <g transform={`translate(${margins.left},${margins.top})`}>
          <g className="chart__grid">
            {yTicks.map((t) => (
              <line key={t} x1={0} x2={innerW} y1={y(t)} y2={y(t)} />
            ))}
          </g>

          {annotations.map((a) => {
            const ax = px(a.x)
            return (
              <g key={String(a.x)}>
                <line className="chart__annotation-rule" x1={ax} x2={ax} y1={0} y2={innerH} />
                <text className="chart__annotation" x={ax + 5} y={11}>
                  {a.label}
                </text>
              </g>
            )
          })}

          {areaPath && (
            <path className="chart__area" d={areaPath} fill={slotColor(series[0].slot)} />
          )}

          {series.map((s) =>
            (segments[s.id] ?? []).map((seg) => (
              <path
                key={seg.key}
                className="chart__line"
                d={seg.d}
                stroke={slotColor(s.slot)}
                strokeDasharray={s.projected ? '5 4' : undefined}
              />
            )),
          )}

          {/* End markers carry a 2px surface ring so overlaps stay legible. */}
          {endPoints.map(({ s, p }) => (
            <circle
              key={`end-${s.id}`}
              className="chart__marker"
              cx={px(p.x)}
              cy={y(p.y as number)}
              r={4.5}
              fill={slotColor(s.slot)}
            />
          ))}

          {showEndLabels &&
            endPoints.map(({ s, p }) => (
              <g key={`lab-${s.id}`}>
                <text
                  className="chart__label--strong"
                  x={px(p.x) + 10}
                  y={y(p.y as number) - 2}
                  dominantBaseline="middle"
                >
                  {formatValue(p.y, s.unit, { compact: true })}
                </text>
                {series.length > 1 && (
                  <text
                    className="chart__label"
                    x={px(p.x) + 10}
                    y={y(p.y as number) + 12}
                    dominantBaseline="middle"
                  >
                    {s.label.length > 13 ? `${s.label.slice(0, 12)}…` : s.label}
                  </text>
                )}
              </g>
            ))}

          {hoverX !== null && (
            <>
              <line
                className="chart__crosshair"
                x1={px(hoverX)}
                x2={px(hoverX)}
                y1={0}
                y2={innerH}
              />
              {tooltipRows.map((r) => {
                const s = series.find((ser) => ser.id === r.id)
                if (!s || r.value === null) return null
                return (
                  <circle
                    key={`hv-${r.id}`}
                    className="chart__marker"
                    cx={px(hoverX)}
                    cy={y(r.value)}
                    r={4.5}
                    fill={slotColor(s.slot)}
                  />
                )
              })}
            </>
          )}

          {/* Axes */}
          <g className="chart__axis">
            <line x1={0} x2={innerW} y1={innerH} y2={innerH} />
          </g>
          {yTicks.map((t) => (
            <text key={`yt-${t}`} className="chart__tick" x={-10} y={y(t)} textAnchor="end" dominantBaseline="middle">
              {formatTick(t, unit)}
            </text>
          ))}
          {xTickValues.map((t) => (
            <text
              key={`xt-${t}`}
              className="chart__tick"
              x={px(t)}
              y={innerH + 18}
              textAnchor="middle"
            >
              {formatX(t)}
            </text>
          ))}
          {yAxisTitle && (
            <text className="chart__axis-title" x={-margins.left + 4} y={-6}>
              {yAxisTitle}
            </text>
          )}

          <rect
            className="chart__hit"
            x={-margins.left / 2}
            y={0}
            width={innerW + margins.left / 2}
            height={innerH}
            onPointerMove={(e) => {
              const rect = e.currentTarget.ownerSVGElement?.getBoundingClientRect()
              if (rect) setHoverIndex(indexFromClientX(e.clientX, rect))
            }}
            onPointerLeave={() => setHoverIndex(null)}
          />
        </g>
      </svg>

      {hoverX !== null && tooltipRows.length > 0 && (
        <Tooltip
          x={px(hoverX) + margins.left}
          y={margins.top + Math.min(...tooltipRows.map((r) => y(r.value as number)))}
          heading={formatX(hoverX)}
          rows={tooltipRows}
          containerWidth={width}
        />
      )}
    </div>
  )
}
