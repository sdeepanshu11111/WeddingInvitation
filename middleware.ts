import { NextResponse, type NextRequest } from "next/server";

/* /admin (every invite link, and the leads list with phone numbers) is for the owner only: the browser's own
   sign-in box (HTTP Basic auth), user name ADMIN_USER (default "admin") and password ADMIN_PASSWORD.
   The browser remembers a good sign-in until it is closed, so later visits don't ask again.

   FAILS CLOSED: without ADMIN_PASSWORD the pages do not exist (404) anywhere except under `next dev` on a
   developer's machine. It used to be "closed when the VERCEL variable is set, open otherwise", so a deployment that
   lost its password and did not expose that variable would have shown customers' numbers to anyone. Never make
   "open" the fallback again. */

/** For every admin response: never stored by a browser or a proxy, never indexed, and links clicked from an admin
    page (a customer's WhatsApp chat, their invite) do not tell the destination where the click came from. */
function sealed(res: NextResponse) {
  res.headers.set("Cache-Control", "no-store");
  res.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  res.headers.set("Referrer-Policy", "no-referrer");
  return res;
}

export function middleware(req: NextRequest) {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return process.env.NODE_ENV === "development" ? sealed(NextResponse.next()) : sealed(new NextResponse("Not found", { status: 404 }));
  const user = process.env.ADMIN_USER || "admin";
  const [scheme, encoded] = (req.headers.get("authorization") ?? "").split(" ");
  if (scheme === "Basic" && encoded) {
    try {
      const pair = new TextDecoder().decode(Uint8Array.from(atob(encoded), (c) => c.charCodeAt(0)));
      const colon = pair.indexOf(":");
      // Both checked every time (no early exit), so a right user name with a wrong password takes as long as anything else.
      const ok = [same(pair.slice(0, Math.max(colon, 0)), user), same(pair.slice(colon + 1), password)];
      if (colon > 0 && ok[0] && ok[1]) return sealed(NextResponse.next());
    } catch {} // not base64: ask again
  }
  return sealed(
    new NextResponse("Sign in to continue.", {
      status: 401,
      headers: { "WWW-Authenticate": 'Basic realm="FutureProof admin", charset="UTF-8"' },
    }),
  );
}

/** Compares every character, so the time taken does not hint at how much of a guess was right. */
function same(a: string, b: string) {
  let diff = a.length ^ b.length;
  for (let i = 0; i < Math.max(a.length, b.length); i++) diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  return diff === 0;
}

export const config = { matcher: ["/admin/:path*", "/api/admin/:path*"] };
