import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { LEADS, VIDEO_EXPORT, exportOff } from "@/lib/features";
import { CONTACT_NOTICE, normalizeEmail, normalizePhone } from "@/lib/contact";
import { slugify } from "@/lib/slug";
import { saveShareLead } from "@/lib/server/leads";
import { ShareError, createLiveShare, createVideoShare, lanOrigin, newOwnerKey, nextNumberedName, numberedBase, ownerKeyHash } from "@/lib/server/share";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST { project, title, card, name?, auto?, phone?, email? } -> live invitation at /e/<name> (default: 1-<first names>,
 *      the first free number for that couple; auto: true = name is that automatic one, so a clash takes the next number).
 *      phone, email: how to reach the couple (lead capture), stored privately, never in the published project
 * POST { file, title }                                 -> link to a finished MP4 in ./exports
 * Both return { token, url, lanUrl }; a live share also { card, ownerKey } (the creator keeps the key: it unlocks the
 * owner tools on the invite page). A taken name gives 409 { error, suggestion }.
 */
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const title = typeof body?.title === "string" && body.title.trim() ? body.title.trim() : "Wedding invitation";
  const origin = new URL(req.url).origin;
  // Kept out of the project on purpose: the project is published, their contact details are not.
  const phone = LEADS && typeof body?.phone === "string" && body.phone ? normalizePhone(body.phone) : null;
  const email = LEADS && typeof body?.email === "string" && body.email ? normalizeEmail(body.email) : null;
  if (LEADS && body?.phone && !phone) return NextResponse.json({ error: "Please enter a valid WhatsApp number" }, { status: 400 });
  if (LEADS && body?.email && !email) return NextResponse.json({ error: "Please enter a valid email" }, { status: 400 });
  let share;
  // Only the creating browser ever sees this key; the share keeps its hash (lib/server/share.ts, "Owner key").
  const ownerKey = newOwnerKey();
  try {
    if (body?.project?.templateId) {
      // auto: the dialog's numbered name (1-deepak-sonia). If someone claimed that number a moment ago, take the next
      // free one here instead of asking the couple; a name they typed themselves still gets a 409 + suggestion.
      const auto = body.auto === true;
      let name = typeof body.name === "string" && body.name ? body.name : await nextNumberedName(slugify(title));
      for (let tries = 0; ; tries++) {
        try {
          share = await createLiveShare(body.project, title, body.card ?? {}, name, origin, ownerKeyHash(ownerKey));
          break;
        } catch (e) {
          if (!auto || !(e instanceof ShareError) || e.status !== 409 || tries >= 4) throw e;
          name = await nextNumberedName(numberedBase(name));
        }
      }
    } else if (typeof body?.file === "string") {
      if (!VIDEO_EXPORT) return exportOff();
      share = await createVideoShare(body.file, title);
    } else return NextResponse.json({ error: "Missing project or file" }, { status: 400 });
  } catch (e: any) {
    if (e instanceof ShareError) return NextResponse.json({ error: e.message, suggestion: e.suggestion }, { status: e.status });
    const missing = e?.code === "ENOENT" || e?.message === "Bad file name";
    return NextResponse.json({ error: missing ? "That video is no longer in the exports folder" : "Could not create the link: " + (e?.message || e) }, { status: missing ? 404 : 500 });
  }
  // Losing a lead must never cost the couple their link, so a database error is only logged (without their details).
  if ((phone || email) && share.kind === "live")
    await saveShareLead(share.token, title, { phone, email }, CONTACT_NOTICE).catch((e) => console.error("Lead not saved:", e?.message));
  // Names are guessable, so someone may have opened this one before it existed: drop any cached "not found".
  revalidatePath("/e/" + share.token);
  const lan = lanOrigin(origin);
  // card: the WhatsApp preview image, so the dialog can show how the link will look in a chat.
  const card = share.kind === "live" ? "/e/" + share.token + "/card?v=" + share.createdAt : null;
  return NextResponse.json({
    token: share.token,
    url: origin + "/e/" + share.token,
    lanUrl: lan ? lan + "/e/" + share.token : null,
    card,
    ownerKey: share.kind === "live" ? ownerKey : undefined,
  });
}
