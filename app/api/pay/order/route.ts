import { NextResponse } from "next/server";
import { PAYMENTS } from "@/lib/features";
import { PRICE_PAISE, createOrder, publicKeyId } from "@/lib/server/razorpay";
import { getPaid, getShare, recordOrder } from "@/lib/server/share";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** POST { name } -> Razorpay order for removing that link's watermark: { orderId, amount, currency, keyId } or { paid: true }. */
export async function POST(req: Request) {
  if (!PAYMENTS) return NextResponse.json({ error: "Payments are not set up" }, { status: 404 });
  const { name } = (await req.json().catch(() => ({}))) as { name?: string };
  const share = typeof name === "string" ? await getShare(name) : null;
  if (share?.kind !== "live") return NextResponse.json({ error: "No such invite link" }, { status: 404 });
  if (await getPaid(share.token)) return NextResponse.json({ paid: true });
  try {
    const order = await createOrder(share.token);
    await recordOrder(share.token, order.id);
    return NextResponse.json({ orderId: order.id, amount: PRICE_PAISE, currency: "INR", keyId: publicKeyId(), name: share.token });
  } catch (e: any) {
    return NextResponse.json({ error: "Could not start the payment: " + (e?.message || e) }, { status: 502 });
  }
}
