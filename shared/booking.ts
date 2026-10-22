// Booking rules shared by the website (src/) and the server functions (api/).
// The server recalculates the deposit from these rules, so the amount a
// visitor sees can never be changed from the browser.

export const SERVICES = [
  "Custom design",
  "Flash piece",
  "Cover-up",
  "Rework / Touch-up",
  "Walk-in request",
  "Consultation only",
] as const

export const SIZES = [
  "Coin",
  "Palm",
  "Forearm",
  "Half sleeve",
  "Full sleeve",
  "Back piece",
] as const

export const CURRENCY = "cad"

/** Deposit in cents (CAD). Consultation-only requests need no deposit. */
export function depositCents(service: string, size: string): number {
  if (service === "Consultation only") return 0
  if (size === "Coin") return 2000
  if (size === "Palm") return 4000
  return 6000
}

export function formatMoney(cents: number): string {
  return `$${(cents / 100).toFixed(cents % 100 === 0 ? 0 : 2)}`
}

export type BookingStatus =
  | "pending_deposit"
  | "deposit_paid"
  | "consultation_requested"
  | "confirmed"
  | "completed"
  | "cancelled"

/** What the website sends to POST /api/checkout. */
export type BookingRequest = {
  service: string
  artist: string
  styles: string[]
  placement: string
  size: string
  idea: string
  budget: string
  first: string
  name: string
  email: string
  phone: string
  dob: string
  guardian: string
  health: string
  emergencyName: string
  emergencyPhone: string
  policy: boolean
}

/** Age in whole years from a YYYY-MM-DD date of birth, or null if invalid. */
export function ageFromDob(dob: string, now = new Date()): number | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dob)) return null
  const d = new Date(`${dob}T00:00:00Z`)
  if (Number.isNaN(d.getTime())) return null
  let age = now.getUTCFullYear() - d.getUTCFullYear()
  const m = now.getUTCMonth() - d.getUTCMonth()
  if (m < 0 || (m === 0 && now.getUTCDate() < d.getUTCDate())) age -= 1
  return age
}

/** Returns an error message, or null when the request is valid. */
export function validateBooking(b: Partial<BookingRequest>): string | null {
  const text = (v: unknown, max: number) =>
    typeof v === "string" && v.trim().length > 0 && v.length <= max
  if (!(SERVICES as readonly string[]).includes(b.service ?? ""))
    return "Please choose a service."
  if (!(SIZES as readonly string[]).includes(b.size ?? ""))
    return "Please choose a size."
  if (!text(b.artist, 60)) return "Please choose an artist."
  if (!text(b.placement, 60)) return "Please choose a placement."
  if (!text(b.idea, 1000) || (b.idea as string).trim().length < 20)
    return "Please describe your idea in a little more detail."
  if (!text(b.name, 120)) return "Please enter your name."
  if (
    !text(b.email, 254) ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(b.email as string)
  )
    return "Please enter a valid email address."
  if (b.phone && String(b.phone).length > 40) return "That phone number is too long."
  const age = ageFromDob(b.dob ?? "")
  if (age === null) return "Please enter your date of birth."
  if (age < 17) return "We can’t accept bookings for clients under 17."
  if (age === 17 && !text(b.guardian, 120))
    return "A parent or guardian name is required for 17-year-old clients."
  if (b.policy !== true) return "Please accept the booking and deposit policy."
  for (const k of ["health", "emergencyName", "emergencyPhone", "budget", "first"] as const)
    if (b[k] !== undefined && String(b[k]).length > 2000) return "One of the fields is too long."
  if (!Array.isArray(b.styles) || b.styles.length > 12) return "Invalid styles."
  return null
}
