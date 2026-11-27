"use client";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Frame, Stage } from "@/components/Frame";
import { SIZES, buildTimeline, inviteDate } from "@/lib/project";
import type { Orientation, Project } from "@/lib/types";
import { LEADS, LINK_PRICE_INR } from "@/lib/features";
import { payToRemoveWatermark } from "@/lib/pay";
import { inviteId, startAnalytics, track } from "@/lib/analytics";
import { BRAND } from "@/lib/brand";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { Confetti } from "@/components/Celebrate";
import { AgreeNote, LockIcon, TrustRow } from "@/components/PayTrust";
import { normalizeEmail, normalizePhone, rememberContact, savedEmail, savedPhone, typingPhone } from "@/lib/contact";
import { ownerKeyFor, takeJustCreated } from "@/lib/owner";
import { countdownText, daysUntil, inviteDetails } from "@/lib/inviteDetails";
import { GuestDetails } from "./GuestDetails";

/* The guest's view of a live share: the same <Frame/> as the editor, driven by
   a rAF clock. It opens on a "tap to open" cover, because browsers only allow
   music to start after a tap.

   The couple who made the link land here 3 seconds after "Get link" in the studio. Their browser holds the link's
   owner key (lib/owner.ts), so they get owner tools instead of the guest bar: a note on the cover, an owner bar,
   and a sheet (opened by the bar, and by itself when the invite ends) to remove the watermark, share the link and
   leave a WhatsApp number or email. The page itself stays the same static HTML for everyone (ISR): all of
   this is decided in the browser. */

type Phase = "cover" | "opening" | "playing" | "paused" | "ended";

/** Photos decoded up front, so none appears half-loaded. */
function decodeImages(project: Project): Promise<unknown> {
  const urls: string[] = [];
  const walk = (v: any) => {
    if (Array.isArray(v)) v.forEach(walk);
    else if (v && typeof v === "object" && v.kind === "image" && v.src) urls.push(v.src);
  };
  Object.values(project.data).forEach(walk);
  return Promise.all(
    urls.map((u) => {
      const im = new Image();
      im.src = u;
      return im.decode().catch(() => null);
    })
  );
}

/**
 * Lays out every scene once, invisibly, as it looks when all its text is in.
 * The browser then fetches exactly the font files (and script subsets) this
 * invite uses, instead of all ~170 faces the app ships (about 2.4 MB), and no
 * frame of the real playback shows a fallback font.
 */
function Warmup({ tl, project, o, onReady }: { tl: ReturnType<typeof buildTimeline>; project: Project; o: Orientation; onReady: () => void }) {
  useEffect(() => {
    let off = false;
    const fonts: Promise<unknown> = (document as any).fonts?.ready ?? Promise.resolve();
    // Two frames: layout has run and every needed font load has started.
    requestAnimationFrame(() => requestAnimationFrame(() => fonts.then(() => !off && onReady())));
    return () => {
      off = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const { W, H } = SIZES[o];
  const base = { W, H, vertical: o === "vertical", data: project.data, theme: tl.theme, deterministic: false, playing: false };
  return (
    <div aria-hidden style={{ position: "fixed", left: -4 * W, top: 0, width: W, height: H, overflow: "hidden", visibility: "hidden", pointerEvents: "none" }}>
      {tl.template.backdrop ? tl.template.backdrop({ ...base, T: tl.total / 2, total: tl.total }) : null}
      {tl.scenes.map((s) => {
        const t = Math.max(0, s.duration - (s.out?.dur ?? 0) - 1);
        return (
          <div key={s.id} style={{ position: "absolute", inset: 0 }}>
            {s.render({ ...base, t, d: s.duration, p: t / s.duration })}
          </div>
        );
      })}
    </div>
  );
}

/**
 * Free-link watermark: a faint diagonal "BRAND · PREVIEW" pattern over the whole
 * invite, a stripe across the middle and a corner badge, all always on. The soft
 * shadow keeps it visible on dark and cream templates alike; the invite stays readable.
 */
export function Watermark() {
  const mark = BRAND.toUpperCase() + " · PREVIEW";
  const shadow = "0 1px 3px rgba(0,0,0,.45)";
  return (
    <div aria-hidden style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          inset: "-60%",
          transform: "rotate(-28deg)",
          display: "flex",
          flexWrap: "wrap",
          alignContent: "center",
          justifyContent: "center",
          gap: "56px 72px",
          color: "rgba(255,255,255,.2)",
          textShadow: shadow,
          fontSize: 17,
          fontWeight: 600,
          letterSpacing: "0.3em",
        }}
      >
        {Array.from({ length: 90 }, (_, i) => (
          <span key={i} style={{ whiteSpace: "nowrap" }}>
            {mark}
          </span>
        ))}
      </div>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: "50%",
          transform: "translateY(-50%)",
          padding: "16px 12px",
          background: "rgba(0,0,0,.55)",
          color: "#fff",
          textAlign: "center",
          fontSize: 14,
          letterSpacing: "0.3em",
          whiteSpace: "nowrap",
        }}
      >
        PREVIEW · {BRAND.toUpperCase()}
      </div>
      <div
        style={{
          position: "absolute",
          top: 14,
          left: 14,
          padding: "6px 11px",
          borderRadius: 99,
          background: "rgba(0,0,0,.55)",
          color: "#fff",
          fontSize: 11,
          letterSpacing: "0.12em",
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
        }}
      >
        PREVIEW · {BRAND}
      </div>
    </div>
  );
}

export function LiveInvite({ project, title, name, watermark = false }: { project: Project; title: string; name?: string; watermark?: boolean }) {
  const [phase, setPhase] = useState<Phase>("cover");
  const [o, setO] = useState<Orientation>(project.orientation);
  const [T, setT] = useState(0);
  const [muted, setMuted] = useState(false);
  const audio = useRef<HTMLAudioElement | null>(null);
  const wantMusic = useRef(false);
  const images = useRef<Promise<unknown> | null>(null);
  const [warming, setWarming] = useState(false);
  const fonts = useRef<{ promise: Promise<void>; resolve: () => void } | null>(null);
  if (!fonts.current) {
    let resolve = () => {};
    const promise = new Promise<void>((r) => (resolve = r));
    fonts.current = { promise, resolve };
  }

  const tl = useMemo(() => buildTimeline({ ...project, orientation: o }), [project, o]);
  const { theme, total } = tl;
  const speed = project.speed || 1;
  const music = project.music;
  const date = useMemo(() => inviteDate(project.data), [project]);
  const playing = phase === "playing";
  const watched = useRef(false);
  const [paidHere, setPaidHere] = useState(false); // paid on this page: drop the watermark now, no reload needed
  const marked = watermark && !paidHere;
  const [ownerKey, setOwnerKey] = useState<string | null>(null); // set: the couple who made this link
  const [welcome, setWelcome] = useState(false); // they just came from "Get link"
  const [sheet, setSheet] = useState(false);
  const sheetShown = useRef(false);

  useEffect(() => {
    const key = ownerKeyFor(name);
    setOwnerKey(key);
    setWelcome(!!key && takeJustCreated(name));
    startAnalytics("guest_page", { invite_id: name && inviteId(name), template_id: project.templateId, is_watermarked: watermark, is_owner: !!key });
  }, [name, project, watermark]);
  useEffect(() => {
    if (phase !== "ended") return;
    // The couple has just watched their invite: now is the moment for the owner sheet (once per visit).
    if (ownerKey && !sheetShown.current) {
      sheetShown.current = true;
      setSheet(true);
    }
    if (watched.current) return;
    watched.current = true; // "Watch again" doesn't count twice
    track("invite_watched");
  }, [phase, ownerKey]);

  // Both layouts are hand-tuned, so phones get 9:16 and laptops/TVs 16:9.
  useEffect(() => {
    const mq = window.matchMedia("(orientation: portrait)");
    const pick = () => setO(mq.matches ? "vertical" : "horizontal");
    pick();
    mq.addEventListener("change", pick);
    // Start loading while the guest reads the cover.
    images.current = decodeImages(project);
    setWarming(true);
    return () => mq.removeEventListener("change", pick);
  }, [project]);

  /* ---------- clock ---------- */
  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(100, now - last); // no jump after a stalled tab
      last = now;
      setT((prev) => {
        const n = prev + dt * speed;
        if (n >= total) {
          setPhase("ended");
          return total;
        }
        return n;
      });
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [playing, speed, total]);

  useEffect(() => {
    const hide = () => document.hidden && setPhase((p) => (p === "playing" ? "paused" : p));
    document.addEventListener("visibilitychange", hide);
    return () => document.removeEventListener("visibilitychange", hide);
  }, []);

  /* ---------- music (synced on play/pause, like the editor) ---------- */
  useEffect(() => {
    const a = audio.current;
    if (!a || !music) return;
    wantMusic.current = playing;
    if (playing) {
      a.currentTime = (music.offset || 0) + T / speed / 1000;
      a.muted = muted;
      a.play().catch(() => {});
    } else a.pause();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing]);

  useEffect(() => {
    const a = audio.current;
    if (!a || !music) return;
    a.muted = muted;
    const fade = Math.min(1, (total - T) / speed / 2200, T / speed / 600 + 0.0001);
    a.volume = Math.max(0, Math.min(1, music.volume * fade));
  }, [T, total, speed, music, muted]);

  /** iOS only lets audio start inside a tap handler: start it muted now, the clock unmutes it. */
  const unlockAudio = () => {
    const a = audio.current;
    if (!a) return;
    a.muted = true;
    a.play().then(() => !wantMusic.current && a.pause()).catch(() => {});
  };

  const open = async () => {
    unlockAudio();
    track("invite_opened", { orientation: o });
    setPhase("opening");
    await Promise.race([Promise.all([fonts.current!.promise, images.current]), new Promise((r) => setTimeout(r, 6000))]);
    setT(0);
    setPhase("playing");
  };

  const toggle = useCallback(() => {
    if (phase === "playing") setPhase("paused");
    else if (phase === "paused") {
      unlockAudio();
      setPhase("playing");
    } else if (phase === "ended") {
      unlockAudio();
      setT(0);
      setPhase("playing");
    }
  }, [phase]);

  /* ---------- story controls: tap right = next scene, tap left = back, hold = pause (like Instagram stories) ---------- */
  const seek = (t: number) => {
    setT(t);
    const a = audio.current;
    if (a && music && phase === "playing") a.currentTime = (music.offset || 0) + t / speed / 1000;
  };
  const sceneAt = (t: number) => tl.slots.reduce((at, s, i) => (s.start <= t + 1 ? i : at), 0);
  const nextScene = () => {
    const i = sceneAt(T);
    if (i + 1 < tl.slots.length) seek(tl.slots[i + 1].start);
    else {
      setT(total);
      setPhase("ended");
    }
  };
  const prevScene = () => {
    const i = sceneAt(T);
    seek(i === 0 || T - tl.slots[i].start > 1200 ? tl.slots[i].start : tl.slots[i - 1].start);
  };
  const press = useRef<{ x: number; held: boolean; timer: ReturnType<typeof setTimeout> } | null>(null);
  const [holding, setHolding] = useState(false);
  const resume = () => {
    unlockAudio();
    setHolding(false);
    setPhase("playing");
  };
  const onDown = (e: React.PointerEvent) => {
    if (phase !== "playing") return;
    const p = { x: e.clientX / window.innerWidth, held: false, timer: setTimeout(() => {
      p.held = true;
      setHolding(true);
      setPhase("paused");
    }, 260) };
    press.current = p;
  };
  const onUp = () => {
    const p = press.current;
    press.current = null;
    if (!p) {
      if (phase === "paused") resume(); // paused by leaving the tab: any tap plays on
      return;
    }
    clearTimeout(p.timer);
    if (p.held) resume();
    else if (p.x < 0.3) prevScene();
    else nextScene();
  };
  const onCancel = () => {
    const p = press.current;
    press.current = null;
    if (!p) return;
    clearTimeout(p.timer);
    if (p.held) resume();
  };
  // A one-time hint the first time it plays, so guests know they can skip ahead.
  const [hint, setHint] = useState(false);
  const hinted = useRef(false);
  useEffect(() => {
    if (phase !== "playing" || hinted.current) return;
    hinted.current = true;
    setHint(true);
    const id = setTimeout(() => setHint(false), 3400);
    return () => clearTimeout(id);
  }, [phase]);

  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (e.code === "ArrowRight" && (phase === "playing" || phase === "paused")) return nextScene();
      if (e.code === "ArrowLeft" && (phase === "playing" || phase === "paused")) return prevScene();
      if (e.code !== "Space") return;
      e.preventDefault();
      if (phase === "cover") open();
      else toggle();
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, toggle, T]);

  // "49 days to go" on the cover: worked out in the browser (the cover HTML is cached for everyone).
  const [countdown, setCountdown] = useState("");
  useEffect(() => {
    const ev = inviteDetails(project.templateId, project.data).events.find((e) => daysUntil(e.date) >= 0);
    setCountdown(ev ? countdownText(daysUntil(ev.date)) : "");
  }, [project]);

  const { W, H } = SIZES[o];
  const ink = theme.ink;
  const round = (size: number): React.CSSProperties => ({
    width: size,
    height: size,
    borderRadius: "50%",
    border: "1px solid rgba(255,255,255,.25)",
    background: "rgba(0,0,0,.45)",
    color: "#fff",
    display: "grid",
    placeItems: "center",
    backdropFilter: "blur(6px)",
    WebkitBackdropFilter: "blur(6px)",
  });

  return (
    <main className="guest-ui" style={{ position: "fixed", inset: 0, overflow: "hidden", background: theme.bg2, userSelect: "none" }}>
      {music ? <audio ref={audio} src={music.src} preload="auto" /> : null}
      {warming ? (
        <Warmup
          tl={tl}
          project={project}
          o={o}
          onReady={() => {
            fonts.current!.resolve();
            setWarming(false);
          }}
        />
      ) : null}

      {phase !== "cover" ? (
        <div
          onPointerDown={onDown}
          onPointerUp={onUp}
          onPointerCancel={onCancel}
          onPointerLeave={onCancel}
          onContextMenu={(e) => e.preventDefault()}
          style={{ position: "absolute", inset: 0, cursor: "pointer", touchAction: "manipulation", WebkitTouchCallout: "none" } as React.CSSProperties}
        >
          <Stage W={W} H={H}>
            <Frame project={{ ...project, orientation: o }} template={tl.template} theme={theme} scenes={tl.scenes} slots={tl.slots} total={total} T={Math.min(T, total)} playing={playing} />
          </Stage>
        </div>
      ) : null}

      {/* progress: one segment per scene, like stories */}
      {phase !== "cover" ? (
        <div className="story-bar" aria-hidden>
          {tl.slots.map((s, i) => {
            const end = i + 1 < tl.slots.length ? tl.slots[i + 1].start : total;
            const f = Math.max(0, Math.min(1, (Math.min(T, total) - s.start) / Math.max(1, end - s.start)));
            return (
              <i key={i}>
                <b style={{ transform: "scaleX(" + f.toFixed(4) + ")" }} />
              </i>
            );
          })}
        </div>
      ) : null}
      {hint && phase === "playing" ? <div className="tap-hint">Tap to skip ›&nbsp; · &nbsp;Hold to pause</div> : null}

      {marked ? <Watermark /> : null}

      {music && (phase === "playing" || phase === "paused") ? (
        <button aria-label={muted ? "Unmute" : "Mute"} onClick={() => setMuted((m) => !m)} style={{ ...round(42), position: "absolute", top: 24, right: 14, fontSize: 18 }}>
          {muted ? "🔇" : "🔊"}
        </button>
      ) : null}

      {phase === "paused" && !holding ? (
        <button aria-label="Play" onClick={toggle} style={{ ...round(84), position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)", fontSize: 30, paddingLeft: 6 }}>
          ▶
        </button>
      ) : null}

      {phase === "ended" ? (
        <div className="end-shade">
          <GuestDetails project={project} title={title} name={name} onReplay={toggle} />
          {/* Free links only (they already carry our name): guests planning a function of their own find the maker.
              Paid links stay clean. The utm tags attribute the visit (lib/analytics keeps them); no invite details go along. */}
          {marked && !ownerKey ? (
            <a className="end-make" href={"/templates/" + project.templateId + "?utm_source=invite&utm_medium=guest_page"}>
              Make your own invitation →
            </a>
          ) : null}
        </div>
      ) : null}

      {/* cover: rendered on the server, so the page shows instantly */}
      {phase === "cover" || phase === "opening" ? (
        <div
          onClick={phase === "cover" ? open : undefined}
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 14,
            padding: "24px 16px",
            textAlign: "center",
            cursor: phase === "cover" ? "pointer" : "progress",
            color: ink,
            background: "radial-gradient(ellipse at 50% 35%, " + theme.bg + " 0%, " + theme.bg2 + " 85%)",
          }}
        >
          <div className="cover-in" style={{ position: "relative", fontFamily: "var(--f-cinzel)", fontSize: 12, letterSpacing: "0.38em", color: theme.accent }}>
            YOU&apos;RE INVITED
          </div>
          <h1 className="cover-in d1" style={{ position: "relative", margin: 0, fontFamily: "var(--f-vibes)", fontWeight: 400, fontSize: "clamp(44px, 13vw, 92px)", lineHeight: 1.1, color: ink }}>
            {title}
          </h1>
          {/* ornament + date, so the cover already says when */}
          <div className="cover-in d2" style={{ position: "relative", display: "flex", alignItems: "center", gap: 10, color: theme.accent, opacity: 0.85 }}>
            <span style={{ width: 54, height: 1, background: "currentColor" }} />
            <span style={{ width: 7, height: 7, transform: "rotate(45deg)", background: "currentColor" }} />
            <span style={{ width: 54, height: 1, background: "currentColor" }} />
          </div>
          {date ? (
            <div className="cover-in d2" style={{ position: "relative", fontFamily: "var(--f-cinzel)", fontSize: 13, letterSpacing: "0.16em", color: theme.soft }}>
              {date}
            </div>
          ) : null}
          {countdown ? (
            <div className="cover-count" style={{ color: theme.accent, borderColor: theme.accent + "66" }}>
              {countdown}
            </div>
          ) : null}
          <button
            className="btn primary open-btn"
            style={{ position: "relative", marginTop: 16, padding: "14px 34px", fontSize: 15, borderRadius: 99, background: theme.accent, color: theme.bg2 }}
            disabled={phase === "opening"}
          >
            {phase === "opening" ? "Opening..." : "✉  Open invitation"}
          </button>
          {music ? (
            <div className="cover-in d3" style={{ position: "relative", fontSize: 12, opacity: 0.7 }}>
              Turn your sound on 🔊
            </div>
          ) : null}
        </div>
      ) : null}

      {/* The couple's own visit: a note on the cover, their bar, their sheet. Guests get the guest bar. */}
      {ownerKey && (phase === "cover" || phase === "opening") ? (
        <div className={"owner-note" + (welcome ? " welcome" : "")}>
          {welcome ? (
            <>
              <b>🎉 Your invite is live!</b> This is exactly what your guests will see. Tap to watch it.
            </>
          ) : (
            <>
              <b>Your invite</b> · this is what your guests see
            </>
          )}
        </div>
      ) : null}
      {ownerKey && name ? (
        <>
          <OwnerBar title={title} name={name} watermark={marked} onOpen={() => setSheet(true)} />
          {sheet ? (
            <OwnerSheet title={title} name={name} ownerKey={ownerKey} watermark={marked} onPaid={() => setPaidHere(true)} onClose={() => setSheet(false)} />
          ) : null}
        </>
      ) : (
        <GuestBar title={title} name={name} watermark={marked} onPaid={() => setPaidHere(true)} />
      )}
    </main>
  );
}

/** The link guests should get: this page's own address, without anything after it. */
const inviteUrl = (name: string) => window.location.origin + "/e/" + name;
const inviteText = (title: string) => title + " - you're invited!";

function shareOnWhatsApp(title: string, name: string) {
  track("invite_shared", { channel: "whatsapp", invite_id: inviteId(name) });
  window.open("https://wa.me/?text=" + encodeURIComponent(inviteText(title) + "\n" + inviteUrl(name)), "_blank", "noopener");
}

/** The couple's bar at the bottom: the one next step (remove the watermark, or share) and WhatsApp. Opens the sheet. */
function OwnerBar({ title, name, watermark, onOpen }: { title: string; name: string; watermark: boolean; onOpen: () => void }) {
  return (
    <div className="guest-bar owner-bar">
      <button className="gb-pay ob-main" onClick={onOpen}>
        <span className="gb-ico" aria-hidden>
          {watermark ? "✦" : "✓"}
        </span>
        <span className="gb-text">
          <b>{watermark ? "Remove the watermark" : "Your invite is live"}</b>
          <span>{watermark ? "Before you send it · one-time" : "Send it to your guests"}</span>
        </span>
        <span className="btn primary sm">{watermark ? "₹" + LINK_PRICE_INR : "Share"}</span>
      </button>
      <button className="gb-wa" onClick={() => shareOnWhatsApp(title, name)} aria-label="Send on WhatsApp" title="Send on WhatsApp">
        <WhatsAppIcon size={26} />
      </button>
    </div>
  );
}

type PayState = "idle" | "paying" | "paid" | { error: string };

/**
 * The couple's sheet: remove the watermark (free links), share the link, and optionally leave a WhatsApp number or
 * email (saved with the owner key, app/api/share/contact). Paying refreshes this same link for every guest.
 */
function OwnerSheet({
  title,
  name,
  ownerKey,
  watermark,
  onPaid,
  onClose,
}: {
  title: string;
  name: string;
  ownerKey: string;
  watermark: boolean;
  onPaid: () => void;
  onClose: () => void;
}) {
  const [pay, setPay] = useState<PayState>("idle");
  const [copied, setCopied] = useState(false);
  const [canShare, setCanShare] = useState(false);
  useEffect(() => setCanShare(!!navigator.share), []);
  const link = inviteUrl(name);

  const removeWatermark = async () => {
    setPay("paying");
    try {
      // Paid: the server has refreshed this link for everyone; here the watermark goes at once (no reload).
      if ((await payToRemoveWatermark(name, title)) === "paid") {
        onPaid();
        setPay("paid");
      } else setPay("idle");
    } catch (e: any) {
      setPay({ error: e?.message || String(e) });
    }
  };

  const copy = async () => {
    track("invite_shared", { channel: "copy", invite_id: inviteId(name) });
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      window.prompt("Copy this link", link);
    }
  };

  return (
    <div className="owner-back" onClick={(e) => e.target === e.currentTarget && onClose()}>
      {pay === "paid" ? <Confetti y={30} /> : null}
      <div className="owner-sheet" role="dialog" aria-label="Your invite">
        <button className="os-x" onClick={onClose} aria-label="Close">
          ✕
        </button>

        {watermark ? (
          <section className="os-pay">
            <h3>Remove the watermark before you send it</h3>
            <p>
              Guests will see &ldquo;{BRAND.toUpperCase()} · PREVIEW&rdquo; across your invite. Remove it once and this same link turns clean for
              everyone.
            </p>
            <div className="os-price">
              <b>₹{LINK_PRICE_INR}</b>
              <span>one-time · no subscription</span>
            </div>
            <ul className="os-ticks">
              <li>Same link, nothing to resend</li>
              <li>Clean for every guest</li>
              <li>Done in seconds</li>
            </ul>
            <button className="btn primary os-cta" onClick={removeWatermark} disabled={pay === "paying"}>
              {pay === "paying" ? (
                <>
                  <span className="spin" aria-hidden /> Waiting for payment…
                </>
              ) : (
                <>
                  <LockIcon /> Remove watermark · ₹{LINK_PRICE_INR}
                </>
              )}
            </button>
            {typeof pay === "object" ? <p className="os-err">{pay.error}</p> : null}
            <TrustRow />
            <AgreeNote paying />
          </section>
        ) : (
          <section className="os-done">
            <h3>{pay === "paid" ? "Watermark removed 🎉" : "Your invite is ready to send"}</h3>
            <p>{pay === "paid" ? "Every guest now sees the clean invite, on this same link." : "Share this link with your family and guests."}</p>
          </section>
        )}

        <section className="os-share">
          <span className="os-label">{watermark ? "Or share it as it is" : "Your link"}</span>
          <div className={"os-link" + (copied ? " copied" : "")}>
            <span className="url" title={link}>
              {link.replace(/^https?:\/\/(www\.)?/, "")}
            </span>
            <button onClick={copy}>{copied ? "✓ Copied" : "Copy"}</button>
          </div>
          <div className="os-share-row">
            <button className="btn wa" onClick={() => shareOnWhatsApp(title, name)}>
              <WhatsAppIcon size={20} /> Send on WhatsApp
            </button>
            {canShare ? (
              <button
                className="btn"
                onClick={() =>
                  navigator.share({ title, text: inviteText(title), url: link }).then(() => track("invite_shared", { channel: "native_share", invite_id: inviteId(name) }), () => {})
                }
              >
                More apps
              </button>
            ) : null}
          </div>
        </section>

        {LEADS ? <OwnerContact name={name} ownerKey={ownerKey} watermark={watermark} /> : null}
      </div>
    </div>
  );
}

/** Optional: a WhatsApp number or an email, so we can help them finish and remind them. One field, with a toggle. */
function OwnerContact({ name, ownerKey, watermark }: { name: string; ownerKey: string; watermark: boolean }) {
  const [via, setVia] = useState<"whatsapp" | "email">("whatsapp");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "saving" | "saved" | { error: string }>("idle");
  // What they gave before on this device, so saving is one tap.
  useEffect(() => {
    setPhone(typingPhone(savedPhone()));
    setEmail(savedEmail());
    if (!savedPhone() && savedEmail()) setVia("email");
  }, []);

  const save = async () => {
    const p = via === "whatsapp" ? normalizePhone(phone) : null;
    const m = via === "email" ? normalizeEmail(email) : null;
    if (!p && !m)
      return setState({ error: via === "whatsapp" ? "Enter a 10-digit mobile number. Outside India? Start with + and your country code." : "That email doesn't look right." });
    setState("saving");
    try {
      const res = await fetch("/api/share/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, key: ownerKey, phone: p ?? undefined, email: m ?? undefined }),
      });
      const r = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(r.error || "Could not save it");
      rememberContact(p, m); // also pre-fills Razorpay Checkout
      setState("saved");
    } catch (e: any) {
      setState({ error: e?.message || String(e) });
    }
  };

  if (state === "saved")
    return (
      <section className="os-contact saved">
        <b>✓ Saved.</b> We&apos;ll only message you about this invite. Reply STOP anytime.
      </section>
    );
  return (
    <section className="os-contact">
      <span className="os-label">
        {watermark ? "Not ready yet? We can remind you" : "Need help with your invite?"} <em>(optional)</em>
      </span>
      <div className="os-contact-row">
        <div className="seg" role="radiogroup" aria-label="How should we reach you?">
          <button className={via === "whatsapp" ? "on" : ""} onClick={() => setVia("whatsapp")} role="radio" aria-checked={via === "whatsapp"}>
            WhatsApp
          </button>
          <button className={via === "email" ? "on" : ""} onClick={() => setVia("email")} role="radio" aria-checked={via === "email"}>
            Email
          </button>
        </div>
        {via === "whatsapp" ? (
          <input
            key="phone"
            className="os-input"
            type="tel"
            inputMode="tel"
            autoComplete="tel-national"
            placeholder="10-digit mobile number"
            value={phone}
            onChange={(e) => {
              setPhone(typingPhone(e.target.value));
              if (typeof state === "object") setState("idle");
            }}
            aria-label="Your WhatsApp number"
          />
        ) : (
          <input
            key="email"
            className="os-input"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="you@example.com"
            maxLength={254}
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (typeof state === "object") setState("idle");
            }}
            aria-label="Your email"
          />
        )}
        <button className="btn os-save" onClick={save} disabled={state === "saving"}>
          {state === "saving" ? <span className="spin" aria-hidden /> : "Save"}
        </button>
      </div>
      <p className={"os-note" + (typeof state === "object" ? " bad" : "")}>
        {typeof state === "object" ? state.error : "We only contact you about this invite and never sell or share your details."}
      </p>
    </section>
  );
}

/**
 * Always-on actions at the bottom of the invite: share on WhatsApp, and on a free
 * (watermarked) link, remove the watermark. Paying refreshes this same link for everyone.
 */
function GuestBar({ title, name, watermark, onPaid }: { title: string; name?: string; watermark: boolean; onPaid: () => void }) {
  const [msg, setMsg] = useState<string | null>(null);
  const busy = msg === "Opening payment...";
  const whatsapp = () => {
    const url = window.location.href.split("#")[0];
    track("invite_shared", { channel: "whatsapp" });
    window.open("https://wa.me/?text=" + encodeURIComponent(title + " - you're invited!\n" + url), "_blank", "noopener");
  };
  const pay = async () => {
    if (!name) return;
    setMsg("Opening payment...");
    try {
      // Paid: the server has refreshed this link for every guest. Here the watermark goes at once, without a
      // reload that could still be answered by the old copy while the refresh spreads.
      if ((await payToRemoveWatermark(name, title)) === "paid") onPaid();
      setMsg(null);
    } catch (e: any) {
      setMsg(e?.message || String(e));
    }
  };
  return (
    <div className="guest-bar">
      {watermark && name ? (
        <div className="gb-pay">
          <span className="gb-ico" aria-hidden>
            ✦
          </span>
          <div className="gb-text">
            <b>Remove watermark</b>
            <span>{msg && !busy ? msg : "One-time · secure payment"}</span>
          </div>
          <button className="btn primary sm" onClick={pay} disabled={busy}>
            {busy ? <span className="spin" aria-hidden /> : null}
            Pay ₹{LINK_PRICE_INR}
          </button>
        </div>
      ) : (
        <div style={{ flex: 1 }} />
      )}
      <button className="gb-wa" onClick={whatsapp} aria-label="Share on WhatsApp" title="Share on WhatsApp">
        <WhatsAppIcon size={26} />
      </button>
    </div>
  );
}
