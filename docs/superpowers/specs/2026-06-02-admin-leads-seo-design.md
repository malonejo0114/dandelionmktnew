# 관리자 — 문의함 + 전역 SEO 편집 설계

**날짜:** 2026-06-02
**범위:** (1) 관리자 문의함 `/admin/leads` (보기 + 삭제), (2) 전역 SEO 메타데이터를 관리자에서 편집(텍스트). 둘 다 기존 관리자/콘텐츠 인프라에 추가.
**전제:** Phase 1·2 완료. 인증(`assertAdmin`/`getAdminEmail`), `getSupabaseAdmin()`, `site_content` jsonb, `getSiteContent()` 머지/폴백, `revalidatePath`, on-demand revalidate 패턴 재사용.

---

## 1. 확정 결정
- 문의함: **보기 + 삭제** (처리상태/답장/CSV 없음).
- SEO: **전역 메타 텍스트만** (title/template/description/ogTitle/ogDescription). OG 이미지는 현재 동적 이미지 유지. 페이지별 SEO·키워드 제외.
- SEO 편집 위치: 기존 `/admin/content` 에디터에 **"SEO" 그룹** 추가 (site_content jsonb에 `seo` 키로 저장 — 마이그레이션 불필요).
- 문의함: 기존 `leads` 테이블 사용(스키마 변경 없음).

## 2. 기능 1 — 문의함 `/admin/leads`

### 페이지 `src/app/admin/leads/page.tsx` (서버 컴포넌트)
- `getSupabaseAdmin().from("leads").select("id,created_at,name,phone,email,industry,channel,challenge,marketing_consent").order("created_at", { ascending: false })`.
- Supabase 미설정 시 안내 문구(포트폴리오 목록과 동일 패턴).
- 표시: 각 문의를 카드/행으로 — 날짜(created_at), 이름, 연락처, 이메일, 업종, 운영 채널, 현재 고민, 마케팅 동의 여부. 비어있으면 "아직 문의가 없습니다".
- 각 행에 **삭제** 버튼(확인) → 서버 액션 `deleteLead(id)`.

### 서버 액션 (`src/app/admin/actions.ts`에 추가)
```ts
export async function deleteLead(id: string) {
  await assertAdmin();
  const supabase = getSupabaseAdmin();
  if (!supabase) return;
  await supabase.from("leads").delete().eq("id", id);
  revalidatePath("/admin/leads");
}
```
(`leads` 테이블 id는 uuid. RLS는 service_role 전체 권한이라 삭제 가능.)

### 네비/대시보드
- `admin/layout.tsx` nav에 `<Link href="/admin/leads">문의함</Link>` 추가.
- `admin/page.tsx` 대시보드에 문의 수 타일 추가(`leads` count). (선택이지만 포함.)

## 3. 기능 2 — 전역 SEO 편집

### 콘텐츠 모델 확장 — `src/data/content.ts`
`SiteContent`에 `seo` 섹션 추가:
```ts
seo: {
  title: string;          // <title> 기본값
  titleTemplate: string;  // "%s | Dandelion Effect"
  description: string;
  ogTitle: string;
  ogDescription: string;
};
```
`defaultContent.seo` 기본값(현재 `layout.tsx` 값 그대로):
- title: `"Dandelion Effect | 브랜드가 퍼지는 구조를 설계합니다"`
- titleTemplate: `"%s | Dandelion Effect"`
- description: `"주식회사 민들레효과는 브랜드가 검색되고, 기억되고, 확산되고, 전환되는 구조를 설계하는 프리미엄 마케팅 에이전시입니다."`
- ogTitle: `"Dandelion Effect | 브랜드 성장 설계 회사"`
- ogDescription: `"광고 운영을 넘어 검색, 확산, 전환, 자동화까지 이어지는 성장 구조를 설계합니다."`

### 머지 — `src/lib/site-content.ts`
`getSiteContent` 반환에 `seo: { ...defaultContent.seo, ...(c.seo ?? {}) }` 추가.

### layout.tsx — 정적 metadata → 동적 generateMetadata
- `export const metadata` 제거, `export async function generateMetadata(): Promise<Metadata>` 추가.
- `const seo = (await getSiteContent()).seo;`
- 동일한 Metadata 구조 생성:
  - `metadataBase`: `new URL(siteUrl)` (env 유지)
  - `title: { default: seo.title, template: seo.titleTemplate }`
  - `description: seo.description`
  - `alternates`: 기존대로 (`canonical: "/"`, rss)
  - `openGraph`: `{ type, locale: "ko_KR", url: "/", siteName: "Dandelion Effect", title: seo.ogTitle, description: seo.ogDescription, images: [{ url: "/opengraph-image", width:1200, height:630, alt: "Dandelion Effect" }] }`
  - `twitter`: `{ card: "summary_large_image", title: seo.ogTitle, description: seo.ogDescription, images: ["/opengraph-image"] }`
- `viewport` export는 그대로 유지(별도). `siteName`/`locale`/이미지 경로는 고정(편집 범위 밖).
- 폰트/SmoothScroll/RootLayout 본문은 그대로.

### 관리자 편집 — `/admin/content`에 "SEO" 그룹
- `site-content-editor.tsx`에 `<Group title="SEO (검색/공유 메타)">` 추가: title, titleTemplate, description(ta), ogTitle, ogDescription(ta). name: `seo_title`, `seo_titleTemplate`, `seo_description`, `seo_ogTitle`, `seo_ogDescription`.
- `actions.ts`의 `parseSiteContent`에 `seo` 파싱 추가.

## 4. 파일 구조 (신규/수정)
```
src/app/admin/leads/page.tsx              (신규: 문의함)
src/app/admin/actions.ts                  (수정: deleteLead + parseSiteContent에 seo)
src/app/admin/layout.tsx                  (수정: 문의함 네비)
src/app/admin/page.tsx                    (수정: 문의 수 타일)
src/data/content.ts                       (수정: SiteContent.seo + 기본값)
src/lib/site-content.ts                   (수정: seo 머지)
src/app/layout.tsx                        (수정: generateMetadata)
src/components/admin/site-content-editor.tsx (수정: SEO 그룹)
```

## 5. 에러 처리 / 보안
- `deleteLead`/SEO 저장은 `assertAdmin` 후 service_role.
- `generateMetadata`는 폴백으로 DB 미설정/오류에도 기본 SEO 반환(사이트 정상).
- 문의함은 인증 영역(`/admin/*`)이라 미들웨어로 보호됨.

## 6. 검증
- `tsc`/`lint` 통과 + Vercel 빌드 성공(로컬 build는 iCloud로 느림).
- 수동: `/admin/leads`에서 문의 표시·삭제. `/admin/content`의 SEO 그룹 수정→저장→홈 `<head>` 메타 반영(View Source/OG 디버거). 폼 제출로 문의 생성 후 문의함에 표시 확인.

## 7. 범위 밖 (YAGNI)
- 문의 처리상태/답장/CSV/이메일 알림, OG 이미지 업로드, 페이지별 SEO, 키워드 메타, sitemap/robots 편집.
