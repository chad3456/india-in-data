import type { Unit } from '../data/types'

const inGrouping = new Intl.NumberFormat('en-IN')

function fixed(value: number, precision: number): string {
  return value.toLocaleString('en-IN', {
    minimumFractionDigits: precision,
    maximumFractionDigits: precision,
  })
}

/** Compact form for large plain counts: 1.4 crore, 58.2 lakh, 4,312. */
export function compactIndian(value: number, precision = 2): string {
  const abs = Math.abs(value)
  if (abs >= 1e7) return `${fixed(value / 1e7, precision)} crore`
  if (abs >= 1e5) return `${fixed(value / 1e5, precision)} lakh`
  return inGrouping.format(Math.round(value))
}

/** Compact form for internationally-scaled numbers: 3.91T, 421B, 55.2M. */
export function compactWestern(value: number, precision = 2): string {
  const abs = Math.abs(value)
  if (abs >= 1e12) return `${fixed(value / 1e12, precision)}T`
  if (abs >= 1e9) return `${fixed(value / 1e9, precision)}B`
  if (abs >= 1e6) return `${fixed(value / 1e6, precision)}M`
  if (abs >= 1e3) return inGrouping.format(Math.round(value))
  return fixed(value, precision)
}

function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return `${n}${s[(v - 20) % 10] ?? s[v] ?? s[0]}`
}

export interface FormatOptions {
  precision?: number
  /** Axis ticks and dense labels drop the unit word and shorten further. */
  compact?: boolean
}

/**
 * The single formatting entry point. Every value shown anywhere — tooltip,
 * axis tick, stat tile, table cell — passes through here, so a series is
 * rendered the same way wherever it appears.
 */
export function formatValue(
  value: number | null | undefined,
  unit: Unit,
  options: FormatOptions = {},
): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return '—'
  const { compact = false } = options
  const p = options.precision

  switch (unit) {
    case 'usd':
      return `$${compactWestern(value, p ?? (Math.abs(value) >= 1e12 ? 2 : 1))}`
    case 'usd-billion':
      return compact ? `${fixed(value, p ?? 0)}` : `$${fixed(value, p ?? 0)}bn`
    case 'usd-trillion':
      return compact ? `${fixed(value, p ?? 1)}` : `$${fixed(value, p ?? 1)}tn`
    case 'inr':
      return `₹${fixed(value, p ?? 0)}`
    case 'inr-crore':
      return compact ? inGrouping.format(Math.round(value)) : `₹${inGrouping.format(Math.round(value))} crore`
    case 'inr-lakh-crore':
      return compact ? fixed(value, p ?? 2) : `₹${fixed(value, p ?? 2)} lakh crore`
    case 'percent':
      return `${fixed(value, p ?? 1)}%`
    case 'count':
      return compact ? compactIndian(value, p ?? 1) : compactIndian(value, p ?? 2)
    case 'million':
      return compact ? fixed(value, p ?? 0) : `${fixed(value, p ?? 1)} million`
    case 'billion':
      return compact ? fixed(value, p ?? 1) : `${fixed(value, p ?? 2)} billion`
    case 'per-lakh':
      return compact ? fixed(value, p ?? 1) : `${fixed(value, p ?? 1)} per lakh`
    case 'per-1000':
      return compact ? fixed(value, p ?? 0) : `${fixed(value, p ?? 0)} per 1,000`
    case 'years':
      return compact ? fixed(value, p ?? 1) : `${fixed(value, p ?? 1)} years`
    case 'usd-per-gb':
      return `$${fixed(value, p ?? 2)}`
    case 'km':
      return compact ? inGrouping.format(Math.round(value)) : `${inGrouping.format(Math.round(value))} km`
    case 'rank':
      return compact ? String(Math.round(value)) : ordinal(Math.round(value))
    case 'ratio':
      return `${fixed(value, p ?? 2)}×`
    case 'index':
    default: {
      if (p !== undefined) return fixed(value, p)
      const abs = Math.abs(value)
      // An index can be an HDI score (0.685) or a SIPRI TIV (4,386). One
      // fixed precision cannot serve both, so scale the decimals to the value.
      if (abs >= 100) return inGrouping.format(Math.round(value))
      if (abs >= 1) return fixed(value, 2)
      return fixed(value, 3)
    }
  }
}

/** Short axis-tick form. Never carries a unit word. */
export function formatTick(value: number, unit: Unit): string {
  switch (unit) {
    case 'usd':
      return `$${compactWestern(value, Math.abs(value) >= 1e12 ? 1 : 0)}`
    case 'usd-billion':
    case 'usd-trillion':
    case 'inr-lakh-crore':
    case 'billion':
      return Number.isInteger(value) ? inGrouping.format(value) : fixed(value, 1)
    case 'percent':
      return `${Number.isInteger(value) ? value : fixed(value, 1)}%`
    case 'count':
      return compactIndian(value, 1)
    case 'inr-crore':
      return compactWestern(value, 0)
    default:
      return formatValue(value, unit, { compact: true })
  }
}

export function unitCaption(unit: Unit): string {
  switch (unit) {
    case 'usd':
      return 'current US$'
    case 'usd-billion':
      return 'US$ billion'
    case 'usd-trillion':
      return 'US$ trillion'
    case 'inr':
      return '₹'
    case 'inr-crore':
      return '₹ crore'
    case 'inr-lakh-crore':
      return '₹ lakh crore'
    case 'percent':
      return 'per cent'
    case 'per-lakh':
      return 'per 100,000 people'
    case 'per-1000':
      return 'per 1,000'
    case 'million':
      return 'million'
    case 'billion':
      return 'billion'
    case 'years':
      return 'years'
    case 'rank':
      return 'rank'
    case 'usd-per-gb':
      return 'US$ per GB'
    case 'km':
      return 'kilometres'
    default:
      return ''
  }
}

export function formatDateTime(iso: string | undefined): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatDate(iso: string | undefined): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
}

/** Signed change, for stat-tile deltas. */
export function formatDelta(from: number, to: number, unit: Unit): string {
  const diff = to - from
  const sign = diff > 0 ? '+' : diff < 0 ? '−' : ''
  return `${sign}${formatValue(Math.abs(diff), unit)}`
}
