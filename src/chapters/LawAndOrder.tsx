import { ChapterPager, Prose, Section } from '../components/Chrome'
import { Figure } from '../components/Figure'
import { PullStat, SeriesStat } from '../components/StatTile'
import { BarChart } from '../components/charts/BarChart'
import { LineChart } from '../components/charts/LineChart'
import {
  casePendency,
  convictionRate,
  crimesAgainstWomen,
  cybercrime,
  homicideComparison,
  murderCount,
  murderRate,
  policeStrength,
  prisonOccupancy,
  totalCognizableCrime,
  undertrialShare,
} from '../data/series/law'
import { CHAPTERS } from './registry'

const meta = CHAPTERS[4]

export function LawAndOrder() {
  return (
    <>
      <header className="chapter-header">
        <div className="container">
          <div className="kicker">{meta.index}</div>
          <h1 className="chapter-header__title">{meta.title}</h1>
          <p className="lede chapter-header__lede">{meta.lede}</p>
        </div>
      </header>

      <Section kicker="Read this first" title="What crime statistics can and cannot tell you">
        <Prose>
          <p>
            Every number in this chapter is a count of <em>recorded</em> crime. It measures the
            intersection of three things: how much crime occurred, how many victims reported it, and
            how many reports the police registered as a case. A change in any of the three moves the
            number, and the data cannot separate them.
          </p>
          <p>
            Two further conventions matter. India&rsquo;s National Crime Records Bureau counts under
            the <strong>principal offence rule</strong>: where one incident involves several
            offences, only the most serious is counted, so totals understate. And the volume appears
            with a lag of one to two years, as a PDF &mdash; there is no crime API in India. Every
            figure in this chapter is therefore transcribed and cited, and says so.
          </p>
          <p>
            With those caveats in place, one comparison survives all of them: homicide. A body is
            hard not to record, which is why it is the only crime statistic that is meaningfully
            comparable across countries.
          </p>
        </Prose>

        <Figure
          eyebrow="Figure 5.1"
          title="Intentional homicide rate, international comparison"
          subtitle="Per 100,000 people, on UNODC's common definition. India sits at half the world average."
          unit="per-lakh"
          config={[{ spec: homicideComparison, slot: 1, label: 'Homicide rate' }]}
          legendKind="none"
        >
          {(series) => (
            <BarChart
              series={series}
              unit="per-lakh"
              orientation="horizontal"
              highlight={['India', 'World average']}
            />
          )}
        </Figure>
      </Section>

      <Section kicker="Violence" title="Murders are falling, in a growing population">
        <Prose>
          <p>
            India recorded about 28,500 murders in 2022, against roughly 34,400 a decade earlier
            &mdash; while the population grew by more than 150 million. The rate has fallen by about
            a quarter, from 2.8 per 100,000 to 2.1.
          </p>
          <p>
            This is the least ambiguous good-news series in the chapter, precisely because homicide
            is the least reporting-sensitive offence there is.
          </p>
        </Prose>

        <Figure
          eyebrow="Figure 5.2"
          title="Murders recorded"
          subtitle="Absolute count. The denominator — India's population — rose by over 10 per cent across the same window."
          unit="count"
          config={[{ spec: murderCount, slot: 8, label: 'Murders recorded' }]}
          legendKind="none"
        >
          {(series) => <LineChart series={series} unit="count" area height={250} />}
        </Figure>

        <Figure
          eyebrow="Figure 5.3"
          title="Murder rate"
          subtitle="Per 100,000 people — the same series with the population growth divided out."
          unit="per-lakh"
          config={[{ spec: murderRate, slot: 8, label: 'Murder rate' }]}
          legendKind="none"
        >
          {(series) => <LineChart series={series} unit="per-lakh" height={230} zeroBaseline={false} />}
        </Figure>
      </Section>

      <Section kicker="Reporting" title="The series that rises, and why that is ambiguous">
        <Prose>
          <p>
            Recorded crimes against women have risen in almost every year of the last decade. Read
            naively, that is a country becoming more dangerous for women. Read against the survey
            evidence &mdash; which consistently finds that the large majority of such crimes are
            never reported at all &mdash; it is at least partly a country in which more women report
            and more police stations register.
          </p>
          <p>
            Both readings can be partly true. What the data cannot do is tell you the mix. Anyone
            who states the mix confidently is going beyond the evidence.
          </p>
        </Prose>

        <Figure
          eyebrow="Figure 5.4"
          title="Recorded crimes against women"
          subtitle="Per 100,000 women. A rising line here is not straightforwardly bad news, and not straightforwardly good news either."
          unit="per-lakh"
          config={[{ spec: crimesAgainstWomen, slot: 5, label: 'Crimes against women' }]}
          legendKind="none"
        >
          {(series) => <LineChart series={series} unit="per-lakh" area height={250} zeroBaseline={false} />}
        </Figure>

        <Figure
          eyebrow="Figure 5.5"
          title="Total cognizable crime rate"
          subtitle="All offences under the penal code and special laws, per 100,000 people. The 2020 spike is pandemic-restriction offences."
          unit="per-lakh"
          config={[{ spec: totalCognizableCrime, slot: 2, label: 'Cognizable crime rate' }]}
          legendKind="none"
        >
          {(series) => (
            <LineChart
              series={series}
              unit="per-lakh"
              height={250}
              zeroBaseline={false}
              annotations={[{ x: 2020, label: 'Pandemic offences' }]}
            />
          )}
        </Figure>

        <Figure
          eyebrow="Figure 5.6"
          title="Cybercrime cases registered"
          subtitle="The fastest-growing recorded offence category in India, from a base that barely existed a decade ago."
          unit="count"
          config={[{ spec: cybercrime, slot: 7, label: 'Cybercrime cases' }]}
          legendKind="none"
        >
          {(series) => <LineChart series={series} unit="count" area height={250} />}
        </Figure>
      </Section>

      <Section kicker="Capacity" title="The constraint behind every number above">
        <Prose>
          <p>
            India polices itself with roughly 155 officers per 100,000 people against a sanctioned
            strength of about 195 and a frequently-cited United Nations benchmark of 222. Around a
            fifth of sanctioned police posts are vacant. The courts carry over five crore pending
            cases.
          </p>
          <p>
            These are not separate problems from the crime statistics; they are the reason the crime
            statistics look as they do. A conviction rate near 54 per cent and a prison population
            three-quarters composed of people awaiting trial are the same fact seen from two ends.
          </p>
        </Prose>

        <PullStat value="75.8%">
          Share of India&rsquo;s prison population awaiting trial rather than serving a sentence.
          Prisons run at about 131 per cent of sanctioned capacity.
        </PullStat>

        <Figure
          eyebrow="Figure 5.7"
          title="Prison occupancy and the share awaiting trial"
          subtitle="Two percentages on one axis, because they share a unit. Occupancy above 100 means more inmates than sanctioned capacity."
          unit="percent"
          config={[
            { spec: prisonOccupancy, slot: 1, label: 'Occupancy rate' },
            { spec: undertrialShare, slot: 2, label: 'Awaiting trial' },
          ]}
        >
          {(series) => <LineChart series={series} unit="percent" height={260} zeroBaseline={false} />}
        </Figure>

        <Figure
          eyebrow="Figure 5.8"
          title="Cases pending across all courts"
          subtitle="From the National Judicial Data Grid — one of the few genuinely live official datasets in Indian governance. Part of the rise is digitisation bringing old cases onto the grid."
          unit="count"
          config={[{ spec: casePendency, slot: 8, label: 'Cases pending' }]}
          legendKind="none"
        >
          {(series) => <LineChart series={series} unit="count" area height={250} />}
        </Figure>

        <div className="stat-row" style={{ marginTop: '2.5rem' }}>
          <SeriesStat
            spec={policeStrength}
            label="Police personnel per 100,000 people"
            compareTo={2016}
            slot={1}
          />
          <SeriesStat
            spec={convictionRate}
            label="Conviction rate, penal code offences"
            compareTo={2016}
            slot={3}
          />
          <SeriesStat
            spec={undertrialShare}
            label="Prisoners awaiting trial"
            compareTo={2016}
            betterWhen="lower"
            slot={2}
          />
        </div>
      </Section>

      <Section kicker="What changed in the law" title="A new criminal code, from July 2024">
        <Prose>
          <p>
            On 1 July 2024 India replaced its three foundational criminal statutes &mdash; the
            Indian Penal Code of 1860, the Code of Criminal Procedure, and the Evidence Act &mdash;
            with the Bharatiya Nyaya Sanhita, the Bharatiya Nagarik Suraksha Sanhita and the
            Bharatiya Sakshya Adhiniyam.
          </p>
          <p>
            This creates a discontinuity in every series in this chapter. Offence definitions and
            section numbers changed; some conduct was reclassified. Data published for 2024 onwards
            is <strong>not</strong> straightforwardly comparable with what precedes it, and this
            site will mark the break in the series rather than draw a continuous line through it.
          </p>
        </Prose>
      </Section>

      <ChapterPager id={meta.id} />
    </>
  )
}
