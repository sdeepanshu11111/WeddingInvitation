"use client";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Frame, Stage } from "@/components/Frame";
import { SIZES, buildTimeline } from "@/lib/project";
import type { Orientation, Project } from "@/lib/types";
import { ShareButtons } from "./ShareButtons";

/* The guest's view of a live share: the same <Frame/> as the editor, driven by
   a rAF clock. It opens on a "tap to open" cover, because browsers only allow
   music to start after a tap. */

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

export function LiveInvite({ project, title }: { project: Project; title: string }) {
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
  const playing = phase === "playing";

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

  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (e.code !== "Space") return;
      e.preventDefault();
      if (phase === "cover") open();
      else toggle();
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, toggle]);

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
    <main style={{ position: "fixed", inset: 0, overflow: "hidden", background: theme.bg2, userSelect: "none" }}>
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
        <div onClick={toggle} style={{ position: "absolute", inset: 0, cursor: "pointer" }}>
          <Stage W={W} H={H}>
            <Frame project={{ ...project, orientation: o }} template={tl.template} theme={theme} scenes={tl.scenes} slots={tl.slots} total={total} T={Math.min(T, total)} playing={playing} />
          </Stage>
        </div>
      ) : null}

      {/* progress */}
      {phase !== "cover" ? (
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 3, background: "rgba(255,255,255,.12)", pointerEvents: "none" }}>
          <div style={{ height: "100%", width: (T / total) * 100 + "%", background: theme.accent }} />
        </div>
      ) : null}

      {music && (phase === "playing" || phase === "paused") ? (
        <button aria-label={muted ? "Unmute" : "Mute"} onClick={() => setMuted((m) => !m)} style={{ ...round(42), position: "absolute", top: 14, right: 14, fontSize: 18 }}>
          {muted ? "🔇" : "🔊"}
        </button>
      ) : null}

      {phase === "paused" ? (
        <button aria-label="Play" onClick={toggle} style={{ ...round(84), position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)", fontSize: 30, paddingLeft: 6 }}>
          ▶
        </button>
      ) : null}

      {phase === "ended" ? (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            padding: "40px 16px 22px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 10,
            background: "linear-gradient(180deg, transparent, rgba(0,0,0,.72) 45%)",
          }}
        >
          <button className="btn" onClick={toggle}>
            ↻ Watch again
          </button>
          <ShareButtons title={title} />
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
          <div style={{ position: "relative", fontFamily: "var(--f-cinzel)", fontSize: 12, letterSpacing: "0.38em", color: theme.accent }}>YOU&apos;RE INVITED</div>
          <h1 style={{ position: "relative", margin: 0, fontFamily: "var(--f-vibes)", fontWeight: 400, fontSize: "clamp(44px, 13vw, 92px)", lineHeight: 1.1, color: ink }}>{title}</h1>
          <button
            className="btn primary"
            style={{ position: "relative", marginTop: 18, padding: "13px 30px", fontSize: 15, borderRadius: 99, background: theme.accent, color: theme.bg2 }}
            disabled={phase === "opening"}
          >
            {phase === "opening" ? "Opening..." : "Open invitation"}
          </button>
          {music ? <div style={{ position: "relative", fontSize: 12, opacity: 0.7 }}>Turn your sound on 🔊</div> : null}
        </div>
      ) : null}
    </main>
  );
}
