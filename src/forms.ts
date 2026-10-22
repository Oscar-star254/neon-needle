import { STUDIO } from "./content";

// Set VITE_FORM_ENDPOINT at build time (for example a Formspree URL) and every form on the
// site posts there as JSON. Without it, forms fall back to opening the visitor's email app.
const ENDPOINT = import.meta.env.VITE_FORM_ENDPOINT as string | undefined;

export type SendResult = "sent" | "mailto" | "failed";

export async function sendForm(kind: string, fields: Record<string, string>): Promise<SendResult> {
  const subject = `[Neon Needle website] ${kind}`;
  if (ENDPOINT) {
    try {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ _subject: subject, ...fields }),
      });
      return res.ok ? "sent" : "failed";
    } catch {
      return "failed";
    }
  }
  const body = Object.entries(fields).filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`).join("\n");
  window.location.href = `mailto:${STUDIO.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  return "mailto";
}

export const usingEndpoint = Boolean(ENDPOINT);
