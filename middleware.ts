import { NextResponse, type NextRequest } from "next/server";

/* /admin (the leads list, with phone numbers) is for the owner only: the browser's own sign-in box
   (HTTP Basic auth), user name ADMIN_USER (default "admin") and password ADMIN_PASSWORD. Without
   ADMIN_PASSWORD it is closed on Vercel and open on a local machine.
   The browser remembers a good sign-in until it is closed, so later visits don't ask again. */
export function middleware(req: NextRequest) {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return process.env.VERCEL ? new NextResponse("Not found", { status: 404 }) : NextResponse.next();
  const user = process.env.ADMIN_USER || "admin";
  const [scheme, encoded] = (req.headers.get("authorization") ?? "").split(" ");
  if (scheme === "Basic" && encoded) {
    try {
      const pair = new TextDecoder().decode(Uint8Array.from(atob(encoded), (c) => c.charCodeAt(0)));
      const colon = pair.indexOf(":");
      // Both checked every time (no early exit), so a right user name with a wrong password takes as long as anything else.
      const ok = [same(pair.slice(0, Math.max(colon, 0)), user), same(pair.slice(colon + 1), password)];
      if (colon > 0 && ok[0] && ok[1]) return NextResponse.next();
    } catch {} // not base64: ask again
  }
  return new NextResponse("Sign in to see the leads.", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="FutureProof admin", charset="UTF-8"', "Cache-Control": "no-store" },
  });
}

/** Compares every character, so the time taken does not hint at how much of a guess was right. */
function same(a: string, b: string) {
  let diff = a.length ^ b.length;
  for (let i = 0; i < Math.max(a.length, b.length); i++) diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  return diff === 0;
}

export const config = { matcher: ["/admin/:path*", "/api/admin/:path*"] };
