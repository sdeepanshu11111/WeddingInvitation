import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { PAYMENTS } from "@/lib/features";
import { priceOf } from "@/lib/pricing";
import { createOrder, publicKeyId } from "@/lib/server/razorpay";
import { amountDue, getLiveProject, getShare, recordOrder } from "@/lib/server/share";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** POST { name } -> Razorpay order for what is still due on that link (its design's price, lib/pricing.ts; never an
    amount from the browser): { orderId, amount, currency, keyId }, or { paid: true } when nothing is due. */
export async function POST(req: Request) {
  if (!PAYMENTS) return NextResponse.json({ error: "Payments are not set up" }, { status: 404 });
  const { name } = (await req.json().catch(() => ({}))) as { name?: string };
  try {
    // Inside the try: a storage error is "try again" (502), not "no such link".
    const share = typeof name === "string" ? await getShare(name) : null;
    if (share?.kind !== "live") return NextResponse.json({ error: "No such invite link" }, { status: 404 });
    const project = await getLiveProject(share.token);
    if (!project) return NextResponse.json({ error: "No such invite link" }, { status: 404 });
    const due = await amountDue(share.token, priceOf(project.templateId));
    if (due <= 0) {
      // Nothing to pay (paid, or a free design), yet someone still sees the watermark: refresh the cached page.
      revalidatePath("/e/" + share.token);
      return NextResponse.json({ paid: true });
    }
    const order = await createOrder(share.token, due * 100);
    await recordOrder(share.token, order.id);
    return NextResponse.json({ orderId: order.id, amount: due * 100, currency: "INR", keyId: publicKeyId(), name: share.token });
  } catch (e: any) {
    return NextResponse.json({ error: "Could not start the payment: " + (e?.message || e) }, { status: 502 });
  }
}
