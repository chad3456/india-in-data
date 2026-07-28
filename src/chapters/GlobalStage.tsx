import { useState } from 'react'
import { ChapterPager, Prose, Section } from '../components/Chrome'
import { Figure } from '../components/Figure'
import { PullStat, SeriesStat } from '../components/StatTile'
import { BarChart } from '../components/charts/BarChart'
import { LineChart } from '../components/charts/LineChart'
import {
  co2PerCapita,
  co2PerCapitaCompare,
  exportsGoodsServices,
  gdpCurrentUsd,
  gdpGrowth,
  gdpPerCapita,
  gdpPpp,
  hdi,
  innovationRank,
  largestEconomies2024,
  populationChina,
  populationIndia,
  remittances,
  shareOfWorldGdp,
  worldGdpGrowth,
} from '../data/series/global'
import { CHAPTERS } from './registry'

const meta = CHAPTERS[0]

export function GlobalStage() {
  const [scale, setScale] = useState<'nominal' | 'ppp'>('nominal')

  return (
    <>
      <header className="chapter-header">
        <div className="container">
          <div className="kicker">{meta.index}</div>
          <h1 className="chapter-header__title">{meta.title}</h1>
          <p className="lede chapter-header__lede">{meta.lede}</p>
        </div>
      </header>

      <Section kicker="Aggregate" title="The size story is real, and it is recent">
        <Prose>
          <p>
            For most of the twentieth century India was a large country with a small economy. That
            stopped being true somewhere in the 2000s. India&rsquo;s output crossed one trillion
            dollars in 2007, two trillion in 2014, three trillion in 2021, and passed the United
            Kingdom &mdash; the country that had governed it &mdash; in 2022.
          </p>
          <p>
            The two panels below measure the same economy two ways. At market exchange rates India
            is the fifth-largest economy in the world. Adjusted for what money actually buys inside
            the country, it is the third-largest, and has been since 2009. Neither number is wrong;
            they answer different questions. Market rates tell you what India can buy abroad.
            Purchasing power tells you what Indians can buy at home.
          </p>
        </Prose>

        <Figure
          eyebrow="Figure 1.1"
          title="India's gross domestic product"
          subtitle="Switch between market exchange rates and purchasing power parity. The gap between the two is the story of a country whose prices are low relative to the dollar."
          unit="usd"
          config={[
            scale === 'nominal'
              ? { spec: gdpCurrentUsd, slot: 1, label: 'At market rates' }
              : { spec: gdpPpp, slot: 2, label: 'At purchasing power parity' },
          ]}
          legendKind="none"
          controls={
            <div className="control-group">
              <span className="control-group__label">Measure</span>
              <button
                type="button"
                className="chip"
                aria-pressed={scale === 'nominal'}
                onClick={() => setScale('nominal')}
              >
                Market rates
              </button>
              <button
                type="button"
                className="chip"
                aria-pressed={scale === 'ppp'}
                onClick={() => setScale('ppp')}
              >
                Purchasing power
              </button>
            </div>
          }
        >
          {(series) => (
            <LineChart
              series={series}
              unit="usd"
              area
              height={300}
              annotations={[{ x: 2020, label: 'Pandemic' }]}
            />
          )}
        </Figure>

        <Figure
          eyebrow="Figure 1.2"
          title="The ten largest economies, 2024"
          subtitle="Nominal GDP at market exchange rates. India is highlighted; every other economy is drawn in the context grey, because this chart is making one point, not ten."
          unit="usd-trillion"
          config={[{ spec: largestEconomies2024, slot: 1, label: 'Nominal GDP' }]}
          legendKind="none"
        >
          {(series) => (
            <BarChart series={series} unit="usd-trillion" orientation="horizontal" highlight={['India']} />
          )}
        </Figure>
      </Section>

      <Section kicker="Per person" title="And the number that does not flatter">
        <Prose>
          <p>
            Divide that economy by the people in it and the picture inverts. India&rsquo;s GDP per
            person is roughly one-thirtieth of the American figure and around a fifth of
            China&rsquo;s. On this measure India ranks somewhere around 140th in the world &mdash;
            below Vietnam, below the Philippines, in the same range as Nicaragua.
          </p>
          <p>
            This is not a rebuttal of the growth story. It is the growth story: the same arithmetic
            that makes India the world&rsquo;s most populous country makes its per-person income
            low. Both charts describe one country. A claim that quotes only one of them is
            incomplete by construction.
          </p>
        </Prose>

        <Figure
          eyebrow="Figure 1.3"
          title="GDP per person"
          subtitle="Current US dollars. The line has more than tripled since 2000 — and is still under $3,000."
          unit="usd"
          config={[{ spec: gdpPerCapita, slot: 2, label: 'GDP per person' }]}
          legendKind="none"
        >
          {(series) => <LineChart series={series} unit="usd" area height={260} />}
        </Figure>

        <PullStat value="≈ $2,700">
          India&rsquo;s output per person in 2024. The world average is roughly five times that. The
          aggregate rank and the per-person rank are separated by about 135 places.
        </PullStat>
      </Section>

      <Section kicker="Momentum" title="Growth, and its share of the world's">
        <Prose>
          <p>
            India has grown faster than the world economy in every year of the last two decades bar
            one &mdash; 2020, when it contracted more sharply than most. Since 2021 it has been the
            fastest-growing large economy, and by some IMF estimates contributes roughly a sixth of
            all global growth.
          </p>
        </Prose>

        <Figure
          eyebrow="Figure 1.4"
          title="Annual GDP growth: India against the world"
          subtitle="Constant-price growth. The distance between the two lines, sustained over twenty years, is the compounding that moved India up the table."
          unit="percent"
          config={[
            { spec: gdpGrowth, slot: 1, label: 'India' },
            { spec: worldGdpGrowth, slot: 0, label: 'World' },
          ]}
        >
          {(series) => <LineChart series={series} unit="percent" height={280} zeroBaseline={false} />}
        </Figure>

        <Figure
          eyebrow="Figure 1.5"
          title="India's share of world output"
          subtitle="India's economy as a percentage of the world's, computed live from the same World Bank release for both aggregates."
          unit="percent"
          config={[{ spec: shareOfWorldGdp, slot: 3, label: 'Share of world GDP' }]}
          legendKind="none"
        >
          {(series) => <LineChart series={series} unit="percent" area height={250} />}
        </Figure>
      </Section>

      <Section kicker="Demography" title="The most populous country on earth">
        <Prose>
          <p>
            During 2023 India passed China to become the world&rsquo;s most populous country
            &mdash; an event with no ceremony and no exact date, because India has not conducted a
            census since 2011 and both figures are modelled estimates. The crossing matters less as
            a milestone than as a divergence: one line is still rising, the other has turned.
          </p>
        </Prose>

        <Figure
          eyebrow="Figure 1.6"
          title="Population: India and China"
          subtitle="Two lines that crossed in 2023. India's median age is around 28; China's is around 40."
          unit="million"
          config={[
            { spec: populationIndia, slot: 1, label: 'India' },
            { spec: populationChina, slot: 2, label: 'China' },
          ]}
        >
          {(series) => <LineChart series={series} unit="million" height={280} zeroBaseline={false} />}
        </Figure>
      </Section>

      <Section kicker="Connections" title="Trade, remittances and standing">
        <Prose>
          <p>
            India&rsquo;s external position has changed shape as much as size. Services &mdash;
            software, business process work, and increasingly design and research centres &mdash;
            now account for close to half of all Indian exports, an unusual composition for a
            country at India&rsquo;s income level. And Indians abroad send home more money than the
            citizens of any other country receive.
          </p>
        </Prose>

        <Figure
          eyebrow="Figure 1.7"
          title="Exports of goods and services"
          subtitle="Total exports in current US dollars. The step change after 2020 is led by services and by electronics."
          unit="usd"
          config={[{ spec: exportsGoodsServices, slot: 3, label: 'Exports' }]}
          legendKind="none"
        >
          {(series) => <LineChart series={series} unit="usd" area height={260} />}
        </Figure>

        <Figure
          eyebrow="Figure 1.8"
          title="Remittances received"
          subtitle="India has been the world's largest recipient of remittances every year since 2008 — money that arrives as household income rather than as investment."
          unit="usd"
          config={[{ spec: remittances, slot: 4, label: 'Remittances received' }]}
          legendKind="none"
        >
          {(series) => <LineChart series={series} unit="usd" area height={250} />}
        </Figure>

        <div className="stat-row" style={{ marginTop: '2.5rem' }}>
          <SeriesStat
            spec={hdi}
            label="Human Development Index"
            compareTo={1990}
            betterWhen="higher"
            slot={1}
          />
          <SeriesStat
            spec={innovationRank}
            label="Global Innovation Index rank"
            compareTo={2015}
            betterWhen="lower"
            slot={7}
          />
          <SeriesStat
            spec={co2PerCapita}
            label="CO₂ emissions per person (tonnes)"
            compareTo={2000}
            betterWhen="lower"
            slot={8}
          />
        </div>
      </Section>

      <Section kicker="The other ledger" title="Large in total, small per person — again">
        <Prose>
          <p>
            The same arithmetic that governs income governs emissions. India is the world&rsquo;s
            third-largest emitter of carbon dioxide and one of the lowest emitters per person among
            major economies. Which of those two facts is quoted usually decides which side of the
            climate negotiation the speaker is on.
          </p>
        </Prose>

        <Figure
          eyebrow="Figure 1.9"
          title="Carbon dioxide emissions per person, 2023"
          subtitle="Tonnes per person per year. India is highlighted; the world average is shown for reference."
          unit="ratio"
          config={[{ spec: co2PerCapitaCompare, slot: 8, label: 'CO₂ per person' }]}
          legendKind="none"
        >
          {(series) => (
            <BarChart
              series={series}
              unit="ratio"
              orientation="horizontal"
              highlight={['India', 'World average']}
            />
          )}
        </Figure>
      </Section>

      <ChapterPager id={meta.id} />
    </>
  )
}
