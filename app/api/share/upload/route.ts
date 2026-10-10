import { NextResponse } from "next/server";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { SHARE_STORE } from "@/lib/features";
import { MAX_MEDIA_BYTES, MEDIA_TYPES } from "@/lib/media";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Issues short-lived tokens so the editor can upload share media straight to
 * Vercel Blob (request bodies through a Vercel function are capped at 4.5 MB).
 * Only media types and sizes a share may hold are allowed.
 */
export async function POST(req: Request) {
  if (SHARE_STORE !== "blob") return NextResponse.json({ error: "Uploads go through /api/share on this server" }, { status: 404 });
  try {
    const body = (await req.json()) as HandleUploadBody;
    const result = await handleUpload({
      body,
      request: req,
      onBeforeGenerateToken: async (pathname) => {
        if (!pathname.startsWith("shares/uploads/")) throw new Error("Bad upload path");
        return {
          allowedContentTypes: Object.keys(MEDIA_TYPES),
          maximumSizeInBytes: MAX_MEDIA_BYTES,
          addRandomSuffix: true, // unguessable URLs, and nobody can overwrite another invite's photo
          cacheControlMaxAge: 31536000,
        };
      },
    });
    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || String(e) }, { status: 400 });
  }
}
