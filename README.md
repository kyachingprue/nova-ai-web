# Nova AI

Next.js 15 (App Router), TypeScript, and Tailwind CSS application with the Nova
AI landing page, pricing, email/password authentication, email verification,
Google sign-in, and a Gemini-powered chat workspace.

## Setup

```bash
npm install
Copy-Item .env.example .env.local
npm run dev
```

Add your service credentials to `.env.local` before using authentication,
uploads, email, or AI chat.

## Required services

- **Neon PostgreSQL** — set `DATABASE_URL`. The application creates its required
  tables on the first API request.
- **JWT** — set `JWT_SECRET` to a unique random secret of at least 32 characters.
- **Google Gemini** — set the server-side `GEMINI_API_KEY`. `GEMINI_MODEL` is
  optional and defaults to `gemini-2.5-flash`; web grounding is enabled for chat.
- **SMTP** — configure `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`,
  and `SMTP_FROM` to deliver 6-digit email verification codes.
- **Firebase** — create a Firebase Web app, enable Google as an Authentication
  provider, and set all `NEXT_PUBLIC_FIREBASE_*` values. The Firebase project ID
  is also used to verify Google ID tokens on the server.
- **ImgBB** — set `NEXT_PUBLIC_IMGBB_API_KEY` to enable optional profile image
  uploads. Images are uploaded directly from the browser to ImgBB.
- **Stripe** — set `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`,
  `STRIPE_PRICE_PRO`, `STRIPE_PRICE_TEAM`, and `APP_URL` (the canonical app
  origin). Create monthly recurring Stripe
  prices matching the displayed plan prices, then configure the webhook endpoint
  `/api/billing/webhook` for checkout completion and subscription update/delete
  events. The secret key and webhook secret must remain server-only.

The `.env.local` file contains secrets and must not be committed. Never expose
the Gemini, SMTP, database, or JWT secrets with a `NEXT_PUBLIC_` prefix.

## Routes

- `/` — product landing page
- `/how-it-works` — product workflow and AI feature overview
- `/pricing` — Free, Pro, and Team plan cards
- `/checkout` — authenticated plan selection and Stripe Checkout
- `/docs` — product documentation, configuration, and API overview
- `/register` — account creation, password guidance, optional profile upload
- `/verify` — email-code verification and account activation
- `/login` — email/password or Google sign-in
- `/dashboard` — responsive AI chat, web sources, and persistent conversation history

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

## UI

The app uses shadcn-style reusable Button and Input primitives with Radix UI,
Tailwind CSS, Lucide icons, react-hook-form, and Zod. The theme selector supports
light, dark, and system preferences.

## Design

The landing page keeps its animated Nova visual identity. Pricing, auth, and
dashboard routes use responsive layouts, shared theme tokens, accessible
controls, and reduced-motion-aware global animation settings.
