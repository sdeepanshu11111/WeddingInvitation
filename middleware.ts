import { NextResponse, type NextRequest } from "next/server";
import { GEO_COOKIE } from "./lib/regions";

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

/* Site pages ("/", "/templates…") come here for one other reason: the visitor's approximate Indian state, so designs
   in their language can come first (lib/regions.ts). Vercel works the state out from the IP address and passes it
   in a header; only the state code is kept, in a cookie on the visitor's device for a week, and nothing is stored on
   our side. The matcher sends a site page here only while that cookie is missing (one call per visitor per week,
   not one per page and prefetch), so "-" is written when there is no Indian state, to stop asking. */
// /invitations/<function> too (2026-11-17): its designs are reordered by state like /templates.
const SITE_PAGE = /^\/(?:(?:templates|invitations)(?:\/[^/]+)?\/?)?$/;
const WEEK = 7 * 24 * 3600;

export function middleware(req: NextRequest) {
  // Exactly "/", "/templates", "/templates/<id>" and "/invitations/<function>"; everything else that reaches here goes
  // through the admin gate. A path added to the matcher below MUST be added to SITE_PAGE too, or it would ask for the admin password.
  return SITE_PAGE.test(req.nextUrl.pathname) ? withState(req) : admin(req);
}

function withState(req: NextRequest) {
  const res = NextResponse.next();
  const country = req.headers.get("x-vercel-ip-country");
  const state = (req.headers.get("x-vercel-ip-country-region") ?? "").toUpperCase();
  res.cookies.set(GEO_COOKIE, country === "IN" && /^[A-Z]{2,3}$/.test(state) ? state : "-", {
    path: "/",
    maxAge: WEEK,
    sameSite: "lax",
    secure: req.nextUrl.protocol === "https:",
  });
  return res;
}

function admin(req: NextRequest) {
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

// The cookie name is written out here (Next reads `config` at build time): it is GEO_COOKIE in lib/regions.ts.
export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
    { source: "/", missing: [{ type: "cookie", key: "fp_geo" }] },
    { source: "/templates/:path*", missing: [{ type: "cookie", key: "fp_geo" }] },
    { source: "/invitations/:path*", missing: [{ type: "cookie", key: "fp_geo" }] },
  ],
};
