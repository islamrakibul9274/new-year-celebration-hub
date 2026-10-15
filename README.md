# 🎆 New Year Celebration Hub — Full-Stack Next.js Platform

[![Next.js](https://img.shields.io/badge/Next.js-15.5-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue?style=for-the-badge&logo=typescriptlang)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38B2AC?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)
[![Tests](https://img.shields.io/badge/tests-60%20passing-brightgreen?style=for-the-badge)](./TEST-RESULTS.md)

> **Live:** https://newyear-celebration-hub.netlify.app
> **GitHub:** https://github.com/islamrakibul9274/new-year-celebration-hub

---

## 🌟 Overview

**New Year Celebration Hub** is a full-stack celebration platform: a live midnight countdown, a real-time party lounge, an AI resolution coach, a holiday gift shop with coupon codes, VIP membership passes, RSVP ticketing, and user accounts with avatar uploads.

---

## ✨ Features

### 🎨 Design & UX
- Design-token system (`src/app/globals.css`): contrast-checked palette, type/spacing/radius scales, single focus-visible treatment, `prefers-reduced-motion` support
- Shared component library: buttons, form fields, cards, badges, modals (focus-trapped), toasts, empty states
- Mobile-first layout verified at 375 / 768 / 1024 / 1280 / 1440px with no horizontal overflow
- WCAG-minded: skip link, landmarks, labelled controls, keyboard-navigable menus and dialogs

### 🧭 Pages
| Route | What it does |
|---|---|
| `/` | Live countdown, 65% OFF deals, party showcase, schedule + instant RSVP, gift portfolio, newsletter |
| `/events` | Gala itinerary, venue details, RSVP with entitlement-aware pass tiers |
| `/deals` | Gift shop with search, category filters, sorting, coupons, bag + checkout |
| `/ai-resolutions` | AI resolution architect + greeting card maker (Groq), community feed |
| `/pricing` | Free / Silver / Diamond passes — Stripe Checkout or 1-click demo activation |
| `/live-lounge` | Pusher real-time chat, synced countdown, screen-wide confetti |
| `/profile` | Avatar upload, theme picker, pass details, order history, saved resolutions |
| `/login` `/signup` | Email + password auth (any password ≥ 4 chars), remember me |
| `/forgot-password` `/reset-password` | Single-use reset links (60-minute expiry) |

### 👑 Membership benefits (actually enforced)
- Verified member badge (navbar, profile, live lounge)
- Free plan: 3 AI generations/day → Silver/Diamond: unlimited
- RSVP pass tiers gated by plan (server downgrades unentitled tiers)
- VIP welcome email on activation

---

## 🛠️ Tech stack

Next.js 15 (App Router) · TypeScript · Tailwind CSS v4 · MongoDB + Mongoose (JSON-file fallback) · JWT sessions (httpOnly cookies) · bcrypt · Groq AI · Stripe · Pusher · Resend · Cloudinary · Netlify

---

## 🚀 Getting started

Full instructions in **[SETUP.md](./SETUP.md)**.

```bash
npm install
cp .env.example .env.local   # fill in values
npm run dev                  # http://localhost:3000
```

## 🧪 Testing

```bash
npm run verify   # lint + typecheck + unit/integration + E2E
```

60 automated tests (32 unit · 19 API integration · 9 Playwright E2E) — results in **[TEST-RESULTS.md](./TEST-RESULTS.md)**.

## 📚 Documentation

- [SETUP.md](./SETUP.md) — install, env vars, scripts, deployment
- [CHANGES.md](./CHANGES.md) — what was fixed, improved and added
- [AUDIT.md](./AUDIT.md) — original audit findings + resolution status
- [TEST-RESULTS.md](./TEST-RESULTS.md) — test coverage and manual checklist

---

## 📜 License

MIT.
