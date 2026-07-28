import { useEffect, useState, type ReactNode } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { CHAPTERS, neighbours } from '../chapters/registry'
import { useDataHealth } from '../data/useSeries'

/* -- theme toggle ---------------------------------------------------------- */

type Theme = 'light' | 'dark' | 'system'

function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(() => {
    const stored = localStorage.getItem('iid-theme')
    return stored === 'light' || stored === 'dark' ? stored : 'system'
  })

  useEffect(() => {
    if (theme === 'system') {
      document.documentElement.removeAttribute('data-theme')
      localStorage.removeItem('iid-theme')
    } else {
      document.documentElement.setAttribute('data-theme', theme)
      localStorage.setItem('iid-theme', theme)
    }
  }, [theme])

  const next: Theme = theme === 'dark' ? 'light' : 'dark'

  return (
    <button
      type="button"
      className="icon-button"
      onClick={() => setTheme(next)}
      aria-label={`Switch to ${next} theme`}
      title={`Switch to ${next} theme`}
    >
      <svg width="15" height="15" viewBox="0 0 16 16" aria-hidden="true" fill="currentColor">
        <path d="M8 1.5a6.5 6.5 0 1 0 6.5 6.5A5 5 0 0 1 8 1.5Z" opacity="0.85" />
      </svg>
    </button>
  )
}

/* -- masthead -------------------------------------------------------------- */

export function Masthead() {
  return (
    <header className="masthead">
      <div className="container masthead__inner">
        <Link to="/" className="masthead__brand">
          <span className="masthead__mark">
            India <em>in Data</em>
          </span>
        </Link>
        <nav className="masthead__nav" aria-label="Primary">
          {CHAPTERS.map((c) => (
            <NavLink
              key={c.id}
              to={c.path}
              className={({ isActive }) => `navlink${isActive ? ' navlink--active' : ''}`}
            >
              {c.navLabel}
            </NavLink>
          ))}
          <NavLink
            to="/sources"
            className={({ isActive }) => `navlink${isActive ? ' navlink--active' : ''}`}
          >
            Sources
          </NavLink>
          <NavLink
            to="/methodology"
            className={({ isActive }) => `navlink${isActive ? ' navlink--active' : ''}`}
          >
            Method
          </NavLink>
        </nav>
        <ThemeToggle />
      </div>
    </header>
  )
}

/* -- footer ---------------------------------------------------------------- */

export function SiteFooter() {
  const health = useDataHealth()

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="site-footer__grid">
          <div>
            <h4>Chapters</h4>
            <ul>
              {CHAPTERS.map((c) => (
                <li key={c.id}>
                  <Link to={c.path}>{c.title}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4>How this works</h4>
            <ul>
              <li>
                <Link to="/sources">Source register</Link>
              </li>
              <li>
                <Link to="/methodology">Method and mechanisms</Link>
              </li>
              <li>
                <Link to="/methodology#provenance">What the badges mean</Link>
              </li>
            </ul>
          </div>
          <div>
            <h4>Data status, this session</h4>
            <ul>
              <li>
                {health.live} series retrieved live from a publisher API
              </li>
              <li>{health.curated} transcribed from a cited release</li>
              <li>{health.snapshot} falling back to the repository snapshot</li>
            </ul>
          </div>
        </div>
        <p className="site-footer__note">
          Every figure on this site states where its numbers came from and when. Nothing here is an
          opinion about whether a number is good news; the charts are built to make the number, its
          source and its caveat visible at the same time. Where a series is contested, the caveat is
          part of the figure, not a footnote to it.
        </p>
      </div>
    </footer>
  )
}

/* -- chapter pager --------------------------------------------------------- */

export function ChapterPager({ id }: { id: string }) {
  const { prev, next } = neighbours(id)
  return (
    <nav className="container pager" aria-label="Chapter navigation">
      {prev ? (
        <Link className="pager__link" to={prev.path}>
          ← Previous
          <strong>{prev.title}</strong>
        </Link>
      ) : (
        <Link className="pager__link" to="/">
          ← Back
          <strong>Introduction</strong>
        </Link>
      )}
      {next ? (
        <Link className="pager__link" to={next.path} style={{ textAlign: 'right' }}>
          Next →
          <strong>{next.title}</strong>
        </Link>
      ) : (
        <Link className="pager__link" to="/sources" style={{ textAlign: 'right' }}>
          Next →
          <strong>The source register</strong>
        </Link>
      )}
    </nav>
  )
}

/* -- scroll restoration ---------------------------------------------------- */

export function ScrollToTop() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (hash) {
      const el = document.getElementById(hash.slice(1))
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        return
      }
    }
    window.scrollTo({ top: 0 })
  }, [pathname, hash])
  return null
}

/* -- section --------------------------------------------------------------- */

export function Section({
  kicker,
  title,
  children,
  id,
}: {
  kicker?: string
  title?: string
  id?: string
  children: ReactNode
}) {
  return (
    <section className="section" id={id}>
      <div className="container">
        {(kicker || title) && (
          <div className="section__head">
            {kicker && <div className="kicker">{kicker}</div>}
            {title && <h2 className="section__title">{title}</h2>}
          </div>
        )}
        {children}
      </div>
    </section>
  )
}

export function Prose({ children }: { children: ReactNode }) {
  return <div className="section__body prose">{children}</div>
}
