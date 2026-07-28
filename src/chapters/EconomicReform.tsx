import { ChapterPager, Prose, Section } from '../components/Chrome'
import { Figure } from '../components/Figure'
import { PullStat, SeriesStat } from '../components/StatTile'
import { BarChart } from '../components/charts/BarChart'
import { LineChart } from '../components/charts/LineChart'
import {
  bankNpas,
  capitalExpenditure,
  electronicsExports,
  fdiInflows,
  forexReserves,
  gstCollections,
  ibcResolutions,
  incomeTaxReturns,
  inflation,
  nationalHighways,
  upiTransactions,
} from '../data/series/economy'
import { CHAPTERS } from './registry'

const meta = CHAPTERS[3]

export function EconomicReform() {
  return (
    <>
      <header className="chapter-header">
        <div className="container">
          <div className="kicker">{meta.index}</div>
          <h1 className="chapter-header__title">{meta.title}</h1>
          <p className="lede chapter-header__lede">{meta.lede}</p>
        </div>
      </header>

      <Section kicker="Tax" title="One country, one indirect tax">
        <Prose>
          <p>
            Before July 2017, moving goods between Indian states meant crossing a tax border: a
            stack of central and state levies, checkpoints, and cascading tax on tax. The Goods and
            Services Tax replaced them with a single destination-based tax and a shared digital
            filing system.
          </p>
          <p>
            Collections have roughly doubled since the first full year. That is not a clean measure
            of success &mdash; inflation, formalisation and rate changes all push the same number up
            &mdash; but the direction and the persistence are hard to explain any other way. In
            September 2025 the rate structure was rationalised again, collapsing the main slabs
            towards 5 and 18 per cent with a 40 per cent rate for demerit goods.
          </p>
        </Prose>

        <Figure
          eyebrow="Figure 4.1"
          title="Gross GST collections"
          subtitle="Per financial year. 2017-18 covers nine months, because GST began on 1 July 2017 — the bar is short for a calendar reason, not an economic one."
          unit="inr-lakh-crore"
          config={[{ spec: gstCollections, slot: 1, label: 'Gross GST collections' }]}
          legendKind="none"
        >
          {(series) => <BarChart series={series} unit="inr-lakh-crore" height={280} />}
        </Figure>

        <Figure
          eyebrow="Figure 4.2"
          title="Income tax returns filed"
          subtitle="The widening of the formal tax net. Filing is not the same as paying: a large share of filers fall below the taxable threshold."
          unit="count"
          config={[{ spec: incomeTaxReturns, slot: 3, label: 'Returns filed' }]}
          legendKind="none"
        >
          {(series) => <LineChart series={series} unit="count" area height={250} />}
        </Figure>
      </Section>

      <Section kicker="Credit" title="Bad loans, recognised then resolved">
        <Prose>
          <p>
            The single most consequential financial reform of the period was not a law but an audit.
            The Reserve Bank&rsquo;s 2015 Asset Quality Review forced banks to classify loans they
            had been quietly rolling over. Reported bad loans tripled in three years &mdash; not
            because lending suddenly went wrong, but because it stopped being hidden.
          </p>
          <p>
            The Insolvency and Bankruptcy Code of 2016 then gave creditors a time-bound process for
            recovering money from failed companies, replacing a system in which recovery took, on
            average, over four years. Both mechanisms show up in the same chart, five years apart.
          </p>
        </Prose>

        <Figure
          eyebrow="Figure 4.3"
          title="Gross non-performing assets of scheduled commercial banks"
          subtitle="The rise is recognition; the fall is part recovery, part write-off. Both halves matter."
          unit="percent"
          config={[{ spec: bankNpas, slot: 8, label: 'Gross NPA ratio' }]}
          legendKind="none"
        >
          {(series) => (
            <LineChart
              series={series}
              unit="percent"
              area
              height={270}
              annotations={[{ x: 'Mar 2018', label: 'Peak' }]}
            />
          )}
        </Figure>

        <Figure
          eyebrow="Figure 4.4"
          title="Insolvency resolutions approved, cumulative"
          subtitle="Corporate insolvency resolution plans approved under the 2016 code. Realisation averages roughly a third of admitted claims — a low number that mostly reflects how distressed firms are by the time they are admitted."
          unit="count"
          config={[{ spec: ibcResolutions, slot: 7, label: 'Resolution plans approved' }]}
          legendKind="none"
        >
          {(series) => <LineChart series={series} unit="count" area height={250} />}
        </Figure>
      </Section>

      <Section kicker="Prices" title="An inflation target, and what happened after it">
        <Prose>
          <p>
            In 2016 India gave its central bank a statutory inflation target &mdash; 4 per cent,
            with a two-point tolerance band &mdash; and a monetary policy committee to hit it. The
            decade before that target had double-digit inflation in three separate years. The decade
            after has had none.
          </p>
        </Prose>

        <Figure
          eyebrow="Figure 4.5"
          title="Consumer price inflation"
          subtitle="Annual average. The vertical rule marks the adoption of the formal inflation target."
          unit="percent"
          config={[{ spec: inflation, slot: 2, label: 'CPI inflation' }]}
          legendKind="none"
        >
          {(series) => (
            <LineChart
              series={series}
              unit="percent"
              height={270}
              annotations={[{ x: 2016, label: 'Inflation target adopted' }]}
            />
          )}
        </Figure>
      </Section>

      <Section kicker="Rails" title="Digital public infrastructure">
        <Prose>
          <p>
            India&rsquo;s most exported policy idea is not a reform but a piece of infrastructure: a
            public digital identity, a public payments rail, and a consent layer on top of both. UPI
            now carries more retail payment instructions than any comparable system in the world.
          </p>
          <p>
            The caveat is scale-specific: UPI transactions are numerous and small. Volume growth
            substantially outpaces value growth, and the count includes person-to-person transfers
            that are not economic activity in any conventional sense.
          </p>
        </Prose>

        <PullStat value="185 billion">
          UPI transactions in 2024-25, up from under a billion in its first full year. Average ticket
          size keeps falling as usage spreads down the income distribution.
        </PullStat>

        <Figure
          eyebrow="Figure 4.6"
          title="UPI transactions per financial year"
          subtitle="Billions of transactions. A log-shaped adoption curve rendered on a linear axis, because the compounding is the point."
          unit="billion"
          config={[{ spec: upiTransactions, slot: 1, label: 'UPI transactions' }]}
          legendKind="none"
        >
          {(series) => <BarChart series={series} unit="billion" height={280} />}
        </Figure>
      </Section>

      <Section kicker="Capital" title="Building, and being paid for it">
        <Prose>
          <p>
            The composition of Union government spending changed materially after 2020: capital
            expenditure roughly trebled in six years, at the same time as the production-linked
            incentive schemes pushed manufacturing investment towards electronics. Whether that
            investment produces durable comparative advantage is not yet answerable from data. What
            it has produced so far is exports.
          </p>
        </Prose>

        <Figure
          eyebrow="Figure 4.7"
          title="Union government capital expenditure"
          subtitle="The last two years are Budget Estimates rather than Actuals, and are labelled as such in the table."
          unit="inr-lakh-crore"
          config={[{ spec: capitalExpenditure, slot: 3, label: 'Capital expenditure' }]}
          legendKind="none"
        >
          {(series) => <BarChart series={series} unit="inr-lakh-crore" height={260} />}
        </Figure>

        <Figure
          eyebrow="Figure 4.8"
          title="Electronics exports"
          subtitle="Gross exports in US dollars. Most of the value is smartphone assembly, where imported content is high — this is not a measure of value added in India."
          unit="usd-billion"
          config={[{ spec: electronicsExports, slot: 4, label: 'Electronics exports' }]}
          legendKind="none"
        >
          {(series) => <LineChart series={series} unit="usd-billion" area height={250} />}
        </Figure>

        <div className="stat-row" style={{ marginTop: '2.5rem' }}>
          <SeriesStat spec={forexReserves} label="Foreign exchange reserves" compareTo={2014} slot={1} />
          <SeriesStat spec={fdiInflows} label="FDI net inflows" compareTo={2014} slot={2} />
          <SeriesStat spec={nationalHighways} label="National highway network" compareTo={2014} slot={3} />
        </div>
      </Section>

      <ChapterPager id={meta.id} />
    </>
  )
}
