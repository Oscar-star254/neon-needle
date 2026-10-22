import Stripe from "stripe"

let client: Stripe | undefined

/** One shared Stripe client, created on first use from STRIPE_SECRET_KEY. */
export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set")
  return (client ??= new Stripe(key))
}
