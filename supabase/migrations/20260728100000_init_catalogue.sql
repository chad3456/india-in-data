-- ============================================================================
-- India in Data — the data catalogue.
--
-- Three tables carry the whole site:
--   sources       the citation register (one row per publisher dataset)
--   series        one row per plotted series, including how to re-fetch it
--   observations  the actual numbers
-- plus ingest_runs, an audit trail of every automated refresh.
--
-- Everything is public-readable and nothing is public-writable: writes happen
-- only through the service role, which the ingest edge function holds.
-- ============================================================================

create extension if not exists pg_net with schema extensions;

-- ---------------------------------------------------------------- sources --

create table if not exists public.sources (
  id          text primary key,
  name        text not null,
  publisher   text not null,
  url         text not null,
  description text not null,
  category    text not null,
  access      text not null check (access in ('api', 'bulk', 'publication')),
  cadence     text not null,
  licence     text not null,
  caveat      text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

comment on table public.sources is
  'The citation register. A series may not reference a source that is not here.';

-- ----------------------------------------------------------------- series --

create table if not exists public.series (
  id              text primary key,
  label           text not null,
  unit            text not null,
  source_id       text not null references public.sources (id) on delete restrict,
  also_source_ids text[] not null default '{}',
  chapter_id      text not null,
  precision       smallint,
  note            text,

  -- How this series is re-fetched. 'manual' means the publisher has no API and
  -- the values are transcribed from a cited release.
  provider        text not null default 'manual'
                  check (provider in ('manual', 'worldbank', 'worldbank_share', 'imf')),
  indicator_code  text,
  country_code    text not null default 'IND',
  value_scale     double precision not null default 1,
  period_from     integer,

  -- Provenance of what is currently stored.
  origin          text not null default 'transcribed'
                  check (origin in ('transcribed', 'ingested')),
  last_ingested_at timestamptz,
  transcribed_as_of date,

  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),

  -- An automated provider is useless without something to fetch.
  constraint series_provider_needs_indicator
    check (provider = 'manual' or indicator_code is not null)
);

comment on column public.series.origin is
  'transcribed = typed in from a cited PDF; ingested = fetched from the publisher API by the ingest function.';

create index if not exists series_chapter_idx on public.series (chapter_id);
create index if not exists series_source_idx on public.series (source_id);
create index if not exists series_provider_idx on public.series (provider) where provider <> 'manual';

-- ----------------------------------------------------------- observations --

create table if not exists public.observations (
  series_id    text not null references public.series (id) on delete cascade,
  -- The x value as published: '2024', '2024-25', 'Mar 2018', 'India'.
  period       text not null,
  -- Sort key, so the database never depends on string collation for order.
  period_order double precision not null,
  value        double precision,
  flag         text,
  updated_at   timestamptz not null default now(),
  primary key (series_id, period)
);

create index if not exists observations_series_order_idx
  on public.observations (series_id, period_order);

-- ------------------------------------------------------------ ingest_runs --

create table if not exists public.ingest_runs (
  id          bigint generated always as identity primary key,
  started_at  timestamptz not null default now(),
  finished_at timestamptz,
  ok_count    integer not null default 0,
  fail_count  integer not null default 0,
  detail      jsonb not null default '[]'::jsonb
);

comment on table public.ingest_runs is
  'Audit trail: every automated refresh, what succeeded and what failed.';

-- ------------------------------------------------------------- updated_at --

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists sources_touch on public.sources;
create trigger sources_touch before update on public.sources
  for each row execute function public.touch_updated_at();

drop trigger if exists series_touch on public.series;
create trigger series_touch before update on public.series
  for each row execute function public.touch_updated_at();

drop trigger if exists observations_touch on public.observations;
create trigger observations_touch before update on public.observations
  for each row execute function public.touch_updated_at();

-- -------------------------------------------------------------------- RLS --
-- Public read, no public write. The ingest function writes with the service
-- role, which bypasses RLS; there is deliberately no insert/update/delete
-- policy for anon, so an anon key leak cannot alter a single number.

alter table public.sources      enable row level security;
alter table public.series       enable row level security;
alter table public.observations enable row level security;
alter table public.ingest_runs  enable row level security;

drop policy if exists "sources are public" on public.sources;
create policy "sources are public" on public.sources
  for select to anon, authenticated using (true);

drop policy if exists "series are public" on public.series;
create policy "series are public" on public.series
  for select to anon, authenticated using (true);

drop policy if exists "observations are public" on public.observations;
create policy "observations are public" on public.observations
  for select to anon, authenticated using (true);

drop policy if exists "ingest runs are public" on public.ingest_runs;
create policy "ingest runs are public" on public.ingest_runs
  for select to anon, authenticated using (true);

-- ------------------------------------------------------------------ views --

-- One row per series with its citation resolved and its freshness stated.
create or replace view public.series_catalogue
with (security_invoker = true) as
select
  s.id,
  s.label,
  s.unit,
  s.chapter_id,
  s.precision,
  s.note,
  s.provider,
  s.indicator_code,
  s.origin,
  s.last_ingested_at,
  s.transcribed_as_of,
  s.source_id,
  src.name       as source_name,
  src.publisher  as source_publisher,
  src.url        as source_url,
  src.access     as source_access,
  s.also_source_ids,
  (select count(*) from public.observations o where o.series_id = s.id) as observation_count
from public.series s
join public.sources src on src.id = s.source_id;

-- Site-wide freshness, for the footer's data-status strip.
create or replace view public.catalogue_health
with (security_invoker = true) as
select
  count(*)                                          as series_total,
  count(*) filter (where origin = 'ingested')       as series_ingested,
  count(*) filter (where origin = 'transcribed')    as series_transcribed,
  max(last_ingested_at)                             as last_ingested_at
from public.series;
