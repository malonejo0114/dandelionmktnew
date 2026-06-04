-- 블로그 글 커버 영상 컬럼 추가 (기존 DB에 1회 실행)
alter table public.posts add column if not exists cover_video_url text;
