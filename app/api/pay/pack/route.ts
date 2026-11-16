import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { PAYMENTS } from "@/lib/features";
import { PACK_COVERS } from "@/lib/pricing";
import { recordPayment } from "@/lib/server/links";
import { coverByPack, getShare, hasPack, isOwnerKey } from "@/lib/server/share";
import { coupleBase } from "@/lib/slug";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST { from, fromKey, to: [{ name, key }] } -> { covered: string[] }
 * Clears the couple's other invites from the wedding pack bought on `from` (lib/pricing.ts). Every link must be
 * proven: the owner key of the pack's link AND of each link to clear, which only the phone that made them holds,
 * and the same couple's names (coupleBase: "1-aarav-ananya-haldi" and "2-aarav-ananya" are one couple). So a pack
 * cannot be lent to another couple or used from another phone. Safe to repeat. `covered`: the links that are clear
 * of the pack now (some may have been already).
 */
export async function POST(req: Request) {
  if (!PAYMENTS) return NextResponse.json({ error: "Payments are not set up" }, { status: 404 });
  const b = (await req.json().catch(() => null)) as { from?: string; fromKey?: string; to?: { name?: string; key?: string }[] } | null;
  const from = typeof b?.from === "string" ? b.from : "";
  const to = Array.isArray(b?.to) ? b!.to.slice(0, 20) : [];
  try {
    const holder = from ? await getShare(from) : null;
    if (!holder || !isOwnerKey(holder, b?.fromKey)) return NextResponse.json({ error: "Only the phone that bought the pack can use it" }, { status: 403 });
    if (!(await hasPack(from))) return NextResponse.json({ error: "No wedding pack on that invite" }, { status: 400 });
    const couple = coupleBase(from);
    const covered: string[] = [];
    for (const t of to) {
      const name = typeof t?.name === "string" ? t.name : "";
      if (!name || name === from || coupleBase(name) !== couple) continue;
      const share = await getShare(name);
      if (!share || share.kind !== "live" || !isOwnerKey(share, t.key)) continue;
      if (await coverByPack(name, from, PACK_COVERS)) {
        revalidatePath("/e/" + name); // drop the cached watermarked page
        await recordPayment(name, { paymentId: "pack:" + from, orderId: "pack", amountInr: 0, via: "pack" }).catch((e) => console.error("Pack cover not recorded:", e?.message));
      }
      covered.push(name);
    }
    return NextResponse.json({ covered });
  } catch (e: any) {
    // Storage could not be asked: the browser tries again later (the invite page retries on its next visit).
    return NextResponse.json({ error: "Could not apply the pack right now: " + (e?.message || e) }, { status: 502 });
  }
}
