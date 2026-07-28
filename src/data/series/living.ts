import { worldBank } from '../providers'
import type { SeriesSpec } from '../types'
import { pts, SNAPSHOT_DATE, TRANSCRIBED } from './kit'

/* ==========================================================================
   Chapter 2 — Living standards: what a household actually has.
   ========================================================================== */

export const electricityAccess: SeriesSpec = {
  id: 'living.electricity-access',
  label: 'Access to electricity',
  unit: 'percent',
  sourceId: 'worldbank-wdi',
  alsoSourceIds: ['cea'],
  live: worldBank('EG.ELC.ACCS.ZS', { from: 1993 }),
  snapshotAsOf: SNAPSHOT_DATE,
  unverified: TRANSCRIBED,
  snapshot: pts([
    [1993, 50.9],
    [2000, 59.9],
    [2005, 67.2],
    [2010, 76.3],
    [2014, 83.0],
    [2016, 88.0],
    [2017, 92.6],
    [2018, 95.2],
    [2019, 96.5],
    [2020, 97.8],
    [2021, 99.6],
    [2022, 99.6],
    [2023, 100.0],
  ]),
  note: 'A connection is not the same as supply. Average hours of rural supply — a separate series — rose from roughly 12 hours a day in 2015 to over 20 by the mid-2020s, and that second number is the one households experience.',
}

export const openDefecation: SeriesSpec = {
  id: 'living.open-defecation',
  label: 'People practising open defecation',
  unit: 'percent',
  sourceId: 'worldbank-wdi',
  alsoSourceIds: ['swachh-bharat'],
  live: worldBank('SH.STA.ODFC.ZS', { from: 2000 }),
  snapshotAsOf: SNAPSHOT_DATE,
  unverified: TRANSCRIBED,
  snapshot: pts([
    [2000, 68.6],
    [2005, 62.9],
    [2010, 56.1],
    [2014, 47.2],
    [2016, 39.6],
    [2018, 24.2],
    [2019, 19.1],
    [2020, 15.1],
    [2021, 12.9],
    [2022, 11.0],
  ]),
  note: 'The steepest fall of any indicator on this site. The administrative dashboards report faster progress than the household surveys do; this is the survey-based series, which is the conservative one.',
}

export const cleanCookingFuel: SeriesSpec = {
  id: 'living.clean-cooking-fuel',
  label: 'Access to clean cooking fuel',
  unit: 'percent',
  sourceId: 'worldbank-wdi',
  alsoSourceIds: ['ppac'],
  live: worldBank('EG.CFT.ACCS.ZS', { from: 2000 }),
  snapshotAsOf: SNAPSHOT_DATE,
  unverified: TRANSCRIBED,
  snapshot: pts([
    [2000, 22.3],
    [2005, 26.7],
    [2010, 33.6],
    [2014, 40.6],
    [2015, 43.4],
    [2016, 46.9],
    [2018, 55.0],
    [2019, 60.8],
    [2020, 66.4],
    [2021, 70.6],
    [2022, 74.0],
    [2023, 76.0],
  ]),
  note: 'Cooking on wood and dung is one of the largest killers in India, through household air pollution. The Ujjwala scheme distributed connections; refill rates, not connections, decide whether the smoke actually stops.',
}

export const basicWater: SeriesSpec = {
  id: 'living.basic-water',
  label: 'At least basic drinking water',
  unit: 'percent',
  sourceId: 'worldbank-wdi',
  alsoSourceIds: ['jal-jeevan'],
  live: worldBank('SH.H2O.BASW.ZS', { from: 2000 }),
  snapshotAsOf: SNAPSHOT_DATE,
  unverified: TRANSCRIBED,
  snapshot: pts([
    [2000, 81.2],
    [2005, 85.0],
    [2010, 88.2],
    [2015, 91.0],
    [2018, 92.6],
    [2020, 93.5],
    [2022, 94.6],
  ]),
}

export const internetUsers: SeriesSpec = {
  id: 'living.internet-users',
  label: 'Individuals using the internet',
  unit: 'percent',
  sourceId: 'worldbank-wdi',
  alsoSourceIds: ['trai'],
  live: worldBank('IT.NET.USER.ZS', { from: 2000 }),
  snapshotAsOf: SNAPSHOT_DATE,
  unverified: TRANSCRIBED,
  snapshot: pts([
    [2000, 0.53],
    [2005, 2.39],
    [2010, 7.5],
    [2014, 14.0],
    [2016, 20.1],
    [2018, 34.5],
    [2019, 41.0],
    [2020, 43.4],
    [2021, 46.3],
    [2022, 48.9],
    [2023, 52.4],
  ]),
}

export const lifeExpectancy: SeriesSpec = {
  id: 'living.life-expectancy',
  label: 'Life expectancy at birth',
  unit: 'years',
  sourceId: 'worldbank-wdi',
  alsoSourceIds: ['srs'],
  live: worldBank('SP.DYN.LE00.IN', { from: 1990 }),
  snapshotAsOf: SNAPSHOT_DATE,
  unverified: TRANSCRIBED,
  snapshot: pts([
    [1990, 58.5],
    [1995, 60.5],
    [2000, 62.6],
    [2005, 64.5],
    [2010, 66.7],
    [2015, 68.6],
    [2018, 70.0],
    [2019, 70.5],
    [2020, 69.9],
    [2021, 67.2],
    [2022, 70.9],
    [2023, 72.0],
  ]),
  note: 'The 2021 dip is the pandemic. It is left in rather than smoothed away, because a series that hides its shocks cannot be trusted with its trends.',
}

export const infantMortality: SeriesSpec = {
  id: 'living.infant-mortality',
  label: 'Infant mortality rate',
  unit: 'per-1000',
  sourceId: 'worldbank-wdi',
  alsoSourceIds: ['srs'],
  live: worldBank('SP.DYN.IMRT.IN', { from: 1990 }),
  snapshotAsOf: SNAPSHOT_DATE,
  unverified: TRANSCRIBED,
  snapshot: pts([
    [1990, 88.6],
    [1995, 78.4],
    [2000, 66.3],
    [2005, 55.1],
    [2010, 44.4],
    [2015, 34.3],
    [2018, 29.4],
    [2019, 27.9],
    [2020, 26.6],
    [2021, 25.5],
    [2022, 24.5],
    [2023, 23.4],
  ]),
  note: 'Deaths before the first birthday, per 1,000 live births. Roughly two thirds fewer than in 1990 — one of the largest absolute reductions in child deaths recorded anywhere.',
}

export const maternalMortality: SeriesSpec = {
  id: 'living.maternal-mortality',
  label: 'Maternal mortality ratio',
  unit: 'per-lakh',
  sourceId: 'worldbank-wdi',
  alsoSourceIds: ['srs'],
  live: worldBank('SH.STA.MMRT', { from: 2000 }),
  snapshotAsOf: SNAPSHOT_DATE,
  unverified: TRANSCRIBED,
  precision: 0,
  snapshot: pts([
    [2000, 384],
    [2005, 286],
    [2010, 210],
    [2015, 145],
    [2018, 118],
    [2020, 103],
    [2023, 80],
  ]),
  note: "Maternal deaths per 100,000 live births. India's own Sample Registration System publishes a three-year moving average on a slightly different basis — 97 for 2018–20 and 93 for 2019–21.",
}

export const accountOwnership: SeriesSpec = {
  id: 'living.account-ownership',
  label: 'Adults with a bank account',
  unit: 'percent',
  sourceId: 'worldbank-wdi',
  alsoSourceIds: ['pmjdy'],
  live: worldBank('FX.OWN.TOTL.ZS', { from: 2011 }),
  snapshotAsOf: SNAPSHOT_DATE,
  unverified: TRANSCRIBED,
  snapshot: pts([
    [2011, 35.2],
    [2014, 52.8],
    [2017, 79.9],
    [2021, 77.5],
  ]),
  note: 'Findex is a survey taken every three years, so this series has four points, not thirty. The Jan Dhan programme opened more than 55 crore accounts over the same period; account ownership and account use are different questions.',
}

/* -- curated: no machine-readable API -------------------------------------- */

export const multidimensionalPoverty: SeriesSpec = {
  id: 'living.mpi-headcount',
  label: 'Multidimensionally poor',
  unit: 'percent',
  sourceId: 'niti-mpi',
  alsoSourceIds: ['nfhs'],
  snapshotAsOf: SNAPSHOT_DATE,
  unverified: TRANSCRIBED,
  precision: 2,
  snapshot: pts([
    ['2005-06', 55.34],
    ['2015-16', 24.85],
    ['2019-21', 14.96],
    ['2022-23', 11.28],
  ]),
  note: 'Share of the population deprived on at least a third of twelve weighted indicators covering health, education and living standards. On NITI Aayog\'s arithmetic roughly 25 crore people moved out of multidimensional poverty between 2013-14 and 2022-23.',
}

export const extremePoverty: SeriesSpec = {
  id: 'living.extreme-poverty-215',
  label: 'Below $2.15 a day (2017 PPP)',
  unit: 'percent',
  sourceId: 'worldbank-pip',
  snapshotAsOf: SNAPSHOT_DATE,
  unverified: TRANSCRIBED,
  snapshot: pts([
    ['1993-94', 49.4],
    ['2004-05', 39.9],
    ['2011-12', 16.2],
    ['2022-23', 2.3],
  ]),
}

export const povertyNewLine: SeriesSpec = {
  id: 'living.extreme-poverty-300',
  label: 'Below $3.00 a day (2021 PPP)',
  unit: 'percent',
  sourceId: 'worldbank-pip',
  snapshotAsOf: SNAPSHOT_DATE,
  unverified: TRANSCRIBED,
  snapshot: pts([
    ['1993-94', 63.0],
    ['2004-05', 51.6],
    ['2011-12', 27.1],
    ['2022-23', 5.3],
  ]),
  note: 'In June 2025 the World Bank rebased the international poverty line to 2021 prices, moving it from $2.15 to $3.00 a day. Both lines are shown because the choice of line — not any change in India — moves the headline by several percentage points.',
}

export const tapWaterConnections: SeriesSpec = {
  id: 'living.tap-water-connections',
  label: 'Rural households with a tap connection',
  unit: 'percent',
  sourceId: 'jal-jeevan',
  snapshotAsOf: SNAPSHOT_DATE,
  unverified: TRANSCRIBED,
  snapshot: pts([
    ['Aug 2019', 16.8],
    ['2020', 27.9],
    ['2021', 45.4],
    ['2022', 55.1],
    ['2023', 70.1],
    ['2024', 78.6],
    ['2025', 80.5],
  ]),
  note: 'Administrative reporting from the Jal Jeevan Mission dashboard: connections provided, not water delivered. Functionality assessments consistently report lower figures than the coverage dashboard.',
}

export const janDhanAccounts: SeriesSpec = {
  id: 'living.jan-dhan-accounts',
  label: 'Jan Dhan accounts',
  unit: 'count',
  sourceId: 'pmjdy',
  snapshotAsOf: SNAPSHOT_DATE,
  unverified: TRANSCRIBED,
  snapshot: pts([
    [2015, 1.79e8],
    [2016, 2.55e8],
    [2017, 3.06e8],
    [2018, 3.23e8],
    [2019, 3.76e8],
    [2020, 4.06e8],
    [2021, 4.35e8],
    [2022, 4.69e8],
    [2023, 5.06e8],
    [2024, 5.31e8],
    [2025, 5.57e8],
  ]),
}

export const dataCost: SeriesSpec = {
  id: 'living.mobile-data-cost',
  label: 'Cost of 1 GB of mobile data',
  unit: 'inr',
  sourceId: 'trai',
  snapshotAsOf: SNAPSHOT_DATE,
  unverified: TRANSCRIBED,
  precision: 0,
  snapshot: pts([
    [2014, 269],
    [2015, 226],
    [2016, 152],
    [2017, 19],
    [2018, 12],
    [2019, 11],
    [2021, 10],
    [2023, 9],
    [2024, 9],
  ]),
  note: 'Average realised revenue per GB. The 2016–17 collapse is the entry of Reliance Jio, not a policy change; it is the single clearest case on this site of competition doing what regulation had not.',
}

export const femaleLfpr: SeriesSpec = {
  id: 'living.female-lfpr',
  label: 'Female labour force participation (15+)',
  unit: 'percent',
  sourceId: 'mospi-plfs',
  snapshotAsOf: SNAPSHOT_DATE,
  unverified: TRANSCRIBED,
  snapshot: pts([
    ['2017-18', 23.3],
    ['2018-19', 24.5],
    ['2019-20', 30.0],
    ['2020-21', 32.5],
    ['2021-22', 32.8],
    ['2022-23', 37.0],
    ['2023-24', 41.7],
  ]),
  note: 'Usual status, rural and urban combined. Most of the rise is in rural self-employment and unpaid work on family farms, which the survey counts as employment. Whether that is women entering the workforce or distress absorbing them is genuinely contested.',
}

/* -- NFHS-4 → NFHS-5 comparison (slope chart) ------------------------------ */

export interface NfhsRow {
  id: string
  label: string
  from: number
  to: number
  slot: number
  betterWhen: 'higher' | 'lower'
}

export const NFHS_ROWS: NfhsRow[] = [
  { id: 'electricity', label: 'Households with electricity', from: 88.2, to: 96.8, slot: 1, betterWhen: 'higher' },
  { id: 'sanitation', label: 'Improved sanitation', from: 48.5, to: 70.2, slot: 2, betterWhen: 'higher' },
  { id: 'clean-fuel', label: 'Clean cooking fuel', from: 43.8, to: 58.6, slot: 3, betterWhen: 'higher' },
  { id: 'institutional', label: 'Institutional births', from: 78.9, to: 88.6, slot: 4, betterWhen: 'higher' },
  { id: 'anaemia', label: 'Anaemia in women (15–49)', from: 53.1, to: 57.0, slot: 8, betterWhen: 'lower' },
  { id: 'stunting', label: 'Stunted children under 5', from: 38.4, to: 35.5, slot: 7, betterWhen: 'lower' },
]

export const NFHS_SOURCE_IDS = ['nfhs']
