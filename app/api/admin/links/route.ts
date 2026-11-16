import { NextResponse } from "next/server";
import { LEADS } from "@/lib/features";
import { importLinks } from "@/lib/server/links";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60; // an import batch reads three files per link

/**
 * POST { action: "import" } from /admin/links: reads the next batch of links that were made before link records
 * existed back from storage (lib/server/links.ts, importLinks) and answers { imported, failed, remaining }; the
 * page calls it until nothing remains. Guarded like /api/admin/leads: the admin password (middleware.ts), and the
 * JSON content type and same-origin checks stop another site from posting here with the owner's remembered sign-in.
 */
export async function POST(req: Request) {
  if (!LEADS) return NextResponse.json({ error: "Link records are off (no database)" }, { status: 404 });
  const origin = req.headers.get("origin");
  if (!req.headers.get("content-type")?.startsWith("application/json") || (origin && origin !== new URL(req.url).origin))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const b = await req.json().catch(() => null);
  if (b?.action !== "import") return NextResponse.json({ error: "Bad request" }, { status: 400 });
  try {
    return NextResponse.json(await importLinks());
  } catch (e: any) {
    return NextResponse.json({ error: "Could not read the links: " + (e?.message || e) }, { status: 502 });
  }
}
