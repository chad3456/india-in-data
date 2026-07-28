import { ChapterPager, Prose, Section } from '../components/Chrome'
import { Figure, FigureFrame } from '../components/Figure'
import { PullStat, SeriesStat } from '../components/StatTile'
import { BarChart } from '../components/charts/BarChart'
import { LineChart } from '../components/charts/LineChart'
import { StackedBar } from '../components/charts/StackedBar'
import { formatValue } from '../lib/format'
import {
  armsImportsTiv,
  defenceBudget,
  defenceExports,
  defenceProduction,
  domesticProcurementShare,
  militaryExpenditure,
  militaryExpenditureGdp,
  SUPPLIER_MIX,
  SUPPLIER_MIX_SOURCE_IDS,
} from '../data/series/defence'
import { CHAPTERS } from './registry'

const meta = CHAPTERS[2]

function SupplierFigure() {
  return (
    <FigureFrame
      eyebrow="Figure 3.5"
      title="Where India's imported weapons come from"
      subtitle="Share of India's major conventional arms imports by supplier, in five-year blocks. Russia's share has roughly halved in a decade; France's has risen more than any other."
      sourceIds={SUPPLIER_MIX_SOURCE_IDS}
      provenance="curated"
      snapshotAsOf="2026-07-28"
      note="Measured in SIPRI trend-indicator values — a volume measure of transferred military capability, not money paid. Shares are rounded and may not sum to exactly 100."
      table={
        <table className="data-table">
          <caption className="sr-only">Supplier shares of Indian arms imports</caption>
          <thead>
            <tr>
              <th scope="col">Period</th>
              {SUPPLIER_MIX[0].segments.map((s) => (
                <th key={s.id} scope="col">
                  {s.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SUPPLIER_MIX.map((row) => (
              <tr key={row.period}>
                <th scope="row">{row.period}</th>
                {row.segments.map((s) => (
                  <td key={s.id}>{formatValue(s.value, 'percent', { precision: 0 })}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      }
    >
      <div className="legend" style={{ paddingInline: '1rem' }}>
        {SUPPLIER_MIX[0].segments.map((s) => (
          <span key={s.id} className="legend__item">
            <span
              className="legend__key legend__key--rect"
              style={{ color: `var(--series-${s.slot === 0 ? 'context' : s.slot})` }}
              aria-hidden="true"
            />
            {s.label}
          </span>
        ))}
      </div>
      <StackedBar
        rows={SUPPLIER_MIX.map((r) => ({ label: r.period, segments: r.segments }))}
        unit="percent"
      />
    </FigureFrame>
  )
}

export function Defence() {
  return (
    <>
      <header className="chapter-header">
        <div className="container">
          <div className="kicker">{meta.index}</div>
          <h1 className="chapter-header__title">{meta.title}</h1>
          <p className="lede chapter-header__lede">{meta.lede}</p>
        </div>
      </header>

      <Section kicker="Spending" title="Fifth-largest budget, shrinking as a share of the economy">
        <Prose>
          <p>
            India is the world&rsquo;s fifth-largest military spender in absolute terms. It is also
            spending a steadily smaller fraction of its economy on defence than it did twenty years
            ago. Both are consequences of the same thing: the economy has grown faster than the
            budget.
          </p>
          <p>
            The two figures below are deliberately not combined. Dollars and percentage-of-GDP are
            different quantities on different scales, and putting them on one plot with two vertical
            axes would manufacture a relationship the data does not contain.
          </p>
        </Prose>

        <Figure
          eyebrow="Figure 3.1"
          title="Military expenditure, US dollars"
          subtitle="SIPRI's consistent international definition, which includes pensions and paramilitary forces — broader than the Indian defence budget line."
          unit="usd"
          config={[{ spec: militaryExpenditure, slot: 1, label: 'Military expenditure' }]}
          legendKind="none"
        >
          {(series) => <LineChart series={series} unit="usd" area height={270} />}
        </Figure>

        <Figure
          eyebrow="Figure 3.2"
          title="Military expenditure as a share of GDP"
          subtitle="The same spending, measured against the economy that funds it."
          unit="percent"
          config={[{ spec: militaryExpenditureGdp, slot: 2, label: 'Share of GDP' }]}
          legendKind="none"
        >
          {(series) => <LineChart series={series} unit="percent" height={240} zeroBaseline={false} />}
        </Figure>

        <Figure
          eyebrow="Figure 3.3"
          title="Ministry of Defence allocation"
          subtitle="Budget Estimates in rupee terms, including defence pensions. Pensions alone are roughly a quarter of the total."
          unit="inr-lakh-crore"
          config={[{ spec: defenceBudget, slot: 3, label: 'MoD allocation' }]}
          legendKind="none"
        >
          {(series) => <BarChart series={series} unit="inr-lakh-crore" height={270} />}
        </Figure>
      </Section>

      <Section kicker="Building" title="Production and exports, from a very small base">
        <Prose>
          <p>
            The self-reliance policy has a measurable scoreboard: the value of defence equipment
            built in India, the share of the acquisition budget reserved for domestic suppliers, and
            exports. All three have risen sharply. All three started low.
          </p>
          <p>
            The exports line is the most quoted and the most over-read. A rise from ₹686 crore to
            over ₹23,000 crore in a decade is genuinely dramatic; it also leaves India, in absolute
            terms, exporting less than $3 billion of defence equipment a year &mdash; a fraction of
            what France or South Korea export, and heavily weighted towards components rather than
            complete platforms.
          </p>
        </Prose>

        <PullStat value="34×">
          Growth in Indian defence exports between 2013-14 and 2024-25, from ₹686 crore to ₹23,622
          crore. Against a target of ₹50,000 crore by 2029.
        </PullStat>

        <Figure
          eyebrow="Figure 3.4"
          title="Defence production and exports"
          subtitle="Both in ₹ crore, on one axis, because they share a unit and a scale story. Production is roughly six times exports."
          unit="inr-crore"
          config={[
            { spec: defenceProduction, slot: 1, label: 'Production value' },
            { spec: defenceExports, slot: 2, label: 'Exports' },
          ]}
        >
          {(series) => <LineChart series={series} unit="inr-crore" height={290} />}
        </Figure>
      </Section>

      <Section kicker="Depending" title="The import dependence that has not gone away">
        <Prose>
          <p>
            India remains one of the two largest importers of major conventional weapons in the
            world. What has changed is not the fact of dependence but its shape: the volume of
            imports has fallen from its 2010s peak, and the supplier base has broadened away from
            Russia towards France, Israel and the United States.
          </p>
          <p>
            A broader supplier base is a real strategic gain. It is not the same as
            self-sufficiency, and the two are frequently conflated in commentary about this
            programme.
          </p>
        </Prose>

        <Figure
          eyebrow="Figure 3.6"
          title="Volume of arms imports"
          subtitle="SIPRI trend-indicator values, constant 1990 units. A capability measure, not a currency — never add these to a budget."
          unit="index"
          config={[{ spec: armsImportsTiv, slot: 8, label: 'Arms imports (TIV)' }]}
          legendKind="none"
        >
          {(series) => <LineChart series={series} unit="index" area height={260} />}
        </Figure>

        <SupplierFigure />

        <div className="stat-row" style={{ marginTop: '2.5rem' }}>
          <SeriesStat
            spec={domesticProcurementShare}
            label="Capital acquisition budget reserved for domestic industry"
            compareTo="2020-21"
            slot={3}
          />
          <SeriesStat spec={defenceProduction} label="Value of defence production" compareTo="2016-17" slot={1} />
          <SeriesStat spec={defenceExports} label="Defence exports" compareTo="2016-17" slot={2} />
        </div>
      </Section>

      <ChapterPager id={meta.id} />
    </>
  )
}
