import type { CSSProperties } from "react";
import type { Transition, TransitionKind } from "./types";

/* ====================================================================
 * Everything here is a PURE function of time.
 * No CSS keyframes, no requestAnimationFrame inside the scenes.
 * That is what makes the preview and the exported MP4 identical:
 * the renderer can jump to t = 1234ms and get exactly one answer.
 * ==================================================================== */

export const clamp = (v: number, a = 0, b = 1) => (v < a ? a : v > b ? b : v);
export const mix = (p: number, from: number, to: number) => from + (to - from) * p;

export type Ease = (t: number) => number;

export const E = {
  linear: (t: number) => t,
  inQuad: (t: number) => t * t,
  outQuad: (t: number) => 1 - (1 - t) * (1 - t),
  inOutQuad: (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2),
  outCubic: (t: number) => 1 - Math.pow(1 - t, 3),
  inOutCubic: (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  outQuart: (t: number) => 1 - Math.pow(1 - t, 4),
  outQuint: (t: number) => 1 - Math.pow(1 - t, 5),
  outExpo: (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t)),
  inOutExpo: (t: number) =>
    t === 0 ? 0 : t === 1 ? 1 : t < 0.5 ? Math.pow(2, 20 * t - 10) / 2 : (2 - Math.pow(2, -20 * t + 10)) / 2,
  outBack: (t: number) => (t <= 0 ? 0 : t >= 1 ? 1 : 1 + 2.2 * Math.pow(t - 1, 3) + 1.2 * Math.pow(t - 1, 2)),
  outElastic: (t: number) =>
    t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * ((2 * Math.PI) / 3)) + 1,
  /** Damped-spring approximation. The nicest default for display type. */
  spring: (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -9 * t) * Math.cos(t * 7)),
};

/** Local progress 0..1 for a sub-animation starting at `start` ms, lasting `dur` ms. */
export function tw(t: number, start: number, dur: number, ease: Ease = E.outExpo): number {
  if (dur <= 0) return t >= start ? 1 : 0;
  return ease(clamp((t - start) / dur));
}

/** Rises in, holds, falls out again. For things that appear then leave. */
export function pulse(t: number, start: number, dur: number, hold: number, ease: Ease = E.inOutCubic) {
  const up = tw(t, start, dur, ease);
  const down = 1 - tw(t, start + dur + hold, dur, ease);
  return Math.min(up, down);
}

/** Index-based delay. stagger(i, 90) gives 0, 90, 180 ... */
export const stagger = (i: number, step = 90, base = 0) => base + i * step;

/* -------------------------------------------------------------- *
 * Composable style builders
 * -------------------------------------------------------------- */
type Opt = { start?: number; dur?: number; ease?: Ease; dist?: number };

export function fade(t: number, o: Opt = {}): CSSProperties {
  const { start = 0, dur = 700, ease = E.outCubic } = o;
  return { opacity: tw(t, start, dur, ease) };
}

export function rise(t: number, o: Opt = {}): CSSProperties {
  const { start = 0, dur = 900, ease = E.outExpo, dist = 46 } = o;
  const p = tw(t, start, dur, ease);
  return { opacity: clamp(p * 1.35), transform: "translate3d(0," + mix(p, dist, 0).toFixed(2) + "px,0)" };
}

export function drop(t: number, o: Opt = {}): CSSProperties {
  const { start = 0, dur = 900, ease = E.outExpo, dist = 46 } = o;
  const p = tw(t, start, dur, ease);
  return { opacity: clamp(p * 1.35), transform: "translate3d(0," + mix(p, -dist, 0).toFixed(2) + "px,0)" };
}

export function slideIn(t: number, dir: "l" | "r", o: Opt = {}): CSSProperties {
  const { start = 0, dur = 900, ease = E.outExpo, dist = 60 } = o;
  const p = tw(t, start, dur, ease);
  const x = mix(p, dir === "l" ? -dist : dist, 0);
  return { opacity: clamp(p * 1.35), transform: "translate3d(" + x.toFixed(2) + "px,0,0)" };
}

export function pop(t: number, o: Opt = {}): CSSProperties {
  const { start = 0, dur = 800, ease = E.outBack } = o;
  const p = tw(t, start, dur, ease);
  return {
    opacity: clamp(tw(t, start, dur * 0.4, E.outCubic)),
    transform: "scale(" + mix(p, 0.82, 1).toFixed(4) + ")",
  };
}

/** Slow continuous push-in used on photos (Ken Burns). */
export function kenBurns(t: number, d: number, from = 1.06, to = 1.18, panX = 0, panY = -1.5): CSSProperties {
  const p = clamp(t / Math.max(d, 1));
  return {
    transform:
      "scale(" + mix(p, from, to).toFixed(4) + ") translate3d(" +
      (panX * p).toFixed(2) + "%," + (panY * p).toFixed(2) + "%,0)",
  };
}

/** Reveal a stroked SVG path by animating its dash offset. */
export function drawPath(t: number, len: number, o: Opt = {}): CSSProperties {
  const { start = 0, dur = 1400, ease = E.inOutCubic } = o;
  const p = tw(t, start, dur, ease);
  return { strokeDasharray: len, strokeDashoffset: mix(p, len, 0) };
}

/** Slide type up from behind a clipping box. The classic title reveal. */
export function maskUp(t: number, o: Opt = {}): CSSProperties {
  const { start = 0, dur = 1000, ease = E.outExpo, dist = 105 } = o;
  const p = tw(t, start, dur, ease);
  return { transform: "translate3d(0," + mix(p, dist, 0).toFixed(2) + "%,0)" };
}

/** Letter-by-letter typing. Returns the number of visible characters. */
export function typed(t: number, start = 0, cps = 22): number {
  return Math.floor(Math.max(0, t - start) / 1000 * cps);
}

/* -------------------------------------------------------------- *
 * Scene transitions, applied to the scene wrapper by <Player/>.
 * p is 0 (off screen) to 1 (fully composed).
 * -------------------------------------------------------------- */
export function transitionStyle(tr: Transition | undefined, p: number, dir: "in" | "out"): CSSProperties {
  if (!tr || tr.kind === "none") return dir === "in" ? {} : { opacity: p };
  const k: TransitionKind = tr.kind;
  const e = E.inOutCubic(p);
  const back = 1 - p;
  switch (k) {
    case "fade":
      return { opacity: e };
    case "slide-up":
      return {
        opacity: clamp(p * 1.6),
        transform: "translate3d(0," + mix(E.outExpo(p), dir === "in" ? 100 : 55, 0).toFixed(2) + "%,0)",
      };
    case "slide-down":
      return {
        opacity: clamp(p * 1.6),
        transform: "translate3d(0," + mix(E.outExpo(p), dir === "in" ? -100 : -55, 0).toFixed(2) + "%,0)",
      };
    case "slide-left":
      return { transform: "translate3d(" + mix(E.inOutExpo(p), 100, 0).toFixed(2) + "%,0,0)" };
    case "slide-right":
      return { transform: "translate3d(" + mix(E.inOutExpo(p), -100, 0).toFixed(2) + "%,0,0)" };
    case "zoom-in":
      return { opacity: e, transform: "scale(" + mix(E.outExpo(p), 1.22, 1).toFixed(4) + ")" };
    case "zoom-out":
      return { opacity: e, transform: "scale(" + mix(E.outExpo(p), 0.82, 1).toFixed(4) + ")" };
    case "wipe-up":
      return { clipPath: "inset(" + (back * 100).toFixed(2) + "% 0 0 0)" };
    case "wipe-right":
      return { clipPath: "inset(0 " + (back * 100).toFixed(2) + "% 0 0)" };
    case "iris":
      return {
        clipPath: "circle(" + mix(E.inOutCubic(p), 0, 80).toFixed(2) + "% at 50% 50%)",
        opacity: clamp(p * 3),
      };
    case "blur":
      return {
        opacity: e,
        filter: "blur(" + (back * 18).toFixed(2) + "px)",
        transform: "scale(" + mix(p, 1.08, 1).toFixed(4) + ")",
      };
    case "curtain":
      return { clipPath: "inset(0 " + (back * 50).toFixed(2) + "% 0 " + (back * 50).toFixed(2) + "%)" };
    default:
      return { opacity: e };
  }
}

/* -------------------------------------------------------------- *
 * Timeline maths
 * -------------------------------------------------------------- */
export type Slot = { index: number; start: number; end: number; duration: number };

export function layout(durations: number[], outs: (Transition | undefined)[]): { slots: Slot[]; total: number } {
  const slots: Slot[] = [];
  let cursor = 0;
  for (let i = 0; i < durations.length; i++) {
    const duration = durations[i];
    slots.push({ index: i, start: cursor, end: cursor + duration, duration });
    cursor += duration - (outs[i]?.dur ?? 0);
  }
  const total = slots.length ? slots[slots.length - 1].end : 0;
  return { slots, total };
}

export const fmt = (ms: number) => {
  const s = Math.max(0, ms) / 1000;
  return Math.floor(s / 60) + ":" + (s % 60).toFixed(1).padStart(4, "0");
};
