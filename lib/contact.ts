/* How we can reach the couple: a WhatsApp number or an email (one of them), optional, left in the owner sheet on their
   own invite page (app/e/[slug]/LiveInvite.tsx; before 2026-10-21 in the "Get link" step)
   (lead capture), and reused to pre-fill Razorpay Checkout. Shared by the browser and the server, so both
   accept exactly the same input. */

/** Which notice the person saw when they gave their details (stored with the lead as proof of consent).
    Change it whenever the wording under the fields changes. */
export const CONTACT_NOTICE = "invite-page-contact-2026-10-21";

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

/**
 * Keeps the phone field to what can still become a valid number, as they type or paste. Next to the fixed
 * "+91": 10 digits shown as "98765 43210" (11 with a leading 0, 12 with a leading 91, which is then dropped);
 * a typed or pasted "+91" moves to that fixed prefix. Other countries: "+" and up to 15 digits.
 */
export function typingPhone(input: string): string {
  let raw = input.trimStart().replace(/^00/, "+"); // trimStart: a space typed after "+1" has to stay
  if (/^\+\s*9\s*1/.test(raw)) raw = raw.replace(/^\+\s*9\s*1/, "");
  if (raw.startsWith("+")) {
    let n = 0;
    return "+" + raw.slice(1).replace(/[^\d ]/g, "").replace(/\d/g, (c) => (++n <= 15 ? c : "")).replace(/ {2,}/g, " ");
  }
  let d = raw.replace(/\D/g, "");
  if (d.startsWith("0")) return d.slice(0, 11);
  if (d.startsWith("91") && d.length > 10) return d.length >= 12 ? typingPhone(d.slice(2, 12)) : d;
  d = d.slice(0, 10);
  return d.length > 5 ? d.slice(0, 5) + " " + d.slice(5) : d;
}

/** "+919876543210" → "+91 98765 43210"; other countries as stored. */
export const formatPhone = (e164: string) => (/^\+91\d{10}$/.test(e164) ? `+91 ${e164.slice(3, 8)} ${e164.slice(8)}` : e164);

/** " Priya@Gmail.com " → "priya@gmail.com"; null unless it looks like name@domain.tld. */
export function normalizeEmail(input: string): string | null {
  const e = input.trim().toLowerCase();
  return e.length <= 254 && /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)*\.[^\s@.]{2,}$/.test(e) ? e : null; // "gmail.c" is a typo
}

/* What they typed last, kept on their own device so the next link and Checkout are pre-filled. */
const read = (key: string) => {
  try {
    return localStorage.getItem(key) ?? "";
  } catch {
    return ""; // private mode or blocked storage
  }
};
export const savedPhone = () => read("fp.whatsapp");
export const savedEmail = () => read("fp.email");
export function rememberContact(phone: string | null, email: string | null) {
  try {
    if (phone) localStorage.setItem("fp.whatsapp", phone);
    if (email) localStorage.setItem("fp.email", email);
  } catch {}
}
