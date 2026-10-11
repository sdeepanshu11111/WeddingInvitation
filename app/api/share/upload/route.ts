import { NextResponse } from "next/server";
import { issueSignedToken } from "@vercel/blob";
import { handleUploadPresigned, type HandleUploadPresignedBody } from "@vercel/blob/client";
import { SHARE_STORE } from "@/lib/features";
import { MAX_MEDIA_BYTES, MEDIA_TYPES } from "@/lib/media";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** shares/uploads/<uuid>.<ext>: the editor picks a random name, so nobody can aim at another invite's file. */
const UPLOAD_PATH = new RegExp("^shares/uploads/[0-9a-f-]{36}(" + [...new Set(Object.values(MEDIA_TYPES))].map((e) => "\\" + e).join("|") + ")$");

/**
 * Gives the editor a short-lived presigned URL so it can upload share media
 * straight to Vercel Blob (request bodies through a Vercel function are capped
 * at 4.5 MB). Works with both ways a store can be connected: OIDC
 * (BLOB_STORE_ID, the default for new stores) and BLOB_READ_WRITE_TOKEN.
 * Only the media types and sizes a share may hold are allowed, and existing
 * files are never overwritten.
 */
export async function POST(req: Request) {
  if (SHARE_STORE !== "blob") return NextResponse.json({ error: "Uploads go through /api/share on this server" }, { status: 404 });
  try {
    const body = (await req.json()) as HandleUploadPresignedBody;
    const result = await handleUploadPresigned({
      body,
      request: req,
      getSignedToken: async (pathname) => {
        if (!UPLOAD_PATH.test(pathname)) throw new Error("Bad upload path");
        const limits = { allowedContentTypes: Object.keys(MEDIA_TYPES), maximumSizeInBytes: MAX_MEDIA_BYTES };
        const token = await issueSignedToken({ pathname, operations: ["put"], validUntil: Date.now() + 15 * 60_000, ...limits });
        return { token, urlOptions: { ...limits, allowOverwrite: false, cacheControlMaxAge: 31536000 } };
      },
    });
    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || String(e) }, { status: 400 });
  }
}
