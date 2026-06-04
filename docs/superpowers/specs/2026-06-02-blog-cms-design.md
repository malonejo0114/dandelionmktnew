# 블로그 CMS 설계 (서브프로젝트 ②)

**날짜:** 2026-06-02
**범위:** 파일시스템 MDX 블로그를 DB 기반 + 관리자 작성(WYSIWYG)으로 전환. 글마다 대표 이미지·요약·FAQ·SEO. 공개 렌더에 구조화 데이터(JSON-LD) + 홈 Journal/sitemap 연동. 정적 폴백.
**전제:** Phase 1·2 패턴(인증/`getSupabaseAdmin`/`assertAdmin`/서명 URL 업로드/`getSiteContent`/on-demand revalidate) 재사용.

## 1. 결정
- 에디터: **TipTap WYSIWYG**, 본문은 **HTML 문자열**로 저장. 이미지 인라인 업로드.
- SEO/AEO/GEO: 글별 메타(제목/설명) + 요약(TL;DR) + FAQ(Q&A) + `BlogPosting`/`FAQPage` JSON-LD + sitemap.
- 대표 이미지(cover) 업로드 → 목록·홈 카드·OG 이미지.
- 저장소: 새 버킷 `blog-media`(공개 읽기). 대표·본문 이미지 모두.
- 폴백: Supabase 미설정/빈 결과 시 기존 MDX(`content/columns/*.mdx`)로 폴백.

## 2. 데이터 모델 (Supabase)

### 테이블 `public.posts`
| 컬럼 | 타입 | 비고 |
|---|---|---|
| id | uuid pk default gen_random_uuid() | |
| slug | text unique not null | `/blog/{slug}` |
| title | text not null | |
| category | text not null default 'Marketing' | |
| status | text not null default 'draft' | 'draft' | 'published' |
| published_at | timestamptz | 게시 시각(정렬·표시) |
| excerpt | text not null default '' | 목록/카드 설명 |
| cover_url | text | 대표 이미지 |
| content_html | text not null default '' | 본문 HTML |
| summary | text not null default '' | TL;DR |
| faqs | jsonb not null default '[]' | `[{q,a}]` |
| seo_title | text not null default '' | 비면 title 사용 |
| seo_description | text not null default '' | 비면 excerpt/description 사용 |
| reading_time | text not null default '5 min read' | |
| created_at | timestamptz default now() | |
| updated_at | timestamptz default now() | 트리거 갱신 |

### RLS / Storage / SQL — `supabase/blog.sql`
- 공개 select: `status='published'`만 (anon/authenticated). 쓰기: service_role.
- updated_at 트리거.
- 버킷 `blog-media`(public), 공개 read 정책.
- 인덱스: slug, published_at.

## 3. 의존성
`npm i @tiptap/react @tiptap/pm @tiptap/starter-kit @tiptap/extension-image @tiptap/extension-link`. (TipTap v2)

## 4. DB 접근 레이어 — `src/lib/posts.ts`
```ts
export type Faq = { q: string; a: string };
export type Post = {
  slug, title, category, excerpt, coverUrl, contentHtml, summary,
  faqs: Faq[], seoTitle, seoDescription, readingTime, publishedAt
};
export async function getPublishedPosts(): Promise<Post[]>   // status=published, published_at desc. 폴백: MDX
export async function getPostBySlug(slug): Promise<Post|null> // 폴백: MDX
```
- DB 미설정/에러/빈 → 기존 `@/lib/blog`의 MDX(`getAllPosts`/`getPostBySlug`)를 매핑해 폴백(contentHtml은 MDX content를 그대로, 렌더 시 마크다운 처리). 폴백 글엔 cover 없음.
- (주: 폴백 경로는 기존 `lib/blog.ts` 유지·재사용.)

## 5. 미디어 업로드 (일반화)
- 기존 `createUploadUrl(slug, kind, ext)`(actions.ts, portfolio-media 전용)을 **버킷 파라미터 추가**로 일반화하거나, 블로그 전용 `createBlogUploadUrl(slug, ext)` 추가(`blog-media`). 클라이언트는 서명 URL로 직접 업로드(브라우저→Storage). 대표 이미지 위젯은 기존 `MediaUpload` 패턴 재사용/확장.
- 결정: 블로그 전용 `createBlogUploadUrl(prefix, ext): Promise<{path,token}|{error}>` 추가(`blog-media`, 경로 `posts/{slug-or-tmp}/{kind}-{ts}.{ext}`). 공개 URL은 클라가 getPublicUrl로 구성.

## 6. 관리자 UI
- `src/app/admin/blog/page.tsx` — 글 목록(제목/카테고리/상태/게시일, 수정·삭제·게시토글, "새 글").
- `src/app/admin/blog/new/page.tsx` / `[id]/page.tsx` — `PostEditor` 공용.
- `src/components/admin/post-editor.tsx` (client) — 필드: 제목, slug, 카테고리, 상태(draft/published), 대표 이미지 업로드, 요약(TL;DR), **TipTap 본문 에디터**, FAQ(Q&A 추가/삭제), SEO 제목·설명. 저장.
- `src/components/admin/rich-text-editor.tsx` (client) — TipTap 래퍼: StarterKit + Image + Link. 툴바(굵게/제목H2,H3/목록/인용/링크/이미지). 이미지 버튼 → 파일 선택 → `createBlogUploadUrl` → 업로드 → editor.chain().setImage({src}). `onChange(html)`.
- 서버 액션(actions.ts 추가): `createPost(formData)`, `updatePost(id, formData)`, `deletePost(id)`, `togglePostStatus(id)`, `createBlogUploadUrl(...)`. 저장 시 `revalidatePath('/')`, `revalidatePath('/blog')`, `revalidatePath('/blog/[slug]','page')`. published 전환 시 `published_at` 설정.
- 관리자 `layout.tsx` 네비 + `page.tsx` 대시보드에 "블로그" 추가.

## 7. 공개 사이트
- `src/app/blog/page.tsx` — `getPublishedPosts()`로 목록(대표 이미지 썸네일 포함). 기존 MDX import 제거.
- `src/app/blog/[slug]/page.tsx` — `getPostBySlug()`. 렌더: 대표 이미지, 제목, 메타(카테고리·게시일·읽기시간), 요약, **본문 HTML**(dangerouslySetInnerHTML; 신뢰된 관리자 작성), FAQ 섹션. `generateStaticParams`는 published slugs, `dynamicParams=true`. `generateMetadata`(seoTitle||title, seoDescription||excerpt, OG=coverUrl||/opengraph-image).
  - **JSON-LD**: `BlogPosting`(headline, description=summary||excerpt, image=coverUrl, datePublished/Modified, author/publisher=Dandelion Effect) + faqs 있으면 `FAQPage`(mainEntity Q&A). `<script type="application/ld+json">`.
  - 기존 `font-serif-kr`(삭제됨) → `font-kr`로 교체. MDXRemote 제거(HTML 직접 렌더).
- `src/components/sections/journal.tsx` — 현재 `columnPreviews` prop/하드코딩 → 홈 `page.tsx`가 `getPublishedPosts()` 상위 3개를 전달하도록 prop화(대표 이미지 카드). DB 없으면 폴백(기존 미리보기).
- `src/app/sitemap.ts` — 블로그 URL을 `getPublishedPosts()` 기반으로(기존 MDX `getAllPosts` 대체 또는 병행).

## 8. 보안 / 품질
- 본문 HTML은 **신뢰된 단일 관리자**가 작성 → 그대로 렌더. (XSS 위험은 자가 작성 한정. 필요 시 후속에 sanitize 추가 — 범위 밖.)
- 업로드: 서명 URL(서버는 createBlogUploadUrl만, 본문 파일은 브라우저→Storage). 타입/크기 클라 검증.
- 모든 쓰기 액션 `assertAdmin`.

## 9. 마이그레이션/시드
- `supabase/blog.sql`에 기존 3글 시드 INSERT(마크다운을 간단 HTML로 변환한 content_html, status='published', published_at=date). 또는 시드 없이 폴백(MDX)로 두고 관리자에서 새로 작성. **결정:** SQL에 3글 시드 포함(HTML 변환본). 이후 DB 소스.

## 10. 파일 구조(요약)
```
supabase/blog.sql                              (신규)
package.json                                   (수정: tiptap)
src/lib/posts.ts                               (신규: 조회+폴백)
src/app/admin/actions.ts                       (수정: post CRUD + createBlogUploadUrl)
src/app/admin/blog/page.tsx, new/page.tsx, [id]/page.tsx (신규)
src/components/admin/post-editor.tsx           (신규)
src/components/admin/rich-text-editor.tsx      (신규: TipTap)
src/app/admin/layout.tsx, page.tsx             (수정: 블로그 네비/타일)
src/app/blog/page.tsx                          (수정: DB)
src/app/blog/[slug]/page.tsx                   (수정: DB + JSON-LD + font-kr)
src/components/sections/journal.tsx            (수정: prop화)
src/components/landing-page.tsx, src/app/page.tsx (수정: posts 전달)
src/app/sitemap.ts                             (수정: DB posts)
src/lib/blog.ts                                (유지: 폴백 소스)
```

## 11. 검증
- `tsc` + Vercel 빌드. 수동: 관리자에서 새 글(대표이미지·본문이미지·FAQ·SEO) 작성→게시→`/blog`·`/blog/{slug}`·홈 Journal 반영, 소스에 JSON-LD/메타/OG 확인. 폴백(DB 미설정) 정상.

## 12. 범위 밖 (YAGNI)
- 댓글, 태그 시스템, 다국어, 예약 발행, 리비전 히스토리, 본문 HTML sanitize(후속), 작성자 다중 계정.
