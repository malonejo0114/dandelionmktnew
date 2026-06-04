create table if not exists public.tracking_links (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  label text not null default '',
  created_at timestamptz not null default now()
);
create table if not exists public.link_visits (
  id uuid primary key default gen_random_uuid(),
  code text not null,
  path text,
  created_at timestamptz not null default now()
);
create index if not exists link_visits_code_idx on public.link_visits (code);
create index if not exists link_visits_created_idx on public.link_visits (created_at);

alter table public.leads add column if not exists ref text;

alter table public.tracking_links enable row level security;
alter table public.link_visits enable row level security;
drop policy if exists "service role manages tracking_links" on public.tracking_links;
create policy "service role manages tracking_links" on public.tracking_links
for all to service_role using (true) with check (true);
drop policy if exists "service role manages link_visits" on public.link_visits;
create policy "service role manages link_visits" on public.link_visits
for all to service_role using (true) with check (true);
