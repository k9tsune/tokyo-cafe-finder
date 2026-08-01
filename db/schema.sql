-- Tokyo Cafe Finder — Postgres/PostGIS schema (Phase B).
-- The seed-JSON scaffold mirrors these tables; swap lib/db.ts to query these
-- once you provision Supabase (enable the PostGIS extension first).

create extension if not exists postgis;

create table area (
  slug         text primary key,
  name         text not null,
  city         text not null default 'tokyo',
  intro_text   text not null,
  geom         geometry(Point, 4326)
);

create table station (
  slug         text primary key,
  name         text not null,
  line_names   text[] not null default '{}',
  area_slug    text references area(slug),
  geom         geometry(Point, 4326)
);

create table venue (
  id             text primary key,
  slug           text unique not null,
  name           text not null,
  name_ja        text,
  address        text,
  area_slug      text references area(slug),
  nearest_station text,
  walk_minutes   int,
  business_hours text,
  chain_name     text,
  price_band     text,
  google_place_id text,      -- the ONLY Google-derived field we store long-term
  geom           geometry(Point, 4326) not null,
  status         text not null default 'draft'  -- draft|published|closed|archived
);
create index venue_geom_idx on venue using gist (geom);
create index venue_area_idx on venue (area_slug);

-- Utility layer: the searchable amenity data, with freshness + confidence.
create table venue_utility (
  venue_id       text primary key references venue(id) on delete cascade,
  has_wifi       boolean not null default false,
  wifi_type      text not null default 'none',   -- free|paid|none
  has_power      boolean not null default false,
  power_density  text not null default 'none',   -- many|some|counter|none
  laptop_friendly boolean not null default false,
  typical_busyness text,
  description    text,
  last_checked   date,
  confidence     text not null default 'low',    -- high|medium|low
  source_url     text
);

-- venue <-> station (nearest stations), many-to-many
create table venue_station (
  venue_id   text references venue(id) on delete cascade,
  station_slug text references station(slug),
  walk_minutes int,
  primary key (venue_id, station_slug)
);

-- Translations (Phase: multilingual). Facts stay on venue/venue_utility;
-- only human-readable copy is localized here (plan §5.1).
create table localization (
  entity_type  text not null,   -- 'venue' | 'area'
  entity_id    text not null,
  language     text not null,   -- 'zh-tw' | 'ko' | ...
  title        text,
  description   text,
  primary key (entity_type, entity_id, language)
);

-- Auto-check audit trail + exception queue (scripts/enrich.mjs).
create table change_log (
  id           bigserial primary key,
  venue_id     text references venue(id) on delete cascade,
  field        text,
  before_value text,
  after_value  text,
  detected_at  timestamptz not null default now(),
  source       text
);

create table review_queue (
  id           bigserial primary key,
  venue_id     text references venue(id) on delete cascade,
  reasons      text[],          -- why this escalated (low confidence, closure, chain flip…)
  proposed     jsonb,
  status       text not null default 'pending',  -- pending|approved|rejected
  created_at   timestamptz not null default now()
);

-- Example nearest-cafes query (replaces JS haversine in lib/db.ts):
--   select v.*, ST_DistanceSphere(v.geom, ST_MakePoint($lng,$lat)) as d
--   from venue v
--   where v.status='published'
--     and ST_DWithin(v.geom::geography, ST_MakePoint($lng,$lat)::geography, 1200)
--   order by d limit 20;
