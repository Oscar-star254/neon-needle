import { readFileSync } from "node:fs"
import { PGlite } from "@electric-sql/pglite"
import Stripe from "stripe"
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest"

// --- Test doubles -----------------------------------------------------------
// Real Postgres (in memory) for the bookings table, and a real Stripe client
// whose only network call (creating/retrieving a Checkout Session) is stubbed.
// Webhook signatures are verified by Stripe's real verification code.
const h = vi.hoisted(() => ({
  db: null as any,
  create: vi.fn(),
  retrieve: vi.fn(),
}))

vi.mock("../api/_lib/db.js", () => ({
  query: async (text: string, params: unknown[] = []) =>
    (await h.db.query(text, params)).rows,
}))
vi.mock("../api/_lib/stripe.js", () => {
  const stripe = new Stripe("sk_test_dummy")
  ;(stripe.checkout.sessions as any).create = h.create
  ;(stripe.checkout.sessions as any).retrieve = h.retrieve
  return { getStripe: () => stripe }
})

import { POST as checkout } from "../api/checkout"
import { POST as webhook } from "../api/payments/webhook"
import { GET as lookup } from "../api/booking"

const SECRET = "whsec_test_secret"
const stripeForSigning = new Stripe("sk_test_dummy")

const validBooking = {
  service: "Custom design",
  artist: "Maya",
  styles: ["Fine line"],
  placement: "Arm",
  size: "Palm",
  idea: "A small sprig of lavender on my forearm, fine line.",
  budget: "$80–$150",
  first: "Yes",
  name: "Jamie Doe",
  email: "jamie@example.com",
  phone: "416 555 0100",
  dob: "1995-04-12",
  guardian: "",
  health: "None",
  emergencyName: "Sam",
  emergencyPhone: "416 555 0101",
  policy: true,
}

const post = (url: string, body: unknown) =>
  new Request(`https://example.test${url}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })

async function book(overrides: Record<string, unknown> = {}) {
  const res = await checkout(post("/api/checkout", { ...validBooking, ...overrides }))
  return { res, body: await res.json() }
}
const rowFor = async (n = 1) =>
  (await h.db.query("select * from bookings order by id limit 1 offset $1", [n - 1])).rows[0]

function signedEvent(type: string, session: Record<string, unknown>, secret = SECRET) {
  const payload = JSON.stringify({
    id: "evt_test",
    object: "event",
    type,
    data: { object: { object: "checkout.session", ...session } },
  })
  const header = stripeForSigning.webhooks.generateTestHeaderString({ payload, secret })
  return new Request("https://example.test/api/payments/webhook", {
    method: "POST",
    headers: { "stripe-signature": header },
    body: payload,
  })
}

beforeAll(async () => {
  process.env.STRIPE_WEBHOOK_SECRET = SECRET
  process.env.SITE_URL = "https://neon-needle.test"
  h.db = new PGlite()
  await h.db.exec(readFileSync("db/schema.sql", "utf8"))
})

beforeEach(async () => {
  await h.db.exec("truncate bookings restart identity")
  h.create.mockReset()
  h.retrieve.mockReset()
  h.create.mockResolvedValue({ id: "cs_test_1", url: "https://checkout.stripe.test/pay/cs_test_1" })
})

// --- POST /api/checkout -----------------------------------------------------
describe("POST /api/checkout", () => {
  it("saves the booking and returns the Stripe Checkout URL", async () => {
    const { res, body } = await book()
    expect(res.status).toBe(200)
    expect(body.url).toBe("https://checkout.stripe.test/pay/cs_test_1")

    const row = await rowFor()
    expect(row.status).toBe("pending_deposit")
    expect(row.deposit_cents).toBe(4000)
    expect(row.currency).toBe("cad")
    expect(row.stripe_session_id).toBe("cs_test_1")
    expect(row.reference).toMatch(/^NNS-\d{4}-\d{5}$/)
    expect(row.email).toBe("jamie@example.com")
    expect(row.details.health).toBe("None")
  })

  it("creates a CAD session with the booking id in metadata and return links", async () => {
    await book()
    const [params, options] = h.create.mock.calls[0]
    const row = await rowFor()
    expect(params.mode).toBe("payment")
    expect(params.line_items[0].price_data.currency).toBe("cad")
    expect(params.line_items[0].price_data.unit_amount).toBe(4000)
    expect(params.metadata.bookingId).toBe(String(row.id))
    expect(params.success_url).toBe(
      `https://neon-needle.test/book/confirmation/${row.reference}?t=${row.public_token}`,
    )
    expect(params.cancel_url).toBe("https://neon-needle.test/book?cancelled=1")
    expect(params.payment_method_types).toBeUndefined() // lets Stripe show Apple/Google Pay
    expect(options.idempotencyKey).toBe(`booking-${row.id}`)
  })

  it("ignores any deposit amount sent by the browser", async () => {
    await book({ depositCents: 1, deposit: "$0", size: "Coin" })
    expect(h.create.mock.calls[0][0].line_items[0].price_data.unit_amount).toBe(2000)
  })

  it("charges $60 for larger sizes", async () => {
    await book({ size: "Half sleeve" })
    expect(h.create.mock.calls[0][0].line_items[0].price_data.unit_amount).toBe(6000)
  })

  it("skips payment for consultation-only requests", async () => {
    const { res, body } = await book({ service: "Consultation only" })
    expect(res.status).toBe(200)
    expect(h.create).not.toHaveBeenCalled()
    expect((await rowFor()).status).toBe("consultation_requested")
    expect(body.url).toContain("/book/confirmation/NNS-")
  })

  it.each([
    ["under 17", { dob: new Date(Date.now() - 16 * 365.25 * 864e5).toISOString().slice(0, 10) }],
    ["17 without guardian", { dob: new Date(Date.now() - 17.5 * 365.25 * 864e5).toISOString().slice(0, 10), guardian: "" }],
    ["bad email", { email: "not-an-email" }],
    ["idea too short", { idea: "tiny" }],
    ["policy not accepted", { policy: false }],
    ["unknown service", { service: "Free tattoo" }],
  ])("rejects %s without saving or charging", async (_label, overrides) => {
    const { res } = await book(overrides)
    expect(res.status).toBe(400)
    expect(h.create).not.toHaveBeenCalled()
    expect((await h.db.query("select count(*)::int as n from bookings")).rows[0].n).toBe(0)
  })

  it("accepts a 17-year-old with a guardian name", async () => {
    const dob = new Date(Date.now() - 17.5 * 365.25 * 864e5).toISOString().slice(0, 10)
    const { res } = await book({ dob, guardian: "Pat Doe" })
    expect(res.status).toBe(200)
  })

  it("returns a friendly error if Stripe fails", async () => {
    h.create.mockRejectedValue(new Error("stripe down"))
    const { res, body } = await book()
    expect(res.status).toBe(502)
    expect(body.error).toMatch(/start the payment/)
  })
})

// --- POST /api/payments/webhook --------------------------------------------
describe("POST /api/payments/webhook", () => {
  const paidSession = (id: number, over: Record<string, unknown> = {}) => ({
    id: "cs_test_1",
    metadata: { bookingId: String(id) },
    payment_status: "paid",
    amount_total: 4000,
    currency: "cad",
    payment_intent: "pi_123",
    ...over,
  })

  it("rejects a missing or invalid signature", async () => {
    await book()
    const noSig = await webhook(new Request("https://example.test/x", { method: "POST", body: "{}" }))
    expect(noSig.status).toBe(400)
    const bad = await webhook(signedEvent("checkout.session.completed", paidSession(1), "whsec_wrong"))
    expect(bad.status).toBe(400)
    expect((await rowFor()).status).toBe("pending_deposit")
  })

  it("marks the booking deposit_paid on checkout.session.completed", async () => {
    await book()
    const { id } = await rowFor()
    const res = await webhook(signedEvent("checkout.session.completed", paidSession(id)))
    expect(res.status).toBe(200)
    const row = await rowFor()
    expect(row.status).toBe("deposit_paid")
    expect(row.stripe_payment_intent_id).toBe("pi_123")
    expect(row.paid_at).not.toBeNull()
  })

  it("is safe to receive twice", async () => {
    await book()
    const { id } = await rowFor()
    await webhook(signedEvent("checkout.session.completed", paidSession(id)))
    const first = (await rowFor()).paid_at
    const again = await webhook(signedEvent("checkout.session.completed", paidSession(id)))
    expect(again.status).toBe(200)
    expect((await rowFor()).paid_at).toEqual(first)
  })

  it("does not mark paid if the amount doesn't match the deposit", async () => {
    await book()
    const { id } = await rowFor()
    await webhook(signedEvent("checkout.session.completed", paidSession(id, { amount_total: 100 })))
    expect((await rowFor()).status).toBe("pending_deposit")
  })

  it("waits for delayed payments, then confirms on async success", async () => {
    await book()
    const { id } = await rowFor()
    await webhook(signedEvent("checkout.session.completed", paidSession(id, { payment_status: "unpaid" })))
    expect((await rowFor()).status).toBe("pending_deposit")
    await webhook(signedEvent("checkout.session.async_payment_succeeded", paidSession(id)))
    expect((await rowFor()).status).toBe("deposit_paid")
  })

  it("cancels an unpaid booking when checkout expires, but never a paid one", async () => {
    await book()
    await book()
    const a = await rowFor(1)
    const b = await rowFor(2)
    await webhook(signedEvent("checkout.session.completed", paidSession(b.id, { id: "cs_b" })))
    await webhook(signedEvent("checkout.session.expired", { id: "cs_a", metadata: { bookingId: String(a.id) } }))
    await webhook(signedEvent("checkout.session.expired", { id: "cs_b", metadata: { bookingId: String(b.id) } }))
    expect((await rowFor(1)).status).toBe("cancelled")
    expect((await rowFor(2)).status).toBe("deposit_paid")
  })

  it("ignores events it doesn't handle", async () => {
    const res = await webhook(signedEvent("charge.refunded", { id: "ch_1" }))
    expect(res.status).toBe(200)
  })
})

// --- GET /api/booking --------------------------------------------------------
describe("GET /api/booking", () => {
  const get = (t: string) => lookup(new Request(`https://example.test/api/booking?t=${t}`))

  it("returns 404 for a bad or unknown token", async () => {
    expect((await get("nope")).status).toBe(404)
    expect((await get("a".repeat(32))).status).toBe(404)
  })

  it("returns only the safe fields", async () => {
    await book()
    const { public_token } = await rowFor()
    h.retrieve.mockResolvedValue({ id: "cs_test_1", payment_status: "unpaid" })
    const body = await (await get(public_token)).json()
    expect(body.status).toBe("pending_deposit")
    expect(Object.keys(body).sort()).toEqual(
      ["artist", "currency", "depositCents", "firstName", "reference", "service", "status"].sort(),
    )
    expect(JSON.stringify(body)).not.toContain("jamie@example.com")
  })

  it("confirms payment directly with Stripe if the webhook is late", async () => {
    await book()
    const { public_token } = await rowFor()
    h.retrieve.mockResolvedValue({
      id: "cs_test_1",
      payment_status: "paid",
      amount_total: 4000,
      currency: "cad",
      payment_intent: "pi_late",
    })
    const body = await (await get(public_token)).json()
    expect(body.status).toBe("deposit_paid")
    expect((await rowFor()).status).toBe("deposit_paid")
  })
})
