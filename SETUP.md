# Setup & Deployment Guide

## Requirements

- Node.js 20+ (developed on Node 26)
- npm 10+
- A MongoDB database (Atlas or local) — the app degrades to a JSON file fallback without one
- Optional: Stripe, Groq, Resend, Pusher and Cloudinary keys for the full feature set

## Local setup

```bash
git clone https://github.com/islamrakibul9274/new-year-celebration-hub.git
cd new-year-celebration-hub
npm install
cp .env.example .env.local     # then fill in the values
npm run dev                    # http://localhost:3000
```

### Environment variables

Copy `.env.example` to `.env.local` and fill in:

| Variable | Required | Purpose |
|---|---|---|
| `AUTH_SECRET` | ✅ | JWT signing secret — `openssl rand -base64 32` |
| `AUTH_URL` | ✅ | Canonical URL (password reset links, Stripe redirects) |
| `MONGODB_URI` | ✅ | MongoDB connection string |
| `GROQ_API_KEY` | for AI | Powers `/ai-resolutions` |
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | for payments | VIP checkout + webhook |
| `RESEND_API_KEY` | for email | Welcome/ticket/newsletter/reset/VIP emails |
| `PUSHER_APP_ID`, `NEXT_PUBLIC_PUSHER_KEY`, `PUSHER_SECRET`, `NEXT_PUBLIC_PUSHER_CLUSTER` | for live lounge | Realtime chat + confetti |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | for uploads | Profile avatars |

Without the optional keys the app still runs: AI returns a friendly error, email is skipped, the live lounge shows no remote messages, and upgrades fall back to the 1-click demo activation.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Dev server on :3000 |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Unit + API integration tests (Vitest) |
| `npm run test:e2e` | Playwright E2E |
| `npm run verify` | lint + typecheck + all tests |

> Integration/E2E suites start their own server on ports 3100/3200, so run `npm run build` first and keep those ports free.

## Deployment (Netlify)

The repo contains `netlify.toml` (`npm run build`, publish `.next`, `@netlify/plugin-nextjs`). Pushes to `main` deploy automatically.

1. Connect the repo in Netlify (Site settings → Build & deploy → Continuous deployment).
2. Add every variable from `.env.example` in **Site configuration → Environment variables**.
3. Push to `main` — the site builds and publishes; the live URL is shown in the deploy log.

### Stripe webhook (when taking real payments)

Create an endpoint pointing at `https://<your-domain>/api/stripe/webhook` subscribed to `checkout.session.completed`, and put the signing secret in `STRIPE_WEBHOOK_SECRET`. Unsigned requests are rejected by design.
