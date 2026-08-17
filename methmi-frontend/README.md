# Methmi Enterprises — Frontend

The Next.js 16 frontend for Methmi Enterprises, extracted from the full-stack
workspace and made to run **on its own**, with no backend required.

## Run it

```bash
npm install
cp .env.example .env.local   # already present — fill in your contact details
npm run dev                  # http://localhost:3000
```

Production:

```bash
npm run build
npm run start
```

## What works without a backend

| Page | Status |
| --- | --- |
| `/` homepage | Works |
| `/fleet` (7 vehicles) | Works — content from `src/data/vehicles.ts` |
| `/tours` (4 packages) | Works — content from `src/data/tours.ts` |
| `/about`, `/contact` | Works |
| `/booking-enquiry` | Works — validated and accepted by `src/app/api/booking-enquiry/route.ts` |
| `/sitemap.xml`, `/robots.txt` | Works |
| `/admin` | **Needs the backend** (see below) |

Standalone, a submitted enquiry is validated, rate-limited (5/min per IP) and
logged to the server console. It is **not** emailed or stored anywhere — the
visitor gets the success screen and the WhatsApp CTA. If you want enquiries
delivered to an inbox, either connect the backend or replace the `console.log`
in that route handler with your own email/database call.

## Configuration

Everything lives in `.env.local`:

```
NEXT_PUBLIC_WHATSAPP_NUMBER=94771234567   # digits only, with country code
NEXT_PUBLIC_BUSINESS_PHONE=
NEXT_PUBLIC_BUSINESS_EMAIL=
NEXT_PUBLIC_SITE_URL=https://www.methmienterprises.com
NEXT_PUBLIC_GA_MEASUREMENT_ID=            # optional, GA4
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=          # optional, contact page map
```

Until the WhatsApp/phone/email values are set, the site renders visible
placeholders like `[WHATSAPP NUMBER]` — set them before going live. Analytics
and Maps fail safely when left blank.

To edit fleet, tours or prices, edit `src/data/vehicles.ts` and
`src/data/tours.ts` and redeploy. Images go in `public/images/`.

## Reconnecting the backend (optional)

Set `BACKEND_URL` in `.env.local` **before building** — the `/api/*` proxy is
resolved at build time:

```
BACKEND_URL=http://localhost:4000
ADMIN_SESSION_SECRET=<same value as the backend>
```

With that set, `/api/*` proxies to the Express app, content is served live from
it instead of `src/data`, enquiries are forwarded to it, and the
password-protected `/admin` panel becomes usable. Leave `BACKEND_URL` unset and
the app serves everything itself. The `/admin` routes are still in the build
either way; without a backend they redirect to a login that cannot authenticate.

## What changed from the workspace version

- `next.config.mjs` — Turbopack root points at this folder, not the workspace
  root, so it builds outside the monorepo. The `/api` proxy is now registered
  only when `BACKEND_URL` is set.
- `src/lib/api.ts` — no longer assumes a backend at `localhost:4000`; skips the
  fetch entirely and uses bundled data when `BACKEND_URL` is unset.
- Added `src/app/api/tours`, `src/app/api/vehicles`, `src/app/api/booking-enquiry`
  route handlers, which forward to the backend when configured and answer
  locally when not.

Everything else — components, pages, styling, SEO, admin panel — is unchanged.

## Stack

Next.js 16 (App Router) · TypeScript · Tailwind CSS · React Hook Form + Zod ·
lucide-react

## Notes

- Next 16 warns that the `middleware` file convention is deprecated in favour of
  `proxy`. It still works; migrate with
  `npx @next/codemod@canary middleware-to-proxy .` when convenient.
- Deploys as-is to Vercel or any Node host. It is not a static export — some
  routes are server-rendered.
