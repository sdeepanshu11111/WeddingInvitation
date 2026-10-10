import { NextResponse } from "next/server";
import { getJob } from "@/lib/server/render";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Feeds the project JSON to the headless /render page. */
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const job = getJob(params.id);
  if (!job) return NextResponse.json({ error: "Unknown job" }, { status: 404 });
  return NextResponse.json(job.project);
}
