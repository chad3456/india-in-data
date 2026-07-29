# Deploying India in Data

Two services, in this order: **Supabase** holds the data, **Vercel** serves the
site. Neither blocks the other — the site builds and renders before Supabase
exists, one rung down the provenance ladder.

Everything below has already been done for the project this repository was built
against. Follow it from scratch only if you are standing up your own copy.

---

## Part 1 — Supabase

### 1.1 Create the project

1. <https://supabase.com/dashboard> → **New project**.
2. Pick a region close to your readers — `ap-south-1` (Mumbai) for an Indian
   audience. Region cannot be changed after creation.
3. Save the database password somewhere durable. You are not shown it again and
   you need it for CLI migrations.

The free tier is sufficient: this catalogue is about a thousand rows and every
read is anonymous and cacheable.

### 1.2 Apply the schema

Either paste `supabase/migrations/20260728100000_init_catalogue.sql` into the
dashboard's **SQL Editor** and run it, or use the CLI:

```bash
npm install -g supabase
supabase link --project-ref <your-project-ref>
supabase db push
```

That creates four tables — `sources`, `series`, `observations`, `ingest_runs` —
plus the `series_catalogue` and `catalogue_health` views.

**It also enables row-level security on all four tables, with `select` as the
only policy granted to `anon` and `authenticated`.** Do not add write policies.
Writes are meant to come from the edge function, which uses the service-role key
and bypasses RLS by design.

### 1.3 Seed the catalogue

The seed files are generated from the TypeScript, so the database and the app
cannot disagree about what a series is:

```bash
npm run export-seed
```

That writes into `supabase/seed/`:

| File | Contents |
|---|---|
| `01_sources.sql` | The 49-entry publisher register. |
| `02_series.sql` | The 60 series definitions. |
| `03_observations.sql` | Every observation, as a reference copy. |
| `03a_observations_manual.sql` | Only the 269 observations for series with no API — the ones the ingest job cannot produce. |

Run `01`, `02`, then `03a` in the SQL Editor. **Skip `03`** — the API-backed
series in it are hand-transcribed, and the ingest in the next step replaces them
with fetched values anyway.

### 1.4 Deploy the ingest function

```bash
supabase functions deploy ingest
```

It is deployed with `verify_jwt = false` because it does its own auth: it
compares the `Authorization` header against `SUPABASE_SERVICE_ROLE_KEY`, which
Supabase injects into the function environment automatically. An unauthenticated
call gets a 401 and touches nothing.

Invoke it with the service-role key — **Settings → API → `service_role`**, which
is secret and must never appear in the frontend, in `.env.local`, or in a commit:

```bash
curl -X POST 'https://<project-ref>.supabase.co/functions/v1/ingest' \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY"
```

It returns a JSON summary and writes an audit row to `ingest_runs`.

### 1.5 Schedule it

Dashboard → **Integrations → Cron** → new job. Weekly is right for this data:
the World Bank revises on roughly a quarterly cadence and nothing here is
intraday.

```sql
select net.http_post(
  url     := 'https://<project-ref>.supabase.co/functions/v1/ingest',
  headers := jsonb_build_object(
    'Authorization', 'Bearer ' || current_setting('app.service_role_key'),
    'Content-Type',  'application/json'
  )
);
```

Store the key as a Vault secret rather than inlining it in the job definition.

### 1.6 Check it worked

```sql
select * from public.catalogue_health;

select id, origin, last_ingested_at
from public.series
where origin = 'ingested'
order by last_ingested_at desc
limit 10;
```

---

## Part 2 — Vercel

### 2.1 Import

1. <https://vercel.com/new> → import the GitHub repository.
2. Vercel reads `vercel.json` and needs no manual configuration: framework
   `vite`, build `npm run build`, output `dist`, install `npm ci`.

Leave the auto-detected settings alone. The committed `vercel.json` also sets the
SPA rewrite, immutable caching on hashed assets, and the security headers.

### 2.2 Environment variables

**Settings → Environment Variables.** Add both to Production, Preview and
Development:

| Name | Value |
|---|---|
| `VITE_SUPABASE_URL` | `https://<project-ref>.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Settings → API → the **anon / public** key |

Optionally `VITE_DATA_GOV_IN_KEY` — a free key from
<https://data.gov.in/user/register> that activates the data.gov.in provider.
Without it those series fall back a rung, which is correct behaviour.

Do **not** set `SITE_BASE`. That exists for GitHub Pages sub-path hosting;
Vercel serves from the domain root.

The anon key belongs in the browser bundle — that is what it is for, and RLS is
what makes it safe (§1.2). If you ever paste the `service_role` key here by
mistake, rotate it immediately: it bypasses RLS entirely.

### 2.3 Deploy

Push to the branch and Vercel builds it.

Vite inlines `VITE_*` variables at **build** time, so after changing any of them
you must redeploy — Deployments → ⋯ → **Redeploy**. Changing a variable in the
dashboard does nothing to an already-built bundle.

### 2.4 Verify

Open the deployment and check, in order:

1. Charts render at all. If they render with a **Cited release** or **Repo
   snapshot** badge, the site is healthy but Supabase is not being reached.
2. A World Bank–backed figure — *GDP, current US$* in the global chapter — shows
   a **Supabase** badge. That is the whole pipeline working end to end.
3. Deep-link straight to `/#/sources` in a fresh tab. A 404 means the SPA rewrite
   is not applied.
4. Toggle the theme and reload. It should not flash; the pre-paint script in
   `index.html` handles that.

If step 2 shows **Live** instead of **Supabase**, the frontend fell through to
calling the World Bank directly. Usual causes: the env vars were added but not
redeployed (§2.3), or the series is not `origin = 'ingested'` yet (§1.6).

---

## Local development

```bash
cp .env.example .env.local     # then paste the anon key
npm install
npm run dev
```

With no `.env.local` at all the site still runs — it just skips the database
tier. That is deliberate and worth keeping true.

## What runs where

| Concern | Runs | Holds the service-role key |
|---|---|---|
| Reading series for a chart | The reader's browser, via PostgREST | No — anon key, RLS-constrained |
| Falling back to a publisher API | The reader's browser | No — public APIs, no credentials |
| Writing observations | The `ingest` edge function | Yes |
| Scheduling the ingest | Supabase Cron | Yes, from Vault |

Nothing in the deployed frontend can write to the database.
