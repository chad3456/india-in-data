import type { Point } from '../types'

/** Compact literal → Point[] helper, so the datasets read like tables. */
export function pts(rows: [string | number, number | null][], flags?: Record<string, string>): Point[] {
  return rows.map(([x, y]) => (flags?.[String(x)] ? { x, y, flag: flags[String(x)] } : { x, y }))
}

/**
 * The date the committed snapshot in this release was assembled.
 *
 * Every snapshot value here was transcribed from the cited publication by
 * hand and has NOT been regenerated from a live API — the environment this
 * repository was built in had no outbound network access. Running
 * `npm run refresh-data` replaces every API-backed series with authoritative
 * values and clears the `unverified` flag. Until that runs, the site tells
 * the reader exactly that rather than implying a precision it does not have.
 */
export const SNAPSHOT_DATE = '2026-07-28'

/** Applied to every hand-transcribed series in this release. */
export const TRANSCRIBED = true
