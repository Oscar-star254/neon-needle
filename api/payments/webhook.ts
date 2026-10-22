import type Stripe from "stripe"
import { getStripe } from "../_lib/stripe.js"
import { markDepositPaid, markExpired } from "../_lib/bookings.js"

/**
 * POST /api/payments/webhook
 * Stripe calls this when a checkout finishes. The signature is verified with
 * STRIPE_WEBHOOK_SECRET so only real Stripe events are accepted.
 */
export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  const signature = request.headers.get("stripe-signature")
  if (!secret || !signature) return new Response("Missing signature", { status: 400 })

  // The raw, unparsed body is required for signature verification.
  const raw = await request.text()

  let event: Stripe.Event
  try {
    event = getStripe().webhooks.constructEvent(raw, signature, secret)
  } catch {
    return new Response("Invalid signature", { status: 400 })
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded": {
        const session = event.data.object as Stripe.Checkout.Session
        // "unpaid" means a delayed payment method is still pending; wait for
        // the async_payment_succeeded event instead.
        const bookingId = session.metadata?.bookingId
        if (bookingId && session.payment_status === "paid") {
          const intent =
            typeof session.payment_intent === "string"
              ? session.payment_intent
              : (session.payment_intent?.id ?? null)
          await markDepositPaid({
            bookingId,
            sessionId: session.id,
            paymentIntentId: intent,
            amountCents: session.amount_total ?? -1,
            currency: session.currency ?? "",
          })
        }
        break
      }
      case "checkout.session.expired": {
        const session = event.data.object as Stripe.Checkout.Session
        if (session.metadata?.bookingId) await markExpired(session.metadata.bookingId)
        break
      }
      default:
        break // other events are ignored
    }
  } catch (err) {
    // A 500 makes Stripe retry later, which is what we want for a database blip.
    console.error("Webhook handling failed", event.type, err)
    return new Response("Webhook handler failed", { status: 500 })
  }

  return Response.json({ received: true })
}
