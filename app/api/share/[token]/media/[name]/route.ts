import { shareFile } from "@/lib/server/share";
import { streamFile } from "@/lib/server/stream";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Photos, video, music and poster.jpg of a live share. Names are content hashes, so they cache forever. */
export async function GET(req: Request, { params }: { params: { token: string; name: string } }) {
  const file = shareFile(params.token, params.name);
  if (!file) return new Response("Not found", { status: 404 });
  return streamFile(req, file, { cache: params.name === "poster.jpg" ? "public, max-age=3600" : "public, max-age=31536000, immutable" });
}
