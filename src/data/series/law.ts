import type { SeriesSpec } from '../types'
import { pts, SNAPSHOT_DATE, TRANSCRIBED } from './kit'

/* ==========================================================================
   Chapter 5 — Law and order.

   Nothing in this chapter has a live API. The National Crime Records Bureau
   publishes one volume a year, as a PDF, one to two years after the fact.
   Every series here is therefore transcribed and cited to a release, and the
   figures say so on their face.
   ========================================================================== */

export const totalCognizableCrime: SeriesSpec = {
  id: 'law.cognizable-crime-rate',
  label: 'Cognizable crime rate',
  unit: 'per-lakh',
  sourceId: 'ncrb-cii',
  snapshotAsOf: SNAPSHOT_DATE,
  unverified: TRANSCRIBED,
  snapshot: pts(
    [
      [2016, 379.3],
      [2017, 388.6],
      [2018, 383.5],
      [2019, 385.5],
      [2020, 487.8],
      [2021, 445.9],
      [2022, 422.2],
    ],
    {
      '2020': 'The 2020 spike is overwhelmingly special-law offences registered under pandemic restrictions, not a rise in ordinary crime.',
    },
  ),
  note: 'All cognizable offences, under both the penal code and special laws, per 100,000 people. Recorded crime is a measure of what reaches a police station; it is shaped by willingness to report and by whether the station registers the complaint.',
}

export const murderCount: SeriesSpec = {
  id: 'law.murder-count',
  label: 'Murders recorded',
  unit: 'count',
  sourceId: 'ncrb-cii',
  snapshotAsOf: SNAPSHOT_DATE,
  unverified: TRANSCRIBED,
  precision: 0,
  snapshot: pts([
    [2012, 34434],
    [2014, 33981],
    [2016, 30450],
    [2017, 28653],
    [2018, 29017],
    [2019, 28915],
    [2020, 29193],
    [2021, 29272],
    [2022, 28522],
  ]),
  note: 'Murder is the one offence that is comparable over time and across countries, because a body is hard not to record. India\'s count has fallen while its population has grown by well over a hundred million.',
}

export const murderRate: SeriesSpec = {
  id: 'law.murder-rate',
  label: 'Murder rate',
  unit: 'per-lakh',
  sourceId: 'ncrb-cii',
  snapshotAsOf: SNAPSHOT_DATE,
  unverified: TRANSCRIBED,
  precision: 1,
  snapshot: pts([
    [2012, 2.8],
    [2014, 2.7],
    [2016, 2.4],
    [2017, 2.2],
    [2018, 2.2],
    [2019, 2.2],
    [2020, 2.2],
    [2021, 2.1],
    [2022, 2.1],
  ]),
}

export const crimesAgainstWomen: SeriesSpec = {
  id: 'law.crimes-against-women',
  label: 'Crimes against women, rate',
  unit: 'per-lakh',
  sourceId: 'ncrb-cii',
  snapshotAsOf: SNAPSHOT_DATE,
  unverified: TRANSCRIBED,
  snapshot: pts([
    [2016, 55.2],
    [2017, 57.9],
    [2018, 58.8],
    [2019, 62.4],
    [2020, 56.5],
    [2021, 64.5],
    [2022, 66.4],
  ]),
  note: 'Per 100,000 women. This series is the sharpest illustration of the reporting problem on the whole site: successive surveys find that most such crimes are never reported at all, so a rising recorded rate is at least partly women being more willing, and police more obliged, to register a case.',
}

export const cybercrime: SeriesSpec = {
  id: 'law.cybercrime-cases',
  label: 'Cybercrime cases registered',
  unit: 'count',
  sourceId: 'ncrb-cii',
  alsoSourceIds: ['mha-i4c'],
  snapshotAsOf: SNAPSHOT_DATE,
  unverified: TRANSCRIBED,
  precision: 0,
  snapshot: pts([
    [2016, 12317],
    [2017, 21796],
    [2018, 27248],
    [2019, 44735],
    [2020, 50035],
    [2021, 52974],
    [2022, 65893],
  ]),
  note: 'The fastest-growing recorded offence category in India. Separately, the national cybercrime reporting portal logged financial-fraud complaints running into tens of thousands of crores of rupees in 2024 — complaints, not adjudicated losses.',
}

export const convictionRate: SeriesSpec = {
  id: 'law.conviction-rate',
  label: 'Conviction rate, penal code offences',
  unit: 'percent',
  sourceId: 'ncrb-cii',
  snapshotAsOf: SNAPSHOT_DATE,
  unverified: TRANSCRIBED,
  snapshot: pts(
    [
      [2016, 46.8],
      [2017, 49.6],
      [2018, 50.4],
      [2019, 50.4],
      [2020, 59.2],
      [2021, 57.0],
      [2022, 54.2],
    ],
    { '2020': 'Courts sat far less during the pandemic; the mix of cases decided that year was unusual.' },
  ),
}

export const prisonOccupancy: SeriesSpec = {
  id: 'law.prison-occupancy',
  label: 'Prison occupancy rate',
  unit: 'percent',
  sourceId: 'ncrb-psi',
  snapshotAsOf: SNAPSHOT_DATE,
  unverified: TRANSCRIBED,
  snapshot: pts([
    [2016, 113.7],
    [2017, 115.1],
    [2018, 117.6],
    [2019, 118.5],
    [2020, 118.0],
    [2021, 130.2],
    [2022, 131.4],
  ]),
}

export const undertrialShare: SeriesSpec = {
  id: 'law.undertrial-share',
  label: 'Inmates awaiting trial',
  unit: 'percent',
  sourceId: 'ncrb-psi',
  snapshotAsOf: SNAPSHOT_DATE,
  unverified: TRANSCRIBED,
  snapshot: pts([
    [2016, 68.5],
    [2017, 68.5],
    [2018, 69.4],
    [2019, 69.0],
    [2020, 76.0],
    [2021, 77.1],
    [2022, 75.8],
  ]),
  note: 'Three out of four people in an Indian prison have not been convicted of anything. This is the number that most directly measures how the justice system treats the people passing through it.',
}

export const policeStrength: SeriesSpec = {
  id: 'law.police-per-lakh',
  label: 'Police personnel in position',
  unit: 'per-lakh',
  sourceId: 'bprd',
  snapshotAsOf: SNAPSHOT_DATE,
  unverified: TRANSCRIBED,
  snapshot: pts([
    [2016, 137.1],
    [2017, 144.1],
    [2018, 151.4],
    [2019, 155.8],
    [2020, 155.8],
    [2021, 152.8],
    [2022, 152.8],
    [2023, 155.0],
  ]),
  note: 'Against a sanctioned strength of roughly 195 per 100,000 and a frequently-cited United Nations benchmark of 222. Around a fifth of sanctioned posts sit vacant, which is the binding constraint behind most of the numbers in this chapter.',
}

export const casePendency: SeriesSpec = {
  id: 'law.case-pendency',
  label: 'Cases pending, all courts',
  unit: 'count',
  sourceId: 'njdg',
  snapshotAsOf: SNAPSHOT_DATE,
  unverified: TRANSCRIBED,
  snapshot: pts([
    [2018, 2.9e7],
    [2019, 3.2e7],
    [2020, 3.7e7],
    [2021, 4.1e7],
    [2022, 4.3e7],
    [2023, 4.7e7],
    [2024, 5.1e7],
    [2025, 5.3e7],
  ]),
  note: 'District courts, high courts and the Supreme Court combined, from the National Judicial Data Grid. Part of the rise is digitisation bringing older cases onto the grid for the first time, which is why this series should be read as a floor.',
}

/* -- international comparison ---------------------------------------------- */

export const homicideComparison: SeriesSpec = {
  id: 'law.homicide-comparison',
  label: 'Intentional homicide rate',
  unit: 'per-lakh',
  sourceId: 'unodc',
  snapshotAsOf: SNAPSHOT_DATE,
  unverified: TRANSCRIBED,
  precision: 1,
  snapshot: pts([
    ['Brazil', 22.5],
    ['Mexico', 24.9],
    ['United States', 6.4],
    ['World average', 5.8],
    ['Russia', 4.4],
    ['India', 2.9],
    ['United Kingdom', 1.0],
    ['China', 0.5],
    ['Japan', 0.2],
  ]),
  note: 'UNODC applies a common definition that is slightly wider than the Indian penal code\'s "murder", which is why India\'s figure here is above the 2.1 the National Crime Records Bureau publishes. Comparing the two directly would be an error.',
}
