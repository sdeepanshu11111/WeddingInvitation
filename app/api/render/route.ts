import { NextResponse } from "next/server";
import { cancelAll, enqueue, type Quality } from "@/lib/server/render";
import type { Project } from "@/lib/types";
import { VIDEO_EXPORT, exportOff } from "@/lib/features";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** POST { project, quality?, fps? } -> { id }. Poll GET /api/render/:id for progress. */
export async function POST(req: Request) {
  if (!VIDEO_EXPORT) return exportOff();
  const body = await req.json().catch(() => null);
  const project = body?.project as Project | undefined;
  if (!project?.templateId || !project.orientation) {
    return NextResponse.json({ error: "Missing project" }, { status: 400 });
  }
  const quality: Quality = ["144p", "720p", "1080p", "4k"].includes(body.quality) ? body.quality : "1080p";
  const fps = [24, 30, 60].includes(body.fps) ? body.fps : 30;
  const job = enqueue(project, quality, fps, new URL(req.url).origin);
  return NextResponse.json({ id: job.id, fileName: job.fileName });
}

/** DELETE cancels every queued and running render. */
export async function DELETE() {
  if (!VIDEO_EXPORT) return exportOff();
  return NextResponse.json({ cancelled: cancelAll() });
}
