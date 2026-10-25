-- Етап 3: перегляди лендінгів і витрати на рекламу. Виконайте в SQL Editor.
create table if not exists landing_stats (
  landing_id uuid not null references landings(id) on delete cascade,
  day date not null,
  views int not null default 0,
  primary key (landing_id, day)
);

create table if not exists ad_spend (
  id uuid primary key default gen_random_uuid(),
  landing_id uuid not null references landings(id) on delete cascade,
  day date not null,
  amount numeric not null check (amount > 0),
  created_at timestamptz default now()
);

alter table landing_stats enable row level security;
alter table ad_spend enable row level security;

-- Атомарний лічильник переглядів (за київською датою)
create or replace function track_view(p_landing uuid) returns void
language sql as $$
  insert into landing_stats (landing_id, day, views)
  values (p_landing, (now() at time zone 'Europe/Kyiv')::date, 1)
  on conflict (landing_id, day)
  do update set views = landing_stats.views + 1;
$$;

revoke execute on function track_view(uuid) from public, anon, authenticated;
