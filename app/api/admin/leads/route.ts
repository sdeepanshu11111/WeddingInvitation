import { NextResponse } from "next/server";
import { LEADS } from "@/lib/features";
import { type LeadAction, updateLead } from "@/lib/server/leads";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ACTIONS: LeadAction[] = ["contacted", "optout", "delete"];

/**
 * POST { link, action } from the buttons on /admin/leads. The admin password (middleware.ts) guards it;
 * the JSON content type and same-origin checks stop another site from posting here with the owner's
 * remembered sign-in (a plain HTML form can send neither).
 */
export async function POST(req: Request) {
  if (!LEADS) return NextResponse.json({ error: "Lead capture is off" }, { status: 404 });
  const origin = req.headers.get("origin");
  if (!req.headers.get("content-type")?.startsWith("application/json") || (origin && origin !== new URL(req.url).origin))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const b = await req.json().catch(() => null);
  if (typeof b?.link !== "string" || !ACTIONS.includes(b.action)) return NextResponse.json({ error: "Bad request" }, { status: 400 });
  await updateLead(b.link, b.action);
  return NextResponse.json({ ok: true });
}
