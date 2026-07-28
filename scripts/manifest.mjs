/**
 * The refresh manifest.
 *
 * This is the Node-side mirror of every series in `src/data/series/*.ts` that
 * declares a `live` provider. It is deliberately a plain data file rather than
 * an import of the TypeScript modules — those reference `import.meta.env` and
 * browser globals — and `npm run verify-sources` fails the build if the two
 * ever drift apart.
 */

export const MANIFEST = [
  /* -- chapter 1: global stage ------------------------------------------- */
  { id: 'global.gdp.current-usd', kind: 'worldbank', indicator: 'NY.GDP.MKTP.CD', from: 1990 },
  { id: 'global.gdp.ppp', kind: 'worldbank', indicator: 'NY.GDP.MKTP.PP.CD', from: 1990 },
  { id: 'global.gdp.per-capita', kind: 'worldbank', indicator: 'NY.GDP.PCAP.CD', from: 1990 },
  { id: 'global.gdp.share-of-world', kind: 'worldbank-share', indicator: 'NY.GDP.MKTP.CD', from: 1990 },
  { id: 'global.gdp.growth', kind: 'worldbank', indicator: 'NY.GDP.MKTP.KD.ZG', from: 2000 },
  {
    id: 'global.gdp.growth-world',
    kind: 'worldbank',
    indicator: 'NY.GDP.MKTP.KD.ZG',
    country: 'WLD',
    from: 2000,
  },
  {
    id: 'global.population.india',
    kind: 'worldbank',
    indicator: 'SP.POP.TOTL',
    from: 1990,
    scale: 1e-6,
  },
  {
    id: 'global.population.china',
    kind: 'worldbank',
    indicator: 'SP.POP.TOTL',
    country: 'CHN',
    from: 1990,
    scale: 1e-6,
  },
  { id: 'global.trade.exports', kind: 'worldbank', indicator: 'NE.EXP.GNFS.CD', from: 1995 },
  { id: 'global.remittances', kind: 'worldbank', indicator: 'BX.TRF.PWKR.CD.DT', from: 2000 },
  { id: 'global.co2.per-capita', kind: 'worldbank', indicator: 'EN.GHG.CO2.PC.CE.AR5', from: 1990 },

  /* -- chapter 2: living standards --------------------------------------- */
  { id: 'living.electricity-access', kind: 'worldbank', indicator: 'EG.ELC.ACCS.ZS', from: 1993 },
  { id: 'living.open-defecation', kind: 'worldbank', indicator: 'SH.STA.ODFC.ZS', from: 2000 },
  { id: 'living.clean-cooking-fuel', kind: 'worldbank', indicator: 'EG.CFT.ACCS.ZS', from: 2000 },
  { id: 'living.basic-water', kind: 'worldbank', indicator: 'SH.H2O.BASW.ZS', from: 2000 },
  { id: 'living.internet-users', kind: 'worldbank', indicator: 'IT.NET.USER.ZS', from: 2000 },
  { id: 'living.life-expectancy', kind: 'worldbank', indicator: 'SP.DYN.LE00.IN', from: 1990 },
  { id: 'living.infant-mortality', kind: 'worldbank', indicator: 'SP.DYN.IMRT.IN', from: 1990 },
  { id: 'living.maternal-mortality', kind: 'worldbank', indicator: 'SH.STA.MMRT', from: 2000 },
  { id: 'living.account-ownership', kind: 'worldbank', indicator: 'FX.OWN.TOTL.ZS', from: 2011 },

  /* -- chapter 3: defence -------------------------------------------------- */
  { id: 'defence.milex.usd', kind: 'worldbank', indicator: 'MS.MIL.XPND.CD', from: 1995 },
  { id: 'defence.milex.gdp-share', kind: 'worldbank', indicator: 'MS.MIL.XPND.GD.ZS', from: 1995 },
  { id: 'defence.arms-imports.tiv', kind: 'worldbank', indicator: 'MS.MIL.MPRT.KD', from: 2000 },

  /* -- chapter 4: economic reform ------------------------------------------ */
  { id: 'economy.forex-reserves', kind: 'worldbank', indicator: 'FI.RES.TOTL.CD', from: 2000 },
  { id: 'economy.fdi-inflows', kind: 'worldbank', indicator: 'BX.KLT.DINV.CD.WD', from: 2000 },
  { id: 'economy.cpi-inflation', kind: 'worldbank', indicator: 'FP.CPI.TOTL.ZG', from: 2005 },
]

/**
 * Series with no live provider. Listed so `verify-sources` can assert that
 * every series in the TypeScript is accounted for one way or the other, and
 * so a series that gains an API is never silently left on a transcription.
 */
export const CURATED_ONLY = [
  'global.hdi',
  'global.gii-rank',
  'global.compare.largest-economies',
  'global.compare.co2-per-capita',
  'living.mpi-headcount',
  'living.extreme-poverty-215',
  'living.extreme-poverty-300',
  'living.tap-water-connections',
  'living.jan-dhan-accounts',
  'living.mobile-data-cost',
  'living.female-lfpr',
  'defence.budget.total',
  'defence.production.value',
  'defence.exports.value',
  'defence.procurement.domestic-share',
  'economy.gst-collections',
  'economy.gross-npa-ratio',
  'economy.capital-expenditure',
  'economy.upi-transactions',
  'economy.income-tax-returns',
  'economy.electronics-exports',
  'economy.national-highways',
  'economy.ibc-resolutions',
  'law.cognizable-crime-rate',
  'law.murder-count',
  'law.murder-rate',
  'law.crimes-against-women',
  'law.cybercrime-cases',
  'law.conviction-rate',
  'law.prison-occupancy',
  'law.undertrial-share',
  'law.police-per-lakh',
  'law.case-pendency',
  'law.homicide-comparison',
]
