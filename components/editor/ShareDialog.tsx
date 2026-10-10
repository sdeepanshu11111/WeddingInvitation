"use client";
import React, { useState } from "react";
import type { Project } from "@/lib/types";
import { coupleTitle, inviteDate, makeTheme } from "@/lib/project";
import { getTemplate } from "@/lib/templates";
import { SHARE_STORE } from "@/lib/features";
import { MEDIA_TYPES, allSrcs, mapDataUrls } from "@/lib/media";

export type ShareResult = { url: string; lanUrl: string | null } | { error: string };

/** "Share" in the top bar: publishes the project as a live web invitation (no MP4 render). */
export function ShareDialog({ project, onClose }: { project: Project; onClose: () => void }) {
  const [state, setState] = useState<"idle" | "busy" | ShareResult>("idle");
  const [step, setStep] = useState("Creating link...");
  const title = coupleTitle(project.data);

  const create = async () => {
    setState("busy");
    try {
      let shared = project;
      if (SHARE_STORE === "blob") {
        // Vercel caps request bodies at 4.5 MB, so photos/video/music go straight to Blob first.
        const { upload } = await import("@vercel/blob/client");
        const total = new Set(allSrcs(project).filter((s) => s.startsWith("data:"))).size;
        let n = 0;
        shared = await mapDataUrls(project, async (src) => {
          setStep("Uploading media " + ++n + " of " + total + "...");
          const file = await (await fetch(src)).blob();
          const r = await upload("shares/uploads/media" + (MEDIA_TYPES[file.type] ?? ""), file, {
            access: "public",
            handleUploadUrl: "/api/share/upload",
            contentType: file.type,
            multipart: file.size > 8 * 1024 * 1024,
          });
          return r.url;
        });
      }
      setStep("Creating link...");
      // Colours and date for the link-preview card, so the server never loads the templates.
      const t = makeTheme(getTemplate(project.templateId), project.paletteId);
      const card = { bg: t.bg, bg2: t.bg2, ink: t.ink, soft: t.soft, accent: t.accent, line: t.line, date: inviteDate(project.data) };
      const res = await fetch("/api/share", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ project: shared, title, card }) });
      const r = await res.json();
      setState(res.ok ? { url: r.url, lanUrl: r.lanUrl } : { error: r.error || "Could not create the link" });
    } catch (e: any) {
      setState({ error: "Could not create the link: " + (e?.message || e) });
    }
  };

  return (
    <div className="backdrop-m" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-label="Share invitation">
        <h3>Share as a web page</h3>
        <p className="sub">
          Guests open a link and the invitation plays right in their browser, with music. No export to wait for, and it stays sharp on any screen:
          phones get the 9:16 layout, laptops and TVs get 16:9.
        </p>

        {state === "idle" || state === "busy" ? (
          <button className="btn primary" onClick={create} disabled={state === "busy"}>
            {state === "busy" ? step : "Create link"}
          </button>
        ) : (
          <SharePanel share={state} title={title} />
        )}

        <div style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 12, lineHeight: 1.45 }}>
          The link is a snapshot of the invite as it is now. If you edit it later, create a new link.
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 18 }}>
          <button className="btn ghost" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

/** The link a guest can open. On localhost the Wi-Fi address is shown, because only that one works on a phone. */
export function SharePanel({ share, title }: { share: ShareResult; title: string }) {
  const [copied, setCopied] = useState(false);
  if ("error" in share) return <div className="err" style={{ fontSize: 12, marginTop: 8 }}>{share.error}</div>;
  const link = share.lanUrl ?? share.url;
  const local = /\/\/(localhost|127\.0\.0\.1|\[::1\]|\d+\.\d+\.\d+\.\d+)[:/]/.test(link);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      window.prompt("Copy this link", link);
    }
  };
  return (
    <div style={{ marginTop: 10, padding: 10, border: "1px solid var(--line-2)", borderRadius: 8, background: "var(--panel-2)" }}>
      <div style={{ display: "flex", gap: 6 }}>
        <input
          readOnly
          value={link}
          onFocus={(e) => e.currentTarget.select()}
          style={{ flex: 1, minWidth: 0, background: "var(--bg)", border: "1px solid var(--line)", borderRadius: 6, padding: "5px 8px", fontSize: 12 }}
        />
        <button className="btn sm primary" onClick={copy}>
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
        <a className="btn sm" href={"https://wa.me/?text=" + encodeURIComponent(title + " - you're invited!\n" + link)} target="_blank" rel="noreferrer">
          Send on WhatsApp
        </a>
        <a className="btn sm" href={share.url} target="_blank" rel="noreferrer">
          Open share page
        </a>
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
