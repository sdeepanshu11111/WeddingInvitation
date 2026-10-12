/* WhatsApp numbers: asked for in the Share step (lead capture), reused to pre-fill Razorpay Checkout.
   Shared by the editor and the server, so both accept exactly the same numbers. */

/** Which notice the person saw when they gave their number (stored with the lead as proof of consent).
    Change it whenever the wording under the field changes. */
export const PHONE_NOTICE = "share-whatsapp-2026-10-12";

/**
 * "98765 43210", "098765-43210", "+91 98765 43210" or "919876543210" → "+919876543210".
 * Numbers outside India need a "+" and country code ("+1 415 555 0100" → "+14155550100").
 * Anything else → null.
 */
export function normalizePhone(input: string): string | null {
  const raw = input.trim();
  let d = raw.replace(/\D/g, "");
  if (raw.startsWith("+") || raw.startsWith("00")) {
    if (raw.startsWith("00")) d = d.slice(2);
    if (d.startsWith("91")) return /^91[6-9]\d{9}$/.test(d) ? "+" + d : null;
    return /^[1-9]\d{7,14}$/.test(d) ? "+" + d : null; // E.164: up to 15 digits with the country code
  }
  if (d.length === 12 && d.startsWith("91")) d = d.slice(2);
  else if (d.length === 11 && d.startsWith("0")) d = d.slice(1);
  return /^[6-9]\d{9}$/.test(d) ? "+91" + d : null; // Indian mobiles start with 6-9
}

/** "+919876543210" → "+91 98765 43210"; other countries as stored. */
export const formatPhone = (e164: string) => (/^\+91\d{10}$/.test(e164) ? `+91 ${e164.slice(3, 8)} ${e164.slice(8)}` : e164);

/* The number they typed last, kept on their own device so the next link and Checkout are pre-filled. */
const KEY = "fp.whatsapp";
export function savedPhone(): string {
  try {
    return localStorage.getItem(KEY) ?? "";
  } catch {
    return ""; // private mode or blocked storage
  }
}
export function rememberPhone(e164: string) {
  try {
    localStorage.setItem(KEY, e164);
  } catch {}
}
