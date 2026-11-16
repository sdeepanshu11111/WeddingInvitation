import { MIXPANEL_API_HOST, MIXPANEL_TOKEN } from "../features";
import { inviteId } from "../inviteId";

/* The one event the server sends to Mixpanel: `payment_confirmed`, the true count of sales.
   The browser's `payment_completed` (lib/pay.ts) is lost whenever the buyer's tab dies before Checkout's callback
   runs (a UPI app switch on Android can do that), and then only Razorpay's webhook unlocks the link. This event is
   sent by whichever of /api/pay/verify and /api/pay/webhook records the payment first (markPaid() returns true once
   per payment), so there is exactly one per payment whatever the browser did.

   distinct_id is the buyer's anonymous Mixpanel device id, which the browser hands over when it opens Checkout
   (kept with the link's checkout record), so the sale lands on the same person as their other events. Without it
   (tracking blocked, or records off) the event still exists, under a per-invite id.
   No names: the link is identified by invite_id, as everywhere in Mixpanel. Never throws, never slows a payment
   by more than its timeout. Off wherever Mixpanel is off (no token outside production). */

export async function trackPaymentConfirmed(link: string, p: { paymentId: string; orderId: string; amountInr: number; templateId: string; via: "checkout" | "webhook"; device: string | null }) {
  if (!MIXPANEL_TOKEN) return;
  const invite_id = inviteId(link);
  const device = p.device && /^[$\w:-]{8,80}$/.test(p.device) ? p.device : null;
  const event = {
    event: "payment_confirmed",
    properties: {
      token: MIXPANEL_TOKEN,
      distinct_id: device ?? "invite:" + invite_id,
      ...(device ? { $device_id: device.replace(/^\$device:/, "") } : {}),
      time: Math.floor(Date.now() / 1000),
      // One per payment even if this is ever sent twice: Mixpanel drops a repeat of the same $insert_id.
      $insert_id: ("pay-" + (p.paymentId || p.orderId)).replace(/[^A-Za-z0-9-]/g, "-").slice(0, 36),
      surface: "server",
      invite_id,
      template_id: p.templateId || undefined,
      amount_inr: p.amountInr,
      via: p.via,
      has_device: !!device,
    },
  };
  try {
    // ip=0: do not take the server's address for the buyer's location.
    const r = await fetch(MIXPANEL_API_HOST + "/track?ip=0&verbose=1", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify([event]),
      cache: "no-store",
      signal: AbortSignal.timeout(2500),
    });
    if (!r.ok) console.error("Mixpanel payment_confirmed not accepted:", r.status);
  } catch (e: any) {
    console.error("Mixpanel payment_confirmed not sent:", e?.message);
  }
}
