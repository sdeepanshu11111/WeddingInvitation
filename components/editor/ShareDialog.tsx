"use client";
import React, { useEffect, useRef, useState } from "react";
import type { Project } from "@/lib/types";
import { buildTimeline, coupleTitle, inviteDate, makeTheme } from "@/lib/project";
import { getTemplate } from "@/lib/templates";
import { PAYMENTS, SHARE_STORE } from "@/lib/features";
import { inviteId, track } from "@/lib/analytics";
import { MEDIA_TYPES, allSrcs, mapDataUrls } from "@/lib/media";
import { rememberOwned } from "@/lib/owner";
import { slugify } from "@/lib/slug";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { Confetti, DrawnCheck } from "@/components/Celebrate";
import { AgreeNote } from "@/components/PayTrust";

export type ShareResult = { url: string; lanUrl: string | null; card?: string | null } | { error: string };

/**
 * A short link name nobody has to think about: a number, then each person's first name, counted per couple:
 * the first Deepak & Sonia get 1-deepak-sonia, the next 2-deepak-sonia ("Harpreet Singh & Simran Kaur" →
 * harpreet-simran). The server takes the next free number itself if this one is taken (POST auto: true).
 */
const HONORIFICS = new Set(["dr", "mr", "mrs", "ms", "miss", "shri", "sri", "smt", "chi", "sow", "er", "capt", "lt"]);
const autoBase = (title: string) => {
  const firsts = title
    .split("&")
    .map((part) => slugify(part).split("-").find((w) => w && !HONORIFICS.has(w)) ?? "")
    .filter(Boolean)
    .join("-");
  return firsts.slice(0, 40).replace(/-+$/, "") || "invite";
};

const inviteText = (title: string) => title + " - you're invited!";
const REDIRECT_S = 3;

type Stage = { kind: "working"; step: string } | { kind: "done"; token: string; url: string; lanUrl: string | null } | { kind: "error"; message: string };

const EnvelopeIcon = () => (
  <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <rect x="3" y="5" width="18" height="14" rx="2.5" />
    <path d="m3.5 7 8.5 6 8.5-6" />
  </svg>
);

/**
 * "Get invite link": no form and no choices. The link is created the moment they tap, celebrated, and 3 seconds
 * later the studio hands over to the invite itself (/e/<name>). There the couple watches it as their guests will
 * and finds their owner tools: remove the watermark, share it, leave a number (app/e/[slug]/LiveInvite.tsx).
 * This browser keeps the link's owner key (lib/owner.ts), which is what unlocks those tools.
 */
export function GetLink({ project, onClose }: { project: Project; onClose: () => void }) {
  const [stage, setStage] = useState<Stage>({ kind: "working", step: "Getting your invite ready…" });
  const [left, setLeft] = useState(REDIRECT_S);
  const [stay, setStay] = useState(false); // "Stay in the studio": no redirect
  const [copied, setCopied] = useState(false);
  const title = coupleTitle(project.data);
  const uploaded = useRef<Project | null>(null); // a retry doesn't upload the photos again
  const started = useRef(false);

  const create = async () => {
    setStage({ kind: "working", step: "Getting your invite ready…" });
    try {
      let shared = uploaded.current ?? project;
      if (SHARE_STORE === "blob" && !uploaded.current) {
        // Vercel caps request bodies at 4.5 MB, so photos/video/music go straight to Blob first.
        const { uploadPresigned } = await import("@vercel/blob/client");
        const total = new Set(allSrcs(project).filter((s) => s.startsWith("data:"))).size;
        let n = 0;
        shared = await mapDataUrls(project, async (src) => {
          setStage({ kind: "working", step: "Uploading your photos & music (" + ++n + " of " + total + ")…" });
          const file = await (await fetch(src)).blob();
          // Random, unguessable name; the server refuses anything else and never overwrites.
          const r = await uploadPresigned("shares/uploads/" + crypto.randomUUID() + (MEDIA_TYPES[file.type] ?? ""), file, {
            access: "public",
            handleUploadUrl: "/api/share/upload",
            contentType: file.type,
            multipart: file.size > 8 * 1024 * 1024,
          });
          return r.url;
        });
        uploaded.current = shared;
      }
      setStage({ kind: "working", step: "Creating your link…" });
      // Colours and date for the link-preview card, so the server never loads the templates.
      const t = makeTheme(getTemplate(project.templateId), project.paletteId);
      const card = { bg: t.bg, bg2: t.bg2, ink: t.ink, soft: t.soft, accent: t.accent, line: t.line, date: inviteDate(project.data) };
      const res = await fetch("/api/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ project: shared, title, card, name: "1-" + autoBase(title), auto: true }),
      });
      const r = await res.json().catch(() => ({}));
      if (!res.ok || !r.token) throw new Error(r.error || "Could not create the link");
      if (r.ownerKey) rememberOwned(r.token, r.ownerKey);
      const media = Object.values(project.data).flat().filter((v) => v && typeof v === "object" && v.src);
      track("invite_link_created", {
        invite_id: inviteId(r.token),
        template_id: project.templateId,
        palette_id: project.paletteId,
        orientation: project.orientation,
        plan: PAYMENTS ? "free" : undefined, // the watermark comes off on the invite page now
        is_custom_name: false,
        has_music: !!project.music,
        photo_count: media.filter((m) => m.kind === "image").length,
        has_video: media.some((m) => m.kind === "video"),
        duration_seconds: Math.round(buildTimeline(project).total / (project.speed || 1) / 100) / 10,
      });
      setLeft(REDIRECT_S);
      setStage({ kind: "done", token: r.token, url: r.url, lanUrl: r.lanUrl ?? null });
    } catch (e: any) {
      setStage({ kind: "error", message: e?.message || String(e) });
    }
  };

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    create();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 3, 2, 1… then the invite itself, in this tab (Back returns to the studio; the project is autosaved).
  const token = stage.kind === "done" ? stage.token : null;
  useEffect(() => {
    if (!token || stay) return;
    if (left <= 0) {
      window.location.assign("/e/" + token);
      return;
    }
    const id = setTimeout(() => setLeft((n) => n - 1), 1000);
    return () => clearTimeout(id);
  }, [token, left, stay]);

  // On localhost the Wi-Fi address is the one a phone can open; online they are the same.
  const link = stage.kind === "done" ? stage.lanUrl ?? stage.url : "";
  const [, hostPart = "", path = ""] = /^https?:\/\/([^/]+)(\/.*)?$/.exec(link) ?? [];
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
    } catch {
      window.prompt("Copy this link", link);
    }
    if (token) track("invite_shared", { channel: "copy", invite_id: inviteId(token) });
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="backdrop-m golink-back">
      {stage.kind === "done" ? <Confetti /> : null}
      <div className="modal golink" role="dialog" aria-label="Your invite link" aria-live="polite">
        {stage.kind === "working" ? (
          <div className="gl-working">
            <div className="gl-orb" aria-hidden>
              <span className="gl-ring" />
              <EnvelopeIcon />
            </div>
            <h3>Creating your invite</h3>
            <p className="gl-sub">{stage.step}</p>
            <div className="gl-bar" aria-hidden>
              <i />
            </div>
            <AgreeNote creating />
          </div>
        ) : stage.kind === "error" ? (
          <div className="gl-working">
            <h3>That didn&apos;t work</h3>
            <p className="gl-sub err">{stage.message}</p>
            <div className="gl-actions">
              <button className="btn primary" onClick={create}>
                Try again
              </button>
              <button className="btn ghost" onClick={onClose}>
                Back to editing
              </button>
            </div>
          </div>
        ) : (
          <div className="gl-done">
            <DrawnCheck />
            <h3>Your invite is live! 🎉</h3>
            <p className="gl-sub">
              {stay ? (
                "Open it to watch it, share it and make it yours."
              ) : left > 0 ? (
                <>
                  Opening it in <b>{left}</b>… watch it just like your guests will.
                </>
              ) : (
                "Opening your invite…"
              )}
            </p>
            <div className={"gl-link" + (copied ? " copied" : "")}>
              <span className="url" title={link}>
                <span className="host-part">{hostPart.replace(/^www\./, "")}</span>
                <b>{path}</b>
              </span>
              <button onClick={copy}>{copied ? "✓ Copied" : "Copy"}</button>
            </div>
            <a
              className={"btn primary gl-open" + (stay ? "" : " counting")}
              href={"/e/" + stage.token}
              style={{ ["--secs" as any]: REDIRECT_S + "s" }}
            >
              <span>Open my invite now →</span>
            </a>
            <button className="gl-stay" onClick={stay ? onClose : () => setStay(true)}>
              {stay ? "Back to editing" : "Stay in the studio"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/** The link a guest can open: Copy / Open icons, WhatsApp, and the phone's share sheet. On localhost the Wi-Fi address is shown, because only that one works on a phone. */
export function SharePanel({ share, title }: { share: ShareResult; title: string }) {
  const [copied, setCopied] = useState(false);
  const [canShare, setCanShare] = useState(false);
  useEffect(() => setCanShare(typeof navigator !== "undefined" && !!navigator.share), []);
  if ("error" in share) return <div className="err" style={{ fontSize: 12, marginTop: 8 }}>{share.error}</div>;
  const link = share.lanUrl ?? share.url;
  const local = /\/\/(localhost|127\.0\.0\.1|\[::1\]|\d+\.\d+\.\d+\.\d+)[:/]/.test(link);
  const [, hostPart = link, path = ""] = /^https?:\/\/([^/]+)(\/.*)?$/.exec(link) ?? [];
  const slug = /\/e\/([^/?#]+)/.exec(share.url)?.[1];
  const shared = (channel: "whatsapp" | "native_share" | "copy") => track("invite_shared", { channel, invite_id: slug && inviteId(slug) });
  const copy = async () => {
    shared("copy");
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      window.prompt("Copy this link", link);
    }
  };
  return (
    <div style={{ textAlign: "left" }}>
      <div className={"link-card" + (copied ? " copied" : "")}>
        <span className="link-ico" aria-hidden>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M10 14a5 5 0 0 0 7.07 0l3-3a5 5 0 0 0-7.07-7.07l-1.5 1.5" /><path d="M14 10a5 5 0 0 0-7.07 0l-3 3a5 5 0 0 0 7.07 7.07l1.5-1.5" /></svg>
        </span>
        <span className="link-text" title={link}>
          <small>Your link</small>
          <span className="url">
            <span className="host-part">{hostPart.replace(/^www\./, "")}</span>
            <b>{path}</b>
          </span>
        </span>
        <button className="copy-btn" onClick={copy} aria-label="Copy link">
          {copied ? "✓ Copied" : (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><rect x="9" y="9" width="12" height="12" rx="2.5" /><path d="M5 15V5a2 2 0 0 1 2-2h10" /></svg>
              Copy
            </>
          )}
        </button>
        <a className="icon-btn" href={share.url} target="_blank" rel="noreferrer" aria-label="Open the invite" title="Open the invite">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" /></svg>
        </a>
      </div>
      <div className="share-actions">
        <a className="btn wa" href={"https://wa.me/?text=" + encodeURIComponent(inviteText(title) + "\n" + link)} target="_blank" rel="noreferrer" onClick={() => shared("whatsapp")}>
          <WhatsAppIcon size={20} /> Send on WhatsApp
        </a>
        {canShare ? (
          <button className="btn more" onClick={() => navigator.share({ title, text: inviteText(title), url: link }).then(() => shared("native_share"), () => {})}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M12 3v12M7.5 7.5 12 3l4.5 4.5" /><path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7" /></svg>
            More apps
          </button>
        ) : (
          <a className="btn more" href={share.url} target="_blank" rel="noreferrer">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" /></svg>
            Open invite
          </a>
        )}
      </div>
      {local ? (
        <div style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 8, lineHeight: 1.45 }}>
          {share.lanUrl ? "Works on phones and PCs on the same Wi-Fi while this app is running." : "This link only works on this computer."} To share
          with guests anywhere, the app needs to be hosted online.
        </div>
      ) : null}
    </div>
  );
}
