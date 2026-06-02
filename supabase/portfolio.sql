-- 포트폴리오 케이스 테이블
create table if not exists public.portfolio_cases (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  industry text not null,
  title text not null,
  problem text not null,
  strategy text not null,
  result text not null,
  duration text not null,
  summary text not null default '',
  detail jsonb not null default '[]'::jsonb,
  video_url text,
  poster_url text,
  sort_order int not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists portfolio_cases_sort_idx on public.portfolio_cases (sort_order);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end; $$;

drop trigger if exists portfolio_cases_updated_at on public.portfolio_cases;
create trigger portfolio_cases_updated_at
before update on public.portfolio_cases
for each row execute function public.set_updated_at();

alter table public.portfolio_cases enable row level security;

drop policy if exists "public can read published cases" on public.portfolio_cases;
create policy "public can read published cases"
on public.portfolio_cases for select
to anon, authenticated
using (published = true);

drop policy if exists "service role manages cases" on public.portfolio_cases;
create policy "service role manages cases"
on public.portfolio_cases for all
to service_role using (true) with check (true);

insert into storage.buckets (id, name, public)
values ('portfolio-media', 'portfolio-media', true)
on conflict (id) do nothing;

drop policy if exists "public read portfolio media" on storage.objects;
create policy "public read portfolio media"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'portfolio-media');

insert into public.portfolio_cases (slug, industry, title, problem, strategy, result, duration, summary, detail, sort_order, published)
values
('skin-clinic-search','피부과','검색 유입 구조 개선','검색 유입은 있었지만 랜딩 메시지와 상담 문의 흐름이 분리되어 있었습니다.','SEO 콘텐츠, 랜딩페이지 카피, 상담 CTA를 하나의 검색 의도에 맞춰 재설계했습니다.','상담 전환 증가','4개월','검색 유입과 상담 흐름을 하나의 구조로 정렬해 상담 전환을 끌어올린 피부과 케이스입니다.',
 '[{"heading":"배경","body":"내원 문의를 만드는 검색 유입은 있었지만, 검색 의도와 랜딩 메시지, 상담 CTA가 서로 다른 언어로 흩어져 있어 방문이 상담으로 이어지지 않았습니다."},{"heading":"접근","body":"핵심 검색 키워드를 상담 의사결정 순서로 재정의하고, SEO 콘텐츠·랜딩 카피·상담 CTA를 하나의 흐름으로 다시 설계했습니다."},{"heading":"결과","body":"검색 유입의 상담 전환이 개선되었고, 어떤 키워드가 상담으로 이어지는지 반복 측정 가능한 구조가 남았습니다."}]'::jsonb,
 0, true),
('education-funnel','교육 서비스','상담 퍼널 재정렬','광고 클릭 이후 문의DB가 충분히 쌓이지 않고 상담 품질 편차가 컸습니다.','소재 후킹, 랜딩 구조, 문의폼 필드를 상담 의사결정 순서에 맞춰 정리했습니다.','문의 완료율 개선','8주','광고 이후의 병목을 소재·랜딩·문의폼까지 한 흐름으로 정리해 문의 완료율을 높인 교육 서비스 케이스입니다.',
 '[{"heading":"배경","body":"광고 클릭은 발생했지만 문의DB가 충분히 쌓이지 않았고, 들어온 상담의 품질 편차도 컸습니다."},{"heading":"접근","body":"소재의 후킹 포인트, 랜딩 구조, 문의폼 필드를 상담 의사결정 순서에 맞춰 재정렬했습니다."},{"heading":"결과","body":"문의 완료율이 개선되고, 상담 전 단계에서 더 정제된 정보가 쌓이는 퍼널이 만들어졌습니다."}]'::jsonb,
 1, true),
('local-brand-system','로컬 브랜드','브랜드 확산 시스템 구축','콘텐츠, 광고, 고객 후기가 각각 따로 운영되어 브랜드 기억이 누적되지 않았습니다.','검색 키워드, 리뷰 메시지, 광고 소재, 리타겟팅 흐름을 같은 브랜드 언어로 연결했습니다.','브랜드 검색 신호 강화','12주','흩어져 있던 콘텐츠·광고·후기를 하나의 브랜드 언어로 연결해 브랜드 검색 신호를 키운 로컬 브랜드 케이스입니다.',
 '[{"heading":"배경","body":"콘텐츠, 광고, 고객 후기가 각각 따로 운영되어 브랜드 기억이 누적되지 않았습니다."},{"heading":"접근","body":"검색 키워드, 리뷰 메시지, 광고 소재, 리타겟팅 흐름을 같은 브랜드 언어로 묶어 하나의 확산 구조로 연결했습니다."},{"heading":"결과","body":"브랜드명 검색 신호가 강화되고, 채널마다 흩어졌던 메시지가 누적되는 자산이 되었습니다."}]'::jsonb,
 2, true)
on conflict (slug) do nothing;
