create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  phone text not null,
  email text,
  industry text not null,
  channel text,
  budget text,
  challenge text not null,
  marketing_consent boolean not null default false,
  source text not null default 'dandelion-effect-homepage'
);

alter table public.leads enable row level security;

create policy "service role can manage leads"
on public.leads
for all
to service_role
using (true)
with check (true);
