# Deploying Neon Needle with Stripe deposits (Vercel + Neon)

How it works: the website (Vite + React) calls three small server functions in `api/`.

| Route | Purpose |
| --- | --- |
| `POST /api/checkout` | Saves the booking in Neon, works out the deposit, creates a hosted Stripe Checkout (CAD) and returns its URL |
| `POST /api/payments/webhook` | Stripe calls this when payment finishes; verifies the signature and sets the booking to `deposit_paid` |
| `GET /api/booking?t=…` | Lets the confirmation page show the booking status |

## 1. Database (Neon)
1. In Neon, **reset the database password** if the connection string was ever pasted anywhere public, then copy the fresh connection string.
2. Create the table, either way:
   - Neon **SQL Editor**: paste the contents of `db/schema.sql` and run it, or
   - `DATABASE_URL="postgresql://…" pnpm db:migrate`

## 2. Stripe keys
Stripe Dashboard → **Developers → API keys** (test mode). If the secret key was ever shared, **Roll key** first. Copy `sk_test_…` and `pk_test_…`.

## 3. Vercel environment variables
Project → **Settings → Environment Variables** (tick Production and Preview):

| Name | Value |
| --- | --- |
| `DATABASE_URL` | Neon connection string |
| `STRIPE_SECRET_KEY` | `sk_test_…` |
| `STRIPE_PUBLISHABLE_KEY` | `pk_test_…` (not used by the server yet; hosted Checkout doesn't need it) |
| `STRIPE_WEBHOOK_SECRET` | `whsec_…` (step 5) |
| `SITE_URL` | `https://neon-needle.vercel.app` (Production only; leave unset for Preview so it uses its own address) |

## 4. Deploy
Push to GitHub (see below); Vercel builds automatically. Settings it should detect: Framework **Vite**, build command `pnpm build`, output `dist`, Node 22. After changing any environment variable, **Redeploy** (Deployments → ⋯ → Redeploy).

## 5. Stripe webhook
Stripe → **Developers → Webhooks → Add destination**
- Events from: **Your account**, payload style **Snapshot**
- Events: `checkout.session.completed`, `checkout.session.expired`, `checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed`
- Destination type: **Webhook endpoint**
- URL: `https://neon-needle.vercel.app/api/payments/webhook`

Copy the **Signing secret** (`whsec_…`) into `STRIPE_WEBHOOK_SECRET` and redeploy.

## 6. Test
1. Make a booking on the site and pay with card `4242 4242 4242 4242`, any future expiry, any CVC.
2. In Neon: `select reference, status, deposit_cents from bookings order by id desc limit 5;` should show `deposit_paid`.
3. Stripe → Webhooks → your destination → **Event deliveries** should show `200`.
4. Apple Pay / Google Pay appear automatically on Checkout on supported devices (Stripe → Settings → Payment methods must have them enabled).

## 7. Going live
Webhook destinations and API keys are separate for test and live mode. Repeat steps 2 and 5 in **live mode**, swap the three Stripe values in Vercel, and redeploy. Also set `"index": true` in `.figma/make/site.json` (the site currently asks search engines not to index it).

## Git
```bash
git checkout -b stripe-checkout
pnpm install
pnpm test && pnpm build
git add -A
git status            # confirm no .env file is listed
git commit -m "Add Stripe Checkout (CAD), verified webhook and Neon booking records"
git push -u origin stripe-checkout
```
Open a pull request on GitHub and merge it; Vercel deploys the merge to production.

## Local development
`pnpm dev` runs only the website (no `/api`). To run the server functions locally use `npx vercel dev` with a `.env.local` (copy `.env.example`). `pnpm test` runs the payment tests against an in-memory database; no keys needed.
