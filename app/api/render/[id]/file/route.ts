import { createReadStream, promises as fs } from "node:fs";
import { Readable } from "node:stream";
import { getJob } from "@/lib/server/render";
import { VIDEO_EXPORT, exportOff } from "@/lib/features";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** ?inline=1 plays the video in the tab instead of downloading it. */
export async function GET(req: Request, { params }: { params: { id: string } }) {
  if (!VIDEO_EXPORT) return exportOff();
  const job = getJob(params.id);
  const file = job?.outPath ?? job?.savedPath;
  if (!job || job.status !== "done" || !file) return new Response("Not ready", { status: 404 });
  const stat = await fs.stat(file).catch(() => null);
  if (!stat) return new Response("File was cleaned up. Find it in the exports folder.", { status: 410 });
  const inline = new URL(req.url).searchParams.get("inline") === "1";
  const stream = Readable.toWeb(createReadStream(file)) as unknown as ReadableStream;
  return new Response(stream, {
    headers: {
      "Content-Type": "video/mp4",
      "Content-Length": String(stat.size),
      "Content-Disposition": (inline ? "inline" : "attachment") + "; filename=\"" + job.fileName + "\"",
    },
  });
}
