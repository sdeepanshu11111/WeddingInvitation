import { isOwnerEvent, recordOwnerEvent } from "@/lib/server/links";
import { getShare, isOwnerKey } from "@/lib/server/share";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST { kind, reason? } + header x-owner-key, from the couple's own invite page (app/e/[slug]/LiveInvite.tsx):
 * "visit" (they opened it), "preview_end" (their 30 s watermark-free preview ended; reason "timer" | "end"),
 * "paysheet" (the pay sheet came up), "pay_later" ("Not now" on it). Counts and times on the link's record
 * (lib/server/links.ts) for /admin/links: nothing about the device. Only the browser that made the link holds the
 * key, so nobody else can move these numbers. Best effort: a storage error is logged, never shown.
 */
export async function POST(req: Request, { params }: { params: { token: string } }) {
  const body = await req.json().catch(() => null);
  const kind = body?.kind;
  if (!isOwnerEvent(kind)) return new Response(null, { status: 400 });
  const share = await getShare(params.token).catch(() => null);
  if (!share || !isOwnerKey(share, req.headers.get("x-owner-key"))) return new Response(null, { status: 403 });
  const reason = body?.reason === "end" ? "end" : "timer";
  await recordOwnerEvent(share.token, kind, reason).catch((e) => console.error("Owner event not saved:", e?.message));
  return new Response(null, { status: 204 });
}
