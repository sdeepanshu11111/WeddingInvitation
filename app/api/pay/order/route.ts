import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { PAYMENTS } from "@/lib/features";
import { PACK_PRICE_INR, packCovers, priceForLink } from "@/lib/pricing";
import { createOrder, publicKeyId } from "@/lib/server/razorpay";
import { recordCheckout } from "@/lib/server/links";
import { amountDue, getLiveProject, getShare, isOwnerKey, recordOrder } from "@/lib/server/share";
import { leadContact } from "@/lib/server/leads";
import { LEADS } from "@/lib/features";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** POST { name, device?, pack? } -> Razorpay order for what is still due on that link (its design's price, lib/pricing.ts; never an
    amount from the browser): { orderId, amount, currency, keyId }, or { paid: true } when nothing is due.
    pack: the wedding pack instead (PACK_PRICE_INR), offered only on a watermarked invite whose design it covers.
    device: the buyer's anonymous Mixpanel id, kept with the checkout record so the server's `payment_confirmed`
    lands on the same person (lib/server/mixpanel.ts).
    key: the couple's owner key, sent only when their browser has no saved number: the answer then carries
    `prefill` (the number given at Get wedding link) so Razorpay Checkout opens with it filled in. Never without the key. */
export async function POST(req: Request) {
  if (!PAYMENTS) return NextResponse.json({ error: "Payments are not set up" }, { status: 404 });
  const { name, device, pack, key } = (await req.json().catch(() => ({}))) as { name?: string; device?: string; pack?: boolean; key?: string };
  try {
    // Inside the try: a storage error is "try again" (502), not "no such link".
    const share = typeof name === "string" ? await getShare(name) : null;
    if (share?.kind !== "live") return NextResponse.json({ error: "No such invite link" }, { status: 404 });
    const project = await getLiveProject(share.token);
    if (!project) return NextResponse.json({ error: "No such invite link" }, { status: 404 });
    const price = priceForLink(project.templateId, share); // a link made while its design was free costs 0
    const due = await amountDue(share.token, price);
    if (due <= 0) {
      // Nothing to pay (paid, or a free design), yet someone still sees the watermark: refresh the cached page.
      revalidatePath("/e/" + share.token);
      return NextResponse.json({ paid: true });
    }
    if (pack === true && !packCovers(price)) return NextResponse.json({ error: "The wedding pack doesn't cover this design" }, { status: 400 });
    const amount = pack === true ? PACK_PRICE_INR : due;
    const order = await createOrder(share.token, amount * 100, pack === true);
    await recordOrder(share.token, order.id, pack === true);
    // The checkout attempt on the link's record: an order with no payment after it is someone who tried to pay.
    await recordCheckout(share.token, { orderId: order.id, amountInr: amount, device: typeof device === "string" ? device.slice(0, 80) : null }).catch((e) =>
      console.error("Checkout not recorded:", e?.message),
    );
    // The couple's own number for Checkout, when their browser lost it (best effort: no number is no reason to fail).
    const prefill = LEADS && key && isOwnerKey(share, key) ? await leadContact(share.token).catch(() => null) : null;
    return NextResponse.json({
      orderId: order.id,
      amount: amount * 100,
      currency: "INR",
      keyId: publicKeyId(),
      name: share.token,
      ...(prefill?.phone || prefill?.email ? { prefill: { contact: prefill.phone ?? undefined, email: prefill.email ?? undefined } } : null),
    });
  } catch (e: any) {
    return NextResponse.json({ error: "Could not start the payment: " + (e?.message || e) }, { status: 502 });
  }
}
