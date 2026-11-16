import { checkoutDevice, recordPayment } from "./links";
import { trackPaymentConfirmed } from "./mixpanel";

/**
 * Bookkeeping once a payment is confirmed, for both /api/pay/verify (the browser's callback) and /api/pay/webhook
 * (Razorpay's own report): the payment goes on the link's record (idempotent by payment id), and whoever recorded
 * it first (`fresh`, what markPaid() returned) sends the server's one `payment_confirmed` event to Mixpanel.
 * Never throws: by now the link is unlocked, and a bookkeeping error must not become "could not confirm the payment"
 * for the buyer or a retry storm from Razorpay.
 */
export async function afterPayment(link: string, p: { paymentId: string; orderId: string; amountInr: number; templateId: string; via: "checkout" | "webhook" }, fresh: boolean) {
  await recordPayment(link, p).catch((e) => console.error("Payment not recorded:", e?.message));
  if (!fresh) return;
  const device = await checkoutDevice(link, p.orderId).catch(() => null);
  await trackPaymentConfirmed(link, { ...p, device });
}
