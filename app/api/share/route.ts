import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { VIDEO_EXPORT, exportOff } from "@/lib/features";
import { slugify } from "@/lib/slug";
import { ShareError, createLiveShare, createVideoShare, lanOrigin, suggestName } from "@/lib/server/share";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST { project, title, card, name? }  -> live invitation at /e/<name> (default: from the couple's names)
 * POST { file, title }                  -> link to a finished MP4 in ./exports
 * Both return { token, url, lanUrl }. A taken name gives 409 { error, suggestion }.
 */
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const title = typeof body?.title === "string" && body.title.trim() ? body.title.trim() : "Wedding invitation";
  const origin = new URL(req.url).origin;
  let share;
  try {
    if (body?.project?.templateId) {
      const name = typeof body.name === "string" && body.name ? body.name : await suggestName(slugify(title));
      share = await createLiveShare(body.project, title, body.card ?? {}, name, origin);
    } else if (typeof body?.file === "string") {
      if (!VIDEO_EXPORT) return exportOff();
      share = await createVideoShare(body.file, title);
    } else return NextResponse.json({ error: "Missing project or file" }, { status: 400 });
  } catch (e: any) {
    if (e instanceof ShareError) return NextResponse.json({ error: e.message, suggestion: e.suggestion }, { status: e.status });
    const missing = e?.code === "ENOENT" || e?.message === "Bad file name";
    return NextResponse.json({ error: missing ? "That video is no longer in the exports folder" : "Could not create the link: " + (e?.message || e) }, { status: missing ? 404 : 500 });
  }
  // Names are guessable, so someone may have opened this one before it existed: drop any cached "not found".
  revalidatePath("/e/" + share.token);
  const lan = lanOrigin(origin);
  // card: the WhatsApp preview image, so the dialog can show how the link will look in a chat.
  const card = share.kind === "live" ? "/e/" + share.token + "/card?v=" + share.createdAt : null;
  return NextResponse.json({ token: share.token, url: origin + "/e/" + share.token, lanUrl: lan ? lan + "/e/" + share.token : null, card });
}
