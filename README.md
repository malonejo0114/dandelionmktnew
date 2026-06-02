# Dandelion Effect

Premium marketing agency homepage for 주식회사 민들레효과.

## Stack

- Next.js 15 App Router
- TypeScript
- Tailwind CSS v4
- shadcn/ui
- GSAP + ScrollTrigger
- Framer Motion
- Lenis smooth scroll
- MDX blog content
- Supabase lead collection

## Run

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Content

- Homepage: `src/components/landing-page.tsx`
- Blog posts: `content/columns/*.mdx`
- Brand kit: `BRAND_KIT.md`
- Lead form action: `src/app/actions.ts`
- Supabase schema: `supabase/leads.sql`

## Environment

Copy `.env.example` to `.env.local` and fill Supabase values:

```bash
NEXT_PUBLIC_SITE_URL=https://dandelionmkt.co.kr
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_LEADS_TABLE=leads
```

The form intentionally returns a setup error until Supabase credentials are present.
