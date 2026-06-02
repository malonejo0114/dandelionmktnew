# Design System — "주문폭발" (Order Explosion)

Hero motion graphic for a marketing agency. Theme: orders exploding on Naver & Coupang.
Mood: dynamic, explosive, premium. Two platform energies (green / red) collide and detonate into gold.

## Palette

Dark canvas so the brand neons glow and pop (cinematic, trendy).

| Token            | Hex       | Role                                   |
| ---------------- | --------- | -------------------------------------- |
| BG Deep          | `#0A0E14` | Base canvas (near-black, blue-tinted)  |
| BG Panel         | `#141A24` | Cards / toasts background              |
| Naver Green      | `#03C75A` | Naver brand accent (focal)             |
| Naver Deep       | `#02A94C` | Green gradient / glow depth            |
| Coupang Red      | `#E03127` | Coupang brand accent (focal)           |
| Coupang Bright   | `#FF3B30` | Red highlight / glow                   |
| Gold Spark       | `#FFC400` | Explosion accent, CTA fill, "money"    |
| Orange Burst     | `#FF7A00` | Explosion outer glow                   |
| Flash White      | `#FFFFFF` | Headline text, burst flash             |
| Text Primary     | `#FFFFFF` | Primary text                           |
| Text Muted       | `#8A94A6` | Secondary text / labels                |

Gradients:
- Green glow: radial `#03C75A` → transparent
- Red glow: radial `#FF3B30` → transparent
- Explosion: radial `#FFFFFF` 0% → `#FFC400` 30% → `#FF7A00` 70% → transparent

## Typography

Pretendard (vendored in `fonts/`). Korean + numerals. Extreme weight contrast.

- Display / headline: **Pretendard Black (900)**, letter-spacing -0.04em
- Counter numerals: **Pretendard ExtraBold (800)**, `font-variant-numeric: tabular-nums`
- Labels / metadata: **Pretendard SemiBold (600)**, all-caps tracking +0.1em, Text Muted
- Body / subhead: **Pretendard Medium (500)**

Video scale: headline 150–220px, counter 180px, subhead 44px, labels 22px.

## Motifs (brand-inspired, NOT literal logos — avoids trademark issues)

- Green rounded-square "N chip" notification badges (Naver)
- Red rocket + trail (Coupang Rocket delivery)
- Order notification toasts that cascade/stack
- ₩ / order-count particles that burst outward
- Radial burst shape in gold at the detonation moment

## Motion

- Main bounce ease: `back.out(1.7)` (overshoot)
- Impact ease: `expo.out` (fast in, settle)
- Exit/throw ease: `power3.in`
- Counter rolls up with a small camera shake at peak
- Rhythm: calm → accelerate → DETONATE (flash) → resolve to slogan
- Every decorative has ambient motion (breathe / drift)
- Tools: GSAP timeline. Seeded PRNG (mulberry32) for particles — NO Math.random.

## What NOT to do

- No literal Naver/Coupang logos or wordmarks (trademark).
- No flat solid `#000` background — use BG Deep + glows.
- Don't blend green↔red directly (muddy) — let gold mediate the collision.
- No exit animations except the final resolve.
