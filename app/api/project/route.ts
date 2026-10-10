import { NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";
import { EXPORT_DIR } from "@/lib/server/render";
import type { Project } from "@/lib/types";
import { VIDEO_EXPORT, exportOff } from "@/lib/features";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Saves the project JSON into ./exports (works even where browser downloads are blocked). */
export async function POST(req: Request) {
  if (!VIDEO_EXPORT) return exportOff();
  const project = (await req.json().catch(() => null)) as Project | null;
  if (!project?.templateId) return NextResponse.json({ error: "Missing project" }, { status: 400 });
  const d = project.data || {};
  const who = [d.nameA ?? d.brideName ?? d.groomName, d.nameB ?? d.groomName ?? d.brideName].filter(Boolean).join("-");
  const base = (String(who || "invite").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "invite") + "-project";
  await fs.mkdir(EXPORT_DIR, { recursive: true });
  const file = path.join(EXPORT_DIR, base + ".json");
  await fs.writeFile(file, JSON.stringify(project));
  return NextResponse.json({ savedAs: path.join("exports", path.basename(file)) });
}
