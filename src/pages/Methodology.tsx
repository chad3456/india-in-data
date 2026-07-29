import { Link } from 'react-router-dom'
import { Prose, Section } from '../components/Chrome'
import { SERIES_TOTALS } from '../data/series'
import { SOURCES } from '../data/sources'
import { SNAPSHOT_DATE } from '../data/series/kit'
import { formatDate } from '../lib/format'

export function Methodology() {
  return (
    <>
      <header className="chapter-header">
        <div className="container">
          <div className="kicker">Method</div>
          <h1 className="chapter-header__title">How this site gets its numbers, and what it does when it can&rsquo;t</h1>
          <p className="lede chapter-header__lede">
            The claim &ldquo;backed by real-time data from reliable sources&rdquo; is only worth
            anything if the failure modes are specified too. This page specifies them.
          </p>
        </div>
      </header>

      <Section kicker="Mechanism" title="Five tiers, in strict order" id="provenance">
        <Prose>
          <p>
            Every series on this site resolves through the same ladder, and the figure tells you
            which rung it landed on. Nothing renders silently.
          </p>
        </Prose>

        <div className="section__body">
          <table className="spec-table">
            <thead>
              <tr>
                <th scope="col">Badge</th>
                <th scope="col">What happened</th>
                <th scope="col">How current the numbers are</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <strong>Supabase</strong>
                </td>
                <td>
                  Read from this project&rsquo;s own Postgres catalogue, which an ingest job
                  refreshes from the publisher on a schedule. This is the canonical store: it is
                  tried first, in one batched request per page rather than one call per series.
                </td>
                <td>As of the ingest date, which the badge shows.</td>
              </tr>
              <tr>
                <td>
                  <strong>Live</strong>
                </td>
                <td>
                  The catalogue did not have the series, so your browser called the publisher&rsquo;s
                  API directly and it answered. No server of ours sits in between.
                </td>
                <td>As current as the publisher&rsquo;s own release.</td>
              </tr>
              <tr>
                <td>
                  <strong>Live · cached</strong>
                </td>
                <td>
                  The same call succeeded earlier in this browser and the result is still inside its
                  twelve-hour window, so it was reused.
                </td>
                <td>At most twelve hours behind the publisher.</td>
              </tr>
              <tr>
                <td>
                  <strong>Cited release</strong>
                </td>
                <td>
                  The publisher has no machine-readable API at all — the National Crime Records
                  Bureau, the Ministry of Defence, most budget documents. Values are transcribed
                  from the cited release and versioned in the repository.
                </td>
                <td>As current as the last publication, which can be one to two years.</td>
              </tr>
              <tr>
                <td>
                  <strong>Repo snapshot</strong>
                </td>
                <td>
                  The live call failed — offline, blocked, rate-limited, or the publisher changed the
                  endpoint — so the committed fallback is shown instead, dated.
                </td>
                <td>As of the snapshot date printed in the badge tooltip.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <Prose>
          <p>
            A chart is never allowed to look identical whether its data is fresh or eighteen months
            old. That is the whole design intent behind the badges: a stale chart should be visibly
            stale.
          </p>
        </Prose>
      </Section>

      <Section kicker="Architecture" title="Where the data actually lives">
        <Prose>
          <p>
            The catalogue is a Postgres database on Supabase holding four tables: the source
            register, the series definitions, the observations, and an audit log of every ingest
            run. The site reads it with an anonymous key over PostgREST.
          </p>
          <p>
            That key is in the browser bundle, which is safe because row-level security is enabled
            on all four tables and the only policy granted to anonymous readers is{' '}
            <code>select</code>. There is no insert, update or delete policy at all, so a leaked
            anon key gets you a copy of data that is already public on this page and nothing else.
          </p>
          <p>
            Writes happen in exactly one place: an edge function holding the service-role key,
            which fetches each API-backed series from the publisher, replaces that series&rsquo;
            observations wholesale rather than merging — a re-fetch is the whole truth for a series,
            including its revisions — and stamps the ingest time that the badge then displays.
          </p>
          <p>
            The tiers below the database exist because the database can be unreachable, unfunded, or
            simply not configured. Clone this repository with no environment variables at all and
            every figure still renders, one rung down the ladder and saying so.
          </p>
        </Prose>
      </Section>

      <Section kicker="Contract" title="What a series must declare before it can be plotted">
        <Prose>
          <p>
            Series are typed. A figure will not compile unless the series behind it declares a
            source that exists in the <Link to="/sources">register</Link>, the unit it is measured
            in, a committed fallback, and the date that fallback was assembled. This is enforcement,
            not convention: there is no code path that renders an uncited number.
          </p>
        </Prose>

        <div className="section__body">
          <table className="spec-table">
            <thead>
              <tr>
                <th scope="col">Field</th>
                <th scope="col">Why it is mandatory</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <code>sourceId</code>
                </td>
                <td>Resolved against the register at render time. An unknown id throws.</td>
              </tr>
              <tr>
                <td>
                  <code>unit</code>
                </td>
                <td>
                  Drives every rendering of the value — axis, tooltip, table, CSV — so the same
                  series is never formatted two ways.
                </td>
              </tr>
              <tr>
                <td>
                  <code>snapshot</code>
                </td>
                <td>The fallback. Without it a failed fetch would mean an empty chart.</td>
              </tr>
              <tr>
                <td>
                  <code>snapshotAsOf</code>
                </td>
                <td>Printed in the badge whenever the fallback is what you are looking at.</td>
              </tr>
              <tr>
                <td>
                  <code>live</code>
                </td>
                <td>
                  Optional. Present only for publishers who serve open, CORS-enabled APIs — the
                  World Bank, the IMF, and India&rsquo;s open-data platform when a key is supplied.
                </td>
              </tr>
              <tr>
                <td>
                  <code>note</code>
                </td>
                <td>
                  The caveat that travels with the series into every figure that uses it, so a
                  number cannot be quoted here without its qualification.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Section>

      <Section kicker="State of this release" title="What is verified, and what is not">
        <Prose>
          <p>
            Honesty about provenance has to include honesty about this repository&rsquo;s own
            provenance. The snapshot committed in the repository &mdash; dated{' '}
            {formatDate(SNAPSHOT_DATE)} &mdash; was <strong>transcribed by hand</strong> from
            published figures. It was not generated by calling the APIs, because the environment
            this site was built in had no outbound network access. It is the bottom rung of the
            ladder, and it is not what you are normally looking at.
          </p>
          <p>
            The practical consequences are worth stating plainly:
          </p>
          <ul>
            <li>
              The {SERIES_TOTALS.live} API-backed series have been ingested into the catalogue
              directly from the World Bank Indicators API, so the values behind those figures are
              machine-retrieved, not transcribed. They also re-fetch live in your browser if the
              catalogue is unreachable. Those are the series to trust first.
            </li>
            <li>
              The {SERIES_TOTALS.curated} transcribed series carry the values as published in the
              cited release, and should be checked against that release before being quoted
              anywhere that matters. No API exists to verify them automatically; that is precisely
              why they are labelled differently.
            </li>
            <li>
              A scheduled ingest re-runs against the publishers and stamps a fresh retrieval date,
              which the badge shows. Locally, <code>npm run refresh-data</code> does the equivalent
              for the committed fallback.
            </li>
          </ul>
          <p>
            Until that runs, figures falling back to the snapshot say so on their face. A site about
            data integrity does not get to make an exception for itself.
          </p>
        </Prose>
      </Section>

      <Section kicker="Charts" title="The rules the figures follow">
        <div className="method-grid" style={{ maxWidth: 'var(--measure-full)' }}>
          <div className="method-card">
            <h4>One axis, always</h4>
            <p>
              No chart on this site has two vertical scales. Two measures of different magnitude get
              two charts, because the alignment of a dual axis is arbitrary and invents a
              correlation the data does not contain.
            </p>
          </div>
          <div className="method-card">
            <h4>Colour follows the entity</h4>
            <p>
              Each series keeps its colour when others are hidden. The palette is a fixed order of
              eight hues, validated for colour-vision deficiency against this site&rsquo;s own light
              and dark surfaces rather than eyeballed.
            </p>
          </div>
          <div className="method-card">
            <h4>Colour is never the only channel</h4>
            <p>
              Every figure carries a legend, a table view and a CSV export, and every value is
              reachable by keyboard. Tooltips enhance; they never gate.
            </p>
          </div>
          <div className="method-card">
            <h4>Zero baselines on magnitudes</h4>
            <p>
              Quantity charts start at zero. Rates, ratios and indices — where zero is not a
              meaningful floor — do not, and say so.
            </p>
          </div>
          <div className="method-card">
            <h4>Breaks are shown, not smoothed</h4>
            <p>
              The 2021 life-expectancy dip, the 2020 crime spike, the part-year first GST bar: these
              stay in, flagged. A series that hides its shocks cannot be trusted with its trends.
            </p>
          </div>
          <div className="method-card">
            <h4>The conservative estimate wins</h4>
            <p>
              Where a scheme dashboard and a household survey disagree, the figure shows the survey.
              Where a ministry statement and an independent estimate disagree, both are cited and
              the caveat names the gap.
            </p>
          </div>
        </div>
      </Section>

      <Section kicker="Editorial" title="What counts as a claim here">
        <Prose>
          <p>
            The rule for prose on this site is narrow: a sentence may describe what a series shows,
            what it does not show, and what is known about how it was collected. It may not assert a
            cause the data does not identify, and it may not characterise a number as good or bad
            news on the site&rsquo;s own authority.
          </p>
          <p>
            So &ldquo;the collapse in data prices in 2016-17 follows a competitive entry, not a
            policy change&rdquo; is allowed, because the timing is in the series and the event is a
            matter of record. &ldquo;Liberalisation caused the fall in poverty&rdquo; is not, because
            the series cannot distinguish that from a dozen alternatives.
          </p>
          <p>
            Where evidence genuinely points both ways &mdash; recorded crimes against women is the
            clearest case &mdash; the text says the data cannot separate the readings, and stops
            there.
          </p>
        </Prose>
      </Section>

      <Section kicker="Limits" title="What this site cannot tell you">
        <Prose>
          <ul>
            <li>
              <strong>No sub-national detail.</strong> India&rsquo;s state-level variation is larger
              than the variation between many countries. Everything here is a national aggregate,
              and national aggregates hide that.
            </li>
            <li>
              <strong>No distribution.</strong> Almost every series is a mean or a headcount.
              Inequality within these numbers is real and is not shown.
            </li>
            <li>
              <strong>No census since 2011.</strong> Every per-capita figure on this site has a
              modelled denominator.
            </li>
            <li>
              <strong>A survey gap in consumption.</strong> The eleven-year break between India&rsquo;s
              consumption surveys, across a changed questionnaire, makes the size of the poverty
              decline genuinely contested.
            </li>
            <li>
              <strong>A legal discontinuity in crime data.</strong> The criminal codes were replaced
              in July 2024; series spanning that date are not straightforwardly comparable.
            </li>
          </ul>
        </Prose>
      </Section>

      <Section kicker="Reuse" title="Take the data">
        <Prose>
          <p>
            Every figure has a CSV button. The underlying series definitions, snapshots and the
            source register are all plain files in the repository. The register currently holds{' '}
            {SOURCES.length} sources across {SERIES_TOTALS.total} series.
          </p>
          <p>
            Licences vary by publisher and are stated per source in the{' '}
            <Link to="/sources">register</Link> — most Government of India data is under the
            Government Open Data Licence, World Bank and UN data under Creative Commons attribution
            terms, and SIPRI free for non-commercial use with attribution. Check the individual
            entry before republishing.
          </p>
        </Prose>
      </Section>
    </>
  )
}
