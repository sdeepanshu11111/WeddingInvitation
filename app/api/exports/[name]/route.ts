import { createReadStream, promises as fs } from "node:fs";
import path from "node:path";
import { Readable } from "node:stream";
import { EXPORT_DIR } from "@/lib/server/render";
import { VIDEO_EXPORT, exportOff } from "@/lib/features";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TYPES: Record<string, string> = { ".mp4": "video/mp4", ".json": "application/json" };

/** Serves a finished file from ./exports by name, so downloads survive a server restart. ?inline=1 plays it in the tab. */
export async function GET(req: Request, { params }: { params: { name: string } }) {
  if (!VIDEO_EXPORT) return exportOff();
  const name = path.basename(decodeURIComponent(params.name));
  const type = TYPES[path.extname(name).toLowerCase()];
  if (!type || name !== decodeURIComponent(params.name)) return new Response("Bad file name", { status: 400 });
  const file = path.join(EXPORT_DIR, name);
  const stat = await fs.stat(file).catch(() => null);
  if (!stat?.isFile()) return new Response("Not found in exports folder", { status: 404 });
  const inline = new URL(req.url).searchParams.get("inline") === "1";
  const stream = Readable.toWeb(createReadStream(file)) as unknown as ReadableStream;
  return new Response(stream, {
    headers: {
      "Content-Type": type,
      "Content-Length": String(stat.size),
      "Content-Disposition": (inline ? "inline" : "attachment") + "; filename=\"" + name + "\"",
    },
  });
}
