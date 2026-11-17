import { isRsvpKind, recordRsvp, rsvpCounts } from "@/lib/server/links";
import { getShare, isOwnerKey } from "@/lib/server/share";
import { MAX_PEOPLE } from "@/lib/rsvp";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const people = (v: unknown) => Math.max(1, Math.min(MAX_PEOPLE, Math.round(Number(v) || 1)));

/**
 * POST { response, people, prev? } from a guest's invite (app/e/[slug]/Rsvp.tsx) after they sent their RSVP on WhatsApp:
 * one more yes / maybe / no on the link's record, and the people a "yes" brings. `prev` is this device's earlier reply,
 * taken back when they change it. The reply itself (names, functions, food, message) goes only to the family's WhatsApp;
 * nothing about the guest reaches this endpoint. Open to anyone, so it only adds to existing records and never errors.
 */
export async function POST(req: Request, { params }: { params: { token: string } }) {
  const body = await req.json().catch(() => null);
  if (isRsvpKind(body?.response)) {
    const prev = isRsvpKind(body?.prev?.response) ? { response: body.prev.response, people: people(body.prev.people) } : undefined;
    await recordRsvp(params.token, { response: body.response, people: people(body.people), prev }).catch((e) => console.error("RSVP count not saved:", e?.message));
  }
  return new Response(null, { status: 204 });
}

/** GET with header x-owner-key -> the counts, for the couple's sheet only (403 for anyone else). */
export async function GET(req: Request, { params }: { params: { token: string } }) {
  const share = await getShare(params.token).catch(() => null);
  if (!share || !isOwnerKey(share, req.headers.get("x-owner-key"))) return Response.json({ error: "Not yours" }, { status: 403, headers: { "Cache-Control": "no-store" } });
  const counts = await rsvpCounts(params.token).catch(() => null);
  return Response.json({ counts }, { headers: { "Cache-Control": "no-store" } });
}
