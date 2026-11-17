import { blessingCount, recordGuestEvent } from "@/lib/server/links";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST { kind: "open" | "watched" } from a guest's invite page (app/e/[slug]/LiveInvite.tsx): one more open, or one
 * more watch to the end, or one more blessing ("Send blessings" at the end), on that link's record (lib/server/links.ts), so /admin/links shows how far an invite
 * travelled. A count only: nothing about the visitor is read or stored, and the couple's own views are not sent.
 * Open to anyone, so it can only add to a link that already has a record, and it never reports an error.
 */
export async function POST(req: Request, { params }: { params: { token: string } }) {
  const kind = (await req.json().catch(() => null))?.kind;
  if (kind === "open" || kind === "watched" || kind === "blessing") await recordGuestEvent(params.token, kind).catch((e) => console.error("Guest count not saved:", e?.message));
  return new Response(null, { status: 204 });
}

/** GET -> { blessings }: how many guests sent blessings, for the invite's end screen. Never an error: 0 when unknown. */
export async function GET(_req: Request, { params }: { params: { token: string } }) {
  const blessings = await blessingCount(params.token).catch(() => 0);
  return Response.json({ blessings }, { headers: { "Cache-Control": "no-store" } });
}
