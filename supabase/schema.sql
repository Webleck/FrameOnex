-- Запустіть у Supabase: SQL Editor -> New query -> Run
create table products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  cost_price numeric not null default 0,
  sale_price numeric not null default 0,
  supplier text,
  created_at timestamptz default now()
);

create table landings (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id),
  slug text not null unique,
  title text not null,
  blocks jsonb not null default '[]',
  settings jsonb not null default '{}',
  status text not null default 'draft', -- draft | published
  created_at timestamptz default now()
);

create table orders (
  id uuid primary key default gen_random_uuid(),
  landing_id uuid not null references landings(id),
  product_id uuid not null references products(id),
  customer_name text not null,
  phone text not null,
  quantity int not null default 1,
  price numeric not null,
  cost_price numeric not null,
  status text not null default 'new',
  utm jsonb not null default '{}',
  created_at timestamptz default now()
);

-- Доступ лише з сервера (service role). Публічного доступу до таблиць немає.
alter table products enable row level security;
alter table landings enable row level security;
alter table orders enable row level security;
