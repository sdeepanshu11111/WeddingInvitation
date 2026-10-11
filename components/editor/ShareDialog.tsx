"use client";
import React, { useEffect, useRef, useState } from "react";
import type { Project } from "@/lib/types";
import { coupleTitle, inviteDate, makeTheme } from "@/lib/project";
import { getTemplate } from "@/lib/templates";
import { BRAND } from "@/lib/brand";
import { LINK_PRICE_INR, PAYMENTS, SHARE_STORE } from "@/lib/features";
import { payToRemoveWatermark } from "@/lib/pay";
import { MEDIA_TYPES, allSrcs, mapDataUrls } from "@/lib/media";
import { SLUG_RE, slugify } from "@/lib/slug";

export type ShareResult = { url: string; lanUrl: string | null } | { error: string };
type Check = { name: string; valid: boolean; available: boolean; suggestion: string | null };
type Pay = "none" | "paying" | "paid" | { error: string };

/** Keeps what the user types close to a valid name, but still lets them type a hyphen before the next word. */
const typing = (v: string) =>
  v.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").replace(/-{2,}/g, "-").replace(/^-/, "").slice(0, 50);

const Spinner = () => <span className="spin" aria-hidden />;

/** "Share" in the top bar: publishes the project as a live web invitation at /e/<name> (no MP4 render). */
export function ShareDialog({ project, onClose }: { project: Project; onClose: () => void }) {
  const [state, setState] = useState<"idle" | "busy" | ShareResult>("idle");
  const [step, setStep] = useState("Creating link...");
  const title = coupleTitle(project.data);
  const year = /\b(20\d\d)\b/.exec(inviteDate(project.data) ?? "")?.[1];
  const [name, setName] = useState(() => slugify(title));
  const [check, setCheck] = useState<Check | null>(null);
  const uploaded = useRef<Project | null>(null); // reused if the name has to change after media went up
  // Paid links: the Premium plan removes the watermark. "none" = free preview link, "paid" = watermark removed.
  const [plan, setPlan] = useState<"free" | "premium">("premium");
  const [pay, setPay] = useState<Pay>("none");
  const [created, setCreated] = useState<string | null>(null); // the name of the link once it exists

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
      const res = await fetch("/api/share", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ project: shared, title, card, name }) });
      const r = await res.json();
      if (res.status === 409) {
        // Taken a moment ago: show the suggestion and let them try again.
        setCheck({ name, valid: true, available: false, suggestion: r.suggestion ?? null });
        setState("idle");
        return;
      }
      if (!res.ok) return setState({ error: r.error || "Could not create the link" });
      setState({ url: r.url, lanUrl: r.lanUrl });
      setCreated(r.token);
      if (withoutWatermark) await removeWatermark(r.token);
    } catch (e: any) {
      setState({ error: "Could not create the link: " + (e?.message || e) });
    }
  };

  const valid = SLUG_RE.test(name);
  const checked = valid && check?.name === name;
  const ready = checked && check!.available;
  const hint = !name
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

  return (
    <div className="backdrop-m" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal share-modal" role="dialog" aria-label="Share invitation">
        <div className="share-head">
          <div>
            <h3>Share your invitation</h3>
            <p>Guests open the link and the invite plays in their browser, with music. Phones get 9:16, laptops and TVs get 16:9.</p>
          </div>
          <button className="share-x" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <div className="share-body">
          {done ? (
            <div className="share-done">
              <div className="done-badge">✓</div>
              <h4>{!PAYMENTS || pay === "paid" ? "Your invite is live" : "Your preview link is ready"}</h4>
              <p>Send it on WhatsApp or copy the link.</p>
              <SharePanel share={state} title={title} />
              {PAYMENTS && created ? <PlanStatus pay={pay} onPay={() => removeWatermark(created)} /> : null}
            </div>
          ) : (
            <>
              <div className="share-label">Your link</div>
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

              {PAYMENTS ? (
                <>
                  <div className="share-label" style={{ marginTop: 16 }}>
                    Choose a plan
                  </div>
                  <div className="plans" role="radiogroup">
                    <button className={"plan" + (plan === "free" ? " on" : "")} onClick={() => setPlan("free")} disabled={busy} role="radio" aria-checked={plan === "free"}>
                      <div className="pname">
                        <span className="radio" /> Preview
                      </div>
                      <div className="price">
                        Free
                      </div>
                      <ul>
                        <li className="no">{BRAND} watermark</li>
                        <li>Check it with family first</li>
                        <li>Upgrade any time</li>
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
                        <li>Share with all your guests</li>
                        <li>Photos, music, every screen</li>
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
                  "Pay ₹" + LINK_PRICE_INR + " & create link"
                ) : PAYMENTS ? (
                  "Create free preview link"
                ) : (
                  "Create link"
                )}
              </button>
              {premium ? <div className="secure">🔒 Secure payment by Razorpay · UPI, cards, netbanking</div> : null}
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

/** Under the created link: free preview (with the button to upgrade) or Premium. */
function PlanStatus({ pay, onPay }: { pay: Pay; onPay: () => void }) {
  if (pay === "paid")
    return (
      <div className="plan-status paid">
        <div>
          <b>✓ Premium: no watermark</b>
          <span>Guests see the clean invite.</span>
        </div>
      </div>
    );
  return (
    <div className="plan-status free">
      <div>
        <b>Preview link</b>
        <span>Guests see a {BRAND} watermark.</span>
      </div>
      <button className="btn sm primary" onClick={onPay} disabled={pay === "paying"}>
        {pay === "paying" ? (
          <>
            <Spinner /> Waiting for payment
          </>
        ) : (
          "Upgrade · ₹" + LINK_PRICE_INR
        )}
      </button>
      {typeof pay === "object" ? (
        <div className="err" style={{ fontSize: 12, width: "100%" }}>
          {pay.error}
        </div>
      ) : null}
    </div>
  );
}

/** The link a guest can open, with Copy / WhatsApp / Open. On localhost the Wi-Fi address is shown, because only that one works on a phone. */
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
    <div style={{ textAlign: "left" }}>
      <div className="link-box">
        <input readOnly value={link} onFocus={(e) => e.currentTarget.select()} aria-label="Invite link" />
        <button className="btn sm primary" onClick={copy}>
          {copied ? "✓ Copied" : "Copy"}
        </button>
      </div>
      <div className="share-actions">
        <a className="btn wa" href={"https://wa.me/?text=" + encodeURIComponent(title + " - you're invited!\n" + link)} target="_blank" rel="noreferrer">
          Send on WhatsApp
        </a>
        <a className="btn" href={share.url} target="_blank" rel="noreferrer">
          Open invite ↗
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
