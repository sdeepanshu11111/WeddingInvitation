import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { LEADS } from "@/lib/features";
import { savePaymentLead } from "@/lib/server/leads";
import { webhookSignatureValid } from "@/lib/server/razorpay";
import { markPaid, orderBelongsTo } from "@/lib/server/share";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Razorpay webhook (event: order.paid). Backup for when the buyer closes the
 * tab before Checkout's callback reaches /api/pay/verify. Set it up in the
 * Razorpay Dashboard → Webhooks with URL <site>/api/pay/webhook and the same
 * secret as RAZORPAY_WEBHOOK_SECRET.
 */
export async function POST(req: Request) {
  const raw = await req.text();
  if (!webhookSignatureValid(raw, req.headers.get("x-razorpay-signature"))) {
    return NextResponse.json({ error: "Bad signature" }, { status: 400 });
  }
  const event = JSON.parse(raw);
  if (event?.event !== "order.paid") return NextResponse.json({ ignored: event?.event ?? null });
  const order = event.payload?.order?.entity;
  const payment = event.payload?.payment?.entity;
  const name = order?.notes?.share;
  if (typeof name !== "string" || !(await orderBelongsTo(name, order.id))) return NextResponse.json({ ignored: "unknown order" });
  await markPaid(name, { orderId: order.id, paymentId: payment?.id ?? "", amount: order.amount_paid ?? 0, paidAt: Date.now() });
  if (LEADS) await savePaymentLead(name, { contact: payment?.contact, email: payment?.email, amount: order.amount_paid ?? 0 }).catch((e) => console.error("Lead not saved:", e?.message));
  revalidatePath("/e/" + name);
  return NextResponse.json({ ok: true });
}
