import { promises as fs } from "node:fs";
import { ImageResponse } from "next/og";
import { getShare, shareFile, type Card } from "@/lib/server/share";

/* Link-preview card (WhatsApp, Telegram, iMessage...) for a share, drawn with
   next/og, so it needs no headless Chrome and runs on Vercel. Next adds the
   og:image tag to the page by itself. Rendered once per share, then cached. */

export const runtime = "nodejs";
export const alt = "Video invitation";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const revalidate = false;
export function generateStaticParams() {
  return []; // like the page: drawn on first request, then cached
}

const DEFAULT: Card = { bg: "#4a0d1c", bg2: "#22050d", ink: "#fff4e6", soft: "#e8cfc0", accent: "#e9c46a", line: "#c9a24a" };

/** Google Fonts subset for exactly `text`, as TTF (next/og cannot read woff2). Null if offline. */
async function googleFont(family: string, text: string): Promise<ArrayBuffer | null> {
  try {
    const css = await (await fetch("https://fonts.googleapis.com/css2?family=" + family.replace(/ /g, "+") + "&text=" + encodeURIComponent(text))).text();
    const url = /src: url\((.+?)\) format\('(?:opentype|truetype)'\)/.exec(css)?.[1];
    return url ? await (await fetch(url)).arrayBuffer() : null;
  } catch {
    return null;
  }
}

/** The couple photo as a data URL (JPEG/PNG only), from local disk or Blob. Null if unavailable. */
async function photo(token: string, src?: string): Promise<string | null> {
  if (!src) return null;
  try {
    const local = /^\/api\/share\/[\w-]+\/media\/([\w.-]+)$/.exec(src);
    let buf: Buffer;
    if (local) {
      const file = shareFile(token, local[1]);
      if (!file) return null;
      buf = await fs.readFile(file);
    } else {
      const r = await fetch(src);
      if (!r.ok) return null;
      buf = Buffer.from(await r.arrayBuffer());
    }
    const type = buf[0] === 0x89 ? "image/png" : buf[0] === 0xff ? "image/jpeg" : null;
    return type ? "data:" + type + ";base64," + buf.toString("base64") : null;
  } catch {
    return null;
  }
}

export default async function Image({ params }: { params: { token: string } }) {
  const s = await getShare(params.token);
  const c = { ...DEFAULT, ...(s?.kind === "live" ? s.card : {}) };
  // The card has no complex-script shaping (Devanagari matras, Gurmukhi, Arabic would break),
  // so names in Indian scripts fall back to a plain heading rather than render wrongly.
  const title = s?.title ?? "Wedding invitation";
  const heading = /^[\u0000-ɏ -⁯]+$/.test(title) ? title : "Wedding Invitation";
  const kicker = "YOU'RE INVITED";
  const pic = s?.kind === "live" ? await photo(s.token, s.card?.photo) : null;
  const [script, caps] = await Promise.all([googleFont("Great Vibes", heading), googleFont("Cinzel", kicker + (c.date ?? ""))]);
  const fonts = [
    ...(script ? [{ name: "Great Vibes", data: script, weight: 400 as const, style: "normal" as const }] : []),
    ...(caps ? [{ name: "Cinzel", data: caps, weight: 400 as const, style: "normal" as const }] : []),
  ];
  const nameSize = Math.round((heading.length <= 16 ? 120 : heading.length <= 24 ? 100 : 78) * (pic ? 0.82 : 1));

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", padding: 28, background: "linear-gradient(135deg, " + c.bg + ", " + c.bg2 + ")" }}>
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 56,
            padding: "0 56px",
            border: "2px solid " + c.line + "99",
            borderRadius: 18,
          }}
        >
          {pic ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={pic} width={330} height={330} alt="" style={{ borderRadius: 999, objectFit: "cover", border: "8px solid " + c.accent }} />
          ) : null}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", maxWidth: pic ? 640 : 1040 }}>
            <div style={{ fontFamily: "Cinzel", fontSize: 30, letterSpacing: 10, color: c.accent }}>{kicker}</div>
            <div style={{ fontFamily: "Great Vibes", fontSize: nameSize, lineHeight: 1.15, color: c.ink, marginTop: 14 }}>{heading}</div>
            {c.date ? <div style={{ fontFamily: "Cinzel", fontSize: 28, letterSpacing: 3, color: c.soft, marginTop: 18 }}>{c.date}</div> : null}
          </div>
        </div>
      </div>
    ),
    { ...size, fonts }
  );
}
