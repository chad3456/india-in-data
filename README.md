# India in Data

An interactive, source-cited data narrative of India's growth — five chapters
built on official statistics and multilateral datasets, where every chart states
where its numbers came from, when they were retrieved, and what they cannot tell
you.

- **India on the global stage** — aggregate size against per-person income
- **What a household actually has** — electricity, sanitation, fuel, water, connectivity
- **Defence** — spending, indigenous production, and import dependence
- **Economic reform** — GST, insolvency, inflation targeting, digital payment rails
- **Law and order** — recorded crime, capacity, and the limits of crime statistics

Plus a **[source register](src/data/sources.ts)** of every publisher used, and a
**methodology** page that specifies the retrieval mechanism and its failure modes.

---

## The data mechanism

Every series resolves through a five-tier ladder, and the figure shows which
tier produced the numbers on screen:

| Badge | Meaning |
|---|---|
| **Supabase** | Read from this project's Postgres catalogue — the canonical store, tried first, one batched request per page. |
| **Live** | The catalogue lacked the series, so the reader's browser called the publisher's API directly and it answered. |
| **Live · cached** | The same call succeeded earlier in that browser, within a 12-hour TTL. |
| **Cited release** | The publisher has no API. Values are transcribed from a cited release and versioned here. |
| **Repo snapshot** | Everything above failed, so the committed fallback is shown — dated in the badge. |

26 of the 60 series are API-backed (World Bank Indicators, plus IMF and
data.gov.in providers). The rest come from publishers who release PDFs — the
National Crime Records Bureau, the Ministry of Defence, Union Budget documents —
and are transcribed with a citation.

**The site runs with no environment variables at all.** Without Supabase
credentials the database tier is skipped entirely and every figure resolves one
rung down the ladder, saying so on its face.

### Status of the committed snapshot

> The snapshot committed in this repository was **transcribed by hand** from
> published figures — the environment it was built in had no outbound network
> access. It is a fallback, not the primary source.
>
> - The API-backed series are ingested into Supabase from the publisher and
>   correct themselves there; they also re-fetch live in the reader's browser if
>   the catalogue is unreachable.
> - The 34 transcribed series should be checked against the cited release before
>   being quoted anywhere that matters.
> - Run `npm run refresh-data` to regenerate every API-backed snapshot from the
>   live publishers. It writes `src/data/snapshots/generated.json`, whose entries
>   supersede the transcribed literals and clear the "not yet machine-verified"
>   label in the UI.
>
> Until that runs, figures falling back to the snapshot say so on their face.

## The catalogue (Supabase)

Four tables in `public`, created by `supabase/migrations/`:

| Table | Holds |
|---|---|
| `sources` | The publisher register — url, licence, cadence, caveat. |
| `series` | Series definitions, including the provider and indicator code the ingest job uses. |
| `observations` | `(series_id, period)` primary key, plus `period_order` so non-numeric periods (`2023-24`, `Mar 2025`) sort correctly. |
| `ingest_runs` | An audit row per ingest: what ran, how many rows, what failed. |

Two views, `series_catalogue` and `catalogue_health`, both `security_invoker`.

**Row-level security is enabled on all four tables and the only policy is
`select` for `anon` and `authenticated`.** There is no insert, update or delete
policy at all, so the anon key in the browser bundle cannot alter anything.
Writes happen only through the `ingest` edge function, which holds the
service-role key and checks it itself.

```bash
npm run export-seed    # regenerate supabase/seed/*.sql from the TypeScript
```

The ingest replaces a series' observations wholesale rather than merging, because
a re-fetch is the whole truth for that series — including the publisher's
revisions to earlier years.

## Deploying

See **[DEPLOY.md](DEPLOY.md)** for the full walkthrough: Supabase project,
migration, seed, edge function, scheduled ingest, and the Vercel deploy.

## Getting started

```bash
npm install
npm run dev            # http://localhost:5173
npm run build          # production build into dist/
npm run preview        # serve the production build
```

Optional environment variables:

| Variable | Effect |
|---|---|
| `VITE_DATA_GOV_IN_KEY` | Enables the data.gov.in provider. Without it those series fall back to their snapshot, which is the correct behaviour for a public deploy without a key. |
| `SITE_BASE` | Asset base path. Set to `/<repo>/` for GitHub project pages; defaults to `/`. |

## Keeping the data current

```bash
npm run refresh-data     # regenerate snapshots from the publisher APIs
npm run verify-sources   # structural checks (run in CI)
```

`verify-sources` fails the build if:

1. a series cites a source that is not in the register;
2. a series is in neither the refresh manifest nor the curated-only list;
3. a World Bank indicator code in the TypeScript disagrees with the one the
   refresh script fetches;
4. a source is missing a URL, licence or update cadence.

A scheduled workflow (`.github/workflows/refresh-data.yml`) runs the refresh
weekly and commits the result if anything changed.

## Adding a series

1. Add the publisher to `src/data/sources.ts` if it is not already there — with
   a URL, licence, cadence and, where relevant, a caveat.
2. Define the series in the appropriate `src/data/series/*.ts`, declaring
   `sourceId`, `unit`, `snapshot` and `snapshotAsOf`. Add `live` if the
   publisher serves an open, CORS-enabled API.
3. Register it in `scripts/manifest.mjs` — under `MANIFEST` if it is
   refreshable, `CURATED_ONLY` if not.
4. Render it with `<Figure>`, which supplies the legend, table view, CSV export,
   provenance badge and citation line automatically.

`npm run verify-sources` will tell you if you missed a step.

## Design and charting rules

- **One axis, always.** No dual-scale charts anywhere.
- **Colour follows the entity**, from a fixed eight-slot categorical palette
  validated for colour-vision deficiency against this site's own light and dark
  surfaces (`node scripts/validate_palette.js` in the dataviz reference).
- **Colour is never the only channel** — every figure ships a legend, a table
  view, a CSV export and keyboard access.
- **Zero baselines on magnitudes**; rates and indices say when they are truncated.
- **Breaks are shown, not smoothed** — the 2021 life-expectancy dip, the 2020
  crime spike, the part-year first GST bar.

## Stack

Vite · React · TypeScript · d3-scale/shape for the geometry, with hand-built SVG
chart components. No chart library, no CSS framework, no runtime dependency on
any third-party service beyond the data publishers themselves.

## Licence and reuse

The code in this repository is available for reuse. **The data is not the
repository's to license** — each publisher's terms are recorded per source in
the register (Government Open Data Licence — India for most Indian government
data, Creative Commons attribution terms for World Bank and UN data, SIPRI free
for non-commercial use with attribution). Check the individual entry before
republishing.
