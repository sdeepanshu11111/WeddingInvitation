import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { LEADS } from "@/lib/features";
import { addOwnerReview, setReviewStatus } from "@/lib/server/reviews";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST from /admin/reviews: { id, action: "approve" | "hide" | "delete" } or { action: "add", text, name, city,
 * template_id, permission: true }. The admin password (middleware.ts) guards it; the JSON content type and
 * same-origin checks stop another site from posting here with the owner's remembered sign-in.
 * Every change re-renders the home page, whose hero shows the approved reviews.
 */
export async function POST(req: Request) {
  if (!LEADS) return NextResponse.json({ error: "Reviews need the database (MONGODB_URI)" }, { status: 404 });
  const origin = req.headers.get("origin");
  if (!req.headers.get("content-type")?.startsWith("application/json") || (origin && origin !== new URL(req.url).origin))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const b = await req.json().catch(() => null);
  try {
    if (b?.action === "add") {
      if (b.permission !== true) return NextResponse.json({ error: "Only add a review the customer agreed to show" }, { status: 400 });
      await addOwnerReview(b);
    } else if (typeof b?.id === "string" && ["approve", "hide", "delete"].includes(b?.action)) {
      await setReviewStatus(b.id, b.action === "approve" ? "approved" : b.action === "hide" ? "hidden" : "delete");
    } else return NextResponse.json({ error: "Bad request" }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Failed" }, { status: 400 });
  }
  revalidatePath("/");
  return NextResponse.json({ ok: true });
}
