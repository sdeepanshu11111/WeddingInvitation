"use client";
import React, { useEffect, useRef, useState } from "react";
import type { Theme } from "@/lib/types";
import { inviteId, track } from "@/lib/analytics";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";

/* The guest page's interactive extras (owner, 2026-11-17: "more interactive and engaging"). Each one is switchable per
   invite in the studio (Project.guest, `guestOn`). They live on the guest page only, never inside a template's scenes,
   so the "pure function of time" rule and the MP4 export are untouched; CSS animation and Math.random are fine here.

   - Envelope: the cover's open button becomes a sealed envelope; the guest taps the wax seal and it opens.
   - Scratch card: on the date scene a gold foil covers the screen and the guest scratches the date free. The story
     waits for it, and the foil dissolves by itself if nobody touches it, so nobody gets stuck.
   - Blessings: "Send blessings" at the end, a shower of petals, and a count of everyone's blessings on the invite.
   - Personal greeting: /e/<name>?to=Sharma%20ji puts "Dear Sharma ji" on the cover. The couple makes these links in
     their sheet. The name is read in the browser only: never stored, never sent to analytics (the guest page strips
     its address from Mixpanel, and no other tracker runs on /e/). */

/* ---------------- personal greeting ---------------- */

/** "Sharma ji" from ?to=, cleaned: letters, spaces and simple punctuation, at most 40 characters. */
export function useGreeting(): string {
  const [to, setTo] = useState("");
  useEffect(() => {
    const raw = new URLSearchParams(window.location.search).get("to") ?? "";
    setTo(raw.replace(/[\u0000-\u001F<>{}[\]\\/@#$%^*=+|~`"]/g, "").replace(/\s+/g, " ").trim().slice(0, 40));
  }, []);
  return to;
}

/** The couple's sheet: a link that greets one guest by name, to send on WhatsApp or copy. */
export function PersonalLink({ name, title, link }: { name: string; title: string; link: string }) {
  const [who, setWho] = useState("");
  const [copied, setCopied] = useState(false);
  const clean = who.replace(/\s+/g, " ").trim().slice(0, 40);
  const url = clean ? link + "?to=" + encodeURIComponent(clean) : "";
  const whatsapp = () => {
    track("invite_personalised", { invite_id: inviteId(name), channel: "whatsapp" });
    window.open("https://wa.me/?text=" + encodeURIComponent("Dear " + clean + ", " + title + " - you're invited!\n" + url), "_blank", "noopener");
  };
  const copy = async () => {
    track("invite_personalised", { invite_id: inviteId(name), channel: "copy" });
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      window.prompt("Copy this link", url);
    }
  };
  return (
    <section className="os-personal">
      <span className="os-label">
        Invite a guest by name <em>(optional)</em>
      </span>
      <p className="os-note">Their invite opens with &ldquo;Dear {clean || "…"}&rdquo;. Same invite, same link, just personal.</p>
      <input className="os-input" maxLength={40} placeholder="e.g. Sharma ji, Priya didi" value={who} onChange={(e) => setWho(e.target.value)} aria-label="Guest's name" />
      {clean ? (
        <div className="os-share-row">
          <button className="btn wa" onClick={whatsapp}>
            <WhatsAppIcon size={20} /> Send to {clean.length > 16 ? clean.slice(0, 15) + "…" : clean}
          </button>
          <button className="btn" onClick={copy}>
            {copied ? "✓ Copied" : "Copy link"}
          </button>
        </div>
      ) : null}
    </section>
  );
}

/* ---------------- envelope ---------------- */

const initials = (title: string) =>
  title
    .split(/\s*&\s*|\s+and\s+/i)
    .map((p) => p.trim().replace(/^(dr|mr|mrs|ms|shri|sri|smt|chi|sow)\.?\s+/i, "").charAt(0).toUpperCase())
    .filter(Boolean)
    .slice(0, 2)
    .join(" & ");

/** A sealed envelope in the invite's colours. The whole cover is the tap target (LiveInvite); `opening` plays the
    flap, the letter rising and the seal breaking while the invite gets ready behind it. */
export function Envelope({ theme, title, opening }: { theme: Theme; title: string; opening: boolean }) {
  const paper = theme.bg;
  return (
    <div className={"env" + (opening ? " open" : "")} style={{ ["--env-paper" as any]: paper, ["--env-edge" as any]: theme.line, ["--env-seal" as any]: theme.accent, ["--env-ink" as any]: theme.bg2 }}>
      <div className="env-back" />
      <div className="env-letter">
        <span>{title}</span>
      </div>
      <div className="env-front" />
      <div className="env-flap" />
      <div className="env-seal" aria-hidden>
        {initials(title) || "♥"}
      </div>
    </div>
  );
}

/* ---------------- scratch card ---------------- */

/** Gold foil over the whole invite; the guest scratches it away. Calls onDone(true) once about half is clear, or
    onDone(false) if nobody touched it for 6 seconds (it dissolves by itself, so the story never stalls). */
export function ScratchCard({ theme, onDone }: { theme: Theme; onDone: (completed: boolean) => void }) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const [leaving, setLeaving] = useState(false);
  const touched = useRef(false);
  const finished = useRef(false);
  const strokes = useRef(0);
  const finish = (completed: boolean) => {
    if (finished.current) return;
    finished.current = true;
    setLeaving(true);
    setTimeout(() => onDone(completed), 450);
  };

  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    c.width = Math.round(c.clientWidth * dpr);
    c.height = Math.round(c.clientHeight * dpr);
    const g = c.getContext("2d");
    if (!g) return finish(false);
    // Foil: the theme's accent and line colours with a diagonal sheen and some glints.
    const grad = g.createLinearGradient(0, 0, c.width, c.height);
    grad.addColorStop(0, theme.line);
    grad.addColorStop(0.45, theme.accent);
    grad.addColorStop(0.55, "#fff6d8");
    grad.addColorStop(1, theme.line);
    g.fillStyle = grad;
    g.fillRect(0, 0, c.width, c.height);
    g.fillStyle = "rgba(255,255,255,0.35)";
    for (let i = 0; i < 140; i++) g.fillRect(Math.random() * c.width, Math.random() * c.height, 2 * dpr, 2 * dpr);
    g.fillStyle = theme.bg2;
    g.textAlign = "center";
    g.font = "600 " + Math.round(22 * dpr) + "px system-ui, sans-serif";
    g.fillText("Scratch to reveal the date", c.width / 2, c.height / 2 - 6 * dpr);
    g.font = Math.round(34 * dpr) + "px system-ui, sans-serif";
    g.fillText("✨", c.width / 2, c.height / 2 + 40 * dpr);
    const idle = setTimeout(() => !touched.current && finish(false), 6000);
    return () => clearTimeout(idle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const scratch = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const c = ref.current;
    const g = c?.getContext("2d");
    if (!c || !g || finished.current) return;
    if (e.type === "pointermove" && e.buttons === 0 && e.pointerType === "mouse") return;
    touched.current = true;
    const r = c.getBoundingClientRect();
    const k = c.width / r.width;
    g.globalCompositeOperation = "destination-out";
    g.beginPath();
    g.arc((e.clientX - r.left) * k, (e.clientY - r.top) * k, 34 * k, 0, Math.PI * 2);
    g.fill();
    // Every few strokes, sample how much foil is left (a coarse grid is plenty).
    if (++strokes.current % 8) return;
    const { data } = g.getImageData(0, 0, c.width, c.height);
    let clear = 0;
    let n = 0;
    for (let i = 3; i < data.length; i += 4 * 97) {
      n++;
      if (data[i] < 40) clear++;
    }
    if (clear / n > 0.45) finish(true);
  };

  return (
    <canvas
      ref={ref}
      className={"scratch" + (leaving ? " gone" : "")}
      onPointerDown={scratch}
      onPointerMove={scratch}
      onContextMenu={(e) => e.preventDefault()}
      aria-label="Scratch to reveal the date"
    />
  );
}

/* ---------------- blessings ---------------- */

const BLESSED = "fp.blessed"; // links this device already blessed: one blessing per guest
const blessedHere = (name: string) => {
  try {
    return (JSON.parse(localStorage.getItem(BLESSED) || "[]") as string[]).includes(name);
  } catch {
    return false;
  }
};
const rememberBlessing = (name: string) => {
  try {
    const all = (JSON.parse(localStorage.getItem(BLESSED) || "[]") as string[]).filter((x) => x !== name).slice(-200);
    localStorage.setItem(BLESSED, JSON.stringify([...all, name]));
  } catch {}
};

/** "Send blessings" at the end of the invite: a shower of petals, and one more on the invite's count (shown from 3, so
    a lone number never looks sad). The couple's own taps are not counted (`counts` false), but they see the count. */
export function Blessings({ name, counts }: { name: string; counts: boolean }) {
  const [total, setTotal] = useState<number | null>(null);
  const [done, setDone] = useState(false);
  const [burst, setBurst] = useState(0);
  useEffect(() => {
    setDone(blessedHere(name));
    fetch("/api/share/" + name + "/seen", { cache: "no-store" })
      .then((r) => r.json())
      .then((r) => setTotal(typeof r.blessings === "number" ? r.blessings : 0))
      .catch(() => setTotal(0));
  }, [name]);
  const bless = () => {
    setBurst((b) => b + 1);
    if (done) return; // more petals, but one blessing per guest
    setDone(true);
    rememberBlessing(name);
    track("guest_action_clicked", { action: "blessing" });
    if (!counts) return;
    setTotal((t) => (t ?? 0) + 1);
    fetch("/api/share/" + name + "/seen", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ kind: "blessing" }), keepalive: true }).catch(() => {});
  };
  return (
    <>
      <button className={"bless-btn" + (done ? " done" : "")} onClick={bless}>
        🌸 {done ? "Blessings sent" : "Send blessings"}
        {total !== null && total >= 3 ? <small>{total} blessings so far</small> : null}
      </button>
      {burst ? <Petals key={burst} /> : null}
    </>
  );
}

/** A one-off shower of petals across the screen (CSS animation, guest page only). */
function Petals() {
  const petals = useRef(
    Array.from({ length: 34 }, () => ({
      left: Math.random() * 100,
      delay: Math.random() * 0.6,
      dur: 2.2 + Math.random() * 1.6,
      size: 14 + Math.random() * 16,
      drift: (Math.random() - 0.5) * 160,
      spin: (Math.random() - 0.5) * 720,
      glyph: ["🌸", "🌼", "🌺", "✿"][Math.floor(Math.random() * 4)],
    })),
  ).current;
  return (
    <div className="petal-rain" aria-hidden>
      {petals.map((p, i) => (
        <span
          key={i}
          style={{
            left: p.left + "%",
            fontSize: p.size,
            animationDelay: p.delay + "s",
            animationDuration: p.dur + "s",
            ["--drift" as any]: p.drift + "px",
            ["--spin" as any]: p.spin + "deg",
          }}
        >
          {p.glyph}
        </span>
      ))}
    </div>
  );
}

/* ---------------- action buttons inside the scenes ---------------- */

/** A button over the scene that shows what it is about: "Add to calendar" on the date scene, "Directions" on the
    venue scene, "RSVP" on the closing scene. They appear a moment into the scene, sit above the guest bar, and are
    outside the story's tap area, so tapping one never skips the scene. */
export type SceneAction = { key: string; label: string; icon: string; href?: string; onClick?: () => void; action: "calendar" | "directions" | "rsvp" };

export function SceneActions({ actions, extra }: { actions: SceneAction[]; extra?: string }) {
  if (!actions.length) return null;
  return (
    <div className="scene-acts">
      {extra ? <span className="scene-count">{extra}</span> : null}
      {actions.map((a) =>
        a.href ? (
          <a key={a.key} className="scene-act" href={a.href} target="_blank" rel="noopener" onClick={() => track("guest_action_clicked", { action: a.action, where: "scene" })}>
            <span aria-hidden>{a.icon}</span> {a.label}
          </a>
        ) : (
          <button
            key={a.key}
            className="scene-act"
            onClick={() => {
              track("guest_action_clicked", { action: a.action, where: "scene" });
              a.onClick?.();
            }}
          >
            <span aria-hidden>{a.icon}</span> {a.label}
          </button>
        ),
      )}
    </div>
  );
}

/** "84 days · 6 hrs" to the start of an event (IST), ticking once a minute; "" once it has started. */
export function useCountdown(date?: string, time?: string): string {
  const [s, setS] = useState("");
  useEffect(() => {
    if (!date) return setS("");
    const at = Date.parse(date + "T" + (time ?? "00:00") + ":00+05:30");
    const tick = () => {
      const ms = at - Date.now();
      if (!(ms > 0)) return setS("");
      const d = Math.floor(ms / 86400000);
      const h = Math.floor((ms % 86400000) / 3600000);
      const m = Math.floor((ms % 3600000) / 60000);
      setS(d > 0 ? d + (d === 1 ? " day · " : " days · ") + h + " hrs to go" : h > 0 ? h + " hrs · " + m + " min to go" : m + " min to go");
    };
    tick();
    const id = setInterval(tick, 60000);
    return () => clearInterval(id);
  }, [date, time]);
  return s;
}

/* ---------------- tap moment ---------------- */

/** What guests shower on the couple, by function. Plain emoji and dots: nothing religious is drawn. */
export type MomentKind = "flowers" | "roses" | "haldi" | "henna" | "party" | "sparklers" | "rings" | "love";
const MOMENT: Record<MomentKind, { prompt: string; glyphs: string[] }> = {
  flowers: { prompt: "Tap to shower flowers on the couple", glyphs: ["🌸", "🌼", "🌺", "🏵️"] },
  roses: { prompt: "Tap to shower roses on the couple", glyphs: ["🌹", "🥀", "✨", "🌸"] },
  haldi: { prompt: "Tap to throw some haldi!", glyphs: ["🌼", "💛", "🟡", "✨"] },
  henna: { prompt: "Tap to send henna blessings", glyphs: ["🌿", "🍃", "🌸", "✨"] },
  party: { prompt: "Tap to start the party!", glyphs: ["🎉", "🎶", "✨", "💃"] },
  sparklers: { prompt: "Tap to light the sparklers", glyphs: ["✨", "🎇", "🌟", "💫"] },
  rings: { prompt: "Tap to cheer for the rings", glyphs: ["💍", "✨", "💖", "🥂"] },
  love: { prompt: "Tap to send some love", glyphs: ["💕", "💖", "✨", "🌸"] },
};

/** The kind for an invite: its function's name first (Floral Rangoli and Shaadi Utsav name theirs), then the design's
    first category and community. */
export function momentKind(fn: string, categories: string[], communities: string[]): MomentKind {
  const f = fn.toLowerCase();
  if (/haldi|holud|maiyan|nalangu|pasupu|halad|arishina/.test(f)) return "haldi";
  if (/mehendi|mehndi|mylanchi|gorintaku|madarangi/.test(f)) return "henna";
  if (/sangeet|jaago|party|cocktail/.test(f)) return "party";
  if (/reception|walima|bou bhat|swagat|varaverppu|salkkaram|aratakshate/.test(f)) return "sparklers";
  if (/engage|sagai|roka|mangni|ring|nischay|sakharpuda|nichayathartham/.test(f)) return "rings";
  const c = categories[0];
  if (c === "haldi") return "haldi";
  if (c === "mehendi") return "henna";
  if (c === "sangeet") return "party";
  if (c === "reception") return "sparklers";
  if (c === "engagement") return "rings";
  if (c === "save-the-date") return "love";
  if (communities.includes("muslim") || communities.includes("christian")) return "roses";
  return "flowers";
}

type Burst = { id: number; x: number; y: number; bits: { dx: number; dy: number; rot: number; size: number; glyph: string; delay: number }[] };

/** The story pauses on the couple's names and guests tap to shower them (each tap a burst where they tapped). It goes
    on by itself 2.5 s after the last tap, after 5 s if nobody taps, or with "Continue". */
export function TapMoment({ kind, onDone, idleMs = 5000 }: { kind: MomentKind; onDone: (taps: number) => void; idleMs?: number }) {
  const m = MOMENT[kind];
  const [bursts, setBursts] = useState<Burst[]>([]);
  const [leaving, setLeaving] = useState(false);
  const taps = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const finished = useRef(false);
  const finish = () => {
    if (finished.current) return;
    finished.current = true;
    setLeaving(true);
    setTimeout(() => onDone(taps.current), 380);
  };
  const arm = (ms: number) => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(finish, ms);
  };
  useEffect(() => {
    arm(idleMs);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const tap = (e: React.PointerEvent) => {
    if (finished.current) return;
    taps.current++;
    const id = Date.now() + Math.random();
    const bits = Array.from({ length: 12 }, (_, i) => {
      const a = (i / 12) * Math.PI * 2 + Math.random() * 0.5;
      const r = 70 + Math.random() * 90;
      return { dx: Math.cos(a) * r, dy: Math.sin(a) * r + 40, rot: (Math.random() - 0.5) * 540, size: 18 + Math.random() * 16, glyph: m.glyphs[i % m.glyphs.length], delay: Math.random() * 0.08 };
    });
    // Relative to this layer: full screen on the invite, a phone frame in the home page's demo.
    const r = e.currentTarget.getBoundingClientRect();
    setBursts((b) => [...b.slice(-6), { id, x: e.clientX - r.left, y: e.clientY - r.top, bits }]);
    arm(2500);
  };
  return (
    <div className={"tap-moment" + (leaving ? " gone" : "")} onPointerDown={tap} onContextMenu={(e) => e.preventDefault()}>
      <div className="tm-prompt">
        <span className="tm-hand" aria-hidden>
          👆
        </span>
        {taps.current ? (taps.current >= 3 ? "Beautiful! Keep going…" : m.prompt) : m.prompt}
      </div>
      {bursts.map((b) => (
        <div key={b.id} className="tm-burst" style={{ left: b.x, top: b.y }} aria-hidden>
          {b.bits.map((x, i) => (
            <span key={i} style={{ fontSize: x.size, animationDelay: x.delay + "s", ["--dx" as any]: x.dx + "px", ["--dy" as any]: x.dy + "px", ["--rot" as any]: x.rot + "deg" }}>
              {x.glyph}
            </span>
          ))}
        </div>
      ))}
      <button
        className="tm-skip"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.stopPropagation();
          finish();
        }}
      >
        Continue ›
      </button>
    </div>
  );
}

/* ---------------- quiz ---------------- */

const QUIZZED = "fp.quiz"; // links this device already answered: one counted answer per guest
const answeredHere = (name?: string) => {
  if (!name) return false;
  try {
    return (JSON.parse(localStorage.getItem(QUIZZED) || "[]") as string[]).includes(name);
  } catch {
    return false;
  }
};

/** The couple's quiz on the guest page: the story waits on the question (lib/quiz.tsx draws it), guests tap A, B or C
    here, see how they did and how everyone else did, and the scene plays its reveal. */
export function QuizAsk({ name, options, answer, counts, onDone }: { name?: string; options: string[]; answer: number; counts: boolean; onDone: () => void }) {
  const [picked, setPicked] = useState<number | null>(null);
  const [stats, setStats] = useState<{ right: number; total: number } | null>(null);
  const pick = (i: number) => {
    if (picked !== null) return;
    setPicked(i);
    const correct = i === answer;
    track("quiz_answered", { correct });
    const first = counts && !answeredHere(name);
    if (name) {
      fetch("/api/share/" + name + "/quiz", first ? { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ correct }) } : { cache: "no-store" })
        .then((r) => r.json())
        .then((r) => typeof r?.total === "number" && setStats(r))
        .catch(() => {});
      if (first)
        try {
          const all = (JSON.parse(localStorage.getItem(QUIZZED) || "[]") as string[]).slice(-200);
          localStorage.setItem(QUIZZED, JSON.stringify([...all, name]));
        } catch {}
    }
    setTimeout(onDone, 2600);
  };
  const right = picked !== null && picked === answer;
  const pct = stats && stats.total >= 3 ? Math.round((stats.right / stats.total) * 100) : null;
  return (
    <div className="quiz-ask" onPointerDown={(e) => e.stopPropagation()}>
      {picked === null ? (
        <>
          <div className="qa-title">Tap your answer</div>
          <div className="qa-opts">
            {options.map((o, i) => (
              <button key={i} className="qa-opt" onClick={() => pick(i)}>
                <b>{"ABC"[i]}</b>
                <span>{o}</span>
              </button>
            ))}
          </div>
          <button className="qa-skip" onClick={onDone}>
            Skip ›
          </button>
        </>
      ) : (
        <div className={"qa-result" + (right ? " ok" : "")}>
          <b>{right ? "🎉 You got it!" : "Not quite! 😄"}</b>
          {pct !== null ? <span>{pct}% of guests got it right</span> : <span>{right ? "You know them well." : "Watch for the answer…"}</span>}
        </div>
      )}
    </div>
  );
}
