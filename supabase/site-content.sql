create table if not exists public.site_content (
  id text primary key default 'singleton',
  content jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

drop trigger if exists site_content_updated_at on public.site_content;
create trigger site_content_updated_at
before update on public.site_content
for each row execute function public.set_updated_at();

alter table public.site_content enable row level security;

drop policy if exists "public can read site content" on public.site_content;
create policy "public can read site content"
on public.site_content for select to anon, authenticated using (true);

drop policy if exists "service role manages site content" on public.site_content;
create policy "service role manages site content"
on public.site_content for all to service_role using (true) with check (true);
