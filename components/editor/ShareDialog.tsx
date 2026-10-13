"use client";
import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Frame, Stage } from "@/components/Frame";
import { Watermark } from "@/app/e/[slug]/LiveInvite";
import type { Project } from "@/lib/types";
import { buildTimeline, coupleTitle, inviteDate, makeTheme } from "@/lib/project";
import { getTemplate } from "@/lib/templates";
import { BRAND } from "@/lib/brand";
import { LEADS, LINK_PRICE_INR, PAYMENTS, SHARE_STORE } from "@/lib/features";
import { normalizeEmail, normalizePhone, rememberContact, savedEmail, savedPhone, typingPhone } from "@/lib/contact";
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
 * A short link name nobody has to think about: a 3-character random code, then each person's first name,
 * e.g. k7x-aarav-ananya ("Harpreet Singh & Simran Kaur" → k7x-harpreet-simran). The code avoids look-alike
 * characters (0/o, 1/l/i) so it can be read out or typed. The rare clash is caught by POST /api/share (409),
 * and create() then takes the server's suggestion without asking.
 */
const CODE_CHARS = "abcdefghjkmnpqrstuvwxyz23456789";
const HONORIFICS = new Set(["dr", "mr", "mrs", "ms", "miss", "shri", "sri", "smt", "chi", "sow", "er", "capt", "lt"]);
const autoName = (title: string) => {
  const r = crypto.getRandomValues(new Uint8Array(3));
  const code = Array.from(r, (n) => CODE_CHARS[n % CODE_CHARS.length]).join("");
  const firsts = title
    .split("&")
    .map((part) => slugify(part).split("-").find((w) => w && !HONORIFICS.has(w)) ?? "")
    .filter(Boolean)
    .join("-");
  return code + "-" + (firsts.slice(0, 40).replace(/-+$/, "") || "invite");
};

/** The number they gave last time on this device, as they would type it ("98765 43210" for India). */
const lastPhone = () => typingPhone(savedPhone());
const MailIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m3 7 9 6 9-6" />
  </svg>
);

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

/** Consent line under the create/pay buttons (DPDP Act; Meta and Razorpay reviewers look for it). New tab, so the editor stays put. */
function AgreeNote({ paying }: { paying?: boolean }) {
  const a = (href: string, label: string) => (
    <a href={href} target="_blank" rel="noopener">
      {label}
    </a>
  );
  return (
    <p className="agree-note">
      By {paying ? "paying" : "continuing"} you agree to our {a("/terms", "Terms")}, {a("/privacy", "Privacy Policy")}
      {paying ? <> and {a("/refunds", "Refund Policy")}</> : null}.
    </p>
  );
}

/** "Get invite link" in the top bar: publishes the project as a live web invitation at /e/<name> (no MP4 render). */
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
  const [showClean, setShowClean] = useState(true); // phone preview: the clean invite they get after paying
  const [created, setCreated] = useState<string | null>(null); // the name of the link once it exists
  // Lead capture, optional: a WhatsApp number or an email (sent separately, never inside the published project).
  // One field at a time, so it never looks like both are needed; WhatsApp first unless they gave only an email before.
  const [via, setVia] = useState<"whatsapp" | "email">(() => (!savedPhone() && savedEmail() ? "email" : "whatsapp"));
  const [phone, setPhone] = useState(lastPhone);
  const [email, setEmail] = useState(savedEmail);
  const [contactBad, setContactBad] = useState<"invalid" | null>(null);
  const contactInput = useRef<HTMLInputElement>(null);
  const switched = useRef(false); // focus the field after they pick WhatsApp / Email, not when the dialog opens
  const caret = useRef<number | null>(null); // digits (and "+") before the caret, so reformatting "98765 43210" doesn't move it

  const chooseVia = (v: "whatsapp" | "email") => {
    switched.current = true;
    setVia(v);
    setContactBad(null);
  };
  const onPhone = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, selectionStart } = e.target;
    caret.current = value.slice(0, selectionStart ?? value.length).replace(/[^\d+]/g, "").length;
    setPhone(typingPhone(value));
    setContactBad(null);
  };
  useLayoutEffect(() => {
    const el = contactInput.current;
    if (caret.current === null || el?.type !== "tel") return;
    let i = 0;
    for (let seen = 0; i < el.value.length && seen < caret.current; i++) if (/[\d+]/.test(el.value[i])) seen++;
    el.setSelectionRange(i, i);
    caret.current = null;
  }, [phone]);

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
    // Only the field they can see is sent, even if they typed in the other one before switching. The field is optional
    // (fewer steps to the link); it only stops them when something was typed that isn't a valid number or email.
    const whatsapp = LEADS && via === "whatsapp" ? normalizePhone(phone) : null;
    const mail = LEADS && via === "email" ? normalizeEmail(email) : null;
    const typed = (via === "whatsapp" ? phone : email).trim();
    if (LEADS && typed && !whatsapp && !mail) {
      setContactBad("invalid");
      contactInput.current?.focus();
      return;
    }
    rememberContact(whatsapp, mail); // also pre-fills Razorpay Checkout
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
        fetch("/api/share", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ project: shared, title, card, name: n, phone: whatsapp ?? undefined, email: mail ?? undefined }) });
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
  const reachOk = via === "whatsapp" ? !!normalizePhone(phone) : !!normalizeEmail(email);

  return (
    <div className="backdrop-m" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={"modal share-modal" + (done ? " wide" : "")} role="dialog" aria-label="Share invitation">
        <div className="share-head">
          <div>
            <h3>{done ? "Your invitation link" : "Get your invitation link"}</h3>
            {done ? null : <p>Guests open the link and the invite plays in their browser, with music, on any phone or TV.</p>}
          </div>
          <button className="share-x" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <div className="share-body">
          {done ? (
            <div className="share-done">
              {/* top: status, link and sharing on the left; removing the watermark on the right */}
              <div className={"done-top" + (PAYMENTS && created ? " two" : "")}>
                <div>
                  <div className="done-head">
                    <div className="done-badge">✓</div>
                    <div>
                      <h4>{live ? "Your invite is live" : "Your preview link is ready"}</h4>
                      <p>{live ? "Every guest sees the clean invite." : "Share it with family to check. Remove the watermark whenever you're ready."}</p>
                    </div>
                  </div>
                  <SharePanel share={state} title={title} />
                </div>
                {PAYMENTS && created ? <PlanStatus pay={pay} onPay={() => removeWatermark(created)} /> : null}
              </div>

              {/* the guest's journey, told with three phones */}
              {"card" in state && state.card ? (
                <div className="journey">
                  <div className="share-label">Your guests&apos; journey</div>
                  <div className="journey-steps">
                    <div className="jstep">
                      <div className="jhead">
                        <span className="jnum">1</span>
                        <div>
                          <b>Arrives on WhatsApp</b>
                          <small>A rich preview with your names</small>
                        </div>
                      </div>
                      <PhoneShell screenClass="wa-screen">
                        <WhatsAppPreview card={state.card} title={title} link={state.lanUrl ?? state.url} host={host} />
                      </PhoneShell>
                    </div>
                    <div className="jarrow" aria-hidden>
                      →
                    </div>
                    <div className="jstep">
                      <div className="jhead">
                        <span className="jnum">2</span>
                        <div>
                          <b>They tap to open</b>
                          <small>Your names and date, music ready</small>
                        </div>
                      </div>
                      <CoverPhone project={project} title={title} />
                    </div>
                    <div className="jarrow" aria-hidden>
                      →
                    </div>
                    <div className="jstep">
                      <div className="jhead">
                        <span className="jnum">3</span>
                        <div>
                          <b>The invite plays</b>
                          <small>{!PAYMENTS || live ? "Clean, on any phone or TV" : showClean ? "After payment: no watermark" : "Free link: with watermark"}</small>
                        </div>
                      </div>
                      <InvitePhone project={project} watermarked={PAYMENTS && !live && !showClean} />
                      {PAYMENTS && !live ? (
                        <div className="seg phone-toggle" role="tablist">
                          <button className={showClean ? "" : "on"} onClick={() => setShowClean(false)}>
                            Free link
                          </button>
                          <button className={showClean ? "on" : ""} onClick={() => setShowClean(true)}>
                            After payment
                          </button>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
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

              {LEADS ? (
                <>
                  <div className="reach-head">
                    <label className="share-label" htmlFor="reach-input">
                      {via === "whatsapp" ? "Your WhatsApp number" : "Your email"} <span className="optional">(optional)</span>
                    </label>
                    <div className="seg" role="radiogroup" aria-label="How should we reach you?">
                      <button className={via === "whatsapp" ? "on" : ""} onClick={() => chooseVia("whatsapp")} disabled={busy} role="radio" aria-checked={via === "whatsapp"}>
                        <span className="seg-ico" aria-hidden>
                          <WhatsAppIcon size={13} />
                        </span>
                        WhatsApp
                      </button>
                      <button className={via === "email" ? "on" : ""} onClick={() => chooseVia("email")} disabled={busy} role="radio" aria-checked={via === "email"}>
                        <MailIcon /> Email
                      </button>
                    </div>
                  </div>
                  <div className={"url-field" + (via === "whatsapp" ? " phone" : "") + (contactBad ? " bad" : "")}>
                    {via === "whatsapp" ? (
                      <>
                        {phone.startsWith("+") ? null : <span className="host">+91</span>}
                        <input
                          key="phone"
                          id="reach-input"
                          ref={contactInput}
                          type="tel"
                          inputMode="tel"
                          autoComplete="tel-national"
                          placeholder="10-digit mobile number"
                          value={phone}
                          onChange={onPhone}
                          disabled={busy}
                          autoFocus={switched.current}
                          aria-invalid={!!contactBad}
                          aria-describedby="contact-note"
                        />
                      </>
                    ) : (
                      <input
                        key="email"
                        id="reach-input"
                        ref={contactInput}
                        type="email"
                        inputMode="email"
                        autoComplete="email"
                        placeholder="you@example.com"
                        maxLength={254}
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setContactBad(null);
                        }}
                        disabled={busy}
                        autoFocus={switched.current}
                        aria-invalid={!!contactBad}
                        aria-describedby="contact-note"
                      />
                    )}
                    {reachOk ? (
                      <span className="url-state ok" aria-hidden>
                        ✓
                      </span>
                    ) : null}
                  </div>
                  <div className="url-hint" id="contact-note" style={contactBad ? { color: "var(--danger)" } : undefined}>
                    {contactBad === "invalid"
                      ? via === "whatsapp"
                        ? "Enter a 10-digit mobile number, or leave it empty. Outside India? Start with + and your country code."
                        : "That email doesn't look right. Fix it, or leave it empty."
                      : "Optional: only if you'd like help with this invite. We never sell or share your details."}
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
                    <LockIcon /> Pay ₹{LINK_PRICE_INR} & get link
                  </>
                ) : PAYMENTS ? (
                  "Get free preview link"
                ) : (
                  "Get my invite link"
                )}
              </button>
              {premium ? <TrustRow /> : null}
              <AgreeNote paying={premium} />
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

/** A modern iPhone: thin frame with side buttons, Dynamic Island, status bar and home indicator. */
function PhoneShell({ children, screenClass = "", screenStyle }: { children: React.ReactNode; screenClass?: string; screenStyle?: React.CSSProperties }) {
  return (
    <div className="phone-frame">
      <div className={"phone-screen " + screenClass} style={screenStyle}>
        {children}
        <div className="phone-status" aria-hidden>
          <span>9:41</span>
          <span className="ps-icons">
            <svg width="15" height="10" viewBox="0 0 15 10" fill="currentColor">
              <rect x="0" y="7" width="3" height="3" rx="0.7" />
              <rect x="4" y="5" width="3" height="5" rx="0.7" />
              <rect x="8" y="2.5" width="3" height="7.5" rx="0.7" />
              <rect x="12" y="0" width="3" height="10" rx="0.7" />
            </svg>
            <svg width="13" height="10" viewBox="0 0 13 10" fill="currentColor">
              <path d="M6.5 2.3c1.8 0 3.4.7 4.6 1.8l1-1A8 8 0 0 0 6.5.9 8 8 0 0 0 .9 3.1l1 1a6.5 6.5 0 0 1 4.6-1.8z" />
              <path d="M6.5 5c1 0 2 .4 2.7 1.1l1-1A5.3 5.3 0 0 0 6.5 3.6 5.3 5.3 0 0 0 2.8 5.1l1 1C4.5 5.4 5.5 5 6.5 5z" />
              <circle cx="6.5" cy="8.3" r="1.4" />
            </svg>
            <svg width="22" height="10" viewBox="0 0 22 10" fill="none">
              <rect x="0.5" y="0.5" width="18" height="9" rx="2.6" stroke="currentColor" opacity="0.45" />
              <rect x="2" y="2" width="15" height="6" rx="1.5" fill="currentColor" />
              <rect x="19.6" y="3.2" width="1.6" height="3.6" rx="0.8" fill="currentColor" opacity="0.5" />
            </svg>
          </span>
        </div>
        <div className="phone-island" aria-hidden />
        <div className="phone-home" aria-hidden />
      </div>
    </div>
  );
}

/** The cover a guest lands on after tapping the link: names, date and the "Open invitation" button. */
function CoverPhone({ project, title }: { project: Project; title: string }) {
  const t = makeTheme(getTemplate(project.templateId), project.paletteId);
  const date = inviteDate(project.data);
  return (
    <PhoneShell screenClass="cover-screen" screenStyle={{ background: "radial-gradient(ellipse at 50% 35%, " + t.bg + " 0%, " + t.bg2 + " 85%)", color: t.ink }}>
        <div className="cv-kicker" style={{ color: t.accent }}>
          YOU&apos;RE INVITED
        </div>
        <div className="cv-names">{title}</div>
        <div className="cv-rule" style={{ color: t.accent }}>
          <i />
          <b />
          <i />
        </div>
        {date ? (
          <div className="cv-date" style={{ color: t.soft }}>
            {date}
          </div>
        ) : null}
        <div className="cv-btn" style={{ background: t.accent, color: t.bg2 }}>
          ✉ Open invitation
          <span className="cv-tap" aria-hidden />
        </div>
    </PhoneShell>
  );
}

/** The invite itself, playing on a phone, with or without the free-link watermark (same overlay as the guest page). */
function InvitePhone({ project, watermarked }: { project: Project; watermarked: boolean }) {
  const tl = useMemo(() => buildTimeline({ ...project, orientation: "vertical" }), [project]);
  const [T, setT] = useState(0);
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(100, now - last);
      last = now;
      setT((t) => (t + dt * (project.speed || 1)) % tl.total); // loops
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [tl, project.speed]);
  return (
    // Taller than 9:16 like a real iPhone: the gaps take the invite's own background, as on the guest page.
    <PhoneShell screenStyle={{ background: tl.theme.bg2 }}>
        <Stage W={1080} H={1920}>
          <Frame project={{ ...project, orientation: "vertical" }} template={tl.template} theme={tl.theme} scenes={tl.scenes} slots={tl.slots} total={tl.total} T={T} playing />
        </Stage>
        {watermarked ? (
          <div className="phone-wm">
            <Watermark />
          </div>
        ) : null}
    </PhoneShell>
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
      <AgreeNote paying />
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
