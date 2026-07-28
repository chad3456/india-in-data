import { worldBank } from '../providers'
import type { SeriesSpec } from '../types'
import { pts, SNAPSHOT_DATE, TRANSCRIBED } from './kit'

/* ==========================================================================
   Chapter 4 — Economic reform: the plumbing, and what it moved.
   ========================================================================== */

export const forexReserves: SeriesSpec = {
  id: 'economy.forex-reserves',
  label: 'Foreign exchange reserves',
  unit: 'usd',
  sourceId: 'worldbank-wdi',
  alsoSourceIds: ['rbi-dbie'],
  live: worldBank('FI.RES.TOTL.CD', { from: 2000 }),
  snapshotAsOf: SNAPSHOT_DATE,
  unverified: TRANSCRIBED,
  snapshot: pts([
    [2000, 4.2e10],
    [2005, 1.376e11],
    [2010, 2.976e11],
    [2013, 2.983e11],
    [2014, 3.253e11],
    [2016, 3.6e11],
    [2018, 3.995e11],
    [2019, 4.777e11],
    [2020, 5.9e11],
    [2021, 6.381e11],
    [2022, 5.626e11],
    [2023, 6.229e11],
    [2024, 6.688e11],
  ]),
  note: 'Reserves peaked above $700 billion during 2024. India holds the fourth-largest stock in the world — roughly eleven months of imports, against the three months conventionally treated as adequate.',
}

export const fdiInflows: SeriesSpec = {
  id: 'economy.fdi-inflows',
  label: 'Foreign direct investment, net inflows',
  unit: 'usd',
  sourceId: 'worldbank-wdi',
  alsoSourceIds: ['dpiit-fdi'],
  live: worldBank('BX.KLT.DINV.CD.WD', { from: 2000 }),
  snapshotAsOf: SNAPSHOT_DATE,
  unverified: TRANSCRIBED,
  snapshot: pts([
    [2000, 3.6e9],
    [2005, 7.6e9],
    [2010, 2.74e10],
    [2014, 3.46e10],
    [2016, 4.44e10],
    [2018, 4.21e10],
    [2019, 5.06e10],
    [2020, 6.41e10],
    [2021, 4.47e10],
    [2022, 4.99e10],
    [2023, 2.81e10],
    [2024, 2.76e10],
  ]),
  note: 'Net inflows, which subtract repatriation and disinvestment. Gross inflows have held up far better than the net series; cumulative FDI into India passed $1 trillion during 2025. Both facts belong in the same paragraph.',
}

export const inflation: SeriesSpec = {
  id: 'economy.cpi-inflation',
  label: 'Consumer price inflation',
  unit: 'percent',
  sourceId: 'worldbank-wdi',
  alsoSourceIds: ['mospi-cpi', 'rbi-dbie'],
  live: worldBank('FP.CPI.TOTL.ZG', { from: 2005 }),
  snapshotAsOf: SNAPSHOT_DATE,
  unverified: TRANSCRIBED,
  snapshot: pts([
    [2005, 4.25],
    [2008, 8.35],
    [2010, 11.99],
    [2011, 8.86],
    [2012, 9.31],
    [2013, 10.91],
    [2014, 6.35],
    [2015, 5.87],
    [2016, 4.95],
    [2017, 3.33],
    [2018, 3.94],
    [2019, 3.73],
    [2020, 6.62],
    [2021, 5.13],
    [2022, 6.7],
    [2023, 5.65],
    [2024, 4.95],
  ]),
  note: 'India adopted a formal inflation target in 2016: 4 per cent, with a tolerance band of two points either side. The series before and after that date is the clearest natural experiment in recent Indian macroeconomic policy.',
}

/* -- curated ---------------------------------------------------------------- */

export const gstCollections: SeriesSpec = {
  id: 'economy.gst-collections',
  label: 'Gross GST collections',
  unit: 'inr-lakh-crore',
  sourceId: 'gst-council',
  alsoSourceIds: ['pib'],
  snapshotAsOf: SNAPSHOT_DATE,
  unverified: TRANSCRIBED,
  snapshot: pts(
    [
      ['2017-18', 7.19],
      ['2018-19', 11.77],
      ['2019-20', 12.22],
      ['2020-21', 11.37],
      ['2021-22', 14.83],
      ['2022-23', 18.1],
      ['2023-24', 20.18],
      ['2024-25', 22.08],
    ],
    { '2017-18': 'Part year — GST began on 1 July 2017.' },
  ),
  note: 'Gross collections, all components. Because GST replaced a stack of central and state levies, this series cannot be compared with pre-2017 indirect tax receipts, and it rises with inflation and compliance as well as with real activity.',
}

export const bankNpas: SeriesSpec = {
  id: 'economy.gross-npa-ratio',
  label: 'Gross non-performing assets',
  unit: 'percent',
  sourceId: 'rbi-fsr',
  snapshotAsOf: SNAPSHOT_DATE,
  unverified: TRANSCRIBED,
  snapshot: pts([
    ['Mar 2015', 4.3],
    ['Mar 2016', 7.5],
    ['Mar 2017', 9.3],
    ['Mar 2018', 11.2],
    ['Mar 2019', 9.1],
    ['Mar 2020', 8.2],
    ['Mar 2021', 7.3],
    ['Mar 2022', 5.8],
    ['Mar 2023', 3.9],
    ['Mar 2024', 2.8],
    ['Mar 2025', 2.3],
  ]),
  note: 'Scheduled commercial banks. The 2015–18 rise is mostly recognition — the RBI\'s Asset Quality Review forcing banks to admit loans they had been rolling over — rather than new lending going bad. The fall since is part genuine recovery and part write-off.',
}

export const capitalExpenditure: SeriesSpec = {
  id: 'economy.capital-expenditure',
  label: 'Union government capital expenditure',
  unit: 'inr-lakh-crore',
  sourceId: 'indiabudget',
  snapshotAsOf: SNAPSHOT_DATE,
  unverified: TRANSCRIBED,
  snapshot: pts([
    ['2018-19', 3.08],
    ['2019-20', 3.36],
    ['2020-21', 4.26],
    ['2021-22', 5.93],
    ['2022-23', 7.36],
    ['2023-24', 9.49],
    ['2024-25', 11.11],
    ['2025-26', 11.21],
  ]),
  note: 'Budget documents; the last two years are Budget Estimates rather than Actuals. Capital spending has roughly trebled in six years, which is the single largest deliberate change in the composition of Union spending in the reform era.',
}

export const upiTransactions: SeriesSpec = {
  id: 'economy.upi-transactions',
  label: 'UPI transactions',
  unit: 'billion',
  sourceId: 'npci',
  snapshotAsOf: SNAPSHOT_DATE,
  unverified: TRANSCRIBED,
  precision: 1,
  snapshot: pts([
    ['2017-18', 0.92],
    ['2018-19', 5.35],
    ['2019-20', 12.52],
    ['2020-21', 22.31],
    ['2021-22', 45.97],
    ['2022-23', 83.75],
    ['2023-24', 131.15],
    ['2024-25', 185.8],
  ]),
  note: 'Transactions per financial year, in billions. UPI now settles more retail payment instructions than any comparable system anywhere; average ticket size is small and falling, so volume growth substantially outpaces value growth.',
}

export const incomeTaxReturns: SeriesSpec = {
  id: 'economy.income-tax-returns',
  label: 'Income tax returns filed',
  unit: 'count',
  sourceId: 'economic-survey',
  alsoSourceIds: ['pib'],
  snapshotAsOf: SNAPSHOT_DATE,
  unverified: TRANSCRIBED,
  snapshot: pts([
    ['2013-14', 3.79e7],
    ['2016-17', 5.29e7],
    ['2018-19', 6.74e7],
    ['2020-21', 6.72e7],
    ['2022-23', 7.4e7],
    ['2023-24', 8.09e7],
    ['2024-25', 9.19e7],
  ]),
  note: 'Filing a return is not the same as paying tax: a large share of filers fall below the taxable threshold. The series measures the widening of the formal tax net, not the revenue it yields.',
}

export const electronicsExports: SeriesSpec = {
  id: 'economy.electronics-exports',
  label: 'Electronics exports',
  unit: 'usd-billion',
  sourceId: 'commerce-tradestat',
  alsoSourceIds: ['pib'],
  snapshotAsOf: SNAPSHOT_DATE,
  unverified: TRANSCRIBED,
  precision: 1,
  snapshot: pts([
    ['2018-19', 8.8],
    ['2019-20', 11.7],
    ['2020-21', 11.1],
    ['2021-22', 15.7],
    ['2022-23', 23.6],
    ['2023-24', 29.1],
    ['2024-25', 38.6],
  ]),
  note: 'The clearest single result claimed for the production-linked incentive schemes. Most of the value is smartphone assembly, where imported content remains high — the export figure is gross, not value added in India.',
}

export const nationalHighways: SeriesSpec = {
  id: 'economy.national-highways',
  label: 'National highway network',
  unit: 'km',
  sourceId: 'morth',
  snapshotAsOf: SNAPSHOT_DATE,
  unverified: TRANSCRIBED,
  snapshot: pts([
    [2014, 91287],
    [2016, 101011],
    [2018, 122434],
    [2020, 132499],
    [2022, 140995],
    [2024, 146145],
  ]),
}

export const ibcResolutions: SeriesSpec = {
  id: 'economy.ibc-resolutions',
  label: 'Resolution plans approved (cumulative)',
  unit: 'count',
  sourceId: 'ibbi',
  snapshotAsOf: SNAPSHOT_DATE,
  unverified: TRANSCRIBED,
  precision: 0,
  snapshot: pts([
    ['Mar 2018', 32],
    ['Mar 2019', 120],
    ['Mar 2020', 258],
    ['Mar 2021', 396],
    ['Mar 2022', 555],
    ['Mar 2023', 720],
    ['Mar 2024', 947],
    ['Mar 2025', 1194],
  ]),
  note: 'The 2016 insolvency code replaced a system in which recovering money from a failed company took, on average, more than four years. Resolution is still slow against the code\'s own 330-day limit, and realisation averages roughly a third of admitted claims.',
}
