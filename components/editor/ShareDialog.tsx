"use client";
import React, { useEffect, useRef, useState } from "react";
import type { Project } from "@/lib/types";
import { buildTimeline, coupleTitle, inviteDate, makeTheme } from "@/lib/project";
import { getTemplate } from "@/lib/templates";
import { BRAND } from "@/lib/brand";
import { LINK_PRICE_INR, PAYMENTS, SHARE_STORE } from "@/lib/features";
import { payToRemoveWatermark } from "@/lib/pay";
import { inviteId, track } from "@/lib/analytics";
import { MEDIA_TYPES, allSrcs, mapDataUrls } from "@/lib/media";
import { SLUG_RE, slugify } from "@/lib/slug";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { PayIcons } from "@/components/PayIcons";

export type ShareResult = { url: string; lanUrl: string | null; card?: string | null } | { error: string };
type Check = { name: string; valid: boolean; available: boolean; suggestion: string | null };
type Pay = "none" | "paying" | "paid" | { error: string };

/** Keeps what the user types close to a valid name, but still lets them type a hyphen before the next word. */
const typing = (v: string) =>
  v.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").replace(/-{2,}/g, "-").replace(/^-/, "").slice(0, 50);

/**
 * A link name nobody has to think about: the couple's names plus a short
 * timestamp (seconds, base 36), e.g. aarav-ananya-t3k2x9. Unique in practice,
 * so the couple never has to pick again because a name is taken.
 */
const autoName = (title: string) => {
  const stamp = Math.floor(Date.now() / 1000).toString(36);
  return (slugify(title).slice(0, 40).replace(/-+$/, "") || "invite") + "-" + stamp;
};

const Spinner = () => <span className="spin" aria-hidden />;
const inviteText = (title: string) => title + " - you're invited!";
const LockIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <rect x="4" y="11" width="16" height="10" rx="2" />
    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
  </svg>
);

/** Who processes the payment and the ways to pay that Indian buyers look for. */
function TrustRow() {
  return (
    <div className="trust-row">
      <span className="lock">
        <LockIcon /> Secured by Razorpay
      </span>
      <PayIcons />
    </div>
  );
}

/** "Share" in the top bar: publishes the project as a live web invitation at /e/<name> (no MP4 render). */
export function ShareDialog({ project, onClose }: { project: Project; onClose: () => void }) {
  const [state, setState] = useState<"idle" | "busy" | ShareResult>("idle");
  const [step, setStep] = useState("Creating link...");
  const title = coupleTitle(project.data);
  const year = /\b(20\d\d)\b/.exec(inviteDate(project.data) ?? "")?.[1];
  const [name, setName] = useState(() => autoName(title));
  const [editing, setEditing] = useState(false); // the couple chose to type their own link name
  const [check, setCheck] = useState<Check | null>(null);
  const uploaded = useRef<Project | null>(null); // reused if the name has to change after media went up
  // Paid links: the Premium plan removes the watermark. "none" = free preview link, "paid" = watermark removed.
  const [plan, setPlan] = useState<"free" | "premium">("premium");
  const [pay, setPay] = useState<Pay>("none");
  const [created, setCreated] = useState<string | null>(null); // the name of the link once it exists

  // Is a typed name free? Asked as the user types (debounced); stale answers are ignored.
  useEffect(() => {
    setCheck(null);
    if (!editing || !SLUG_RE.test(name)) return;
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
  }, [name, year, editing]);

  const removeWatermark = async (link: string) => {
    setPay("paying");
    try {
      setPay((await payToRemoveWatermark(link, title)) === "paid" ? "paid" : "none");
    } catch (e: any) {
      setPay({ error: e?.message || String(e) });
    }
  };

  /** withoutWatermark: create the link, then go straight to payment (the free link stays if they cancel). */
  const create = async (withoutWatermark = false) => {
    setState("busy");
    try {
      let shared = uploaded.current ?? project;
      if (SHARE_STORE === "blob" && !uploaded.current) {
        // Vercel caps request bodies at 4.5 MB, so photos/video/music go straight to Blob first.
        const { uploadPresigned } = await import("@vercel/blob/client");
        const total = new Set(allSrcs(project).filter((s) => s.startsWith("data:"))).size;
        let n = 0;
        shared = await mapDataUrls(project, async (src) => {
          setStep("Uploading photos & music " + ++n + "/" + total + "...");
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
      setStep("Creating your link...");
      // Colours and date for the link-preview card, so the server never loads the templates.
      const t = makeTheme(getTemplate(project.templateId), project.paletteId);
      const card = { bg: t.bg, bg2: t.bg2, ink: t.ink, soft: t.soft, accent: t.accent, line: t.line, date: inviteDate(project.data) };
      const post = (n: string) =>
        fetch("/api/share", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ project: shared, title, card, name: n }) });
      let finalName = name;
      let res = await post(finalName);
      let r = await res.json();
      if (res.status === 409 && !editing && r.suggestion) {
        // An automatic name collided (very unlikely): take the server's free one, no questions asked.
        finalName = r.suggestion;
        res = await post(finalName);
        r = await res.json();
      }
      if (res.status === 409) {
        // A name they typed was taken a moment ago: show the suggestion and let them try again.
        setEditing(true);
        setName(finalName);
        setCheck({ name: finalName, valid: true, available: false, suggestion: r.suggestion ?? null });
        setState("idle");
        return;
      }
      if (!res.ok) return setState({ error: r.error || "Could not create the link" });
      setState({ url: r.url, lanUrl: r.lanUrl, card: r.card });
      setCreated(r.token);
      const media = Object.values(project.data).flat().filter((v) => v && typeof v === "object" && v.src);
      track("invite_link_created", {
        invite_id: inviteId(r.token),
        template_id: project.templateId,
        palette_id: project.paletteId,
        orientation: project.orientation,
        plan: PAYMENTS ? (withoutWatermark ? "premium" : "free") : undefined,
        is_custom_name: editing,
        has_music: !!project.music,
        photo_count: media.filter((m) => m.kind === "image").length,
        has_video: media.some((m) => m.kind === "video"),
        duration_seconds: Math.round(buildTimeline(project).total / (project.speed || 1) / 100) / 10,
      });
      if (withoutWatermark) await removeWatermark(r.token);
    } catch (e: any) {
      setState({ error: "Could not create the link: " + (e?.message || e) });
    }
  };

  const valid = SLUG_RE.test(name);
  const checked = editing && valid && check?.name === name;
  const ready = valid && (!editing || (checked && check!.available));
  const hint = !editing
    ? null
    : !name
      ? "Pick a name for your link, e.g. aarav-ananya"
      : !valid
        ? "3–50 lowercase letters, numbers and hyphens"
        : !checked
          ? "Checking availability..."
          : check!.available
            ? "Nice, this link is available"
            : "This link is taken";
  const host = window.location.host.replace(/^www\./, "");
  const premium = PAYMENTS && plan === "premium";
  const busy = state === "busy";
  const done = state !== "idle" && state !== "busy" && !("error" in state);
  const live = !PAYMENTS || pay === "paid";

  return (
    <div className="backdrop-m" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={"modal share-modal" + (done ? " wide" : "")} role="dialog" aria-label="Share invitation">
        <div className="share-head">
          <div>
            <h3>{done ? "Your invitation link" : "Share your invitation"}</h3>
            {done ? null : <p>Guests open the link and the invite plays in their browser, with music, on any phone or TV.</p>}
          </div>
          <button className="share-x" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <div className="share-body">
          {done ? (
            <div className={"share-done" + ("card" in state && state.card ? " split" : "")}>
              <div className="share-main">
              <div className="done-head">
                <div className="done-badge">✓</div>
                <div>
                  <h4>{live ? "Your invite is live" : "Your preview link is ready"}</h4>
                  <p>{live ? "Every guest sees the clean invite." : "Share it with family to check. Remove the watermark whenever you're ready."}</p>
                </div>
              </div>
              <SharePanel share={state} title={title} />
              {PAYMENTS && created ? <PlanStatus pay={pay} onPay={() => removeWatermark(created)} /> : null}
              </div>
              {"card" in state && state.card ? (
                <aside className="share-side">
                  <div className="share-label">How guests see it</div>
                  <WhatsAppPreview card={state.card} title={title} link={state.lanUrl ?? state.url} host={host} />
                </aside>
              ) : null}
            </div>
          ) : (
            <>
              <div className="share-label">Your link</div>
              {editing ? (
                <>
                  <div className="url-field">
                    <span className="host">{host}/e/</span>
                    <input
                      value={name}
                      onChange={(e) => setName(typing(e.target.value))}
                      onBlur={() => setName((n) => slugify(n))}
                      disabled={busy}
                      spellCheck={false}
                      autoFocus
                      aria-label="Link name"
                    />
                    <span className={"url-state" + (checked ? (check!.available ? " ok" : " bad") : "")} aria-hidden>
                      {!valid ? "" : !checked ? <Spinner /> : check!.available ? "✓" : "✕"}
                    </span>
                  </div>
                  <div className="url-hint" style={checked ? { color: check!.available ? "var(--ok)" : "var(--danger)" } : undefined}>
                    {hint}
                    {checked && !check!.available && check!.suggestion ? (
                      <button className="chip-btn" onClick={() => setName(check!.suggestion!)}>
                        Use {check!.suggestion}
                      </button>
                    ) : null}
                  </div>
                </>
              ) : (
                <div className="auto-link">
                  <span className="url">
                    {host}/e/<b>{name}</b>
                  </span>
                  <button className="chip-btn" onClick={() => setEditing(true)} disabled={busy}>
                    ✎ Edit
                  </button>
                </div>
              )}

              {PAYMENTS ? (
                <>
                  <div className="share-label" style={{ marginTop: 18 }}>
                    Choose a plan
                  </div>
                  <div className="plans" role="radiogroup">
                    <button className={"plan" + (plan === "free" ? " on" : "")} onClick={() => setPlan("free")} disabled={busy} role="radio" aria-checked={plan === "free"}>
                      <div className="pname">
                        <span className="radio" /> Preview
                      </div>
                      <div className="price">Free</div>
                      <ul>
                        <li className="no">{BRAND} watermark</li>
                        <li>Check it with family</li>
                        <li>Remove it later</li>
                      </ul>
                    </button>
                    <button className={"plan" + (plan === "premium" ? " on" : "")} onClick={() => setPlan("premium")} disabled={busy} role="radio" aria-checked={plan === "premium"}>
                      <span className="tag">Popular</span>
                      <div className="pname">
                        <span className="radio" /> Premium
                      </div>
                      <div className="price">
                        ₹{LINK_PRICE_INR}
                        <small>one-time</small>
                      </div>
                      <ul>
                        <li>No watermark</li>
                        <li>For all your guests</li>
                        <li>Active instantly</li>
                      </ul>
                    </button>
                  </div>
                </>
              ) : null}

              <button className="btn primary cta" onClick={() => create(premium)} disabled={busy || !ready}>
                {busy ? (
                  <>
                    <Spinner /> {step}
                  </>
                ) : premium ? (
                  <>
                    <LockIcon /> Pay ₹{LINK_PRICE_INR} & create link
                  </>
                ) : PAYMENTS ? (
                  "Create free preview link"
                ) : (
                  "Create link"
                )}
              </button>
              {premium ? <TrustRow /> : null}
              {state !== "idle" && state !== "busy" && "error" in state ? (
                <div className="err" style={{ fontSize: 12.5, marginTop: 10 }}>
                  {state.error}
                </div>
              ) : null}
            </>
          )}
        </div>

        <div className="share-foot">
          Anyone with the link can open the invite. The link is a snapshot of the invite as it is now: if you edit it later, create a new link.
        </div>
      </div>
    </div>
  );
}

/** How the link will look in a WhatsApp chat: the real preview card in a chat-style frame. */
function WhatsAppPreview({ card, title, link, host }: { card: string; title: string; link: string; host: string }) {
  const time = new Date().toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });
  return (
    <div className="wa-phone">
      <div className="wa-top">
        <span className="wa-av" aria-hidden>
          <WhatsAppIcon size={16} />
        </span>
        <div>
          <b>Family group</b>
          <small>You, Mummy, Papa, Didi...</small>
        </div>
      </div>
      <div className="wa-chat">
        <div className="wa-day">Today</div>
        <div className="wa-bubble">
          <div className="wa-card">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={card} alt="" />
            <div className="t">{title}</div>
            <div className="d">You&apos;re invited! Tap to open the invitation.</div>
            <div className="h">{host}</div>
          </div>
          <div className="wa-msg">
            {inviteText(title)}
            <br />
            <span>{link}</span>
          </div>
          <div className="wa-time">{time} ✓✓</div>
        </div>
      </div>
    </div>
  );
}

/** Under the created link: remove the watermark (free preview) or the paid confirmation. */
function PlanStatus({ pay, onPay }: { pay: Pay; onPay: () => void }) {
  if (pay === "paid")
    return (
      <div className="paid-card">
        <div className="upsell-ico">✓</div>
        <div>
          <b>Premium · no watermark</b>
          <span>Payment received. Every guest sees the clean invite.</span>
        </div>
      </div>
    );
  return (
    <div className="upsell">
      <div className="upsell-head">
        <div>
          <b>Remove watermark</b>
          <span>A clean invite for every guest</span>
        </div>
        <div className="price-tag">
          ₹{LINK_PRICE_INR}
          <small>one-time</small>
        </div>
      </div>
      <div className="ticks">
        <span>Same link, nothing to resend</span>
        <span>Active instantly</span>
      </div>
      <button className="btn primary upsell-cta" onClick={onPay} disabled={pay === "paying"}>
        {pay === "paying" ? (
          <>
            <Spinner /> Waiting for payment...
          </>
        ) : (
          <>
            <LockIcon /> Pay ₹{LINK_PRICE_INR} securely
          </>
        )}
      </button>
      <TrustRow />
      {typeof pay === "object" ? (
        <div className="err" style={{ fontSize: 12, marginTop: 8 }}>
          {pay.error}
        </div>
      ) : null}
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
      <div className="link-card">
        <span className="url" title={link}>
          {hostPart.replace(/^www\./, "")}
          <b>{path}</b>
        </span>
        <button className={"icon-btn" + (copied ? " copied" : "")} onClick={copy} aria-label="Copy link" title="Copy link">
          {copied ? "✓" : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <rect x="9" y="9" width="12" height="12" rx="2" />
              <path d="M5 15V5a2 2 0 0 1 2-2h10" />
            </svg>
          )}
        </button>
        <a className="icon-btn" href={share.url} target="_blank" rel="noreferrer" aria-label="Open the invite" title="Open the invite">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
          </svg>
        </a>
      </div>
      <div className="share-actions">
        <a className="btn wa" href={"https://wa.me/?text=" + encodeURIComponent(inviteText(title) + "\n" + link)} target="_blank" rel="noreferrer" onClick={() => shared("whatsapp")}>
          <WhatsAppIcon size={18} /> Send on WhatsApp
        </a>
        {canShare ? (
          <button className="btn" onClick={() => navigator.share({ title, text: inviteText(title), url: link }).then(() => shared("native_share"), () => {})}>
            ↗ More apps
          </button>
        ) : (
          <button className="btn" onClick={copy}>
            {copied ? "✓ Copied" : "Copy link"}
          </button>
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
