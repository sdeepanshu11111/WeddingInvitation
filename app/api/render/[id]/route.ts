import { NextResponse } from "next/server";
import path from "node:path";
import { getJob, queuePosition } from "@/lib/server/render";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const job = getJob(params.id);
  if (!job) return NextResponse.json({ error: "Unknown job (the server may have restarted)" }, { status: 404 });
  return NextResponse.json({
    id: job.id,
    status: job.status,
    progress: job.progress,
    frames: job.frames,
    error: job.error,
    fileName: job.fileName,
    queuePosition: queuePosition(job.id),
    savedAs: job.savedPath ? path.join("exports", path.basename(job.savedPath)) : null,
    savedName: job.savedPath ? path.basename(job.savedPath) : null,
  });
}
