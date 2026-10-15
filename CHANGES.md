# Change Summary

All work is on the `main` branch, uncommitted until the final commit. Grouped per your requested categories.

## Fixed (was broken)

| # | Issue | Fix |
|---|---|---|
| 1 | **AI feature dead** — Groq retired `llama-3.3-70b-versatile`, every generation returned 500 | Switched to `openai/gpt-oss-120b` (verified against the live model list); added JSON-parse fallback, prompt validation and clearer errors |
| 2 | **No auth validation** — `email: "notanemail"`, `password: "1"` created real accounts | Shared validators (`src/lib/validators.ts`) enforced server-side on register/login/reset |
| 3 | **Forgeable JWT** — fallback secret `default-secret-change-in-production-123456` | App refuses to boot without `AUTH_SECRET` |
| 4 | **Unsigned Stripe webhooks accepted** — anyone could grant themselves VIP | Signature (and secret) now mandatory; unverifiable payloads rejected with 400 |
| 5 | **Fake cart checkout** — `setTimeout` + "order placed" lie | Real `Order` model + `/api/orders`; order number, totals and coupon persisted |
| 6 | **Dead Piazza feature** — `/api/stripe/verify` was never called | Profile now verifies Stripe return, checks payment status + session ownership, re-issues the session cookie |
| 7 | **Stale plan in session** — JWT kept the pre-upgrade plan, so AI limits/RSVP tiers stayed wrong | Cookie re-issued on upgrade + `getFreshSession()` re-checks the plan from the DB |
| 8 | **Pricing race** — logged-in users bounced to signup when the session hadn't resolved | Buttons disabled while auth loads; handler no-ops instead of redirecting |
| 9 | **`Field` component broke every auth label** — id landed on the icon wrapper `div`, not the input | Control discovery + identity-preserving clone; label ↔ input association verified with Playwright |
| 10 | **Committed user PII** — `data/db.json` with emails + bcrypt hashes was tracked | Untracked, gitignored, file sanitised |
| 11 | **Horizontal overflow on mobile** (436px) + permanent thick scrollbar | Root-caused and fixed; custom scrollbar removed so the OS-native one shows |
| 12 | **`alert()` everywhere** (13 call sites) | Inline error states with `role="alert"` |
| 13 | **Wrong year copy** ("2024" in footer, offers, events, AI page, live room) | 2026 everywhere; dynamic copyright year |
| 14 | **Promo code lie** — banner advertised `NYE2024`, cart rejected it | Coupons centralised in `src/lib/coupons.ts`; all copy matches |
| 15 | **Countdown froze** after midnight | "Happy New Year!" celebration state |
| 16 | **Form labels unassociated** (events, AI, profile) | `Field` component + `htmlFor`/`id` pairs |

## Improved

- **Design system**: tokens in `globals.css` (`@theme`) — contrast-checked palette (text/primary/gold ≥ 4.5:1 on the `#0b0d14` canvas), type scale, radii, shadows, one focus-visible treatment, `prefers-reduced-motion` honoured.
- **Shared components** (`src/components/ui/`): Button, Field/Input/Select, Card/Badge/Alert/EmptyState/Spinner, Modal (focus trap, Escape, scroll lock, restore focus), Toast system.
- **Accessibility**: skip link, landmarks, `aria-current`, `aria-expanded`, dialogs labelled, keyboard-navigable dropdowns/menus, chat input labels, visible focus rings.
- **Responsive**: navbar rebuilt (icon rail at `lg`, labels from `xl`, no more truncated links); verified at 375/768/1024/1280/1440 with zero horizontal overflow.
- **Images**: 2.5 MB of PNGs → 324 KB of WebP (14 optimised, 11 unused/duplicate assets incl. a 23 MB `.fig` deleted), `next/image` with `sizes`, lazy loading, real alt text, avatars with dimensions.
- **Performance**: particle canvas now DPR-aware, pauses when the tab is hidden, disabled under reduced-motion; unused deps removed (`framer-motion`, `clsx`, `tailwind-merge`); shared JS 103 kB.
- **Auth**: password strength meter (advisory), remember-me (30 days), forgot/reset password flow with single-use 60-minute tokens, generic login errors, rate limits, same-origin checks.
- **Email**: all templates centralised in `src/lib/mailer.ts` (welcome, ticket, newsletter, password reset, VIP welcome).
- **SEO**: per-route titles/descriptions + Open Graph/Twitter cards + canonical URLs.

## Added

- **Membership benefits that actually work**: verified badge (navbar, profile, live lounge), free plan capped at 3 AI generations/day with an upgrade CTA, RSVIP pass tiers gated by plan (downgraded server-side with an explanation), VIP welcome email, plan definitions in `src/lib/plans.ts`.
- **Orders**: `Order` model, `POST/GET /api/orders`, checkout confirmation dialog, order history on the profile.
- **Saved AI resolutions**: `/api/ai/mine` + "My AI Resolutions" panel with empty states.
- **Deal discovery**: search + category filter + sorting (price/discount) + result counts + empty state.
- **Toasts** for every async action (RSVP, AI, newsletter, save, upgrade, order).
- **Tests**: 32 unit + 19 integration + 9 E2E = 60 automated tests, all passing, wired into `npm run verify`.
- **`.env.example`**, ESLint config, `vitest`/`playwright` configs, `AUDIT.md`, `TEST-RESULTS.md`.
