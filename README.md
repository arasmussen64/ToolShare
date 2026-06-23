# 🛠️ ToolShare

A peer-to-peer marketplace for renting tools and equipment from your neighbors —
everything from a cordless drill to a full-size backhoe. Why buy a tool you'll
use once? Borrow what you need, and earn from the gear sitting idle in your
garage or yard.

> **MVP / demo:** ToolShare is fully self-contained. All data is mock and seeded,
> persisted in the browser via `localStorage`. There is no backend, database, or
> external API call at runtime.

## Features

- **Browse & search** — full-text search, category filters (automotive,
  landscaping, power/hand tools, construction, heavy equipment, and more), and
  price sorting.
- **Listings** — detail pages with photos/owner info, condition, location, and
  reviews.
- **Booking** — date-range picker with **availability conflict detection**,
  inclusive day/price calculation, and an owner approval flow.
- **List a tool** — create a listing with an uploaded photo (auto-downscaled and
  compressed client-side) or a category icon.
- **Accounts** — mock auth: pick a seed persona or create your own.
- **Dashboard** — manage your rentals, incoming requests (confirm/decline/
  complete), and your own listings.
- **Reviews & ratings** — per-listing star ratings with aggregated averages.

## Tech stack

- [Next.js 16](https://nextjs.org) (App Router, Turbopack) + React 19
- TypeScript (strict)
- Tailwind CSS v4
- Vitest for unit tests

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Sign in as **Demo User**
(it ships with sample rentals) to explore the full flow.

## Scripts

| Command              | Description                               |
| -------------------- | ----------------------------------------- |
| `npm run dev`        | Start the dev server                      |
| `npm run build`      | Production build                          |
| `npm start`          | Serve the production build                |
| `npm run lint`       | ESLint                                    |
| `npm run typecheck`  | TypeScript type checking (`tsc --noEmit`) |
| `npm test`           | Run the Vitest unit suite                 |
| `npm run test:watch` | Watch-mode tests                          |

## Architecture

```
src/
├── app/                 # App Router pages (browse, tools/[id], list, login, profile)
│   ├── error.tsx        # Global error boundary
│   ├── not-found.tsx    # 404
│   └── providers.tsx    # Toast + Store context providers
├── components/          # UI components (Header, ToolCard, BookingWidget, …)
└── lib/
    ├── types.ts         # Domain types
    ├── seed.ts          # Mock seed data (users, tools, reviews, bookings)
    ├── store.tsx        # Client store (React Context) + localStorage persistence
    ├── helpers.ts       # Pure logic: booking math, availability, formatting
    ├── image.ts         # Client-side image downscale/compress
    └── __tests__/       # Vitest unit tests for the core logic
```

**State** lives in a single React Context (`StoreProvider`) seeded
deterministically (so server and first client render match), then hydrated from
`localStorage` after mount. Booking availability is enforced in the store
mutation layer — not just the UI — so invalid bookings can't be written.

## Continuous integration

Every push and PR to `main` runs typecheck → lint → tests → production build via
GitHub Actions (`.github/workflows/ci.yml`).

## Resetting demo data

The app keys its storage by schema version and cleans up older versions
automatically. To wipe everything manually, clear `localStorage` for the site.
