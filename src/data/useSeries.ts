import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react'
import { combineProvenance, healthSnapshot, loadSeries, snapshotFor, subscribeHealth } from './loader'
import type { LoadedSeries, Provenance, SeriesSpec } from './types'

export interface SeriesState {
  series: LoadedSeries[]
  provenance: Provenance
  loading: boolean
  /** The most recent live retrieval across the set, if any. */
  fetchedAt?: string
  /** Distinct failure messages, for the figure's diagnostic tooltip. */
  errors: string[]
}

/**
 * Resolve a set of series for one figure. Renders the snapshot immediately on
 * first paint where possible so a chart never shows an empty frame, then
 * swaps in live values when they arrive.
 */
export function useSeries(specs: SeriesSpec[]): SeriesState {
  const key = specs.map((s) => s.id).join('|')

  const initial = useMemo<LoadedSeries[]>(
    () =>
      specs.map((spec) => ({
        spec,
        points: snapshotFor(spec),
        provenance: 'loading' as Provenance,
      })),
    // Recompute only when the identity of the requested set changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key],
  )

  const [state, setState] = useState<SeriesState>(() => ({
    series: initial,
    provenance: 'loading',
    loading: true,
    errors: [],
  }))

  const specsRef = useRef(specs)
  specsRef.current = specs

  useEffect(() => {
    const controller = new AbortController()
    let cancelled = false

    setState({ series: initial, provenance: 'loading', loading: true, errors: [] })

    Promise.all(specsRef.current.map((spec) => loadSeries(spec, controller.signal))).then(
      (resolved) => {
        if (cancelled) return
        const fetchedAt = resolved
          .map((r) => r.fetchedAt)
          .filter((v): v is string => Boolean(v))
          .sort()
          .pop()
        setState({
          series: resolved,
          provenance: combineProvenance(resolved),
          loading: false,
          fetchedAt,
          errors: Array.from(new Set(resolved.map((r) => r.error).filter((e): e is string => Boolean(e)))),
        })
      },
      () => {
        if (cancelled) return
        // loadSeries resolves rather than rejects; this is belt and braces.
        setState({
          series: specsRef.current.map((spec) => ({
            spec,
            points: snapshotFor(spec),
            provenance: 'snapshot' as Provenance,
          })),
          provenance: 'snapshot',
          loading: false,
          errors: ['Retrieval failed'],
        })
      },
    )

    return () => {
      cancelled = true
      controller.abort()
    }
  }, [key, initial])

  return state
}

/** Site-wide count of how many series are live versus falling back. */
export function useDataHealth() {
  return useSyncExternalStore(subscribeHealth, healthSnapshot, healthSnapshot)
}
