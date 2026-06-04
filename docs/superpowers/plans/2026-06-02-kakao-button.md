# 카카오채널 버튼 Implementation Plan (서브프로젝트 ①)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development.

**Goal:** 전 공개 페이지 우하단 카카오 상담 플로팅 버튼 추가 + 관리자에서 URL 편집(비우면 숨김).

**Tech Stack:** Next.js 15 App Router, Tailwind v4, 기존 site_content 콘텐츠 시스템.

**사전 메모:** git repo — 커밋. 검증 `npx tsc --noEmit`(로컬 build/lint는 flaky, 최종은 Vercel). 폴백: URL 빈값/DB없음 → 버튼 숨김.

---

## Task 1: kakaoUrl 모델 + 버튼 + 연결

**Files:** Modify `src/data/content.ts`, `src/app/admin/actions.ts`, `src/components/admin/site-content-editor.tsx`, `src/app/layout.tsx`; Create `src/components/floating-kakao.tsx`

- [ ] **Step 1: content.ts — common.kakaoUrl**

`SiteContent.common` 타입에 `footerTagline` 뒤(블록 안)에 추가: `kakaoUrl: string;`
`defaultContent.common`에 `footerTagline` 뒤에 추가: `kakaoUrl: "",`

- [ ] **Step 2: actions.ts parseSiteContent — common.kakaoUrl**

`parseSiteContent` 반환의 `common` 블록에서 `footerTagline: str(formData, "common_footerTagline"),` 뒤에 추가:
```ts
      kakaoUrl: str(formData, "common_kakaoUrl"),
```

- [ ] **Step 3: 에디터 — 공통 그룹에 카카오 URL 필드**

`src/components/admin/site-content-editor.tsx`의 "공통 (마키 · 네비 · 푸터)" `<Group>` 안, `푸터 태그라인` Text 다음 줄에 추가:
```tsx
        <Text label="카카오 채널 URL (비우면 버튼 숨김)" name="common_kakaoUrl" def={c.common.kakaoUrl} />
```

- [ ] **Step 4: FloatingKakao 컴포넌트**

Create `src/components/floating-kakao.tsx`:
```tsx
"use client";

import { usePathname } from "next/navigation";

export function FloatingKakao({ url }: { url: string }) {
  const pathname = usePathname();
  if (!url || pathname.startsWith("/admin")) return null;
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="카카오 채널 상담"
      className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full bg-[#FEE500] px-4 py-3 text-[#3C1E1E] shadow-[0_8px_24px_rgba(0,0,0,0.35)] transition-transform hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D6B77A] sm:bottom-7 sm:right-7"
    >
      <svg viewBox="0 0 24 24" className="size-6" fill="currentColor" aria-hidden="true">
        <path d="M12 3C6.48 3 2 6.46 2 10.73c0 2.76 1.88 5.18 4.72 6.55-.2.72-.72 2.62-.82 3.03-.13.5.18.5.39.36.16-.11 2.5-1.7 3.51-2.39.39.05.78.08 1.2.08 5.52 0 10-3.46 10-7.73C22 6.46 17.52 3 12 3z" />
      </svg>
      <span className="hidden font-kr text-sm font-bold sm:inline">카카오 상담</span>
    </a>
  );
}
```

- [ ] **Step 5: layout.tsx — RootLayout async + 버튼 렌더**

`src/app/layout.tsx`:
- import 추가: `import { FloatingKakao } from "@/components/floating-kakao";`
- `RootLayout`을 async로 + 콘텐츠 조회 + 버튼 렌더:
```tsx
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const content = await getSiteContent();
  return (
    <html lang="ko" className={`${cormorant.variable} dark`}>
      <body>
        <SmoothScroll />
        {children}
        <FloatingKakao url={content.common.kakaoUrl} />
        <div className="noise-overlay" aria-hidden="true" />
      </body>
    </html>
  );
}
```
(generateMetadata/viewport/폰트는 그대로. `getSiteContent`는 이미 import됨.)

- [ ] **Step 6: 검증 + 커밋**
Run: `npx tsc --noEmit` → 클린.
`git add -A && git commit -m "feat(kakao): 카카오 채널 상담 플로팅 버튼 + 관리자 URL 편집"` (+ Co-Authored-By trailer)

---

## Task 2: 배포 + 확인
- [ ] `git push origin main` → Vercel 빌드 success 확인.
- [ ] (사용자) `/admin/content` 공통 그룹에 카카오 채널 URL 입력 → 저장 → 공개 페이지 우하단 버튼 확인.

---

## Self-Review
- 커버리지: kakaoUrl 모델/파서/에디터/컴포넌트/layout 연결 ✅. 폴백(빈값 숨김)·/admin 숨김 ✅.
- 타입 일관성: `common.kakaoUrl`(content.ts) ↔ `common_kakaoUrl`(에디터 name/파서) ↔ `content.common.kakaoUrl`(layout) 일치.
- 플레이스홀더 없음.
