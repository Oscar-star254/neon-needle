import { query, type Row } from "./db.js"
import type { BookingRequest } from "../../shared/booking.js"

export type NewBooking = {
  request: BookingRequest
  depositCents: number
  status: "pending_deposit" | "consultation_requested"
  currency: string
}

/** Inserts a booking and returns its id, reference and public token. */
export async function createBooking(b: NewBooking): Promise<Row> {
  const r = b.request
  const details = {
    styles: r.styles,
    budget: r.budget,
    firstTattoo: r.first,
    dob: r.dob,
    guardian: r.guardian,
    health: r.health,
    emergencyName: r.emergencyName,
    emergencyPhone: r.emergencyPhone,
  }
  const rows = await query(
    `insert into bookings
       (reference, public_token, status, service, artist, placement, size, idea,
        name, email, phone, deposit_cents, currency, details)
     values
       ('NNS-' || to_char(now(), 'YYYY') || '-' || nextval('booking_ref_seq'),
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13::jsonb)
     returning id, reference, public_token`,
    [
      crypto.randomUUID().replace(/-/g, ""),
      b.status,
      r.service,
      r.artist,
      r.placement,
      r.size,
      r.idea.trim(),
      r.name.trim(),
      r.email.trim().toLowerCase(),
      r.phone?.trim() || null,
      b.depositCents,
      b.currency,
      JSON.stringify(details),
    ],
  )
  return rows[0]
}

export async function attachSession(id: number | string, sessionId: string) {
  await query(
    `update bookings set stripe_session_id = $2, updated_at = now() where id = $1`,
    [id, sessionId],
  )
}

/**
 * Marks a booking as deposit_paid. Only succeeds while the booking is still
 * pending and the amount Stripe collected matches the deposit we expected, so
 * running it twice (webhook retries, page polling) is harmless.
 * Returns true if this call changed the booking.
 */
export async function markDepositPaid(args: {
  bookingId: number | string
  sessionId: string
  paymentIntentId: string | null
  amountCents: number
  currency: string
}): Promise<boolean> {
  const rows = await query(
    `update bookings
        set status = 'deposit_paid',
            stripe_session_id = $2,
            stripe_payment_intent_id = $3,
            paid_at = now(),
            updated_at = now()
      where id = $1
        and status = 'pending_deposit'
        and deposit_cents = $4
        and currency = $5
      returning id`,
    [args.bookingId, args.sessionId, args.paymentIntentId, args.amountCents, args.currency],
  )
  return rows.length > 0
}

/** A checkout that expired unpaid: free up the pending booking. */
export async function markExpired(bookingId: number | string): Promise<boolean> {
  const rows = await query(
    `update bookings set status = 'cancelled', updated_at = now()
      where id = $1 and status = 'pending_deposit' returning id`,
    [bookingId],
  )
  return rows.length > 0
}

export async function findByToken(token: string): Promise<Row | undefined> {
  const rows = await query(
    `select id, reference, status, service, artist, name, deposit_cents,
            currency, stripe_session_id
       from bookings where public_token = $1`,
    [token],
  )
  return rows[0]
}
