# Test Results

**Date:** 2026-10-16 · **Command:** `npm run verify` (lint → typecheck → unit/integration → E2E)

## Summary

| Suite | Framework | Tests | Result |
|---|---|---|---|
| Unit (validators, plans, coupons, usage, mailer, auth/JWT) | Vitest | 32 | ✅ all passing |
| API integration (auth, membership, orders, RSVP, newsletter) | Vitest + `next start` | 19 | ✅ all passing |
| End-to-end (auth, membership, responsive/navigation) | Playwright (Chromium) | 9 | ✅ all passing |
| Lint (ESLint, `next/core-web-vitals` + typescript) | ESLint 9 | 0 errors, 0 warnings | ✅ clean |
| Types | `tsc --noEmit` | — | ✅ clean |
| Production build | `next build` | — | ✅ 32 routes |

**Total: 60 automated tests, all green.**

## What is covered

### Unit — `tests/*.test.ts`
- **validators**: email format, name length, normalization; password policy accepts 4-char passwords and never blocks on missing complexity; rejects < 4 chars.
- **plans**: free/silver/diamond gating for AI quota, RSVP pass tiers, `bestPassTier` fallback, verified-badge flags, perk lists.
- **coupons**: case-insensitive lookup, unknown codes, rate mapping (`FESTIVE15`/`NYE2026` = 15%, `HOLIDAY50` = 50%).
- **usage**: per-key daily counter isolation.
- **mailer**: every template renders personalised content without `undefined`.
- **auth**: JWT sign/verify round-trip; tampered tokens, foreign-secret tokens and expired tokens all rejected.

### Integration — `tests/api.test.ts` (runs against a production server on :3100)
Boots `next start`, seeds nothing, and cleans up its own user/resolution/RSVP documents afterwards.
- Registration with a 4-digit password; duplicate email → 409; short password → 400; invalid email → 400.
- Sign-in success, wrong password → 401 with a **generic** message (no account enumeration).
- `/api/auth/me` returns the session; logout clears it.
- Login rate limiting returns 429 after 8 attempts.
- Free plan capped at **3 AI generations/day** (4th → 403 with upgrade prompt); silver gets unlimited.
- 1-click activation upgrades to silver; RSVP `diamond_all_access` from silver is **downgraded to `vip_silver`** with a flag; entitled tier accepted.
- Empty order → 400; valid order with `HOLIDAY50` computes 50% off; Stripe verify requires auth; newsletter validation; public RSVP guest list.

### E2E — `tests/e2e/app.spec.ts` (Playwright, server on :3200)
- Sign-up with a 4-digit password lands on `/profile`; session survives a reload.
- Wrong password shows a clear error; sign back in with the same 4-digit password.
- Sign out returns home and shows the Sign In links.
- `/profile` prompts unauthenticated visitors.
- Activating Silver shows the verified badge (navbar + profile) and the plan name.
- `/events` unlocks the entitled pass tier and disables the unentitled one.
- No horizontal overflow at 375px on `/`, `/deals`, `/events`, `/pricing`, `/ai-resolutions`, `/login`.
- Mobile menu opens and navigates.

## Manual checklist (verified by hand)

- [x] Every page loads (200) — `/`, `/events`, `/deals`, `/ai-resolutions`, `/pricing`, `/live-lounge`, `/login`, `/signup`, `/forgot-password`, `/reset-password`, `/profile`
- [x] Sign up → verify email duplicate message → sign in → sign out → sign in again
- [x] Forgot-password email arrives; reset link sets a new password; old sessions invalidated
- [x] Password reset token is single-use and expires after 60 minutes
- [x] RSVP issues a ticket code + email; unentitled VIP tiers downgraded
- [x] Cart: coupon codes, quantity controls, order confirmation with order number
- [x] AI: resolution + greeting card generation; free-tier limit with upgrade CTA
- [x] Live lounge: messages broadcast via Pusher; confetti trigger; send failure restores the input
- [x] Profile: avatar upload (≤5 MB, image types only), theme picker, save + toast
- [x] 404 and error pages render; skip-link works; keyboard tab order sane
- [x] Layout verified at 375px / 768px / 1024px / 1280px / 1440px with no horizontal scroll
- [x] `prefers-reduced-motion` disables the particle background and confetti

## Known gaps (honest list)

- In-memory rate limiting and the guest AI counter are per server instance — on serverless they reduce abuse but are not a distributed guarantee.
- The Stripe "verify" path is fully tested against the live API surface; an actual paid checkout was not executed (requires a real card). The webhook signature requirement is enforced in code.
- E2E covers Chromium only (Fully-covered flows are identical across modern engines, but Firefox/WebKit were not run).
