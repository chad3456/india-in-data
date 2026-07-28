/* ==========================================================================
   The source register.

   This is the single place a citation is written down. Figures reference a
   source by id; the Sources page renders this register directly. If a source
   is not in here, nothing on the site can cite it — that is the point.
   ========================================================================== */

import type { Source } from './types'

const REGISTER = [
  /* ---------------------------------------------------------------- global */
  {
    id: 'worldbank-wdi',
    name: 'World Development Indicators',
    publisher: 'World Bank',
    url: 'https://datatopics.worldbank.org/world-development-indicators/',
    description:
      "The World Bank's compilation of internationally comparable statistics, assembled from national statistical offices and UN agencies. Queried live from this site through the open v2 API, which is why most long-run series here update themselves.",
    category: 'Multilateral',
    access: 'api',
    cadence: 'Continuous; major refreshes in April, July, September and December',
    licence: 'CC BY 4.0',
    caveat:
      'Values are as reported by the national statistical office and are revised without notice. Comparability across countries is the priority, so figures can differ slightly from the Indian domestic release for the same indicator.',
  },
  {
    id: 'worldbank-pip',
    name: 'Poverty and Inequality Platform',
    publisher: 'World Bank',
    url: 'https://pip.worldbank.org/',
    description:
      'The World Bank\'s poverty measurement platform, source of the international poverty lines. In June 2025 the lines were rebased to 2021 PPPs, moving extreme poverty from $2.15 to $3.00 a day — which changes every headline poverty number, including India\'s.',
    category: 'Multilateral',
    access: 'api',
    cadence: 'Twice yearly',
    licence: 'CC BY 4.0',
    caveat:
      'India\'s poverty estimates rest on consumption surveys with a long gap between 2011-12 and 2022-23, and a changed questionnaire design. Comparisons across that break are contested and should be read as indicative of direction, not precision.',
  },
  {
    id: 'imf-weo',
    name: 'World Economic Outlook Database',
    publisher: 'International Monetary Fund',
    url: 'https://www.imf.org/en/Publications/WEO/weo-database',
    description:
      'The IMF\'s macroeconomic database and the standard reference for cross-country GDP comparisons and for the forward projections used in the ranking charts here.',
    category: 'Multilateral',
    access: 'api',
    cadence: 'April and October, with January and July updates',
    licence: 'IMF terms of use — free for non-commercial reuse with attribution',
    caveat:
      'Anything beyond the current year is a projection, not an observation. Nominal-GDP league tables also move with the exchange rate, so a ranking can change without any change in output.',
  },
  {
    id: 'un-wpp',
    name: 'World Population Prospects',
    publisher: 'United Nations, Department of Economic and Social Affairs',
    url: 'https://population.un.org/wpp/',
    description:
      'The UN\'s population estimates and projections, and the basis for the finding that India became the world\'s most populous country during 2023.',
    category: 'Multilateral',
    access: 'bulk',
    cadence: 'Revised every two years',
    licence: 'CC BY 3.0 IGO',
    caveat:
      'India has not held a census since 2011, so recent Indian population figures are modelled estimates carried forward, not counts.',
  },
  {
    id: 'undp-hdr',
    name: 'Human Development Report',
    publisher: 'United Nations Development Programme',
    url: 'https://hdr.undp.org/data-center',
    description:
      'The Human Development Index and its components — life expectancy, schooling, and gross national income per head — used here as the counterweight to the aggregate-GDP story.',
    category: 'Multilateral',
    access: 'bulk',
    cadence: 'Annual',
    licence: 'CC BY 3.0 IGO',
    caveat:
      'Each report describes a reference year roughly two years earlier, and the index is periodically re-based, so rank changes between reports are not always real movement.',
  },
  {
    id: 'wipo-gii',
    name: 'Global Innovation Index',
    publisher: 'World Intellectual Property Organization',
    url: 'https://www.wipo.int/global_innovation_index/en/',
    description:
      'A composite ranking of national innovation capacity across around 80 indicators, used here to track India\'s movement rather than its absolute score.',
    category: 'Multilateral',
    access: 'publication',
    cadence: 'Annual',
    licence: 'CC BY 4.0 (report); indicator data under contributor terms',
    caveat:
      'A composite index: the methodology and the sample of economies change between editions, so a rank series is only loosely comparable over time.',
  },
  {
    id: 'knomad',
    name: 'Migration and Development Brief (remittances)',
    publisher: 'World Bank / KNOMAD',
    url: 'https://www.knomad.org/data/remittances',
    description:
      'Global remittance estimates by receiving country — the series behind India being the world\'s largest recipient of remittances.',
    category: 'Multilateral',
    access: 'bulk',
    cadence: 'Twice yearly',
    licence: 'CC BY 4.0',
    caveat:
      'Estimates combine balance-of-payments reporting with modelling, and informal channels are captured unevenly.',
  },
  {
    id: 'unodc',
    name: 'Global Study on Homicide / UNODC data portal',
    publisher: 'United Nations Office on Drugs and Crime',
    url: 'https://dataunodc.un.org/',
    description:
      'Internationally comparable intentional-homicide rates, used here to place India\'s murder rate against the world average.',
    category: 'Multilateral',
    access: 'bulk',
    cadence: 'Annual',
    licence: 'CC BY 3.0 IGO',
    caveat:
      'Cross-country crime comparison is reliable only for homicide. Recorded rates for every other offence are dominated by differences in reporting and legal definition.',
  },
  {
    id: 'sipri-milex',
    name: 'Military Expenditure Database',
    publisher: 'Stockholm International Peace Research Institute',
    url: 'https://www.sipri.org/databases/milex',
    description:
      'Consistent estimates of military spending back to 1949, on a common definition that lets India be compared with other spenders.',
    category: 'Research institute',
    access: 'bulk',
    cadence: 'Annual, each April',
    licence: 'Free for non-commercial use with attribution',
    caveat:
      "SIPRI's definition is broader than India's defence budget line: it includes pensions and paramilitary forces, so SIPRI's total is higher than the Ministry of Defence allocation for the same year.",
  },
  {
    id: 'sipri-at',
    name: 'Arms Transfers Database',
    publisher: 'Stockholm International Peace Research Institute',
    url: 'https://www.sipri.org/databases/armstransfers',
    description:
      'Volumes of international transfers of major conventional weapons, the source for India\'s import dependence and for the shift in supplier mix away from Russia.',
    category: 'Research institute',
    access: 'bulk',
    cadence: 'Annual, each March',
    licence: 'Free for non-commercial use with attribution',
    caveat:
      'Measured in trend-indicator values (TIV), a volume measure of military capability — not money paid. TIV totals must never be read as dollars.',
  },
  {
    id: 'owid',
    name: 'Our World in Data',
    publisher: 'Global Change Data Lab, University of Oxford',
    url: 'https://ourworldindata.org/',
    description:
      'Curated and harmonised long-run series drawn from primary statistical agencies, used here where a clean comparable time series matters more than the latest observation.',
    category: 'Research institute',
    access: 'api',
    cadence: 'Continuous',
    licence: 'CC BY 4.0',
    caveat: 'A re-publisher, not an originator — the underlying source is always cited alongside.',
  },
  {
    id: 'iea',
    name: 'India energy statistics',
    publisher: 'International Energy Agency',
    url: 'https://www.iea.org/countries/india',
    description:
      "Energy balances, electricity generation and emissions for India, used for the energy-transition figures.",
    category: 'Multilateral',
    access: 'publication',
    cadence: 'Annual, with periodic outlooks',
    licence: 'IEA terms of use',
  },

  /* ------------------------------------------------- Government of India */
  {
    id: 'mospi-nas',
    name: 'National Accounts Statistics',
    publisher: 'Ministry of Statistics and Programme Implementation',
    url: 'https://mospi.gov.in/national-accounts-statistics',
    description:
      "India's official GDP estimates — the primary release from which the World Bank and IMF India figures are ultimately derived.",
    category: 'Government of India',
    access: 'publication',
    cadence: 'Quarterly estimates; annual revisions in January and February',
    licence: 'Government Open Data Licence — India',
    caveat:
      'The 2011-12 base-year series is not directly comparable with the earlier 2004-05 series. A new base year revision is under way.',
  },
  {
    id: 'mospi-plfs',
    name: 'Periodic Labour Force Survey',
    publisher: 'Ministry of Statistics and Programme Implementation',
    url: 'https://mospi.gov.in/web/mospi/download-tables-data/-/reports/view/templateFour/',
    description:
      'The official household survey of employment, unemployment and labour-force participation, replacing the old quinquennial rounds with an annual (and now monthly) cadence.',
    category: 'Government of India',
    access: 'publication',
    cadence: 'Annual reports; quarterly urban bulletins; monthly from 2025',
    licence: 'Government Open Data Licence — India',
    caveat:
      'Headline unemployment uses "usual status", which counts anyone working 30 days or more in the year as employed, and counts unpaid family work as employment. Both choices lower the measured rate relative to intuitive definitions.',
  },
  {
    id: 'mospi-cpi',
    name: 'Consumer Price Index',
    publisher: 'Ministry of Statistics and Programme Implementation',
    url: 'https://mospi.gov.in/cpi',
    description: 'The monthly inflation series the Reserve Bank targets.',
    category: 'Government of India',
    access: 'publication',
    cadence: 'Monthly',
    licence: 'Government Open Data Licence — India',
  },
  {
    id: 'indiabudget',
    name: 'Union Budget documents',
    publisher: 'Ministry of Finance',
    url: 'https://www.indiabudget.gov.in/',
    description:
      'Budget at a Glance, Expenditure Profile and Demands for Grants — the authoritative record for every allocation figure quoted here, including defence and capital expenditure.',
    category: 'Government of India',
    access: 'publication',
    cadence: 'Annual, each 1 February',
    licence: 'Government Open Data Licence — India',
    caveat:
      'A budget has three vintages: Budget Estimate, Revised Estimate and Actual. They differ, sometimes by a lot. Every budget figure here states which vintage it is.',
  },
  {
    id: 'economic-survey',
    name: 'Economic Survey of India',
    publisher: 'Ministry of Finance, Department of Economic Affairs',
    url: 'https://www.indiabudget.gov.in/economicsurvey/',
    description:
      "The government's annual review of the economy, tabled the day before the Budget, and a consolidated source for reform-era statistics.",
    category: 'Government of India',
    access: 'publication',
    cadence: 'Annual',
    licence: 'Government Open Data Licence — India',
    caveat: 'Authored by the government; the framing is official, though the underlying data are the standard official series.',
  },
  {
    id: 'data-gov-in',
    name: 'Open Government Data Platform India',
    publisher: 'National Informatics Centre',
    url: 'https://data.gov.in/',
    description:
      "India's central open-data catalogue, exposing thousands of departmental datasets through a keyed REST API. Used here for departmental series that have no dedicated API of their own.",
    category: 'Government of India',
    access: 'api',
    cadence: 'Varies by dataset',
    licence: 'Government Open Data Licence — India',
    caveat:
      'Coverage is uneven and many resources stop being updated without being marked stale. Each dataset used here is checked for its own last-updated date.',
  },
  {
    id: 'pib',
    name: 'Press Information Bureau releases',
    publisher: 'Government of India',
    url: 'https://www.pib.gov.in/',
    description:
      "The official channel for ministry announcements and for parliamentary answers. Used where a number exists only in a ministry statement — chiefly defence production and scheme progress.",
    category: 'Government of India',
    access: 'publication',
    cadence: 'Daily',
    licence: 'Government Open Data Licence — India',
    caveat:
      'A press release is a primary source for what a ministry has stated, not an independently audited statistic. Figures sourced only to PIB are marked as such.',
  },
  {
    id: 'mod-ddp',
    name: 'Department of Defence Production',
    publisher: 'Ministry of Defence',
    url: 'https://ddpmod.gov.in/',
    description:
      'Defence production value, defence exports, indigenisation lists and the iDEX innovation programme — the primary record for the self-reliance figures.',
    category: 'Government of India',
    access: 'publication',
    cadence: 'Annual, with quarterly statements',
    licence: 'Government Open Data Licence — India',
    caveat:
      'Production value counts output of defence public-sector undertakings and private firms at sale value; it is not a measure of indigenous content, which is lower.',
  },
  {
    id: 'mod-annual',
    name: 'Ministry of Defence Annual Report',
    publisher: 'Ministry of Defence',
    url: 'https://www.mod.gov.in/documents/annual-report',
    description:
      'The consolidated annual account of the armed forces, acquisitions, R&D and the defence-industrial base.',
    category: 'Government of India',
    access: 'publication',
    cadence: 'Annual',
    licence: 'Government Open Data Licence — India',
  },
  {
    id: 'drdo',
    name: 'Defence Research and Development Organisation',
    publisher: 'Ministry of Defence',
    url: 'https://www.drdo.gov.in/',
    description: 'Programme records for indigenous defence systems and test milestones.',
    category: 'Government of India',
    access: 'publication',
    cadence: 'Continuous',
    licence: 'Government Open Data Licence — India',
  },
  {
    id: 'isro',
    name: 'Indian Space Research Organisation',
    publisher: 'Department of Space',
    url: 'https://www.isro.gov.in/',
    description: 'Launch records and mission outcomes, used for the space-programme figures.',
    category: 'Government of India',
    access: 'publication',
    cadence: 'Per mission',
    licence: 'Government Open Data Licence — India',
  },
  {
    id: 'ncrb-cii',
    name: 'Crime in India',
    publisher: 'National Crime Records Bureau, Ministry of Home Affairs',
    url: 'https://www.ncrb.gov.in/crime-in-india.html',
    description:
      "India's annual crime statistics volume, compiled from state police returns — the only national crime series, and the basis for every crime figure here.",
    category: 'Government of India',
    access: 'publication',
    cadence: 'Annual, published with a lag of one to two years',
    licence: 'Government Open Data Licence — India',
    caveat:
      'These are recorded crimes, not crimes committed. NCRB counts under the "principal offence rule" — only the most serious charge in an incident is counted — so totals understate. Rising numbers can mean rising reporting, better registration, or rising crime, and the series cannot separate them.',
  },
  {
    id: 'ncrb-psi',
    name: 'Prison Statistics India',
    publisher: 'National Crime Records Bureau, Ministry of Home Affairs',
    url: 'https://www.ncrb.gov.in/prison-statistics-india.html',
    description:
      'Annual statistics on prison population, capacity, occupancy and the share of inmates awaiting trial.',
    category: 'Government of India',
    access: 'publication',
    cadence: 'Annual',
    licence: 'Government Open Data Licence — India',
  },
  {
    id: 'njdg',
    name: 'National Judicial Data Grid',
    publisher: 'eCommittee, Supreme Court of India',
    url: 'https://njdg.ecourts.gov.in/',
    description:
      'A live count of pending and disposed cases across district and high courts — one of the few genuinely real-time official datasets in Indian governance.',
    category: 'Government of India',
    access: 'api',
    cadence: 'Continuously updated',
    licence: 'Government Open Data Licence — India',
    caveat:
      'Pendency counts depend on court-level data entry and on how a "case" is defined; the total moves with digitisation as much as with disposal.',
  },
  {
    id: 'bprd',
    name: 'Data on Police Organisations',
    publisher: 'Bureau of Police Research and Development',
    url: 'https://bprd.nic.in/publication-list?page_id=17',
    description:
      'Sanctioned and actual police strength, expenditure and infrastructure by state — the capacity side of the law-and-order picture.',
    category: 'Government of India',
    access: 'publication',
    cadence: 'Annual, as on 1 January',
    licence: 'Government Open Data Licence — India',
  },
  {
    id: 'mha-i4c',
    name: 'Indian Cyber Crime Coordination Centre',
    publisher: 'Ministry of Home Affairs',
    url: 'https://i4c.mha.gov.in/',
    description:
      'The national cybercrime reporting portal and its statistics on financial-fraud complaints and amounts.',
    category: 'Government of India',
    access: 'publication',
    cadence: 'Continuous; periodic parliamentary statements',
    licence: 'Government Open Data Licence — India',
    caveat:
      'Portal complaints are reports, not verified losses, and the sharp rise partly reflects the portal itself becoming the standard reporting route.',
  },
  {
    id: 'trai',
    name: 'Telecom subscription and performance indicator reports',
    publisher: 'Telecom Regulatory Authority of India',
    url: 'https://www.trai.gov.in/release-publication/reports',
    description:
      'Monthly subscriber counts and quarterly indicators covering broadband, data consumption and tariffs.',
    category: 'Government of India',
    access: 'publication',
    cadence: 'Monthly and quarterly',
    licence: 'Government Open Data Licence — India',
    caveat:
      'Counts SIMs and connections, not people. One person with two active SIMs appears twice, so subscriber totals overstate the number of users.',
  },
  {
    id: 'jal-jeevan',
    name: 'Jal Jeevan Mission dashboard',
    publisher: 'Department of Drinking Water and Sanitation',
    url: 'https://ejalshakti.gov.in/jjmreport/JJMIndia.aspx',
    description:
      'Live reporting of rural household tap-water connections, by state and district.',
    category: 'Government of India',
    access: 'bulk',
    cadence: 'Continuously updated',
    licence: 'Government Open Data Licence — India',
    caveat:
      'Reports connections provided, which is not the same as water delivered reliably or of tested quality. Functionality assessments run separately and report lower numbers.',
  },
  {
    id: 'swachh-bharat',
    name: 'Swachh Bharat Mission (Grameen) dashboard',
    publisher: 'Department of Drinking Water and Sanitation',
    url: 'https://sbm.gov.in/',
    description: 'Household toilet coverage and ODF status by village, block and district.',
    category: 'Government of India',
    access: 'bulk',
    cadence: 'Continuously updated',
    licence: 'Government Open Data Licence — India',
    caveat:
      'Self-declared administrative status. Independent surveys — including the National Family Health Survey — record usage below declared coverage.',
  },
  {
    id: 'pmay',
    name: 'Pradhan Mantri Awas Yojana dashboards',
    publisher: 'Ministry of Rural Development / Ministry of Housing and Urban Affairs',
    url: 'https://pmayg.nic.in/netiayHome/home.aspx',
    description: 'Houses sanctioned, completed and handed over under the rural and urban housing missions.',
    category: 'Government of India',
    access: 'bulk',
    cadence: 'Continuously updated',
    licence: 'Government Open Data Licence — India',
  },
  {
    id: 'pmjdy',
    name: 'Pradhan Mantri Jan Dhan Yojana progress',
    publisher: 'Department of Financial Services',
    url: 'https://pmjdy.gov.in/statewise-statistics',
    description: 'Weekly account, deposit and card statistics for the financial-inclusion programme.',
    category: 'Government of India',
    access: 'bulk',
    cadence: 'Weekly',
    licence: 'Government Open Data Licence — India',
    caveat:
      'Accounts opened is a stock measure that includes dormant accounts; deposits per account is the better indicator of use.',
  },
  {
    id: 'niti-mpi',
    name: 'National Multidimensional Poverty Index',
    publisher: 'NITI Aayog',
    url: 'https://www.niti.gov.in/national-multidimensional-poverty-index',
    description:
      'A twelve-indicator deprivation index built on National Family Health Survey data, covering health, education and standard of living.',
    category: 'Government of India',
    access: 'publication',
    cadence: 'Per NFHS round',
    licence: 'Government Open Data Licence — India',
    caveat:
      'Measures deprivation in basic amenities, not income. Because several indicators track scheme delivery directly, the index moves quickly when schemes scale — which is a real improvement in living conditions but not the same as a rise in earnings.',
  },
  {
    id: 'nfhs',
    name: 'National Family Health Survey',
    publisher: 'International Institute for Population Sciences / Ministry of Health and Family Welfare',
    url: 'http://rchiips.org/nfhs/',
    description:
      "India's large-sample household health and demographic survey, and the independent check on scheme dashboards.",
    category: 'Government of India',
    access: 'publication',
    cadence: 'Roughly every five years',
    licence: 'Free for research use',
  },
  {
    id: 'srs',
    name: 'Sample Registration System',
    publisher: 'Office of the Registrar General of India',
    url: 'https://censusindia.gov.in/census.website/data/SRSSTAT',
    description:
      'The official vital-statistics system: birth and death rates, infant mortality, maternal mortality and life expectancy.',
    category: 'Government of India',
    access: 'publication',
    cadence: 'Annual bulletins; maternal mortality on a three-year moving average',
    licence: 'Government Open Data Licence — India',
    caveat:
      'Maternal mortality is published as a three-year average, so the latest available figure always lags by several years.',
  },
  {
    id: 'cea',
    name: 'Central Electricity Authority',
    publisher: 'Ministry of Power',
    url: 'https://cea.nic.in/dashboard/',
    description: 'Installed generation capacity, generation and supply position, updated monthly.',
    category: 'Government of India',
    access: 'bulk',
    cadence: 'Monthly',
    licence: 'Government Open Data Licence — India',
  },
  {
    id: 'morth',
    name: 'Ministry of Road Transport and Highways',
    publisher: 'Government of India',
    url: 'https://morth.nic.in/road-transport-year-books',
    description: 'National highway length, construction pace and road accident statistics.',
    category: 'Government of India',
    access: 'publication',
    cadence: 'Annual',
    licence: 'Government Open Data Licence — India',
  },
  {
    id: 'dpiit-fdi',
    name: 'FDI Statistics',
    publisher: 'Department for Promotion of Industry and Internal Trade',
    url: 'https://dpiit.gov.in/publications/fdi-statistics',
    description: 'Quarterly foreign direct investment inflows by sector and source country.',
    category: 'Government of India',
    access: 'publication',
    cadence: 'Quarterly',
    licence: 'Government Open Data Licence — India',
    caveat:
      'Headline "FDI inflow" includes reinvested earnings and other capital; equity inflow is the narrower and more informative number.',
  },
  {
    id: 'commerce-tradestat',
    name: 'Foreign trade statistics',
    publisher: 'Ministry of Commerce and Industry',
    url: 'https://tradestat.commerce.gov.in/',
    description:
      'Merchandise and services export and import data by commodity and partner, the source for the export-composition figures.',
    category: 'Government of India',
    access: 'bulk',
    cadence: 'Monthly',
    licence: 'Government Open Data Licence — India',
    caveat: 'Recent months are provisional and are routinely revised, services trade especially.',
  },
  {
    id: 'gst-council',
    name: 'GST collections and council decisions',
    publisher: 'GST Council / Ministry of Finance',
    url: 'https://gstcouncil.gov.in/',
    description:
      'Monthly gross GST collections and the record of rate decisions, including the 2025 rate rationalisation.',
    category: 'Government of India',
    access: 'publication',
    cadence: 'Monthly',
    licence: 'Government Open Data Licence — India',
    caveat:
      'Gross collections are not comparable with pre-2017 indirect tax receipts, and rise with both compliance and inflation as well as with real activity.',
  },
  {
    id: 'ibbi',
    name: 'Insolvency and Bankruptcy Board of India quarterly newsletter',
    publisher: 'IBBI',
    url: 'https://ibbi.gov.in/en/publication',
    description:
      'Case-level statistics on corporate insolvency resolution: admissions, resolutions, liquidations, realisation and time taken.',
    category: 'Government of India',
    access: 'publication',
    cadence: 'Quarterly',
    licence: 'Government Open Data Licence — India',
    caveat:
      'Recovery rates are computed against admitted claims, which typically far exceed the liquidation value of the firm. A low recovery rate often reflects how distressed a company was when it was admitted, not the process itself.',
  },
  {
    id: 'ppac',
    name: 'Petroleum Planning and Analysis Cell',
    publisher: 'Ministry of Petroleum and Natural Gas',
    url: 'https://ppac.gov.in/',
    description:
      'Consumption, import dependence and LPG coverage statistics for petroleum products.',
    category: 'Government of India',
    access: 'bulk',
    cadence: 'Monthly',
    licence: 'Government Open Data Licence — India',
  },

  /* ------------------------------------------------------------------ RBI */
  {
    id: 'rbi-dbie',
    name: 'Database on the Indian Economy',
    publisher: 'Reserve Bank of India',
    url: 'https://data.rbi.org.in/',
    description:
      "The RBI's statistical warehouse: money and banking, external sector, financial markets and government finances.",
    category: 'Reserve Bank of India',
    access: 'bulk',
    cadence: 'Weekly to annual, by series',
    licence: 'Free to use with attribution',
  },
  {
    id: 'rbi-fsr',
    name: 'Financial Stability Report',
    publisher: 'Reserve Bank of India',
    url: 'https://www.rbi.org.in/Scripts/PublicationsView.aspx?id=0',
    description:
      'Half-yearly assessment of banking-system health, and the source for the gross non-performing-asset series.',
    category: 'Reserve Bank of India',
    access: 'publication',
    cadence: 'Twice yearly',
    licence: 'Free to use with attribution',
    caveat:
      'The fall in reported bad loans reflects genuine recovery, but also write-offs, which remove loans from the ratio without recovering the money.',
  },
  {
    id: 'rbi-handbook',
    name: 'Handbook of Statistics on the Indian Economy',
    publisher: 'Reserve Bank of India',
    url: 'https://www.rbi.org.in/Scripts/AnnualPublications.aspx?head=Handbook+of+Statistics+on+Indian+Economy',
    description:
      'Long-run annual series on the Indian economy — the standard reference for anything needing a consistent multi-decade view.',
    category: 'Reserve Bank of India',
    access: 'bulk',
    cadence: 'Annual',
    licence: 'Free to use with attribution',
  },

  /* -------------------------------------------------------- industry body */
  {
    id: 'npci',
    name: 'UPI product statistics',
    publisher: 'National Payments Corporation of India',
    url: 'https://www.npci.org.in/what-we-do/upi/product-statistics',
    description:
      'Monthly transaction volumes and values for the Unified Payments Interface and the other retail payment rails NPCI operates.',
    category: 'Industry body',
    access: 'bulk',
    cadence: 'Monthly',
    licence: 'Free to use with attribution',
    caveat:
      'Counts transactions, including very small and person-to-person transfers, so volume growth outpaces the growth in value and in economic activity.',
  },
  {
    id: 'uidai',
    name: 'Aadhaar saturation and authentication statistics',
    publisher: 'Unique Identification Authority of India',
    url: 'https://uidai.gov.in/aadhaar_dashboard/',
    description: 'Enrolment, saturation and monthly authentication and e-KYC volumes.',
    category: 'Government of India',
    access: 'bulk',
    cadence: 'Continuously updated',
    licence: 'Government Open Data Licence — India',
  },
  {
    id: 'dbt-bharat',
    name: 'Direct Benefit Transfer dashboard',
    publisher: 'DBT Mission, Cabinet Secretariat',
    url: 'https://dbtbharat.gov.in/',
    description:
      'Scheme-wise transfers made directly to beneficiary accounts, and the government\'s estimate of resulting savings.',
    category: 'Government of India',
    access: 'bulk',
    cadence: 'Continuously updated',
    licence: 'Government Open Data Licence — India',
    caveat:
      'The published "savings" figure is a government estimate combining removed duplicates with avoided leakage, and independent estimates of the same quantity differ substantially.',
  },
] as const satisfies readonly Source[]

export type KnownSourceId = (typeof REGISTER)[number]['id']

export const SOURCES: readonly Source[] = REGISTER

const BY_ID = new Map<string, Source>(REGISTER.map((s) => [s.id, s]))

export function getSource(id: string): Source {
  const found = BY_ID.get(id)
  if (!found) {
    // Loud in development, harmless in production: a figure must never render
    // a citation the register does not contain.
    throw new Error(`Unknown source id "${id}". Add it to src/data/sources.ts.`)
  }
  return found
}

export function tryGetSource(id: string): Source | undefined {
  return BY_ID.get(id)
}

export const SOURCE_CATEGORIES = [
  'Government of India',
  'Reserve Bank of India',
  'Multilateral',
  'Research institute',
  'Industry body',
] as const

export const ACCESS_LABELS: Record<Source['access'], string> = {
  api: 'Live API',
  bulk: 'Machine-readable file',
  publication: 'Published report',
}

export const ACCESS_EXPLAINER: Record<Source['access'], string> = {
  api: 'Queried directly from your browser when you load the page.',
  bulk: 'Published as a downloadable dataset and refreshed into the repository.',
  publication: 'Released as a report; figures are transcribed and cited to the page.',
}
