import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLiveProject, getShare } from "@/lib/server/share";
import { SITE_URL } from "@/lib/site";
import { LiveInvite } from "./LiveInvite";
import { ShareButtons } from "./ShareButtons";

/* Public page for a shared invitation. Server-rendered, so the Open Graph tags
   are in the HTML and WhatsApp/Telegram show a preview card.
   Live shares play the animation in the browser; video shares play the MP4.

   A share never changes after it is created, so each page is rendered on its
   first visit and then served from the cache (on-demand ISR): the other few
   hundred guests get it from the CDN without running any server code.
   Nothing here may read headers/cookies, or the page turns dynamic again.
   If shares become editable or deletable, call revalidatePath("/v/" + token). */

export const revalidate = false;
export function generateStaticParams() {
  return []; // none at build time; each one renders on first visit
}

const DESCRIPTION = "You're invited! Tap to open the invitation.";
const abs = (p: string) => SITE_URL + p; // preview cards need absolute URLs

export async function generateMetadata({ params }: { params: { token: string } }): Promise<Metadata> {
  const s = await getShare(params.token);
  if (!s) return { title: "Invitation not found" };
  // metadataBase turns the og:image that Next adds from ./opengraph-image.tsx into an absolute URL.
  const base = { metadataBase: new URL(SITE_URL), title: s.title, description: DESCRIPTION, robots: { index: false, follow: false } };
  if (s.kind === "live") {
    return { ...base, openGraph: { title: s.title, description: DESCRIPTION, type: "website" }, twitter: { card: "summary_large_image" } };
  }
  const video = abs("/api/share/" + s.token + "/video");
  return { ...base, openGraph: { title: s.title, description: DESCRIPTION, type: "video.other", videos: [{ url: video, type: "video/mp4" }] } };
}

export default async function WatchPage({ params }: { params: { token: string } }) {
  const s = await getShare(params.token);
  if (!s) notFound();

  if (s.kind === "live") {
    const project = await getLiveProject(s.token).catch(() => null);
    if (!project) notFound();
    return <LiveInvite project={project} title={s.title} />;
  }

  const video = "/api/share/" + s.token + "/video";
  return (
    <main
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
      <div style={{ fontSize: 11, color: "var(--muted)" }}>Made with Invite Studio</div>
    </main>
  );
}
