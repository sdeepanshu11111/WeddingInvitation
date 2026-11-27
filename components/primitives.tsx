"use client";
import React, { useEffect, useRef } from "react";
import type { CSSProperties, ReactNode } from "react";
import { clamp, drawPath, E, kenBurns, mix, tw } from "@/lib/anim";
import type { Theme } from "@/lib/types";

/* =====================================================================
 * Building blocks shared by every template.
 * All of them take `t` and derive their look from it — nothing animates
 * on its own, so a headless renderer gets the same pixels every time.
 * ===================================================================== */

export const Layer = ({
  children,
  style,
  center = true,
}: {
  children?: ReactNode;
  style?: CSSProperties;
  center?: boolean;
}) => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      display: "flex",
      flexDirection: "column",
      alignItems: center ? "center" : "flex-start",
      justifyContent: center ? "center" : "flex-start",
      ...style,
    }}
  >
    {children}
  </div>
);

/** Text that slides up from behind a mask. */
export function Reveal({
  children,
  style,
  wrapStyle,
}: {
  children: ReactNode;
  style?: CSSProperties;
  wrapStyle?: CSSProperties;
}) {
  return (
    <span style={{ display: "block", overflow: "hidden", paddingBottom: "0.08em", ...wrapStyle }}>
      <span style={{ display: "block", willChange: "transform", ...style }}>{children}</span>
    </span>
  );
}

/** Per-word stagger. Each word gets its own mask so it reads as kinetic type. */
export function WordsUp({
  text,
  t,
  start = 0,
  step = 110,
  dur = 1000,
  style,
  gap = "0.28em",
  justify = "center",
}: {
  text: string;
  t: number;
  start?: number;
  step?: number;
  dur?: number;
  style?: CSSProperties;
  gap?: string;
  justify?: CSSProperties["justifyContent"];
}) {
  const words = String(text || "").split(/\s+/).filter(Boolean);
  return (
    <span style={{ display: "flex", flexWrap: "wrap", justifyContent: justify, columnGap: gap, ...style }}>
      {words.map((w, i) => {
        const p = tw(t, start + i * step, dur, E.outExpo);
        return (
          <span key={i} style={{ display: "block", overflow: "hidden", paddingBottom: "0.12em" }}>
            <span
              style={{
                display: "block",
                transform: "translate3d(0," + mix(p, 110, 0).toFixed(2) + "%,0)",
                opacity: clamp(p * 2),
              }}
            >
              {w}
            </span>
          </span>
        );
      })}
    </span>
  );
}

/** Letter-by-letter, used for the cinematic template. */
export function Typewriter({
  text,
  t,
  start = 0,
  cps = 18,
  style,
  caret = true,
  theme,
}: {
  text: string;
  t: number;
  start?: number;
  cps?: number;
  style?: CSSProperties;
  caret?: boolean;
  theme?: Theme;
}) {
  const s = String(text || "");
  const n = Math.floor((Math.max(0, t - start) / 1000) * cps);
  const shown = s.slice(0, Math.min(n, s.length));
  const done = n >= s.length;
  const blink = Math.floor(t / 420) % 2 === 0;
  return (
    <span style={style}>
      {shown}
      {caret && !done && (
        <span style={{ opacity: blink ? 1 : 0.15, color: theme?.accent }}>|</span>
      )}
    </span>
  );
}

/** A hairline rule that draws outward from the centre. */
export function Rule({
  t,
  start = 0,
  dur = 900,
  width = 260,
  color,
  thickness = 1,
  style,
}: {
  t: number;
  start?: number;
  dur?: number;
  width?: number;
  color: string;
  thickness?: number;
  style?: CSSProperties;
}) {
  const p = tw(t, start, dur, E.inOutCubic);
  return (
    <span
      style={{
        display: "block",
        height: thickness,
        width: width * p,
        background: color,
        opacity: 0.85,
        ...style,
      }}
    />
  );
}

/** A rule with a small diamond at its centre — used in the classic templates. */
export function DiamondRule({ t, start = 0, width = 320, color }: { t: number; start?: number; width?: number; color: string }) {
  const p = tw(t, start, 1000, E.inOutCubic);
  const d = tw(t, start + 350, 700, E.outBack);
  return (
    <span style={{ display: "flex", alignItems: "center", gap: 14 }}>
      <span style={{ height: 1, width: (width / 2) * p, background: color, opacity: 0.8 }} />
      <span
        style={{
          width: 7,
          height: 7,
          background: color,
          transform: "rotate(45deg) scale(" + d.toFixed(3) + ")",
          flex: "0 0 auto",
        }}
      />
      <span style={{ height: 1, width: (width / 2) * p, background: color, opacity: 0.8 }} />
    </span>
  );
}

/* ------------------------------------------------------------------ *
 * Media
 * ------------------------------------------------------------------ */

/** Image with Ken Burns. Falls back to a tasteful placeholder when empty. */
export function Photo({
  src,
  t,
  d,
  style,
  from = 1.05,
  to = 1.17,
  panX = 0,
  panY = -1.5,
  theme,
  label = "Add a photo",
}: {
  src?: string;
  t: number;
  d: number;
  style?: CSSProperties;
  from?: number;
  to?: number;
  panX?: number;
  panY?: number;
  theme: Theme;
  label?: string;
}) {
  return (
    <div style={{ overflow: "hidden", position: "relative", background: theme.bg2, ...style }}>
      {src ? (
        <img
          src={src}
          alt=""
          draggable={false}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
            willChange: "transform",
            ...kenBurns(t, d, from, to, panX, panY),
          }}
        />
      ) : (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "grid",
            placeItems: "center",
            color: theme.soft,
            fontSize: 22,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            background:
              "repeating-linear-gradient(45deg," + theme.bg2 + "," + theme.bg2 + " 18px," + theme.bg + " 18px," + theme.bg + " 36px)",
          }}
        >
          {label}
        </div>
      )}
    </div>
  );
}

/**
 * Video that is driven by the timeline rather than by its own clock.
 * Editor: plays natively while the transport plays, snaps to the scrubber when paused.
 * Export: seeked to an exact time per frame; readiness is reported through
 * window.__mediaPending so the renderer only screenshots decoded frames.
 * Clips shorter than the scene loop.
 */
export function Clip({
  src,
  t,
  d,
  deterministic,
  playing = false,
  style,
  trimStart = 0,
  theme,
  muted = true,
}: {
  src?: string;
  t: number;
  d: number;
  deterministic: boolean;
  playing?: boolean;
  style?: CSSProperties;
  trimStart?: number;
  theme: Theme;
  muted?: boolean;
}) {
  const ref = useRef<HTMLVideoElement | null>(null);
  const target = (v: HTMLVideoElement) => {
    const raw = trimStart + t / 1000;
    const len = isFinite(v.duration) && v.duration > 0 ? v.duration : 0;
    return len ? raw % Math.max(len - 0.05, 0.1) : raw;
  };

  // Export path: exact seek, then wait for the decoded frame.
  useEffect(() => {
    const v = ref.current;
    if (!v || !src || !deterministic) return;
    const w: any = window as any;
    let settled = false;
    w.__mediaPending = (w.__mediaPending || 0) + 1;
    const finish = () => {
      if (settled) return;
      settled = true;
      w.__mediaPending = Math.max(0, (w.__mediaPending || 1) - 1);
    };
    const seek = () => {
      const want = target(v);
      if (Math.abs(v.currentTime - want) < 0.004 && v.readyState >= 2) return finish();
      v.addEventListener("seeked", finish, { once: true });
      try {
        v.currentTime = want;
      } catch {
        finish();
      }
    };
    if (v.readyState >= 1) seek();
    else v.addEventListener("loadedmetadata", seek, { once: true });
    return finish;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t, trimStart, deterministic, src]);

  // Editor path: let the element play; correct drift only when it is large.
  useEffect(() => {
    const v = ref.current;
    if (!v || !src || deterministic) return;
    if (playing) {
      if (v.paused) v.play().catch(() => {});
      if (Math.abs(v.currentTime - target(v)) > 0.3) v.currentTime = target(v);
    } else {
      if (!v.paused) v.pause();
      if (Math.abs(v.currentTime - target(v)) > 0.04) v.currentTime = target(v);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t, playing, deterministic, src, trimStart]);

  if (!src) {
    return (
      <div
        style={{
          display: "grid",
          placeItems: "center",
          color: theme.soft,
          fontSize: 22,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          background: theme.bg2,
          ...style,
        }}
      >
        Add a video clip
      </div>
    );
  }
  return (
    <video
      ref={ref}
      src={src}
      muted={muted}
      playsInline
      loop={!deterministic}
      preload="auto"
      style={{ objectFit: "cover", display: "block", ...style }}
    />
  );
}

/* ------------------------------------------------------------------ *
 * Ornaments — all inline SVG so they scale to any export resolution
 * ------------------------------------------------------------------ */

export function Mandala({ t, color, size = 520, start = 0, spin = 14, opacity = 0.5 }: { t: number; color: string; size?: number; start?: number; spin?: number; opacity?: number }) {
  const p = tw(t, start, 1800, E.outExpo);
  const rot = (t / 1000) * spin;
  const petals = 16;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      style={{ opacity: opacity * p, transform: "rotate(" + rot.toFixed(2) + "deg) scale(" + mix(p, 0.86, 1).toFixed(3) + ")" }}
    >
      <g stroke={color} fill="none" strokeWidth={0.7}>
        <circle cx="100" cy="100" r="92" style={drawPath(t, 578, { start, dur: 1800 })} />
        <circle cx="100" cy="100" r="74" strokeDasharray="2 5" />
        <circle cx="100" cy="100" r="40" />
        <circle cx="100" cy="100" r="30" strokeDasharray="1 4" />
        {Array.from({ length: petals }).map((_, i) => {
          const a = (i / petals) * 360;
          const pi = tw(t, start + 300 + i * 45, 900, E.outBack);
          return (
            <g key={i} transform={"rotate(" + a + " 100 100)"} opacity={pi}>
              <path d="M100 30 C112 48, 112 62, 100 76 C88 62, 88 48, 100 30 Z" />
              <circle cx="100" cy="22" r={Math.max(0, 1.6 * pi)} fill={color} stroke="none" />
            </g>
          );
        })}
      </g>
    </svg>
  );
}

/** Ornamental corner filigree. Place four, rotated. */
export function Corner({ t, color, size = 170, start = 0, rotate = 0 }: { t: number; color: string; size?: number; start?: number; rotate?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ transform: "rotate(" + rotate + "deg)" }}>
      <g stroke={color} fill="none" strokeWidth={1.1} strokeLinecap="round">
        <path d="M4 4 L4 46 M4 4 L46 4" style={drawPath(t, 84, { start, dur: 900 })} />
        <path d="M10 10 L10 30 Q10 10 30 10 L30 10" style={drawPath(t, 60, { start: start + 160, dur: 900 })} />
        <path d="M4 56 Q22 56 22 38 Q22 26 34 26 Q46 26 46 14" style={drawPath(t, 110, { start: start + 260, dur: 1200 })} />
        <circle cx="50" cy="10" r="2" fill={color} stroke="none" opacity={tw(t, start + 700, 500)} />
        <circle cx="10" cy="50" r="2" fill={color} stroke="none" opacity={tw(t, start + 780, 500)} />
      </g>
    </svg>
  );
}

/** Drawn botanical sprig — the floral template's signature. */
export function Sprig({ t, color, size = 220, start = 0, flip = false, opacity = 1 }: { t: number; color: string; size?: number; start?: number; flip?: boolean; opacity?: number }) {
  const leaves = 9;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ transform: flip ? "scaleX(-1)" : undefined, opacity }}>
      <path d="M50 96 C46 70, 50 42, 62 8" stroke={color} fill="none" strokeWidth={1.2} strokeLinecap="round" style={drawPath(t, 100, { start, dur: 1100 })} />
      {Array.from({ length: leaves }).map((_, i) => {
        const f = i / (leaves - 1);
        const x = mix(f, 48, 61);
        const y = mix(f, 90, 16);
        const side = i % 2 === 0 ? 1 : -1;
        const p = tw(t, start + 300 + i * 95, 650, E.outBack);
        return (
          <g key={i} transform={"translate(" + x + " " + y + ") rotate(" + side * mix(f, 44, 22) + ") scale(" + p.toFixed(3) + ")"}>
            <path d={"M0 0 C" + 8 * side + " -5, " + 15 * side + " -2, " + 17 * side + " 3 C" + 11 * side + " 8, " + 4 * side + " 5, 0 0 Z"} fill={color} opacity={0.75} />
          </g>
        );
      })}
    </svg>
  );
}

/** Soft animated bokeh / particle field. Deterministic: seeded, time-driven. */
export function Particles({
  t,
  color,
  count = 26,
  W,
  H,
  seed = 7,
  size = 5,
  opacity = 0.45,
}: {
  t: number;
  color: string;
  count?: number;
  W: number;
  H: number;
  seed?: number;
  size?: number;
  opacity?: number;
}) {
  const rnd = (i: number, k: number) => {
    const x = Math.sin(i * 127.1 + k * 311.7 + seed * 74.7) * 43758.5453;
    return x - Math.floor(x);
  };
  return (
    <svg width={W} height={H} viewBox={"0 0 " + W + " " + H} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      {Array.from({ length: count }).map((_, i) => {
        const bx = rnd(i, 1) * W;
        const speed = mix(rnd(i, 2), 14, 46);
        const drift = Math.sin(t / 1000 + i) * mix(rnd(i, 5), 8, 34);
        const y = H + 40 - ((t / 1000) * speed + rnd(i, 3) * H * 1.4) % (H + 120);
        const r = mix(rnd(i, 4), size * 0.4, size);
        const a = opacity * (0.35 + 0.65 * rnd(i, 6));
        return <circle key={i} cx={bx + drift} cy={y} r={r} fill={color} opacity={a} />;
      })}
    </svg>
  );
}

/** Falling petals for the floral template. */
export function Petals({ t, color, count = 16, W, H, seed = 3 }: { t: number; color: string; count?: number; W: number; H: number; seed?: number }) {
  const rnd = (i: number, k: number) => {
    const x = Math.sin(i * 91.3 + k * 47.9 + seed * 12.3) * 23421.631;
    return x - Math.floor(x);
  };
  return (
    <svg width={W} height={H} viewBox={"0 0 " + W + " " + H} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      {Array.from({ length: count }).map((_, i) => {
        const speed = mix(rnd(i, 2), 40, 95);
        const y = ((t / 1000) * speed + rnd(i, 3) * H * 1.6) % (H + 160) - 80;
        const x = rnd(i, 1) * W + Math.sin(t / 900 + i * 1.7) * 60;
        const rot = (t / 1000) * mix(rnd(i, 7), 30, 110) + rnd(i, 8) * 360;
        const s = mix(rnd(i, 4), 0.6, 1.3);
        return (
          <g key={i} transform={"translate(" + x.toFixed(1) + " " + y.toFixed(1) + ") rotate(" + rot.toFixed(1) + ") scale(" + s.toFixed(2) + ")"} opacity={0.5}>
            <path d="M0 0 C7 -6, 16 -2, 16 4 C10 10, 2 7, 0 0 Z" fill={color} />
          </g>
        );
      })}
    </svg>
  );
}

/** Film grain + vignette overlay for the cinematic template. */
export function Grain({ t, W, H, intensity = 0.07 }: { t: number; W: number; H: number; intensity?: number }) {
  const shift = (Math.floor(t / 83) % 7) * 37;
  return (
    <>
      <svg width={W} height={H} style={{ position: "absolute", inset: 0, opacity: intensity, mixBlendMode: "overlay", pointerEvents: "none" }}>
        <filter id={"gr" + shift}>
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={3} seed={shift} />
        </filter>
        <rect width="100%" height="100%" filter={"url(#gr" + shift + ")"} />
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background: "radial-gradient(ellipse at center, rgba(0,0,0,0) 45%, rgba(0,0,0,0.55) 100%)",
        }}
      />
    </>
  );
}

/** Tape strip for the scrapbook template. */
export function Tape({ color = "rgba(255,255,255,0.55)", w = 120, h = 34, rotate = -6, style }: { color?: string; w?: number; h?: number; rotate?: number; style?: CSSProperties }) {
  return (
    <div
      style={{
        width: w,
        height: h,
        background: color,
        transform: "rotate(" + rotate + "deg)",
        boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
        ...style,
      }}
    />
  );
}

/* ------------------------------------------------------------------ *
 * Date formatting shared by templates
 * ------------------------------------------------------------------ */
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAYS = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

export function parseDate(v?: string): Date | null {
  if (!v) return null;
  const d = new Date(v + (v.length <= 10 ? "T12:00:00" : ""));
  return isNaN(d.getTime()) ? null : d;
}

export function dateParts(v?: string) {
  const d = parseDate(v);
  if (!d) return { day: "00", month: "Month", year: "0000", weekday: "Day", monthShort: "MON", full: "" };
  return {
    day: String(d.getDate()).padStart(2, "0"),
    month: MONTHS[d.getMonth()],
    monthShort: MONTHS[d.getMonth()].slice(0, 3).toUpperCase(),
    year: String(d.getFullYear()),
    weekday: DAYS[d.getDay()],
    full: DAYS[d.getDay()] + ", " + MONTHS[d.getMonth()] + " " + d.getDate() + ", " + d.getFullYear(),
  };
}

export function prettyTime(v?: string) {
  if (!v) return "";
  const [hRaw, m] = v.split(":");
  const h = parseInt(hRaw, 10);
  if (isNaN(h)) return v;
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return h12 + ":" + (m || "00") + " " + ampm;
}
