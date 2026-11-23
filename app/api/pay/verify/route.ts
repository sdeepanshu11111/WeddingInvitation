import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { LEADS, PAYMENTS } from "@/lib/features";
import { checkoutSignatureValid, confirmPayment } from "@/lib/server/razorpay";
import { savePaymentLead } from "@/lib/server/leads";
import { afterPayment } from "@/lib/server/afterPayment";
import { priceForLink } from "@/lib/pricing";
import { getLiveProject, getShare, markPack, markPaid, orderBelongsTo, orderIsPack } from "@/lib/server/share";

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
  try {
    // Inside the try: if storage cannot be asked right now, answer 502 so the browser retries (a 4xx is final).
    if (!(await orderBelongsTo(name, orderId))) return NextResponse.json({ error: "That payment is for a different link" }, { status: 400 });
    const p = await confirmPayment(orderId, paymentId);
    const project = await getLiveProject(name);
    // A wedding pack pays more than this one design costs on purpose: no "REFUND NEEDED" for it (markPaid).
    const pack = await orderIsPack(name, orderId);
    const fresh = await markPaid(name, { orderId, paymentId, amount: p.amount, paidAt: Date.now() }, pack ? Number.MAX_SAFE_INTEGER : await linkPrice(name, project?.templateId ?? ""));
    if (pack) await markPack(name, { orderId, paymentId }); // this link now holds the couple's pack (app/api/pay/pack)
    if (LEADS) await savePaymentLead(name, p).catch((e) => console.error("Lead not saved:", e?.message));
    await afterPayment(name, { paymentId, orderId, amountInr: Math.round(p.amount / 100), templateId: project?.templateId ?? "", via: "checkout" }, fresh);
  } catch (e: any) {
    return NextResponse.json({ error: "Could not confirm the payment: " + (e?.message || e) }, { status: 502 });
  }
  revalidatePath("/e/" + name); // drop the cached watermarked page
  return NextResponse.json({ ok: true });
}

/** What this link costs (lib/pricing.ts, priceForLink: links made before the flat price keep their old one). */
async function linkPrice(name: string, templateId: string): Promise<number> {
  const share = await getShare(name);
  return priceForLink(templateId, share?.kind === "live" ? share : { createdAt: Date.now(), flat: true });
}
