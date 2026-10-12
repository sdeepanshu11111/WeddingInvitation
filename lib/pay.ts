/* Browser side of paid links: Razorpay Checkout for removing a link's watermark.
   The server creates the order and verifies the payment (app/api/pay/*). */

import { BRAND } from "./brand";
import { LINK_PRICE_INR } from "./features";
import { inviteId, track } from "./analytics";
import { savedEmail, savedPhone } from "./contact";

let checkoutScript: Promise<void> | null = null;

/** Razorpay's checkout.js, loaded on first use only. */
function loadCheckout(): Promise<void> {
  if ((window as any).Razorpay) return Promise.resolve();
  checkoutScript ??= new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve();
    s.onerror = () => {
      checkoutScript = null;
      reject(new Error("Could not load Razorpay. Check your connection and try again."));
    };
    document.head.appendChild(s);
  });
  return checkoutScript;
}

/**
 * Opens Checkout for removing the watermark from /e/<name>.
 * Resolves "paid" once the server has confirmed the payment, "cancelled" if the buyer closed Checkout.
 */
export async function payToRemoveWatermark(name: string, title: string): Promise<"paid" | "cancelled"> {
  const invite_id = inviteId(name);
  track("payment_started", { invite_id, amount_inr: LINK_PRICE_INR });
  try {
    const r = await checkout(name, title, invite_id);
    if (r === "cancelled") track("payment_cancelled", { invite_id });
    return r;
  } catch (e) {
    track("payment_failed", { invite_id });
    throw e;
  }
}

async function checkout(name: string, title: string, invite_id: string): Promise<"paid" | "cancelled"> {
  const res = await fetch("/api/pay/order", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name }) });
  const order = await res.json();
  if (!res.ok) throw new Error(order.error || "Could not start the payment");
  if (order.paid) return "paid";
  await loadCheckout();
  return new Promise((resolve, reject) => {
    const rzp = new (window as any).Razorpay({
      key: order.keyId,
      order_id: order.orderId,
      amount: order.amount,
      currency: order.currency,
      name: BRAND,
      description: "Premium invite link (no watermark): " + title,
      theme: { color: "#d9b77c" },
      // What they gave in the Share step on this device: less to type.
      prefill: { contact: savedPhone() || undefined, email: savedEmail() || undefined },
      handler: async (r: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
        try {
          const v = await fetch("/api/pay/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, orderId: r.razorpay_order_id, paymentId: r.razorpay_payment_id, signature: r.razorpay_signature }),
          });
          const out = await v.json();
          if (v.ok) {
            track("payment_completed", { invite_id, amount_inr: order.amount / 100 }); // Razorpay amounts are in paise
            resolve("paid");
          }
          else reject(new Error(out.error || "Payment received but not confirmed yet. It will update within a minute."));
        } catch (e) {
          reject(e);
        }
      },
      // A failed attempt keeps Checkout open so the buyer can retry; closing it ends the flow.
      modal: { ondismiss: () => resolve("cancelled") },
    });
    rzp.open();
  });
}
