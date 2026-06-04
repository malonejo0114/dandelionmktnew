create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  category text not null default 'Marketing',
  status text not null default 'draft',
  published_at timestamptz,
  excerpt text not null default '',
  cover_url text,
  content_html text not null default '',
  summary text not null default '',
  faqs jsonb not null default '[]'::jsonb,
  seo_title text not null default '',
  seo_description text not null default '',
  reading_time text not null default '5 min read',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists posts_published_idx on public.posts (published_at desc);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;
drop trigger if exists posts_updated_at on public.posts;
create trigger posts_updated_at before update on public.posts
for each row execute function public.set_updated_at();

alter table public.posts enable row level security;
drop policy if exists "public reads published posts" on public.posts;
create policy "public reads published posts" on public.posts
for select to anon, authenticated using (status = 'published');
drop policy if exists "service role manages posts" on public.posts;
create policy "service role manages posts" on public.posts
for all to service_role using (true) with check (true);

insert into storage.buckets (id, name, public)
values ('blog-media', 'blog-media', true) on conflict (id) do nothing;
drop policy if exists "public read blog media" on storage.objects;
create policy "public read blog media" on storage.objects
for select to anon, authenticated using (bucket_id = 'blog-media');
