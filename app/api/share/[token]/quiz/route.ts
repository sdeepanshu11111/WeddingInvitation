import { quizCounts, recordQuiz } from "@/lib/server/links";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST { correct } from a guest who answered the couple's quiz (lib/quiz.tsx) -> { right, total } including theirs, for
 * "62% of guests got it right". Counts only; open to anyone, so it only adds to existing link records and never errors.
 * GET -> { right, total } (a guest who answered before, or the couple: their own answers are not counted).
 */
export async function POST(req: Request, { params }: { params: { token: string } }) {
  const body = await req.json().catch(() => null);
  if (typeof body?.correct === "boolean") await recordQuiz(params.token, body.correct).catch((e) => console.error("Quiz answer not counted:", e?.message));
  return GET(req, { params });
}

export async function GET(_req: Request, { params }: { params: { token: string } }) {
  const c = await quizCounts(params.token).catch(() => ({ right: 0, total: 0 }));
  return Response.json(c, { headers: { "Cache-Control": "no-store" } });
}
