import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { PAYMENTS } from "@/lib/features";
import { PRICE_PAISE, createOrder, publicKeyId } from "@/lib/server/razorpay";
import { getShare, isPaid, recordOrder } from "@/lib/server/share";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** POST { name } -> Razorpay order for removing that link's watermark: { orderId, amount, currency, keyId } or { paid: true }. */
export async function POST(req: Request) {
  if (!PAYMENTS) return NextResponse.json({ error: "Payments are not set up" }, { status: 404 });
  const { name } = (await req.json().catch(() => ({}))) as { name?: string };
  const share = typeof name === "string" ? await getShare(name) : null;
  if (share?.kind !== "live") return NextResponse.json({ error: "No such invite link" }, { status: 404 });
  try {
    if (await isPaid(share.token)) {
      // Already paid, yet someone still sees the watermark: refresh the cached page instead of charging again.
      revalidatePath("/e/" + share.token);
      return NextResponse.json({ paid: true });
    }
    const order = await createOrder(share.token);
    await recordOrder(share.token, order.id);
    return NextResponse.json({ orderId: order.id, amount: PRICE_PAISE, currency: "INR", keyId: publicKeyId(), name: share.token });
  } catch (e: any) {
    return NextResponse.json({ error: "Could not start the payment: " + (e?.message || e) }, { status: 502 });
  }
}
