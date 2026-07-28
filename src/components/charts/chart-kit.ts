import { useEffect, useRef, useState } from 'react'
import type { Point, Unit } from '../../data/types'

/** A series as a chart consumes it. `slot` is the fixed categorical slot. */
export interface ChartSeries {
  id: string
  label: string
  points: Point[]
  /**
   * 1–8 map to the validated categorical slots; 0 is the de-emphasised
   * "context" grey. The slot travels with the entity, so hiding a series in
   * the legend never repaints the survivors.
   */
  slot: number
  unit: Unit
  /** Draw as a dashed projection rather than an observation. */
  projected?: boolean
}

export function slotColor(slot: number): string {
  if (slot <= 0) return 'var(--series-context)'
  return `var(--series-${Math.min(slot, 8)})`
}

/**
 * Ink for a label placed *inside* a filled mark — the one case where text may
 * sit on a series colour. Picked per slot by the fill's luminance.
 */
export function slotInk(slot: number): string {
  if (slot <= 0) return 'var(--series-context-ink)'
  return `var(--series-${Math.min(slot, 8)}-ink)`
}

export interface Margins {
  top: number
  right: number
  bottom: number
  left: number
}

export const DEFAULT_MARGINS: Margins = { top: 16, right: 20, bottom: 36, left: 56 }

/** Width observer so charts fill their card and re-render on resize. */
export function useMeasuredWidth(fallback = 720): [React.RefObject<HTMLDivElement>, number] {
  const ref = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(fallback)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const update = () => setWidth(Math.max(280, el.clientWidth))
    update()
    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', update)
      return () => window.removeEventListener('resize', update)
    }
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  return [ref, width]
}

/** Ordered union of x values across series, preserving first-seen order. */
export function unionX(series: ChartSeries[]): (string | number)[] {
  const seen = new Set<string>()
  const out: (string | number)[] = []
  for (const s of series) {
    for (const p of s.points) {
      const key = String(p.x)
      if (!seen.has(key)) {
        seen.add(key)
        out.push(p.x)
      }
    }
  }
  const allNumeric = out.every((v) => typeof v === 'number' || /^-?\d+(\.\d+)?$/.test(String(v)))
  if (allNumeric) return out.slice().sort((a, b) => Number(a) - Number(b))

  // Fiscal-year style labels ("2016-17", "2024-25") must be ordered, not left
  // in first-seen order — otherwise two series with different start years put
  // the earlier period on the right-hand end of the axis.
  const allYearLed = out.every((v) => /^\d{4}/.test(String(v)))
  if (allYearLed) {
    return out
      .slice()
      .sort((a, b) => String(a).localeCompare(String(b), undefined, { numeric: true }))
  }
  return out
}

export function valueExtent(series: ChartSeries[]): [number, number] {
  let min = Infinity
  let max = -Infinity
  for (const s of series) {
    for (const p of s.points) {
      if (p.y === null || !Number.isFinite(p.y)) continue
      if (p.y < min) min = p.y
      if (p.y > max) max = p.y
    }
  }
  if (!Number.isFinite(min) || !Number.isFinite(max)) return [0, 1]
  if (min === max) return [min === 0 ? 0 : min * 0.9, max === 0 ? 1 : max * 1.1]
  return [min, max]
}

/**
 * A y-domain that keeps zero when it is close, because a truncated axis on a
 * magnitude series overstates change. Charts that legitimately need a
 * non-zero baseline (rates, indices) pass `zeroBaseline: false` explicitly.
 */
export function yDomain(
  series: ChartSeries[],
  options: { zeroBaseline?: boolean; padding?: number } = {},
): [number, number] {
  const { zeroBaseline = true, padding = 0.08 } = options
  const [min, max] = valueExtent(series)
  if (zeroBaseline) {
    const top = max + (max - Math.min(0, min)) * padding
    return [Math.min(0, min), top]
  }
  const span = max - min
  return [min - span * padding, max + span * padding]
}

export function pointAt(series: ChartSeries, x: string | number): Point | undefined {
  const key = String(x)
  return series.points.find((p) => String(p.x) === key)
}

/** Last observation with a real value. */
export function lastDefined(series: ChartSeries): Point | undefined {
  for (let i = series.points.length - 1; i >= 0; i -= 1) {
    const p = series.points[i]
    if (p.y !== null && Number.isFinite(p.y)) return p
  }
  return undefined
}

export function firstDefined(series: ChartSeries): Point | undefined {
  return series.points.find((p) => p.y !== null && Number.isFinite(p.y))
}

/** Evenly thinned tick labels so the x-axis never collides. */
export function thinTicks<T>(values: T[], maxTicks: number): T[] {
  if (values.length <= maxTicks) return values
  const step = Math.ceil(values.length / maxTicks)
  const out: T[] = []
  for (let i = 0; i < values.length; i += step) out.push(values[i])
  const last = values[values.length - 1]
  if (out[out.length - 1] !== last) out.push(last)
  return out
}
