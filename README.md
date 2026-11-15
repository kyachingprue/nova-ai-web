# Nova AI

Next.js 15 (App Router), TypeScript, and Tailwind CSS application with the Nova
AI landing page, pricing, email/password authentication, email verification,
Google sign-in, and an OpenRouter-powered chat workspace.

## Setup

```bash
npm install
npm run dev
```

Add your service credentials to `.env.local` (or the existing root `.env`)
before using authentication, uploads, email, or AI chat.

## Required services

- **Neon PostgreSQL** — set `DATABASE_URL`. The application creates its required
  tables on the first API request.
- **JWT** — set `JWT_SECRET` to a unique random secret of at least 32 characters.
- **Administrators** — set the server-side `ADMIN_EMAILS` to a comma-separated
  list of verified account email addresses. Matching accounts receive the
  administrator role at registration verification or their next sign-in;
  everyone else defaults to `user`. For example:
  `ADMIN_EMAILS=admin@example.com,owner@example.com`.
- **OpenRouter** — set the server-side `OPENROUTER_API_KEY` in the project-root
  `.env.local` file (or the existing root `.env`/your hosting provider's
  server-side secrets).
  `OPENROUTER_MODEL` is optional and defaults to `openrouter/free`, which
  automatically chooses an available free model. Free models have usage limits
  and availability can change. Web search is off by default; setting
  `OPENROUTER_WEB_SEARCH=true` enables it, but web search can incur extra
  charges. Never expose the API key with a `NEXT_PUBLIC_` prefix.
- **SMTP** — configure `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`,
  and `SMTP_FROM` to deliver 6-digit email verification codes.
- **Firebase** — create a Firebase Web app, enable Google as an Authentication
  provider, and set all `NEXT_PUBLIC_FIREBASE_*` values. The Firebase project ID
  is also used to verify Google ID tokens on the server.
- **ImgBB** — set `IMGBB_API_KEY` server-side for authenticated profile image
  changes. Registration-time uploads continue to use
  `NEXT_PUBLIC_IMGBB_API_KEY`. The profile image API accepts either key, but
  the server-side variable is recommended.
- **Stripe** — set `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`,
  `STRIPE_PRICE_PRO`, `STRIPE_PRICE_TEAM`, and `APP_URL` (the canonical app
  origin). Create monthly recurring Stripe
  prices matching the displayed plan prices, then configure the webhook endpoint
  `/api/billing/webhook` for checkout completion and subscription update/delete
  events. The secret key and webhook secret must remain server-only.

The `.env.local` file contains secrets and must not be committed. Never expose
the OpenRouter, SMTP, database, or JWT secrets with a `NEXT_PUBLIC_` prefix.

## Routes

- `/` — product landing page
- `/how-it-works` — product workflow and AI feature overview
- `/pricing` — Free, Pro, and Team plan cards
- `/checkout` — authenticated plan selection and Stripe Checkout
- `/docs` — product documentation, configuration, and API overview
- `/register` — account creation, password guidance, optional profile upload
- `/verify` — email-code verification and account activation
- `/login` — email/password or Google sign-in
- `/dashboard` — user chat; administrators are redirected to the overview
- `/dashboard/overview`, `/dashboard/users`, `/dashboard/analytics`,
  `/dashboard/reports`, and `/dashboard/settings` — administrator-only pages
- `/dashboard/profile` — personal profile for users and administrators

Guest plan selections continue through login or registration and email
verification. Signed-in users visiting `/login` or `/register` are redirected
to their dashboard or selected plan checkout. Free users go directly to the
dashboard; paid plan selection uses Stripe Checkout. Paid subscriptions are
activated after Stripe confirms the subscription, through the checkout
confirmation endpoint and webhook.

The chat stores conversations and timestamped messages in Neon. Account
registration hashes passwords with bcrypt and only creates a user after a
valid email verification code is submitted. Authenticated requests use a
server-signed, HTTP-only JWT cookie.
Administrator APIs enforce the stored role on the server. Topic reports expose
aggregate categories from conversation titles rather than individual message
content. User profile image changes are uploaded to ImgBB through the server.

## UI

The app uses shadcn-style reusable Button and Input primitives with Radix UI,
Tailwind CSS, Lucide icons, react-hook-form, and Zod. The theme selector supports
light, dark, and system preferences.

## Design

The landing page keeps its animated Nova visual identity. Pricing, auth, and
dashboard routes use responsive layouts, shared theme tokens, accessible
controls, and reduced-motion-aware global animation settings.
