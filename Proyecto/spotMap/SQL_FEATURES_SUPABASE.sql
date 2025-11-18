-- Supabase Postgres schema additions for extended features
-- Execute in Supabase SQL editor

-- Favorites
create table if not exists favorites (
  id bigserial primary key,
  user_id uuid not null,
  spot_id bigint not null references spots(id) on delete cascade,
  created_at timestamptz default now(),
  unique (user_id, spot_id)
);

-- Comments
create table if not exists comments (
  id bigserial primary key,
  user_id uuid not null,
  spot_id bigint not null references spots(id) on delete cascade,
  body text not null,
  created_at timestamptz default now(),
  updated_at timestamptz
);

-- Ratings
create table if not exists ratings (
  id bigserial primary key,
  user_id uuid not null,
  spot_id bigint not null references spots(id) on delete cascade,
  score smallint not null check (score between 1 and 5),
  created_at timestamptz default now(),
  unique (user_id, spot_id)
);

-- Reports
create table if not exists reports (
  id bigserial primary key,
  user_id uuid not null,
  spot_id bigint not null references spots(id) on delete cascade,
  reason text not null,
  status text not null default 'pending', -- pending | approved | hidden | rejected
  created_at timestamptz default now(),
  moderated_by uuid,
  moderated_at timestamptz,
  moderation_note text
);

-- Schedule / recommended time windows for spots
alter table spots add column if not exists schedule text; -- e.g. 'sunrise', 'golden_hour', 'night'

-- Geospatial support (optional): enable PostGIS extension in Supabase
-- NOTE: Requires paying attention to Supabase extension availability.
-- create extension if not exists postgis;
-- If using PostGIS, replace lat/lng numeric columns with geometry(Point,4326) or keep both.

-- Basic B-Tree index for frequent category queries
create index if not exists spots_category_idx on spots(category);

-- Composite index for ownership queries
create index if not exists spots_user_category_idx on spots(user_id, category);

-- Geospatial index placeholder (if geometry column added 'geom')
-- create index if not exists spots_geom_idx on spots using gist(geom);


-- Aggregate helper view for spot popularity
create or replace view spot_popularity as
select s.id as spot_id,
       coalesce(f.fav_count,0) as favorites,
       coalesce(r.rating_avg,0) as rating_avg,
       coalesce(c.comment_count,0) as comments
from spots s
left join (
  select spot_id, count(*) as fav_count from favorites group by spot_id
) f on f.spot_id = s.id
left join (
  select spot_id, avg(score)::numeric(3,2) as rating_avg from ratings group by spot_id
) r on r.spot_id = s.id
left join (
  select spot_id, count(*) as comment_count from comments group by spot_id
) c on c.spot_id = s.id;
