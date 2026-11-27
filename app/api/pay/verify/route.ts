import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { LEADS, PAYMENTS } from "@/lib/features";
import { checkoutSignatureValid, confirmPayment } from "@/lib/server/razorpay";
import { savePaymentLead } from "@/lib/server/leads";
import { markPaid, orderBelongsTo } from "@/lib/server/share";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST { name, orderId, paymentId, signature } from Checkout's success callback.
 * Checks the signature, that the order was made for this link, and with
 * Razorpay that the money was captured; then the watermark is removed.
 */
export async function POST(req: Request) {
  if (!PAYMENTS) return NextResponse.json({ error: "Payments are not set up" }, { status: 404 });
  const b = (await req.json().catch(() => ({}))) as Record<string, string>;
  const { name, orderId, paymentId, signature } = b;
  if (!checkoutSignatureValid(orderId, paymentId, signature)) return NextResponse.json({ error: "Payment signature is invalid" }, { status: 400 });
  if (!(await orderBelongsTo(name, orderId))) return NextResponse.json({ error: "That payment is for a different link" }, { status: 400 });
  try {
    const p = await confirmPayment(orderId, paymentId);
    await markPaid(name, { orderId, paymentId, amount: p.amount, paidAt: Date.now() });
    if (LEADS) await savePaymentLead(name, p).catch((e) => console.error("Lead not saved:", e?.message));
  } catch (e: any) {
    return NextResponse.json({ error: "Could not confirm the payment: " + (e?.message || e) }, { status: 502 });
  }
  revalidatePath("/e/" + name); // drop the cached watermarked page
  return NextResponse.json({ ok: true });
}
