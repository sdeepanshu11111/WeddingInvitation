import { NextResponse } from "next/server";
import { spawn } from "node:child_process";
import { EXPORT_DIR, getJob } from "@/lib/server/render";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Local convenience: open the exports folder with the file selected. */
export async function POST(req: Request, { params }: { params: { id: string } }) {
  // Only for the person sitting at this machine.
  const host = new URL(req.url).hostname;
  if (!["localhost", "127.0.0.1", "[::1]"].includes(host)) return NextResponse.json({ error: "Local only" }, { status: 403 });
  const job = getJob(params.id);
  const target = job?.savedPath;
  const opts = { detached: true, stdio: "ignore" as const };
  if (process.platform === "win32") spawn("explorer.exe", target ? ["/select,", target] : [EXPORT_DIR], opts).unref();
  else if (process.platform === "darwin") spawn("open", target ? ["-R", target] : [EXPORT_DIR], opts).unref();
  else spawn("xdg-open", [EXPORT_DIR], opts).unref();
  return NextResponse.json({ ok: true });
}
