import { NextResponse } from "next/server";
import { VIDEO_EXPORT, exportOff } from "@/lib/features";
import { createLiveShare, createVideoShare, lanOrigin } from "@/lib/server/share";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST { project, title, card }  -> live invitation (plays in the browser, no render)
 * POST { file, title }           -> link to a finished MP4 in ./exports
 * Both return { token, url, lanUrl }.
 */
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const title = typeof body?.title === "string" && body.title.trim() ? body.title.trim() : "Wedding invitation";
  const origin = new URL(req.url).origin;
  let share;
  try {
    if (body?.project?.templateId) share = await createLiveShare(body.project, title, body.card ?? {});
    else if (typeof body?.file === "string") {
      if (!VIDEO_EXPORT) return exportOff();
      share = await createVideoShare(body.file, title);
    } else return NextResponse.json({ error: "Missing project or file" }, { status: 400 });
  } catch (e: any) {
    const missing = e?.code === "ENOENT" || e?.message === "Bad file name";
    return NextResponse.json({ error: missing ? "That video is no longer in the exports folder" : "Could not create the link: " + (e?.message || e) }, { status: missing ? 404 : 500 });
  }
  const lan = lanOrigin(origin);
  return NextResponse.json({ token: share.token, url: origin + "/v/" + share.token, lanUrl: lan ? lan + "/v/" + share.token : null });
}
