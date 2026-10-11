import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PAYMENTS } from "@/lib/features";
import { getLiveProject, getPaid, getShare } from "@/lib/server/share";
import { SITE_URL } from "@/lib/site";
import { LiveInvite } from "./LiveInvite";
import { BRAND } from "@/lib/brand";
import { ShareButtons } from "./ShareButtons";

/* Public page for a shared invitation. Server-rendered, so the Open Graph tags
   are in the HTML and WhatsApp/Telegram show a preview card.
   Live shares play the animation in the browser; video shares play the MP4.

   A share never changes after it is created, so each page is rendered on its
   first visit and then served from the cache (on-demand ISR): the other few
   hundred guests get it from the CDN without running any server code.
   Nothing here may read headers/cookies, or the page turns dynamic again.
   Names are guessable, so POST /api/share calls revalidatePath("/e/" + name)
   in case someone opened it before it existed (a cached 404). */

export const revalidate = false;
export function generateStaticParams() {
  return []; // none at build time; each one renders on first visit
}

const DESCRIPTION = "You're invited! Tap to open the invitation.";
/** Preview cards need absolute URLs: SITE_URL when set, else the site the share was made on (the host in the
    link the couple sent; a production domain that is not live yet would break the card), else the default. */
const absFor = (s: { origin?: string }) => (p: string) => (process.env.SITE_URL ? SITE_URL : s.origin ?? SITE_URL) + p;

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const s = await getShare(params.slug);
  if (!s) return { title: "Invitation not found" };
  const base = { title: s.title, description: DESCRIPTION, robots: { index: false, follow: false } };
  const abs = absFor(s.kind === "live" ? s : {});
  if (s.kind === "live") {
    // Versioned, so the card can never be a copy cached before this share existed (see ./card/route.tsx).
    const images = [{ url: abs("/e/" + s.token + "/card?v=" + s.createdAt), width: 1200, height: 630, alt: s.title }];
    return { ...base, openGraph: { title: s.title, description: DESCRIPTION, type: "website", images }, twitter: { card: "summary_large_image", images } };
  }
  const video = abs("/api/share/" + s.token + "/video");
  return { ...base, openGraph: { title: s.title, description: DESCRIPTION, type: "video.other", videos: [{ url: video, type: "video/mp4" }] } };
}

export default async function WatchPage({ params }: { params: { slug: string } }) {
  const s = await getShare(params.slug);
  if (!s) notFound();

  if (s.kind === "live") {
    const project = await getLiveProject(s.token).catch(() => null);
    if (!project) notFound();
    // Free links carry a watermark while paid links are on; paying revalidates this page (api/pay/verify).
    const watermark = PAYMENTS && !(await getPaid(s.token));
    return <LiveInvite project={project} title={s.title} name={s.token} watermark={watermark} />;
  }

  const video = "/api/share/" + s.token + "/video";
  return (
    <main
      className="guest-ui"
      style={{
        minHeight: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 18,
        padding: "28px 16px 36px",
        background: "radial-gradient(ellipse at 50% 0%, #2a1d22 0%, var(--bg) 70%)",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 11, letterSpacing: "0.32em", textTransform: "uppercase", color: "var(--gold)" }}>You&apos;re invited</div>
        <h1 style={{ fontFamily: "var(--f-vibes)", fontWeight: 400, fontSize: 46, margin: "6px 0 0", color: "var(--gold-2)", lineHeight: 1.15 }}>{s.title}</h1>
      </div>
      <video
        src={video}
        controls
        autoPlay
        playsInline
        preload="metadata"
        style={{
          width: s.vertical ? "min(100%, 420px, calc((100vh - 230px) * 9 / 16))" : "min(100%, 960px)",
          aspectRatio: s.vertical ? "9 / 16" : "16 / 9",
          minWidth: s.vertical ? 240 : undefined,
          borderRadius: 14,
          background: "#000",
          boxShadow: "0 24px 60px rgba(0,0,0,.55)",
        }}
      />
      <ShareButtons title={s.title} videoPath={video} fileName={s.file} />
      <div style={{ fontSize: 11, color: "var(--muted)" }}>Made with {BRAND}</div>
    </main>
  );
}
