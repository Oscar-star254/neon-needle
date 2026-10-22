import { getStripe } from "./_lib/stripe.js"
import { attachSession, createBooking } from "./_lib/bookings.js"
import {
  CURRENCY,
  depositCents,
  validateBooking,
  type BookingRequest,
} from "../shared/booking.js"

const json = (body: unknown, status = 200) =>
  Response.json(body, { status, headers: { "Cache-Control": "no-store" } })

/**
 * POST /api/checkout
 * Saves the booking request, then (when a deposit is due) creates a hosted
 * Stripe Checkout Session in CAD and returns its URL for the browser to open.
 */
export async function POST(request: Request) {
  let body: Partial<BookingRequest>
  try {
    body = await request.json()
  } catch {
    return json({ error: "Invalid request." }, 400)
  }

  const problem = validateBooking(body)
  if (problem) return json({ error: problem }, 400)
  const booking = body as BookingRequest

  // The deposit is always calculated here, never taken from the browser.
  const cents = depositCents(booking.service, booking.size)
  const siteUrl = (process.env.SITE_URL || new URL(request.url).origin).replace(/\/$/, "")

  let saved
  try {
    saved = await createBooking({
      request: booking,
      depositCents: cents,
      status: cents === 0 ? "consultation_requested" : "pending_deposit",
      currency: CURRENCY,
    })
  } catch (err) {
    console.error("createBooking failed", err)
    return json({ error: "We couldn’t save your booking. Please try again." }, 500)
  }

  const confirmation = `/book/confirmation/${saved.reference}?t=${saved.public_token}`

  // Consultation-only requests are free: no payment step.
  if (cents === 0) return json({ url: `${siteUrl}${confirmation}` })

  try {
    const session = await getStripe().checkout.sessions.create(
      {
        mode: "payment",
        line_items: [
          {
            quantity: 1,
            price_data: {
              currency: CURRENCY,
              unit_amount: cents,
              product_data: {
                name: `Tattoo deposit · ${saved.reference}`,
                description: `${booking.service} with ${booking.artist}`,
              },
            },
          },
        ],
        customer_email: booking.email.trim(),
        client_reference_id: saved.reference,
        metadata: { bookingId: String(saved.id), reference: saved.reference },
        payment_intent_data: {
          metadata: { bookingId: String(saved.id), reference: saved.reference },
        },
        success_url: `${siteUrl}${confirmation}`,
        cancel_url: `${siteUrl}/book?cancelled=1`,
      },
      { idempotencyKey: `booking-${saved.id}` },
    )
    await attachSession(saved.id, session.id)
    return json({ url: session.url })
  } catch (err) {
    console.error("Stripe checkout failed", err)
    return json({ error: "We couldn’t start the payment. Please try again." }, 502)
  }
}
