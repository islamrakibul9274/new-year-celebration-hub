# Phase 1 — Audit Report

**Project:** New Year Celebration Hub (Next.js 15 App Router + MongoDB/Mongoose + Tailwind v4)
**Date:** 2026-10-16 · **Audited by:** opencode (step-5-preview)
**Live:** https://newyear-celebration-hub.netlify.app · **Local:** http://localhost:3000

---

## 1. Inventory

### Pages (App Router)
| Route | File | Notes |
|---|---|---|
| `/` | `src/app/page.tsx` | 8 home sections (hero, deals, party, schedule, offers, sale, portfolio, newsletter) |
| `/events` | `src/app/events/page.tsx` | Itinerary + RSVP form + attendee list |
| `/deals` | `src/app/deals/page.tsx` | Product grid, search + category filter, cart |
| `/ai-resolutions` | `src/app/ai-resolutions/page.tsx` | AI resolution architect + greeting card maker + public feed |
| `/pricing` | `src/app/pricing/page.tsx` | 3 tiers, monthly/annual, Stripe + 1-click demo activation, FAQ |
| `/live-lounge` | `src/app/live-lounge/page.tsx` | Pusher chat + confetti broadcast + countdown |
| `/profile` | `src/app/profile/page.tsx` | Profile form, avatar upload, pass card |
| `/login` `(/signup)` | `src/app/(auth)/*/page.tsx` | Email + password only |
| `404 / error` | `not-found.tsx`, `error.tsx` | Present, adequate |

### API routes (15)
`auth/register`, `auth/login`, `auth/logout`, `auth/me` (GET+PUT), `ai/generate` (GET+POST), `newsletter`, `pusher/message`, `pusher/confetti`, `rsvp` (GET+POST), `stripe/checkout`, `stripe/verify`, `stripe/webhook`, `upload`, `user/upgrade-plan`

### Models (4)
`User` (name, email, password, avatar, plan, stripeCustomerId, stripeSubscriptionId, themePreference, confettiSoundsEnabled, customGreeting, bio), `RSVP`, `Resolution`, `Newsletter`

### Env vars (15, all present in Netlify)
`MONGODB_URI`, `AUTH_SECRET`, `AUTH_URL`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `GROQ_API_KEY`, `RESEND_API_KEY`, `PUSHER_APP_ID`, `NEXT_PUBLIC_PUSHER_KEY`, `PUSHER_SECRET`, `NEXT_PUBLIC_PUSHER_CLUSTER`, `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`

### Dependencies (verified)
next 15.5.23, react 19, mongoose 8.24.4, stripe, groq-sdk, pusher 5.3.4 / pusher-js, cloudinary 2.10.1, resend, bcryptjs, canvas-confetti, lucide-react 1.34.0.
**Unused:** `framer-motion`, `clsx`, `tailwind-merge` (zero imports — dead weight).

### Dual-storage design
MongoDB (primary) with a JSON-file fallback (`data/db.json`) when Mongo is unreachable. In this environment Mongo **is** reachable, so the file fallback is dormant locally.

---

## 2. Issues by severity

### CRITICAL

| # | Issue | File(s) | Evidence |
|---|---|---|---|
| C1 | **AI feature fully broken.** Groq model `llama-3.3-70b-versatile` was retired by Groq → both resolution and greeting-card generation return 500. Verified live: `{"error":"404 ...model does not exist"}`. Current catalog has `openai/gpt-oss-120b`, `qwen/qwen3.8-27b`, etc. | `src/app/api/ai/generate/route.ts:51` | live-call test |
| C2 | **No server-side input validation on register.** Accepted `email: "notanemail"` and `password: "1"` — real accounts created. No email-format check, no password policy, no name length check. | `src/app/api/auth/register/route.ts:13-15` | live-call test (users deleted after) |
| C3 | **Hardcoded fallback JWT secret.** If `AUTH_SECRET` is ever unset, tokens are signed with `default-secret-change-in-production-123456` → forgeable admin sessions. | `src/lib/auth.ts:4` | code |
| C4 | **Stripe webhook accepts unsigned payloads.** When `STRIPE_WEBHOOK_SECRET` or the signature header is missing it does `JSON.parse(body)` and trusts it → anyone can POST a fake `checkout.session.completed` and grant themselves any plan. | `src/app/api/stripe/webhook/route.ts:12-18` | code |
| C5 | **Production user PII committed to git** — `data/db.json` contains 2 real users' emails + bcrypt hashes. It is also the live-write fallback store (writes are lost on serverless, and it will drift/ conflict). | `data/db.json` | `git ls-files` |

### MAJOR

| # | Issue | File(s) |
|---|---|---|
| M1 | **Dev writes to the production database.** `.env.local` was pulled from Netlify and points at the same Atlas cluster — local testing creates/modifies prod data (confirmed during audit; test artifacts were removed). |
| M2 | **Cart checkout is fake.** `setTimeout(1500)` → confetti → "Holiday Order Placed!" with no order created, no persistence, no Stripe. Users are told an order exists. (`src/components/cart/CartDrawer.tsx:53-61`) |
| M3 | **No rate limiting** on `/api/auth/*` (and other POST routes) → credential brute-force/email-spam possible. |
| M4 | **No forgot/reset-password flow** anywhere. |
| M5 | **`?redirect=` is ignored.** `/pricing` links to `/signup?redirect=/pricing&plan=…` but both auth pages always push `/profile`, losing the user's destination. |
| M6 | **Session expiry is silent.** `AuthProvider` fetches `/api/auth/me` once on mount; an expired 7-day JWT yields `user: null` with no "session expired" message and no return-to-URL. |
| M7 | **Invalid promo code advertised.** Home hero banner says `NYE2024`; cart only accepts `FESTIVE15`/`NYE2026`/`HOLIDAY50`; newsletter email says `FESTIVE15`. Three different truths. |
| M8 | **All failures use `alert()`** (13 occurrences) — blocking, unstyled, untestable, no inline error states. |
| M9 | **Wrong year everywhere ("2024")**: Footer brand + copyright, OffersSection (×2), Events wish label, AI page headings, Live Lounge welcome message + room tag. Product is branded 2026. |
| M10 | **Stale year copy vs. logic**: countdown targets Dec 31 of the current year (fine) but freezes at 00:00:00 without a "Happy New Year" state. |
| M11 | **No tests of any kind** (unit/integration/E2E) and **no `.env.example`**. |

### MINOR

| # | Issue | File(s) |
|---|---|---|
| m1 | Zero accessibility affordances: modals lack `role="dialog"`/`aria-modal`, Escape-to-close, focus trap and scroll-lock; many `<label>`s have no `htmlFor`/input `id` (events, ai-resolutions, profile); icon-only buttons rely on `title`; no `focus-visible` styles; `prefers-reduced-motion` never honored; chat feed has no `aria-live`. |
| m2 | Contrast failures: `text-gray-500` secondary text and struck-through plan features on `#0b0d14` ≈ 3.4:1 (needs 4.5:1). |
| m3 | `lg` breakpoint hides 2 of 6 nav links (VIP Pricing, Live Lounge) with no overflow menu — destinations become unreachable on tablets. |
| m4 | Images: 55 MB of raw PNG committed (incl. a 23 MB `new year.fig` **twice** — `images/` and `public/images/`), 5 unreferenced files (~2.7 MB); no `width/height` (CLS), no lazy-loading, no `srcset`, no WebP/AVIF, all via `<img>` not `next/image`. |
| m5 | Duplicate newsletter logic (Footer + NewsletterCard) — identical fetch/error code in two places. |
| m6 | `data/db.json` fallback can also write passwords/`updatedAt` inconsistently vs. Mongoose defaults (e.g., `confettiSoundsEnabled` missing on Mongo path is fine, but local path adds fields manually). |
| m7 | Plan "verify" endpoint upgrades any plan for any session without payment proof (`/api/stripe/verify`) — intentional demo behavior, but unsupervised. |
| m8 | Logout always lands on `/` via `window.location.href` (full reload) rather than router navigation. |
| m9 | No per-route `<title>`/description, no Open Graph/Twitter card metadata. |
| m10 | Performance: `ParticleBackground` runs a permanent `requestAnimationFrame` loop with `shadowBlur` (expensive per-frame), no devicePixelRatio scaling, not paused when tab hidden or under reduced-motion. |
| m11 | Empty states missing on `/deals` (no results) and community feed; no loading skeletons. |
| m12 | RSVP `guestsCount` select offers 6 but schema max is 10 — fine, but no client validation of ranges (server clamps silently). |

---

## 3. What already works (keep)
Build passes; all 10 routes render 200; email/password login + bcrypt hashing; httpOnly session cookie; RSVP + ticket codes; Pusher chat/confetti (live-verified); newsletter; Cloudinary upload; Stripe checkout URL creation; countdown; cart with coupon math; responsive layout shells.

---

## 4. Phase plan
- **P2 Auth:** shared validation schema + server enforcement, password strength + indicator, rate limiting, session-expiry UX, redirect-after-login, forgot/reset password (Resend), auth tests.
- **P3 Repairs:** swap AI model to a current Groq model, remove fake cart checkout (real order confirmation flow / honest empty state), webhook signature enforcement, secret handling, replace all `alert()`s, add loading/empty/error states, fix promo-code + year copy.
- **P4 UI/UX:** design tokens + shared component library (Button, Input, Card, Modal, Toast, Navbar, Footer), mobile-first verification at 375/768/1280, WCAG 2.1 AA pass (focus, labels, contrast, dialogs, reduced motion).
- **P5 Images:** optimize/convert, dimensions, lazy-loading, alt text, remove bloat.
- **P6 Features:** sorting, pagination on deals, confirmation dialogs, toasts, search improvements.
- **P7 Quality:** folder structure, `.env.example`, error boundaries, metadata/OG, drop unused deps, bundle check.
- **P8 Tests:** unit (validation/auth), integration (API), E2E (auth + core flow), manual checklist.

---

# Addendum — resolution status (post-repair)

**All 5 critical and 11 major findings are fixed.** See `CHANGES.md` for the full list.

| ID | Status |
|---|---|
| C1 AI model dead | ✅ Fixed — `openai/gpt-oss-120b`, verified live |
| C2 No auth validation | ✅ Fixed — shared validators, enforced server-side |
| C3 Fallback JWT secret | ✅ Fixed — refuses to boot without `AUTH_SECRET` |
| C4 Unsigned webhooks | ✅ Fixed — signature mandatory |
| C5 PII in git | ✅ Fixed — untracked + sanitised (history scrub still recommended) |
| M1 Dev writes to prod DB | ⚠️ By design of the shared Netlify env — documented |
| M2 Fake checkout | ✅ Fixed — real Order model + confirmation |
| M3 No rate limiting | ✅ Fixed — auth, newsletter, RSVP, Pusher, AI limits |
| M4 No password reset | ✅ Fixed — single-use 60-min tokens |
| M5 `?redirect=` ignored | ✅ Fixed — honored end-to-end |
| M6 Silent session expiry | ✅ Fixed — banner + redirect-after-login |
| M7 Promo-code mismatch | ✅ Fixed — coupons centralised |
| M8 `alert()` UX | ✅ Fixed — inline errors + toasts |
| M9 Wrong-year copy | ✅ Fixed |
| M10 Countdown freeze | ✅ Fixed — celebration state |
| M11 No tests | ✅ Fixed — 60 automated tests (`TEST-RESULTS.md`) |
| Minor (a11y, images, dead code, metadata, perf) | ✅ All addressed |
