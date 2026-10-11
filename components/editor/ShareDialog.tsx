"use client";
import React, { useEffect, useRef, useState } from "react";
import type { Project } from "@/lib/types";
import { coupleTitle, inviteDate, makeTheme } from "@/lib/project";
import { getTemplate } from "@/lib/templates";
import { SHARE_STORE } from "@/lib/features";
import { MEDIA_TYPES, allSrcs, mapDataUrls } from "@/lib/media";
import { SLUG_RE, slugify } from "@/lib/slug";

export type ShareResult = { url: string; lanUrl: string | null } | { error: string };
type Check = { name: string; valid: boolean; available: boolean; suggestion: string | null };

/** Keeps what the user types close to a valid name, but still lets them type a hyphen before the next word. */
const typing = (v: string) =>
  v.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").replace(/-{2,}/g, "-").replace(/^-/, "").slice(0, 50);

/** "Share" in the top bar: publishes the project as a live web invitation at /e/<name> (no MP4 render). */
export function ShareDialog({ project, onClose }: { project: Project; onClose: () => void }) {
  const [state, setState] = useState<"idle" | "busy" | ShareResult>("idle");
  const [step, setStep] = useState("Creating link...");
  const title = coupleTitle(project.data);
  const year = /\b(20\d\d)\b/.exec(inviteDate(project.data) ?? "")?.[1];
  const [name, setName] = useState(() => slugify(title));
  const [check, setCheck] = useState<Check | null>(null);
  const uploaded = useRef<Project | null>(null); // reused if the name has to change after media went up

  // Is the name free? Asked as the user types (debounced); stale answers are ignored.
  useEffect(() => {
    setCheck(null);
    if (!SLUG_RE.test(name)) return;
    let live = true;
    const id = setTimeout(() => {
      fetch("/api/share/check?name=" + encodeURIComponent(name) + (year ? "&year=" + year : ""))
        .then((r) => r.json())
        .then((c: Check) => live && setCheck(c))
        .catch(() => {});
    }, 300);
    return () => {
      live = false;
      clearTimeout(id);
    };
  }, [name, year]);

  const create = async () => {
    setState("busy");
    try {
      let shared = uploaded.current ?? project;
      if (SHARE_STORE === "blob" && !uploaded.current) {
        // Vercel caps request bodies at 4.5 MB, so photos/video/music go straight to Blob first.
        const { uploadPresigned } = await import("@vercel/blob/client");
        const total = new Set(allSrcs(project).filter((s) => s.startsWith("data:"))).size;
        let n = 0;
        shared = await mapDataUrls(project, async (src) => {
          setStep("Uploading media " + ++n + " of " + total + "...");
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
      setStep("Creating link...");
      // Colours and date for the link-preview card, so the server never loads the templates.
      const t = makeTheme(getTemplate(project.templateId), project.paletteId);
      const card = { bg: t.bg, bg2: t.bg2, ink: t.ink, soft: t.soft, accent: t.accent, line: t.line, date: inviteDate(project.data) };
      const res = await fetch("/api/share", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ project: shared, title, card, name }) });
      const r = await res.json();
      if (res.status === 409) {
        // Taken a moment ago: show the suggestion and let them try again.
        setCheck({ name, valid: true, available: false, suggestion: r.suggestion ?? null });
        setState("idle");
        return;
      }
      setState(res.ok ? { url: r.url, lanUrl: r.lanUrl } : { error: r.error || "Could not create the link" });
    } catch (e: any) {
      setState({ error: "Could not create the link: " + (e?.message || e) });
    }
  };

  const valid = SLUG_RE.test(name);
  const status = !name
    ? { text: "Type a name for the link, e.g. aarav-ananya", color: "var(--muted)" }
    : !valid
      ? { text: "3–50 lowercase letters, numbers and hyphens", color: "var(--muted)" }
      : !check || check.name !== name
        ? { text: "Checking...", color: "var(--muted)" }
        : check.available
          ? { text: "✓ Available", color: "var(--ok)" }
          : { text: "That name is taken.", color: "var(--danger)" };
  const ready = valid && check?.name === name && check.available;

  return (
    <div className="backdrop-m" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-label="Share invitation">
        <h3>Share as a web page</h3>
        <p className="sub">
          Guests open a link and the invitation plays right in their browser, with music. No export to wait for, and it stays sharp on any screen:
          phones get the 9:16 layout, laptops and TVs get 16:9.
        </p>

        {state === "idle" || state === "busy" ? (
          <>
            <div className="section-title">Link</div>
            <div style={{ display: "flex", alignItems: "center", border: "1px solid var(--line-2)", borderRadius: 8, background: "var(--bg)", overflow: "hidden" }}>
              <span style={{ padding: "8px 0 8px 10px", color: "var(--muted)", whiteSpace: "nowrap", fontSize: 12.5 }}>{window.location.host}/e/</span>
              <input
                value={name}
                onChange={(e) => setName(typing(e.target.value))}
                onBlur={() => setName((n) => slugify(n))}
                disabled={state === "busy"}
                spellCheck={false}
                aria-label="Link name"
                style={{ flex: 1, minWidth: 0, background: "transparent", border: 0, outline: "none", padding: "8px 10px 8px 0", fontSize: 12.5 }}
              />
            </div>
            <div style={{ fontSize: 12, marginTop: 6, minHeight: 18, color: status.color, display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              {status.text}
              {check?.name === name && !check.available && check.suggestion ? (
                <button className="btn sm" onClick={() => setName(check.suggestion!)}>
                  Use {check.suggestion}
                </button>
              ) : null}
            </div>
            <button className="btn primary" style={{ marginTop: 12 }} onClick={create} disabled={state === "busy" || !ready}>
              {state === "busy" ? step : "Create link"}
            </button>
          </>
        ) : (
          <SharePanel share={state} title={title} />
        )}

        <div style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 12, lineHeight: 1.45 }}>
          Anyone with the link can open the invite, and readable names can be guessed, like on other invite sites. The link is a snapshot of
          the invite as it is now: if you edit it later, create a new link.
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
