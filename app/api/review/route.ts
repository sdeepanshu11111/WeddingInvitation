import { NextResponse } from "next/server";
import { LEADS } from "@/lib/features";
import { saveInviteReview } from "@/lib/server/reviews";
import { getLiveProject, getShare, isOwnerKey, isPaid } from "@/lib/server/share";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST { name, key, rating, text?, displayName?, city?, consent } -> { ok: true }
 * The couple rates their own invite from the owner sheet on /e/<name>. Only the browser that made the link holds
 * `key` (lib/server/share.ts, "Owner key"), so a review here is always from someone who really made an invite.
 * It waits on /admin/reviews; nothing reaches the website until the owner approves it and the couple allowed it.
 */
export async function POST(req: Request) {
  if (!LEADS) return NextResponse.json({ error: "Not available" }, { status: 404 });
  const body = await req.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name : "";
  try {
    const share = name ? await getShare(name) : null;
    if (!share || !isOwnerKey(share, body?.key)) return NextResponse.json({ error: "Only the person who made this invite can review it" }, { status: 403 });
    const project = await getLiveProject(name).catch(() => null);
    const paid = await isPaid(name).catch(() => false);
    await saveInviteReview(name, { rating: body?.rating, text: body?.text, name: body?.displayName, city: body?.city, consent: body?.consent }, { template_id: String(project?.templateId ?? ""), paid });
  } catch (e: any) {
    const bad = /stars/.test(e?.message ?? "");
    if (!bad) console.error("Review not saved:", e?.message); // never the review itself
    return NextResponse.json({ error: bad ? e.message : "Could not save it right now. Please try again." }, { status: bad ? 400 : 500 });
  }
  return NextResponse.json({ ok: true });
}
