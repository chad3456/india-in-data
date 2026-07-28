import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ACCESS_EXPLAINER, ACCESS_LABELS, SOURCES, SOURCE_CATEGORIES } from '../data/sources'
import { SERIES_TOTALS, usageFor } from '../data/series'
import type { Source } from '../data/types'

type CategoryFilter = 'all' | (typeof SOURCE_CATEGORIES)[number]
type AccessFilter = 'all' | Source['access']

export function Sources() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<CategoryFilter>('all')
  const [access, setAccess] = useState<AccessFilter>('all')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return SOURCES.filter((s) => {
      if (category !== 'all' && s.category !== category) return false
      if (access !== 'all' && s.access !== access) return false
      if (!q) return true
      return (
        s.name.toLowerCase().includes(q) ||
        s.publisher.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q)
      )
    })
  }, [query, category, access])

  return (
    <>
      <header className="chapter-header">
        <div className="container">
          <div className="kicker">The register</div>
          <h1 className="chapter-header__title">Every source, in one place</h1>
          <p className="lede chapter-header__lede">
            This is not a bibliography appended after the fact. It is the register the site itself
            reads: a figure cannot cite a source that is not listed here, and the &ldquo;used
            in&rdquo; line under each entry is generated from the figures that actually depend on
            it.
          </p>
          <p className="ui-label" style={{ marginTop: '1.25rem' }}>
            {SOURCES.length} sources · {SERIES_TOTALS.total} series · {SERIES_TOTALS.live} of them
            retrievable live from a publisher API
          </p>
        </div>
      </header>

      <div className="container">
        <div className="filter-bar">
          <input
            className="search-input"
            type="search"
            placeholder="Search sources, publishers, descriptions…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search the source register"
          />

          <div className="control-group">
            <span className="control-group__label">Publisher</span>
            <button
              type="button"
              className="chip"
              aria-pressed={category === 'all'}
              onClick={() => setCategory('all')}
            >
              All
            </button>
            {SOURCE_CATEGORIES.map((c) => (
              <button
                key={c}
                type="button"
                className="chip"
                aria-pressed={category === c}
                onClick={() => setCategory(c)}
              >
                {c === 'Government of India' ? 'Govt of India' : c === 'Reserve Bank of India' ? 'RBI' : c}
              </button>
            ))}
          </div>

          <div className="control-group">
            <span className="control-group__label">Access</span>
            <button
              type="button"
              className="chip"
              aria-pressed={access === 'all'}
              onClick={() => setAccess('all')}
            >
              Any
            </button>
            {(['api', 'bulk', 'publication'] as const).map((a) => (
              <button
                key={a}
                type="button"
                className="chip"
                aria-pressed={access === a}
                onClick={() => setAccess(a)}
                title={ACCESS_EXPLAINER[a]}
              >
                {ACCESS_LABELS[a]}
              </button>
            ))}
          </div>

          <span className="filter-count">
            {filtered.length} of {SOURCES.length}
          </span>
        </div>

        <ul className="source-list">
          {filtered.map((s) => {
            const used = usageFor(s.id)
            return (
              <li className="source-card" key={s.id}>
                <h2 className="source-card__name">
                  <a href={s.url} target="_blank" rel="noreferrer noopener">
                    {s.name}
                  </a>
                </h2>
                <div className="source-card__publisher">{s.publisher}</div>
                <p className="source-card__desc">{s.description}</p>
                {s.caveat && (
                  <p className="source-card__desc" style={{ color: 'var(--text-muted)' }}>
                    <strong>Caveat:</strong> {s.caveat}
                  </p>
                )}
                <div className="source-card__meta">
                  <span className="tag tag--access" title={ACCESS_EXPLAINER[s.access]}>
                    {ACCESS_LABELS[s.access]}
                  </span>
                  <span className="tag">Updated: {s.cadence}</span>
                  <span className="tag">Licence: {s.licence}</span>
                </div>
                <div className="source-card__side">
                  <span className="tag tag--official">{s.category}</span>
                  <a className="ui-label" href={s.url} target="_blank" rel="noreferrer noopener">
                    Open source ↗
                  </a>
                </div>
                {used && (
                  <div className="used-in">
                    Used by {used.seriesCount} {used.seriesCount === 1 ? 'series' : 'series'} in{' '}
                    {used.chapters.map((c, i) => (
                      <span key={c.id}>
                        {i > 0 && ', '}
                        <Link to={c.path}>{c.title}</Link>
                      </span>
                    ))}
                    {used.liveCount > 0 && ` · ${used.liveCount} retrieved live`}
                  </div>
                )}
              </li>
            )
          })}
        </ul>

        {filtered.length === 0 && (
          <p className="lede" style={{ padding: '3rem 0' }}>
            Nothing in the register matches that filter.
          </p>
        )}
      </div>

      <div className="container" style={{ paddingBottom: '4rem', paddingTop: '2.5rem' }}>
        <div className="callout">
          <strong>A source is not an endorsement.</strong> Several entries here are published by the
          government whose performance the site is describing, and the caveats say so. Where an
          official series and an independent one disagree — scheme dashboards against household
          surveys, ministry statements against SIPRI estimates — both are listed and the figures
          show the more conservative one.{' '}
          <Link to="/methodology">The methodology explains how those conflicts are resolved.</Link>
        </div>
      </div>
    </>
  )
}
