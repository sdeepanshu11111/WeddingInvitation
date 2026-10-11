import { NextResponse } from "next/server";
import { SLUG_RE } from "@/lib/slug";
import { nameTaken, suggestName } from "@/lib/server/share";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET ?name=aarav-ananya[&year=2026] -> { name, valid, available, suggestion } for the Share dialog. */
export async function GET(req: Request) {
  const q = new URL(req.url).searchParams;
  const name = q.get("name") ?? "";
  const year = /^\d{4}$/.test(q.get("year") ?? "") ? q.get("year")! : undefined;
  if (!SLUG_RE.test(name)) return NextResponse.json({ name, valid: false, available: false, suggestion: null });
  const available = !(await nameTaken(name));
  return NextResponse.json({ name, valid: true, available, suggestion: available ? null : await suggestName(name, year) });
}
