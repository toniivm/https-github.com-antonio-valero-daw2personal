-- SQL_RLS_BASE.sql - Tablas y Policies base SpotMap (Supabase)
-- Ejecutar en el panel SQL de Supabase. Ajustar según necesidad.

-- 1. Tablas
create table if not exists profiles (
  user_id uuid primary key references auth.users on delete cascade,
  role text not null default 'user',
  created_at timestamptz default now()
);

create table if not exists spots (
  id bigint generated always as identity primary key,
  user_id uuid references profiles(user_id) on delete cascade,
  title text not null,
  description text,
  lat decimal(9,6) not null,
  lng decimal(9,6) not null,
  tags text[] default '{}',
  category text,
  image_path text,
  status text not null default 'pending',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_spots_status on spots(status);
create index if not exists idx_spots_category on spots(category);

-- Trigger updated_at
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;$$ language plpgsql;

create trigger trg_spots_updated
before update on spots
for each row execute procedure set_updated_at();

-- 2. Helpers de rol
create or replace function is_admin() returns boolean as $$
  select exists(select 1 from profiles where user_id = auth.uid() and role = 'admin');
$$ language sql stable;

create or replace function is_moderator() returns boolean as $$
  select exists(select 1 from profiles where user_id = auth.uid() and role in ('moderator','admin'));
$$ language sql stable;

-- 3. Activar RLS
alter table profiles enable row level security;
alter table spots enable row level security;

-- 4. Policies profiles
create policy select_own_profile on profiles for select using (auth.uid() = user_id);
create policy select_all_profiles_admin on profiles for select using (is_admin());
create policy insert_own_profile on profiles for insert with check (auth.uid() = user_id);
create policy update_role_admin_only on profiles for update using (is_admin()) with check (is_admin());

-- 5. Policies spots
create policy select_public_spots on spots for select using (
  status = 'approved' OR user_id = auth.uid()
);

create policy insert_spot on spots for insert with check (auth.uid() = user_id);

create policy update_spot on spots for update using (
  auth.uid() = user_id OR is_moderator()
) with check (
  (auth.uid() = user_id AND status in ('pending','rejected')) OR is_moderator()
);

create policy delete_spot on spots for delete using (
  auth.uid() = user_id OR is_admin()
);

-- 6. Opcional: remover update sin policy abierta
-- revoke update on spots from anon, authenticated;

-- 7. Validación rápida (ejecutar manualmente para probar):
-- select role from profiles where user_id = auth.uid();
-- select * from spots limit 5;
