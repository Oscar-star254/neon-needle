import { getStripe } from "./_lib/stripe.js"
import { findByToken, markDepositPaid } from "./_lib/bookings.js"

const json = (body: unknown, status = 200) =>
  Response.json(body, { status, headers: { "Cache-Control": "no-store" } })

/**
 * GET /api/booking?t=<token>
 * Used by the confirmation page. The token is unguessable and only appears in
 * the link Stripe sends the client back to, so this exposes very little.
 */
export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("t") || ""
  if (!/^[a-f0-9]{32}$/.test(token)) return json({ error: "Not found" }, 404)

  let booking = await findByToken(token)
  if (!booking) return json({ error: "Not found" }, 404)

  // Safety net: if the client is back from Stripe but the webhook hasn't landed
  // yet, ask Stripe directly. markDepositPaid is idempotent, so this is safe.
  if (booking.status === "pending_deposit" && booking.stripe_session_id) {
    try {
      const session = await getStripe().checkout.sessions.retrieve(booking.stripe_session_id)
      if (session.payment_status === "paid") {
        await markDepositPaid({
          bookingId: booking.id,
          sessionId: session.id,
          paymentIntentId:
            typeof session.payment_intent === "string" ? session.payment_intent : null,
          amountCents: session.amount_total ?? -1,
          currency: session.currency ?? "",
        })
        booking = (await findByToken(token)) ?? booking
      }
    } catch (err) {
      console.error("Stripe session lookup failed", err)
    }
  }

  return json({
    reference: booking.reference,
    status: booking.status,
    artist: booking.artist,
    service: booking.service,
    firstName: String(booking.name).split(" ")[0],
    depositCents: booking.deposit_cents,
    currency: booking.currency,
  })
}
