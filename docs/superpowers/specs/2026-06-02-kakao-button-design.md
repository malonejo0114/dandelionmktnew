# 카카오채널 상담 버튼 설계 (서브프로젝트 ①)

**날짜:** 2026-06-02
**범위:** 전 공개 페이지 우하단에 카카오 채널 상담 버튼(플로팅) 추가. URL은 관리자에서 편집(비우면 숨김). 관리자 화면(`/admin`)에는 표시 안 함.
**전제:** `SiteContent`/`getSiteContent()` 콘텐츠 시스템, `/admin/content` 에디터, `parseSiteContent`, 동적 `generateMetadata` 패턴 존재.

## 결정
- 스타일: 카카오 옐로 `#FEE500` 알약 버튼 + 말풍선 아이콘 + 라벨 "카카오 상담" (텍스트는 데스크탑 노출, 모바일은 아이콘만 가능).
- URL: `SiteContent.common.kakaoUrl`(기본 `""`). 관리자 "공통" 그룹에서 편집. 빈 값이면 버튼 미표시.
- 위치: `position: fixed` 우하단. `/admin` 경로에서는 숨김.

## 데이터
- `src/data/content.ts`: `SiteContent.common`에 `kakaoUrl: string` 추가, `defaultContent.common.kakaoUrl: ""`.
- `getSiteContent` 머지는 `common` 스프레드라 자동 포함(추가 변경 불필요).
- `parseSiteContent`(actions.ts): `common`에 `kakaoUrl: str(formData, "common_kakaoUrl")` 추가.
- 에디터(site-content-editor.tsx) "공통" 그룹에 `<Text label="카카오 채널 URL" name="common_kakaoUrl" def={c.common.kakaoUrl} />` 추가.

## 컴포넌트
- `src/components/floating-kakao.tsx` (client):
  - props: `{ url: string }`.
  - `usePathname()`; `if (!url || pathname.startsWith("/admin")) return null;`
  - 렌더: `<a href={url} target="_blank" rel="noopener noreferrer" aria-label="카카오 채널 상담">` — fixed bottom-right, bg `#FEE500`, text `#3C1E1E`, rounded-full, shadow, 말풍선 SVG 아이콘 + "카카오 상담"(sm 이상 표시). 포커스 링(골드).

## 연결
- `src/app/layout.tsx`의 `RootLayout`을 **async**로 변경, `const content = await getSiteContent();` 후 `<body>` 안에 `<FloatingKakao url={content.common.kakaoUrl} />` 추가 (기존 SmoothScroll/children/noise-overlay 유지). `generateMetadata`도 `getSiteContent`를 쓰므로 import 재사용.
- 저장 시 기존 `updateSiteContent`가 `revalidatePath("/")` 호출 → 반영.

## 폴백/에러
- DB 미설정/빈 URL → 버튼 숨김(사이트 정상). 

## 검증
- `tsc`/`lint` + Vercel 빌드. 수동: 관리자 공통에 URL 입력→저장→공개 페이지 우하단 버튼 표시·클릭(새 탭). `/admin`에서는 미표시. 빈 값이면 숨김.

## 범위 밖
- 카카오 SDK/싱크, 채팅 위젯 임베드, 다른 채널(전화/이메일) 버튼.
