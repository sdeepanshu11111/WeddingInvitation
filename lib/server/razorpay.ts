import { createHmac, timingSafeEqual } from "node:crypto";
import { LINK_PRICE_INR } from "../features";

/* =====================================================================
 * Razorpay (Orders API + Checkout), called with fetch: no SDK needed.
 * Keys come from Vercel environment variables, never the browser:
 *   RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET   (Dashboard → Account & Settings → API Keys)
 *   RAZORPAY_WEBHOOK_SECRET                (Dashboard → Webhooks, event order.paid)
 * ===================================================================== */

const API = "https://api.razorpay.com/v1";
export const PRICE_PAISE = LINK_PRICE_INR * 100;

const keyId = () => process.env.RAZORPAY_KEY_ID ?? "";
const auth = () => "Basic " + Buffer.from(keyId() + ":" + (process.env.RAZORPAY_KEY_SECRET ?? "")).toString("base64");

async function api<T>(method: "GET" | "POST", path: string, body?: unknown): Promise<T> {
  const r = await fetch(API + path, {
    method,
    headers: { Authorization: auth(), "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });
  const json = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error("Razorpay " + r.status + ": " + (json?.error?.description ?? "request failed"));
  return json as T;
}

export type RzpOrder = { id: string; amount: number; amount_paid: number; currency: string; status: string; notes?: Record<string, string> };
/** contact and email: what the buyer typed into Checkout (kept as a lead, see lib/server/leads.ts). */
export type RzpPayment = { id: string; order_id: string; amount: number; currency: string; status: string; contact?: string; email?: string };

/** An order for removing the watermark from one share. notes.share ties the money to that link. */
export function createOrder(name: string) {
  return api<RzpOrder>("POST", "/orders", { amount: PRICE_PAISE, currency: "INR", receipt: name.slice(0, 40), notes: { share: name } });
}

/**
 * Confirms with Razorpay that the payment really went through for this order,
 * and captures it if the account does not auto-capture (uncaptured payments
 * are refunded after a few days).
 */
export async function confirmPayment(orderId: string, paymentId: string): Promise<RzpPayment> {
  let p = await api<RzpPayment>("GET", "/payments/" + encodeURIComponent(paymentId));
  if (p.order_id !== orderId) throw new Error("Payment does not belong to this order");
  if (p.status === "authorized") p = await api<RzpPayment>("POST", "/payments/" + encodeURIComponent(paymentId) + "/capture", { amount: p.amount, currency: p.currency });
  if (p.status !== "captured") throw new Error("Payment is " + p.status);
  return p;
}

const sameHex = (a: string, b: string) => a.length === b.length && timingSafeEqual(Buffer.from(a), Buffer.from(b));

/** Checkout's success callback signature: HMAC-SHA256(order_id|payment_id, key secret). */
export function checkoutSignatureValid(orderId: string, paymentId: string, signature: string) {
  const want = createHmac("sha256", process.env.RAZORPAY_KEY_SECRET ?? "").update(orderId + "|" + paymentId).digest("hex");
  return typeof signature === "string" && sameHex(want, signature);
}

/** Webhook signature: HMAC-SHA256(raw body, webhook secret), sent as X-Razorpay-Signature. */
export function webhookSignatureValid(rawBody: string, signature: string | null) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret || !signature) return false;
  return sameHex(createHmac("sha256", secret).update(rawBody).digest("hex"), signature);
}

export const publicKeyId = keyId;
