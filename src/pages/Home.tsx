import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { CHAPTERS } from '../chapters/registry'
import { Prose, Section } from '../components/Chrome'
import { ProvenanceBadge } from '../components/Figure'
import { SeriesStat } from '../components/StatTile'
import { gdpCurrentUsd, populationIndia, shareOfWorldGdp } from '../data/series/global'
import { extremePoverty } from '../data/series/living'
import { useSeries } from '../data/useSeries'
import { formatValue } from '../lib/format'

function HeroNumber() {
  const { series, provenance, loading, fetchedAt } = useSeries(useMemo(() => [gdpCurrentUsd], []))
  const points = series[0]?.points ?? gdpCurrentUsd.snapshot
  const latest = [...points].reverse().find((p) => p.y !== null)

  return (
    <div style={{ marginTop: '2.75rem' }}>
      <div className="kicker kicker--muted">India&rsquo;s economy, latest available year</div>
      <div className="hero-figure" style={{ marginTop: '0.5rem' }}>
        {formatValue(latest?.y ?? null, 'usd')}
      </div>
      <div
        className="ui-label"
        style={{ marginTop: '0.75rem', display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap' }}
      >
        <span>Gross domestic product, {latest?.x ?? '—'}, current US dollars</span>
        <ProvenanceBadge
          provenance={loading ? 'loading' : provenance}
          fetchedAt={fetchedAt}
          snapshotAsOf={gdpCurrentUsd.snapshotAsOf}
        />
      </div>
    </div>
  )
}

export function Home() {
  return (
    <>
      <section className="hero">
        <div className="container">
          <div className="kicker">A data narrative · updated from source, on load</div>
          <h1 className="hero__title">The growth of India, told in numbers that cite themselves.</h1>
          <p className="lede hero__lede">
            Five chapters, built on official statistics and multilateral datasets. Every chart states
            where its numbers came from, when they were retrieved, and what they cannot tell you.
            Where the data is contested, the chart says so.
          </p>
          <HeroNumber />
          <div className="hero__meta">
            <span>World Bank · IMF · MoSPI · RBI · NCRB · SIPRI · NPCI · UNODC</span>
            <span>
              <Link to="/methodology">How the data mechanism works →</Link>
            </span>
          </div>
        </div>
      </section>

      <Section kicker="The argument" title="Three numbers that have to be read together">
        <Prose>
          <p>
            India is simultaneously one of the largest economies in the world, one of the
            fastest-growing, and a country where the average person earns a fraction of what people
            in the countries it has overtaken earn. Every serious claim about Indian growth lives in
            the tension between those facts.
          </p>
          <p>
            This site does not resolve that tension. It makes it legible: aggregate alongside
            per-person, administrative dashboard alongside household survey, official release
            alongside independent estimate — with the disagreements labelled rather than smoothed.
          </p>
        </Prose>

        <div className="stat-row" style={{ marginTop: '2.25rem' }}>
          <SeriesStat
            spec={shareOfWorldGdp}
            label="Share of world GDP"
            compareTo={2000}
            betterWhen="higher"
            slot={1}
          />
          <SeriesStat spec={populationIndia} label="Population" compareTo={2000} slot={3} />
          <SeriesStat
            spec={extremePoverty}
            label="Living below $2.15 a day"
            compareTo="2011-12"
            betterWhen="lower"
            slot={2}
          />
        </div>
      </Section>

      <Section kicker="Contents" title="Five chapters">
        <div className="chapter-grid" style={{ maxWidth: 'var(--measure-full)' }}>
          {CHAPTERS.map((c) => (
            <Link key={c.id} to={c.path} className="chapter-card">
              <span className="chapter-card__index">{c.index}</span>
              <span className="chapter-card__title">{c.title}</span>
              <span className="chapter-card__blurb">{c.blurb}</span>
              <span className="chapter-card__cue">Read the chapter →</span>
            </Link>
          ))}
        </div>
      </Section>

      <Section kicker="How to read this site" title="The rules this site holds itself to">
        <div className="method-grid" style={{ maxWidth: 'var(--measure-full)' }}>
          <div className="method-card">
            <h4>Every figure names its source</h4>
            <p>
              A chart cannot be rendered unless its series names an entry in the{' '}
              <Link to="/sources">source register</Link>. The citation and the hyperlink sit under
              the chart, not in an appendix.
            </p>
          </div>
          <div className="method-card">
            <h4>Every figure states its provenance</h4>
            <p>
              A badge on each chart says whether the numbers were fetched live from the publisher,
              reused from your browser&rsquo;s cache, transcribed from a report, or served from the
              repository snapshot because the live call failed.
            </p>
          </div>
          <div className="method-card">
            <h4>Every figure has a table</h4>
            <p>
              Colour is never the only channel. Each chart carries a table view and a CSV export, so
              a value is reachable without hovering, without colour, and without a mouse.
            </p>
          </div>
          <div className="method-card">
            <h4>The caveat is part of the figure</h4>
            <p>
              Recorded crime is not crime. Connections are not services. Gross exports are not value
              added. Where a number is routinely over-read, the note under the chart says so.
            </p>
          </div>
        </div>
      </Section>
    </>
  )
}
