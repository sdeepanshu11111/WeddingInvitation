import { NextResponse } from "next/server";
import { LEADS } from "@/lib/features";
import { CONTACT_NOTICE, normalizeEmail, normalizePhone } from "@/lib/contact";
import { saveShareLead } from "@/lib/server/leads";
import { getShare, isOwnerKey } from "@/lib/server/share";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST { name, key, phone?, email? } -> { ok: true }
 * The couple leaves a WhatsApp number or an email on their own invite page (optional, for help and reminders).
 * Only the browser that created the link holds `key` (see "Owner key" in lib/server/share.ts), so nobody can attach
 * their number to someone else's invite. Saved like the old Get-link field: privately, with the notice version.
 */
export async function POST(req: Request) {
  if (!LEADS) return NextResponse.json({ error: "Not available" }, { status: 404 });
  const body = await req.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name : "";
  const phone = typeof body?.phone === "string" && body.phone.trim() ? normalizePhone(body.phone) : null;
  const email = typeof body?.email === "string" && body.email.trim() ? normalizeEmail(body.email) : null;
  if (body?.phone && !phone) return NextResponse.json({ error: "Enter a 10-digit mobile number (or + and your country code)" }, { status: 400 });
  if (body?.email && !email) return NextResponse.json({ error: "That email doesn't look right" }, { status: 400 });
  if (!phone && !email) return NextResponse.json({ error: "Add a WhatsApp number or an email" }, { status: 400 });

  const share = name ? await getShare(name).catch(() => null) : null;
  if (!share || !isOwnerKey(share, body?.key)) return NextResponse.json({ error: "Only the person who made this invite can do that" }, { status: 403 });

  try {
    await saveShareLead(share.token, share.title, { phone, email }, CONTACT_NOTICE);
  } catch (e: any) {
    console.error("Lead not saved:", e?.message); // never the number or email itself
    return NextResponse.json({ error: "Could not save it right now. Please try again." }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
