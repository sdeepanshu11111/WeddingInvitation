import { createReadStream, promises as fs } from "node:fs";
import path from "node:path";
import { Readable } from "node:stream";

export const MIME: Record<string, string> = {
  ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp", ".gif": "image/gif",
  ".mp4": "video/mp4", ".webm": "video/webm", ".mov": "video/quicktime",
  ".mp3": "audio/mpeg", ".m4a": "audio/mp4", ".aac": "audio/aac", ".wav": "audio/wav", ".ogg": "audio/ogg",
  ".json": "application/json",
};

/**
 * Serves a file with HTTP Range support. iPhone Safari will not play <video>
 * or <audio> without it, and it makes seeking instant everywhere.
 * `download` sets the attachment file name.
 */
export async function streamFile(req: Request, file: string, opts: { download?: string; cache?: string } = {}): Promise<Response> {
  const stat = await fs.stat(file).catch(() => null);
  if (!stat?.isFile()) return new Response("Not found", { status: 404 });
  const headers: Record<string, string> = {
    "Content-Type": MIME[path.extname(file).toLowerCase()] ?? "application/octet-stream",
    "Accept-Ranges": "bytes",
    "Cache-Control": opts.cache ?? "public, max-age=3600",
    "X-Content-Type-Options": "nosniff", // never let a browser re-interpret an upload as HTML
  };
  if (opts.download) headers["Content-Disposition"] = "attachment; filename=\"" + opts.download + "\"";

  const m = /^bytes=(\d*)-(\d*)$/.exec(req.headers.get("range") ?? "");
  if (m && (m[1] || m[2])) {
    // "bytes=500-" (from 500), "bytes=-500" (last 500), "bytes=0-999"
    const start = m[1] ? Number(m[1]) : Math.max(0, stat.size - Number(m[2]));
    const end = m[1] && m[2] ? Math.min(Number(m[2]), stat.size - 1) : stat.size - 1;
    if (start >= stat.size || start > end) {
      return new Response(null, { status: 416, headers: { "Content-Range": "bytes */" + stat.size } });
    }
    const body = Readable.toWeb(createReadStream(file, { start, end })) as unknown as ReadableStream;
    return new Response(body, {
      status: 206,
      headers: { ...headers, "Content-Length": String(end - start + 1), "Content-Range": "bytes " + start + "-" + end + "/" + stat.size },
    });
  }
  const body = Readable.toWeb(createReadStream(file)) as unknown as ReadableStream;
  return new Response(body, { headers: { ...headers, "Content-Length": String(stat.size) } });
}
