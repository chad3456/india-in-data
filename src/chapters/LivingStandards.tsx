import { ChapterPager, Prose, Section } from '../components/Chrome'
import { Figure, FigureFrame } from '../components/Figure'
import { PullStat, SeriesStat } from '../components/StatTile'
import { BarChart } from '../components/charts/BarChart'
import { LineChart } from '../components/charts/LineChart'
import { SlopeChart } from '../components/charts/SlopeChart'
import { formatValue } from '../lib/format'
import {
  accountOwnership,
  basicWater,
  cleanCookingFuel,
  dataCost,
  electricityAccess,
  extremePoverty,
  femaleLfpr,
  infantMortality,
  internetUsers,
  janDhanAccounts,
  lifeExpectancy,
  maternalMortality,
  multidimensionalPoverty,
  NFHS_ROWS,
  NFHS_SOURCE_IDS,
  openDefecation,
  povertyNewLine,
  tapWaterConnections,
} from '../data/series/living'
import { CHAPTERS } from './registry'

const meta = CHAPTERS[1]

function NfhsFigure() {
  return (
    <FigureFrame
      eyebrow="Figure 2.4"
      title="What the household survey found, 2015-16 against 2019-21"
      subtitle="India's largest health and demographic survey, measured on the same households in two rounds. Independent of any scheme dashboard — which is exactly why it is here."
      sourceIds={NFHS_SOURCE_IDS}
      provenance="curated"
      snapshotAsOf="2026-07-28"
      note="Anaemia is the outlier and it moved the wrong way: more than half of Indian women aged 15 to 49 are anaemic, and the share rose between rounds. A chapter that only showed the improving lines would be a brochure."
      table={
        <table className="data-table">
          <caption className="sr-only">NFHS-4 to NFHS-5 comparison, full data table</caption>
          <thead>
            <tr>
              <th scope="col">Indicator</th>
              <th scope="col">NFHS-4 (2015-16)</th>
              <th scope="col">NFHS-5 (2019-21)</th>
              <th scope="col">Change</th>
            </tr>
          </thead>
          <tbody>
            {NFHS_ROWS.map((r) => (
              <tr key={r.id}>
                <th scope="row">{r.label}</th>
                <td>{formatValue(r.from, 'percent')}</td>
                <td>{formatValue(r.to, 'percent')}</td>
                <td>
                  {r.to > r.from ? '+' : '−'}
                  {formatValue(Math.abs(r.to - r.from), 'percent')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      }
    >
      <SlopeChart
        rows={NFHS_ROWS.map(({ id, label, from, to, slot }) => ({ id, label, from, to, slot }))}
        unit="percent"
        fromLabel="2015-16"
        toLabel="2019-21"
        height={330}
      />
    </FigureFrame>
  )
}

export function LivingStandards() {
  return (
    <>
      <header className="chapter-header">
        <div className="container">
          <div className="kicker">{meta.index}</div>
          <h1 className="chapter-header__title">{meta.title}</h1>
          <p className="lede chapter-header__lede">{meta.lede}</p>
        </div>
      </header>

      <Section kicker="Amenities" title="Four lines that changed a generation's daily routine">
        <Prose>
          <p>
            The most consequential changes in Indian living standards over the last two decades are
            not in any headline growth number. They are in whether a house has a light, whether the
            kitchen fills with smoke, whether there is a toilet, and whether the phone in the room
            can reach the internet.
          </p>
          <p>
            All four series below are measured by international statistical convention rather than
            by scheme dashboards, so they are slower and more conservative than the government
            figures &mdash; and harder to argue with. Use the legend to isolate any one of them.
          </p>
        </Prose>

        <Figure
          eyebrow="Figure 2.1"
          title="Household amenities, share of population with access"
          subtitle="Four independent indicators on one axis, because they share a unit. Toggle any series in the legend."
          unit="percent"
          config={[
            { spec: electricityAccess, slot: 1, label: 'Electricity' },
            { spec: cleanCookingFuel, slot: 2, label: 'Clean cooking fuel' },
            { spec: basicWater, slot: 3, label: 'Basic drinking water' },
            { spec: internetUsers, slot: 4, label: 'Internet use' },
          ]}
        >
          {(series) => <LineChart series={series} unit="percent" height={310} />}
        </Figure>

        <Figure
          eyebrow="Figure 2.2"
          title="People practising open defecation"
          subtitle="The steepest decline of any indicator on this site: from roughly two people in three at the turn of the century to about one in nine."
          unit="percent"
          config={[{ spec: openDefecation, slot: 8, label: 'Open defecation' }]}
          legendKind="none"
        >
          {(series) => <LineChart series={series} unit="percent" area height={260} />}
        </Figure>

        <PullStat value="₹9 per GB">
          What a gigabyte of mobile data costs in India, down from about ₹269 in 2014. Cheap data is
          the precondition for almost every other digital number on this site.
        </PullStat>

        <Figure
          eyebrow="Figure 2.3"
          title="The price of a gigabyte"
          subtitle="Average realised revenue per gigabyte of mobile data. The collapse in 2016-17 is a competitive entry, not a policy."
          unit="inr"
          config={[{ spec: dataCost, slot: 7, label: 'Cost per GB' }]}
          legendKind="none"
        >
          {(series) => (
            <LineChart series={series} unit="inr" area height={240} annotations={[{ x: 2016, label: 'Jio launch' }]} />
          )}
        </Figure>
      </Section>

      <Section kicker="The independent check" title="What the survey says, not the dashboard">
        <Prose>
          <p>
            Administrative dashboards count what was delivered. Household surveys count what people
            report having. The two disagree, consistently and in a predictable direction, and the
            gap is where most arguments about Indian development statistics actually live.
          </p>
        </Prose>

        <NfhsFigure />
      </Section>

      <Section kicker="Poverty" title="A steep fall, and a line that moved">
        <Prose>
          <p>
            By the World Bank&rsquo;s international poverty lines, the share of Indians in extreme
            poverty fell dramatically between 2011-12 and 2022-23. Then, in June 2025, the Bank
            rebased its lines to 2021 prices &mdash; moving the extreme-poverty threshold from
            $2.15 to $3.00 a day &mdash; which changed every headline number without anything
            changing in India.
          </p>
          <p>
            Both lines are shown below. So is the caveat that matters more than either: India&rsquo;s
            consumption survey has an eleven-year gap and a changed questionnaire across it, so the
            size of the fall is genuinely disputed even where its direction is not.
          </p>
        </Prose>

        <Figure
          eyebrow="Figure 2.5"
          title="Poverty headcount on two international lines"
          subtitle="The same country, the same surveys, two thresholds. The distance between the lines is a methodological choice, not a change in living conditions."
          unit="percent"
          config={[
            { spec: extremePoverty, slot: 1, label: '$2.15 a day (2017 PPP)' },
            { spec: povertyNewLine, slot: 2, label: '$3.00 a day (2021 PPP)' },
          ]}
          legendKind="rect"
        >
          {(series) => <BarChart series={series} unit="percent" height={280} />}
        </Figure>

        <Figure
          eyebrow="Figure 2.6"
          title="Multidimensional poverty"
          subtitle="NITI Aayog's index counts deprivation across twelve indicators — nutrition, schooling, sanitation, fuel, housing, assets — rather than income."
          unit="percent"
          config={[{ spec: multidimensionalPoverty, slot: 3, label: 'Multidimensionally poor' }]}
          legendKind="none"
        >
          {(series) => <BarChart series={series} unit="percent" height={250} />}
        </Figure>
      </Section>

      <Section kicker="Health" title="Living longer, dying less young">
        <Prose>
          <p>
            Life expectancy at birth has risen by roughly thirteen years since 1990. Infant
            mortality has fallen by about three quarters. Maternal mortality &mdash; the indicator
            that historically moves last, because it needs a functioning health system rather than a
            vaccine &mdash; has fallen faster in India than the global average.
          </p>
        </Prose>

        <Figure
          eyebrow="Figure 2.7"
          title="Life expectancy at birth"
          subtitle="Years. The dip in 2021 is the pandemic and is deliberately left in the series."
          unit="years"
          config={[{ spec: lifeExpectancy, slot: 1, label: 'Life expectancy' }]}
          legendKind="none"
        >
          {(series) => <LineChart series={series} unit="years" height={250} zeroBaseline={false} />}
        </Figure>

        <Figure
          eyebrow="Figure 2.8"
          title="Infant and maternal mortality"
          subtitle="Two different denominators — per 1,000 live births and per 100,000 live births — so they are shown as separate charts rather than forced onto one axis."
          unit="per-1000"
          config={[{ spec: infantMortality, slot: 2, label: 'Infant mortality (per 1,000)' }]}
          legendKind="none"
        >
          {(series) => <LineChart series={series} unit="per-1000" area height={240} />}
        </Figure>

        <Figure
          eyebrow="Figure 2.9"
          title="Maternal mortality ratio"
          subtitle="Deaths per 100,000 live births. Shown on its own axis because mixing it with infant mortality would invent a comparison the data does not support."
          unit="per-lakh"
          config={[{ spec: maternalMortality, slot: 5, label: 'Maternal mortality' }]}
          legendKind="none"
        >
          {(series) => <LineChart series={series} unit="per-lakh" area height={240} />}
        </Figure>
      </Section>

      <Section kicker="Inclusion" title="Accounts, connections and work">
        <Prose>
          <p>
            The financial-inclusion push after 2014 was unusually fast by international standards:
            account ownership among Indian adults roughly doubled in a decade. Whether those
            accounts are used is a separate question, and the honest answer is &ldquo;increasingly,
            but unevenly&rdquo;.
          </p>
          <p>
            Female labour force participation is the indicator where the data and its interpretation
            diverge most sharply. It has risen steeply since 2017-18 &mdash; but overwhelmingly
            through self-employment and unpaid work on family enterprises, which the survey counts
            as employment.
          </p>
        </Prose>

        <div className="stat-row">
          <SeriesStat spec={accountOwnership} label="Adults with a bank account" compareTo={2011} slot={1} />
          <SeriesStat spec={janDhanAccounts} label="Jan Dhan accounts opened" compareTo={2015} slot={3} />
          <SeriesStat
            spec={tapWaterConnections}
            label="Rural households with a tap connection"
            compareTo="Aug 2019"
            slot={4}
          />
        </div>

        <Figure
          eyebrow="Figure 2.10"
          title="Female labour force participation"
          subtitle="Usual status, aged 15 and above. A steep rise whose composition is contested — read the note."
          unit="percent"
          config={[{ spec: femaleLfpr, slot: 5, label: 'Female LFPR' }]}
          legendKind="none"
        >
          {(series) => <LineChart series={series} unit="percent" area height={250} zeroBaseline={false} />}
        </Figure>
      </Section>

      <ChapterPager id={meta.id} />
    </>
  )
}
