import { worldBank } from '../providers'
import type { SeriesSpec } from '../types'
import { pts, SNAPSHOT_DATE, TRANSCRIBED } from './kit'

/* ==========================================================================
   Chapter 3 — Defence: spending, self-reliance and dependence.
   ========================================================================== */

export const militaryExpenditure: SeriesSpec = {
  id: 'defence.milex.usd',
  label: 'Military expenditure',
  unit: 'usd',
  sourceId: 'worldbank-wdi',
  alsoSourceIds: ['sipri-milex'],
  live: worldBank('MS.MIL.XPND.CD', { from: 1995 }),
  snapshotAsOf: SNAPSHOT_DATE,
  unverified: TRANSCRIBED,
  snapshot: pts([
    [1995, 8.0e9],
    [2000, 1.43e10],
    [2005, 2.31e10],
    [2010, 4.61e10],
    [2014, 5.09e10],
    [2015, 5.16e10],
    [2016, 5.64e10],
    [2017, 6.45e10],
    [2018, 6.65e10],
    [2019, 7.15e10],
    [2020, 7.29e10],
    [2021, 7.66e10],
    [2022, 8.14e10],
    [2023, 8.36e10],
    [2024, 8.61e10],
  ]),
  note: "On SIPRI's definition — which includes pensions and paramilitary forces — India is the world's fifth-largest military spender. That definition is deliberately broader than the Ministry of Defence budget line, so this figure is larger than the Indian budget total for the same year.",
}

export const militaryExpenditureGdp: SeriesSpec = {
  id: 'defence.milex.gdp-share',
  label: 'Military expenditure',
  unit: 'percent',
  sourceId: 'worldbank-wdi',
  alsoSourceIds: ['sipri-milex'],
  live: worldBank('MS.MIL.XPND.GD.ZS', { from: 1995 }),
  snapshotAsOf: SNAPSHOT_DATE,
  unverified: TRANSCRIBED,
  snapshot: pts([
    [1995, 2.7],
    [2000, 2.94],
    [2005, 2.8],
    [2010, 2.7],
    [2014, 2.5],
    [2015, 2.4],
    [2016, 2.5],
    [2017, 2.5],
    [2018, 2.4],
    [2019, 2.4],
    [2020, 2.9],
    [2021, 2.7],
    [2022, 2.4],
    [2023, 2.4],
    [2024, 2.3],
  ]),
  note: 'As a share of the economy, Indian defence spending has been drifting downwards for two decades even as the absolute amount has risen sharply. Growth, not restraint, is doing most of that work.',
}

export const armsImportsTiv: SeriesSpec = {
  id: 'defence.arms-imports.tiv',
  label: 'Arms imports (trend-indicator value)',
  unit: 'index',
  sourceId: 'worldbank-wdi',
  alsoSourceIds: ['sipri-at'],
  live: worldBank('MS.MIL.MPRT.KD', { from: 2000 }),
  snapshotAsOf: SNAPSHOT_DATE,
  unverified: TRANSCRIBED,
  precision: 0,
  snapshot: pts([
    [2000, 1024],
    [2005, 1156],
    [2010, 2909],
    [2012, 4386],
    [2014, 3078],
    [2016, 3325],
    [2018, 2313],
    [2019, 2964],
    [2020, 2799],
    [2021, 2130],
    [2022, 2101],
    [2023, 2015],
    [2024, 1900],
  ]),
  note: 'SIPRI trend-indicator values measure the military capability transferred, in constant 1990 units. They are not dollars and must never be added to a budget figure.',
}

/* -- curated: budget and production ---------------------------------------- */

export const defenceBudget: SeriesSpec = {
  id: 'defence.budget.total',
  label: 'Ministry of Defence allocation',
  unit: 'inr-lakh-crore',
  sourceId: 'indiabudget',
  alsoSourceIds: ['mod-annual'],
  snapshotAsOf: SNAPSHOT_DATE,
  unverified: TRANSCRIBED,
  snapshot: pts([
    ['2016-17', 3.41],
    ['2017-18', 3.6],
    ['2018-19', 4.04],
    ['2019-20', 4.31],
    ['2020-21', 4.71],
    ['2021-22', 4.78],
    ['2022-23', 5.25],
    ['2023-24', 5.94],
    ['2024-25', 6.22],
    ['2025-26', 6.81],
  ]),
  note: 'Budget Estimates, including defence pensions and the Ministry\'s civil expenditure. Pensions alone account for roughly a quarter of the total, which is why the headline allocation grows faster than fighting capability does.',
}

export const defenceProduction: SeriesSpec = {
  id: 'defence.production.value',
  label: 'Value of defence production',
  unit: 'inr-crore',
  sourceId: 'mod-ddp',
  alsoSourceIds: ['pib'],
  snapshotAsOf: SNAPSHOT_DATE,
  unverified: TRANSCRIBED,
  snapshot: pts([
    ['2016-17', 74054],
    ['2017-18', 78820],
    ['2018-19', 81747],
    ['2019-20', 79071],
    ['2020-21', 84643],
    ['2021-22', 94846],
    ['2022-23', 108684],
    ['2023-24', 126887],
    ['2024-25', 151000],
  ]),
  note: 'Combined output of defence public-sector undertakings and private manufacturers, at sale value. It measures what was built in India, not how much of each system is Indian — indigenous content is lower and is not published on a comparable basis.',
}

export const defenceExports: SeriesSpec = {
  id: 'defence.exports.value',
  label: 'Defence exports',
  unit: 'inr-crore',
  sourceId: 'mod-ddp',
  alsoSourceIds: ['pib'],
  snapshotAsOf: SNAPSHOT_DATE,
  unverified: TRANSCRIBED,
  snapshot: pts([
    ['2013-14', 686],
    ['2016-17', 1522],
    ['2017-18', 4682],
    ['2018-19', 10746],
    ['2019-20', 9116],
    ['2020-21', 8435],
    ['2021-22', 12815],
    ['2022-23', 15920],
    ['2023-24', 21083],
    ['2024-25', 23622],
  ]),
  note: 'A thirty-fold rise from a very small base. The absolute figure — under $3 billion — still places India well outside the top tier of arms exporters, and a large share is components and sub-systems rather than complete platforms.',
}

export const domesticProcurementShare: SeriesSpec = {
  id: 'defence.procurement.domestic-share',
  label: 'Capital acquisition budget reserved for domestic industry',
  unit: 'percent',
  sourceId: 'indiabudget',
  alsoSourceIds: ['mod-ddp'],
  snapshotAsOf: SNAPSHOT_DATE,
  unverified: TRANSCRIBED,
  precision: 0,
  snapshot: pts([
    ['2020-21', 58],
    ['2021-22', 64],
    ['2022-23', 68],
    ['2023-24', 75],
    ['2024-25', 75],
    ['2025-26', 75],
  ]),
}

/* -- supplier mix (stacked composition) ------------------------------------ */

export interface SupplierRow {
  period: string
  segments: { id: string; label: string; value: number; slot: number }[]
}

export const SUPPLIER_MIX: SupplierRow[] = [
  {
    period: '2010–14',
    segments: [
      { id: 'ru', label: 'Russia', value: 76, slot: 1 },
      { id: 'us', label: 'United States', value: 8, slot: 2 },
      { id: 'il', label: 'Israel', value: 6, slot: 3 },
      { id: 'fr', label: 'France', value: 2, slot: 4 },
      { id: 'other', label: 'Others', value: 8, slot: 0 },
    ],
  },
  {
    period: '2015–19',
    segments: [
      { id: 'ru', label: 'Russia', value: 58, slot: 1 },
      { id: 'us', label: 'United States', value: 9, slot: 2 },
      { id: 'il', label: 'Israel', value: 13, slot: 3 },
      { id: 'fr', label: 'France', value: 12, slot: 4 },
      { id: 'other', label: 'Others', value: 8, slot: 0 },
    ],
  },
  {
    period: '2020–24',
    segments: [
      { id: 'ru', label: 'Russia', value: 36, slot: 1 },
      { id: 'us', label: 'United States', value: 10, slot: 2 },
      { id: 'il', label: 'Israel', value: 13, slot: 3 },
      { id: 'fr', label: 'France', value: 33, slot: 4 },
      { id: 'other', label: 'Others', value: 8, slot: 0 },
    ],
  },
]

export const SUPPLIER_MIX_SOURCE_IDS = ['sipri-at']
