import { getShare } from "@/lib/server/share";
import { streamFile } from "@/lib/server/stream";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Streams a shared MP4 (Range-capable). ?download=1 saves instead of playing. */
export async function GET(req: Request, { params }: { params: { token: string } }) {
  const share = await getShare(params.token);
  if (share?.kind !== "video") return new Response("This invitation link has expired", { status: 404 });
  const download = new URL(req.url).searchParams.get("download") === "1";
  return streamFile(req, share.path, { download: download ? share.file : undefined });
}
