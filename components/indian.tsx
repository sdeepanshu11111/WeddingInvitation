"use client";
import React from "react";
import type { CSSProperties } from "react";
import { clamp, drawPath, E, mix, tw } from "@/lib/anim";

/* =====================================================================
 * Indian-market ornaments. Same rules as primitives.tsx: every visual
 * is a pure function of `t` (ms), so exports are frame-exact.
 * Seeded pseudo-randomness (never Math.random) keeps frames repeatable.
 * ===================================================================== */

const rnd = (i: number, k: number, seed = 1) => {
  const x = Math.sin(i * 127.1 + k * 311.7 + seed * 74.7) * 43758.5453;
  return x - Math.floor(x);
};
const uid = (s: string) => s.replace(/[^a-z0-9]/gi, "");

/* ------------------------------------------------------------------ *
 * Flowers & garlands (Haldi, festivities)
 * ------------------------------------------------------------------ */

/** Marigold (genda phool) as an SVG symbol. Reference with <use href="#mg-{tone}"/>. */
function MarigoldDefs({ tones }: { tones: { id: string; petal: string; shade: string }[] }) {
  return (
    <defs>
      {tones.map((c) => (
        <g id={"mg-" + c.id} key={c.id}>
          {Array.from({ length: 12 }).map((_, i) => {
            const a = (i / 12) * Math.PI * 2;
            return <circle key={i} cx={Math.cos(a) * 6.6} cy={Math.sin(a) * 6.6} r={3.7} fill={c.shade} />;
          })}
          {Array.from({ length: 8 }).map((_, i) => {
            const a = (i / 8) * Math.PI * 2 + 0.3;
            return <circle key={"m" + i} cx={Math.cos(a) * 3.6} cy={Math.sin(a) * 3.6} r={3.4} fill={c.petal} />;
          })}
          <circle r={3} fill={c.petal} />
          <circle r={1.4} fill={c.shade} opacity={0.7} />
        </g>
      ))}
      <path id="mango-leaf" d="M0 0 C 6 6, 7 20, 0 34 C -7 20, -6 6, 0 0 Z" />
    </defs>
  );
}

const MARIGOLD = [
  { id: "orange", petal: "#FB8C00", shade: "#E65100" },
  { id: "yellow", petal: "#FFC107", shade: "#F59E0B" },
];

/**
 * Hanging marigold strings (laris) across the top of the frame.
 * Strands drop in one after another, then sway gently forever.
 */
export function Garlands({
  t,
  W,
  H,
  strands = 9,
  start = 0,
  maxLen = 0.42,
  flower = 22,
  leaf = "#2E7D32",
  style,
}: {
  t: number;
  W: number;
  H: number;
  strands?: number;
  start?: number;
  maxLen?: number;
  flower?: number;
  leaf?: string;
  style?: CSSProperties;
}) {
  const k = flower / 20; // marigold symbol is ~20px wide
  const gap = flower * 1.05;
  return (
    <svg width={W} height={H} viewBox={"0 0 " + W + " " + H} style={{ position: "absolute", inset: 0, pointerEvents: "none", ...style }}>
      <MarigoldDefs tones={MARIGOLD} />
      {/* top swag: a sagging row of flowers between strand tops */}
      {Array.from({ length: strands - 1 }).map((_, i) => {
        const x0 = ((i + 0.5) / strands) * W;
        const x1 = ((i + 1.5) / strands) * W;
        const p = tw(t, start + i * 60, 900, E.outCubic);
        const n = Math.ceil((x1 - x0) / gap);
        return (
          <g key={"s" + i} opacity={p}>
            {Array.from({ length: n }).map((_, j) => {
              const f = j / n;
              const x = mix(f, x0, x1);
              const y = -4 + Math.sin(f * Math.PI) * flower * 2.2 * p;
              return <use key={j} href={"#mg-" + (j % 3 === 0 ? "yellow" : "orange")} transform={"translate(" + x.toFixed(1) + " " + y.toFixed(1) + ") scale(" + k.toFixed(3) + ")"} />;
            })}
          </g>
        );
      })}
      {/* vertical strands */}
      {Array.from({ length: strands }).map((_, i) => {
        const x = ((i + 0.5) / strands) * W;
        const len = H * maxLen * (i % 2 === 0 ? 1 : 0.72) * (0.9 + rnd(i, 3) * 0.2);
        const drop = tw(t, start + 150 + i * 90, 1300, E.outBack);
        const shown = Math.max(0, len * drop);
        const sway = Math.sin(t / 1000 * 1.15 + i * 0.9) * 2.2 * clamp(drop);
        const n = Math.floor(shown / gap);
        return (
          <g key={i} transform={"translate(" + x.toFixed(1) + " 0) rotate(" + sway.toFixed(2) + ")"}>
            <line x1={0} y1={0} x2={0} y2={shown} stroke="#7a4b12" strokeWidth={1.2} opacity={0.5} />
            {Array.from({ length: n }).map((_, j) => (
              <use key={j} href={"#mg-" + ((i + j) % 4 === 0 ? "yellow" : "orange")} transform={"translate(0 " + (j * gap + flower * 0.6).toFixed(1) + ") scale(" + k.toFixed(3) + ")"} />
            ))}
            {n > 2 ? (
              <g transform={"translate(0 " + (n * gap + flower * 0.2).toFixed(1) + ")"}>
                <use href="#mango-leaf" fill={leaf} transform={"scale(" + (k * 0.9).toFixed(3) + ")"} />
              </g>
            ) : null}
          </g>
        );
      })}
    </svg>
  );
}

/** Toran: mango leaves and marigolds strung across the doorway (top edge). */
export function Toran({ t, W, start = 0, y = 0, leaf = "#2E7D32", leaf2 = "#43A047", size = 1 }: { t: number; W: number; start?: number; y?: number; leaf?: string; leaf2?: string; size?: number }) {
  const n = Math.round(W / (46 * size));
  const sag = 26 * size;
  return (
    <svg width={W} height={140 * size} viewBox={"0 0 " + W + " " + 140 * size} style={{ position: "absolute", left: 0, top: y, pointerEvents: "none", overflow: "visible" }}>
      <MarigoldDefs tones={MARIGOLD} />
      <path d={"M0 " + 8 * size + " Q " + W / 2 + " " + (8 * size + sag * 2) + " " + W + " " + 8 * size} stroke="#8d5a1e" strokeWidth={2} fill="none" style={drawPath(t, W * 1.05, { start, dur: 900 })} />
      {Array.from({ length: n }).map((_, i) => {
        const f = (i + 0.5) / n;
        const x = f * W;
        const yy = 8 * size + Math.sin(f * Math.PI) * sag;
        const p = tw(t, start + 200 + Math.abs(f - 0.5) * 900, 700, E.outBack);
        const sw = Math.sin(t / 1000 * 1.6 + i) * 4;
        return (
          <g key={i} transform={"translate(" + x.toFixed(1) + " " + yy.toFixed(1) + ")"}>
            <g transform={"rotate(" + sw.toFixed(2) + ") scale(" + (size * clamp(p)).toFixed(3) + ")"}>
              <use href="#mango-leaf" fill={i % 2 ? leaf : leaf2} transform="scale(1.25)" />
            </g>
            {i % 2 === 0 ? <use href={"#mg-" + (i % 4 === 0 ? "yellow" : "orange")} transform={"scale(" + (0.9 * size * clamp(p)).toFixed(3) + ")"} /> : null}
          </g>
        );
      })}
    </svg>
  );
}

/* ------------------------------------------------------------------ *
 * Lamps, kalash
 * ------------------------------------------------------------------ */

/** A living flame: flicker is a sum of sines, so it is deterministic. */
export function Flame({ t, x = 0, y = 0, s = 1, seed = 0 }: { t: number; x?: number; y?: number; s?: number; seed?: number }) {
  const f1 = Math.sin(t * 0.017 + seed * 3.1);
  const f2 = Math.sin(t * 0.031 + seed * 1.7);
  const sy = 1 + 0.09 * f1 + 0.05 * f2;
  const sk = 4 * Math.sin(t * 0.009 + seed);
  const gid = "fl" + seed;
  return (
    <g transform={"translate(" + x + " " + y + ") scale(" + s + ")"}>
      <defs>
        <radialGradient id={gid + "g"}>
          <stop offset="0%" stopColor="#FFD54F" stopOpacity={0.55} />
          <stop offset="100%" stopColor="#FF9800" stopOpacity={0} />
        </radialGradient>
        <linearGradient id={gid} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#FF6F00" />
          <stop offset="55%" stopColor="#FFB300" />
          <stop offset="100%" stopColor="#FFF8E1" />
        </linearGradient>
      </defs>
      <circle cx={0} cy={-14} r={38 + 3 * f2} fill={"url(#" + gid + "g)"} />
      <g transform={"skewX(" + sk.toFixed(2) + ") scale(1 " + sy.toFixed(3) + ")"}>
        <path d="M0 0 C -9 -8, -8 -20, 0 -34 C 8 -20, 9 -8, 0 0 Z" fill={"url(#" + gid + ")"} />
        <path d="M0 -2 C -4 -7, -3 -13, 0 -19 C 3 -13, 4 -7, 0 -2 Z" fill="#FFFDE7" opacity={0.85} />
      </g>
    </g>
  );
}

/** Clay diya with a flame. */
export function Diya({ t, size = 120, color = "#B5532A", rim = "#E0A458", seed = 0, start = 0 }: { t: number; size?: number; color?: string; rim?: string; seed?: number; start?: number }) {
  const p = tw(t, start, 700, E.outBack);
  const lit = tw(t, start + 400, 600, E.outCubic);
  return (
    <svg width={size} height={size} viewBox="-60 -70 120 100" style={{ overflow: "visible", transform: "scale(" + p.toFixed(3) + ")" }}>
      <g opacity={lit}>
        <Flame t={t} y={-4} s={1.6} seed={seed} />
      </g>
      <path d="M-50 -4 Q -44 26 0 28 Q 44 26 54 -8 L 46 -6 Q 22 4 0 4 Q -26 4 -50 -4 Z" fill={color} />
      <path d="M-50 -4 Q -26 4 0 4 Q 22 4 46 -6 L 54 -8" fill="none" stroke={rim} strokeWidth={3} />
      {[-30, -15, 0, 15, 30].map((x) => (
        <circle key={x} cx={x} cy={14} r={2.4} fill={rim} />
      ))}
    </svg>
  );
}

/** Kalash: copper pot, mango leaves, coconut. Auspicious opener for Hindu invites. */
export function Kalash({ t, size = 260, metal = "#C8893B", metal2 = "#8E5A20", start = 0 }: { t: number; size?: number; metal?: string; metal2?: string; start?: number }) {
  const pot = tw(t, start, 900, E.outBack);
  const gid = "kl" + uid(metal);
  return (
    <svg width={size} height={size} viewBox="-100 -120 200 220" style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id={gid} x1="0" x2="1">
          <stop offset="0" stopColor={metal2} />
          <stop offset="0.45" stopColor={metal} />
          <stop offset="0.6" stopColor="#F3C77B" />
          <stop offset="1" stopColor={metal2} />
        </linearGradient>
      </defs>
      {/* leaves fan out */}
      {[-60, -30, 0, 30, 60].map((a, i) => {
        const p = tw(t, start + 500 + i * 90, 700, E.outBack);
        return (
          <g key={a} transform={"translate(0 -38) rotate(" + (a * clamp(p)).toFixed(1) + ") scale(" + clamp(p).toFixed(3) + ")"}>
            <path d="M0 0 C 12 -16, 12 -54, 0 -78 C -12 -54, -12 -16, 0 0 Z" fill={i % 2 ? "#2E7D32" : "#43A047"} />
            <path d="M0 -4 L0 -70" stroke="#1B5E20" strokeWidth={1.5} />
          </g>
        );
      })}
      {/* coconut */}
      <g opacity={tw(t, start + 900, 500)} transform={"translate(0 -58)"}>
        <ellipse rx={24} ry={28} fill="#8D6E63" />
        <path d="M-4 -26 Q 0 -40 6 -30" stroke="#5D4037" strokeWidth={3} fill="none" />
        <path d="M-18 -2 Q 0 10 18 -2" stroke="#D84315" strokeWidth={4} fill="none" />
      </g>
      {/* pot */}
      <g transform={"scale(" + pot.toFixed(3) + ")"}>
        <path d="M-34 -40 L 34 -40 L 28 -24 Q 76 -6 70 40 Q 62 84 0 88 Q -62 84 -70 40 Q -76 -6 -28 -24 Z" fill={"url(#" + gid + ")"} />
        <rect x={-38} y={-46} width={76} height={10} rx={4} fill={metal2} />
        <path d="M-66 24 Q 0 40 66 24" stroke="#D84315" strokeWidth={5} fill="none" />
        {[-40, -20, 0, 20, 40].map((x) => (
          <circle key={x} cx={x} cy={52} r={4} fill="#FFF3E0" opacity={0.85} />
        ))}
      </g>
    </svg>
  );
}

/* ------------------------------------------------------------------ *
 * Mehendi: paisley & henna ring
 * ------------------------------------------------------------------ */

/** Henna paisley (kairi) that draws itself, with dotted halo and inner motif. */
export function Paisley({ t, color, size = 260, start = 0, flip = false, rotate = 0 }: { t: number; color: string; size?: number; start?: number; flip?: boolean; rotate?: number }) {
  const outer = "M50 94 C 22 94 8 72 13 50 C 18 28 40 14 61 17 C 82 20 90 40 77 49 C 68 55 59 47 64 40";
  const inner = "M50 82 C 30 82 20 66 24 51 C 28 35 44 26 59 28 C 70 30 74 40 68 45";
  const dots = tw(t, start + 900, 900, E.outCubic);
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ overflow: "visible", transform: (flip ? "scaleX(-1) " : "") + "rotate(" + rotate + "deg)" }}>
      <g fill="none" stroke={color} strokeLinecap="round">
        <path d={outer} strokeWidth={1.6} style={drawPath(t, 260, { start, dur: 1500 })} />
        <path d={inner} strokeWidth={1} style={drawPath(t, 200, { start: start + 300, dur: 1400 })} />
        <path d={outer} strokeWidth={2.6} strokeDasharray="0 6.5" transform="translate(50 56) scale(1.13) translate(-50 -56)" opacity={dots} />
        {/* small flower in the belly */}
        <g transform="translate(42 62)" opacity={tw(t, start + 700, 800)}>
          {Array.from({ length: 6 }).map((_, i) => (
            <ellipse key={i} rx={2.6} ry={6} transform={"rotate(" + i * 60 + ") translate(0 -6)"} strokeWidth={0.9} />
          ))}
          <circle r={2.2} fill={color} stroke="none" />
        </g>
        {/* veins */}
        {[0, 1, 2, 3].map((i) => (
          <path key={i} d={"M" + (30 + i * 9) + " " + (72 - i * 7) + " q 6 -6 12 -2"} strokeWidth={0.8} style={drawPath(t, 16, { start: start + 1000 + i * 120, dur: 500 })} />
        ))}
      </g>
    </svg>
  );
}

/** Scalloped henna ring, often wrapped around a photo. */
export function HennaRing({ t, color, size = 600, start = 0, scallops = 28 }: { t: number; color: string; size?: number; start?: number; scallops?: number }) {
  const R = 46;
  const pts = Array.from({ length: scallops + 1 }, (_, i) => {
    const a = (i / scallops) * Math.PI * 2 - Math.PI / 2;
    return [50 + Math.cos(a) * R, 50 + Math.sin(a) * R];
  });
  const r = (Math.PI * 2 * R) / scallops / 2;
  const d = "M" + pts[0][0].toFixed(2) + " " + pts[0][1].toFixed(2) + pts.slice(1).map((p) => " A " + r.toFixed(2) + " " + r.toFixed(2) + " 0 0 1 " + p[0].toFixed(2) + " " + p[1].toFixed(2)).join("");
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ overflow: "visible" }}>
      <g fill="none" stroke={color} strokeLinecap="round">
        <path d={d} strokeWidth={0.7} style={drawPath(t, 460, { start, dur: 1800 })} />
        <circle cx={50} cy={50} r={R - 2.2} strokeWidth={0.4} opacity={tw(t, start + 600, 800)} />
        <circle cx={50} cy={50} r={R - 3.6} strokeWidth={1.4} strokeDasharray="0 2.2" opacity={tw(t, start + 900, 800)} />
        {pts.slice(0, scallops).map((p, i) => {
          const a = ((i + 0.5) / scallops) * Math.PI * 2 - Math.PI / 2;
          return <circle key={i} cx={50 + Math.cos(a) * (R + 4.2)} cy={50 + Math.sin(a) * (R + 4.2)} r={0.8} fill={color} stroke="none" opacity={tw(t, start + 1000 + i * 25, 400)} />;
        })}
      </g>
    </svg>
  );
}

/* ------------------------------------------------------------------ *
 * South Indian: kolam, banana leaf, temple border, bells, lamp
 * ------------------------------------------------------------------ */

/** Kolam: a pulli (dot) grid with interlocking loops, drawn outward from the centre. */
export function Kolam({ t, color = "#FFFFFF", size = 520, n = 5, start = 0 }: { t: number; color?: string; size?: number; n?: number; start?: number }) {
  const step = 100 / (n + 1);
  const dots: [number, number, number][] = [];
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) dots.push([step * (i + 1), step * (j + 1), Math.hypot(i - (n - 1) / 2, j - (n - 1) / 2)]);
  const r = step * 0.72;
  const len = Math.PI * 2 * r;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ overflow: "visible", transform: "rotate(45deg)" }}>
      <g fill="none" stroke={color} strokeWidth={0.9} strokeLinecap="round">
        {dots.map(([x, y, dist], i) => (
          <circle key={"c" + i} cx={x} cy={y} r={r} style={drawPath(t, len, { start: start + dist * 260, dur: 900 })} />
        ))}
        {/* petal loops on the outer edge */}
        {Array.from({ length: n }).map((_, i) =>
          [0, 1, 2, 3].map((side) => {
            const a = step * (i + 1);
            const [x, y] = side === 0 ? [a, step * 0.15] : side === 1 ? [100 - step * 0.15, a] : side === 2 ? [a, 100 - step * 0.15] : [step * 0.15, a];
            return <circle key={side + "-" + i} cx={x} cy={y} r={step * 0.32} style={drawPath(t, step * 2.1, { start: start + 1200 + i * 80, dur: 600 })} />;
          })
        )}
      </g>
      {dots.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={1.1} fill={color} opacity={tw(t, start + i * 20, 400)} />
      ))}
    </svg>
  );
}

/** Banana leaf, swaying gently. Classic South Indian wedding entrance. */
export function BananaLeaf({ t, height = 900, flip = false, seed = 0, start = 0, style }: { t: number; height?: number; flip?: boolean; seed?: number; start?: number; style?: CSSProperties }) {
  const p = tw(t, start, 1400, E.outExpo);
  const sway = Math.sin(t / 1000 * 0.9 + seed) * 1.6;
  const gid = "bl" + seed + (flip ? "f" : "");
  return (
    <svg
      width={height * 0.36}
      height={height}
      viewBox="0 0 36 100"
      style={{
        overflow: "visible",
        transformOrigin: "50% 100%",
        transform: (flip ? "scaleX(-1) " : "") + "rotate(" + (sway + (1 - p) * -14).toFixed(2) + "deg) translateY(" + ((1 - p) * 30).toFixed(1) + "%)",
        ...style,
      }}
    >
      <defs>
        <linearGradient id={gid} x1="0" x2="1">
          <stop offset="0" stopColor="#1B5E20" />
          <stop offset="0.5" stopColor="#388E3C" />
          <stop offset="1" stopColor="#66BB6A" />
        </linearGradient>
      </defs>
      <path d="M18 100 C 16 70 14 40 18 2 C 30 12 36 40 34 70 C 32 86 26 96 18 100 Z" fill={"url(#" + gid + ")"} />
      <path d="M18 100 C 16 70 14 40 18 2 C 8 14 0 40 3 68 C 5 86 12 96 18 100 Z" fill="#2E7D32" />
      <path d="M18 100 C 16 70 15 40 18 2" stroke="#A5D6A7" strokeWidth={0.8} fill="none" />
      {Array.from({ length: 22 }).map((_, i) => {
        const y = 8 + i * 4;
        return (
          <g key={i} stroke="#81C784" strokeWidth={0.25} opacity={0.7}>
            <path d={"M17.5 " + y + " Q 26 " + (y - 2) + " 33 " + (y - 5)} />
            <path d={"M17.5 " + y + " Q 9 " + (y - 2) + " 3 " + (y - 5)} />
          </g>
        );
      })}
    </svg>
  );
}

/** Kanjeevaram-style temple border: a stripe crowned with a row of gopuram triangles. */
export function TempleBorder({ t, W, color, color2, start = 0, flip = false, h = 70 }: { t: number; W: number; color: string; color2: string; start?: number; flip?: boolean; h?: number }) {
  const p = tw(t, start, 1300, E.inOutCubic);
  const n = Math.round(W / (h * 0.72));
  const tw2 = W / n;
  const clip = "inset(0 " + ((1 - p) * 50).toFixed(2) + "% 0 " + ((1 - p) * 50).toFixed(2) + "%)";
  return (
    <svg width={W} height={h} viewBox={"0 0 " + W + " " + h} style={{ display: "block", clipPath: clip, transform: flip ? "scaleY(-1)" : undefined }}>
      <rect x={0} y={h * 0.62} width={W} height={h * 0.38} fill={color} />
      <rect x={0} y={h * 0.7} width={W} height={2} fill={color2} />
      <rect x={0} y={h * 0.88} width={W} height={2} fill={color2} />
      {Array.from({ length: n }).map((_, i) => {
        const x = i * tw2;
        return (
          <g key={i}>
            <path d={"M" + x + " " + h * 0.62 + " L " + (x + tw2 / 2) + " " + h * 0.08 + " L " + (x + tw2) + " " + h * 0.62 + " Z"} fill={color} />
            <path d={"M" + (x + tw2 * 0.22) + " " + h * 0.62 + " L " + (x + tw2 / 2) + " " + h * 0.3 + " L " + (x + tw2 * 0.78) + " " + h * 0.62 + " Z"} fill={color2} opacity={0.85} />
            <circle cx={x + tw2 / 2} cy={h * 0.06} r={2.5} fill={color2} />
          </g>
        );
      })}
    </svg>
  );
}

/** Brass temple bell on a chain, swinging. */
export function Bell({ t, color = "#D4A017", dark = "#8C6A0E", len = 260, size = 70, seed = 0, start = 0 }: { t: number; color?: string; dark?: string; len?: number; size?: number; seed?: number; start?: number }) {
  const drop = tw(t, start, 1100, E.outBack);
  const settle = clamp((t - start) / 4000);
  const swing = Math.sin(t / 1000 * 2.4 + seed) * mix(settle, 14, 4);
  const L = len * clamp(drop);
  return (
    <svg width={size * 2} height={len + size * 1.4} viewBox={-size + " 0 " + size * 2 + " " + (len + size * 1.4)} style={{ overflow: "visible" }}>
      <g transform={"rotate(" + swing.toFixed(2) + " 0 0)"}>
        {Array.from({ length: Math.floor(L / 12) }).map((_, i) => (
          <ellipse key={i} cx={0} cy={i * 12 + 6} rx={3} ry={6} fill="none" stroke={dark} strokeWidth={2} />
        ))}
        <g transform={"translate(0 " + L + ") scale(" + (size / 70).toFixed(3) + ")"}>
          <path d="M0 0 C 14 0 18 12 20 30 C 22 46 30 52 34 58 L -34 58 C -30 52 -22 46 -20 30 C -18 12 -14 0 0 0 Z" fill={color} />
          <path d="M-34 58 L 34 58 L 30 64 L -30 64 Z" fill={dark} />
          <path d="M-12 14 C -10 30 -14 44 -22 52" stroke="#FFF2B2" strokeWidth={3} fill="none" opacity={0.6} />
          <circle cx={0} cy={70} r={7} fill={dark} />
        </g>
      </g>
    </svg>
  );
}

/** Kuthuvilakku: tall brass standing lamp with five flames. */
export function StandingLamp({ t, size = 360, color = "#D4A017", dark = "#8C6A0E", start = 0 }: { t: number; size?: number; color?: string; dark?: string; start?: number }) {
  const p = tw(t, start, 1000, E.outExpo);
  return (
    <svg width={size * 0.6} height={size} viewBox="-60 -40 120 200" style={{ overflow: "visible", opacity: p, transform: "translateY(" + ((1 - p) * 40).toFixed(1) + "px)" }}>
      {[-36, -18, 0, 18, 36].map((x, i) => (
        <g key={x} opacity={tw(t, start + 700 + Math.abs(i - 2) * 220, 500)}>
          <Flame t={t} x={x} y={i === 2 ? -6 : 2} s={0.55} seed={i + 7} />
        </g>
      ))}
      <path d="M-46 4 Q 0 26 46 4 L 40 14 Q 0 30 -40 14 Z" fill={color} />
      <rect x={-4} y={20} width={8} height={100} fill={color} />
      <ellipse cx={0} cy={50} rx={14} ry={6} fill={dark} />
      <ellipse cx={0} cy={86} rx={10} ry={5} fill={dark} />
      <path d="M-40 156 Q -36 128 0 120 Q 36 128 40 156 Z" fill={color} />
      <rect x={-44} y={154} width={88} height={8} rx={3} fill={dark} />
      <path d="M0 -26 L 6 -10 L 0 -4 L -6 -10 Z" fill={color} />
    </svg>
  );
}

/* ------------------------------------------------------------------ *
 * Islamic geometry: star pattern, mehrab arch, lanterns, crescent
 * ------------------------------------------------------------------ */

/** Tiled 8-point star (khatim) lattice, revealed from the centre outward. */
export function StarLattice({ t, W, H, color, start = 0, tile = 120, opacity = 0.16 }: { t: number; W: number; H: number; color: string; start?: number; tile?: number; opacity?: number }) {
  const p = tw(t, start, 2600, E.inOutCubic);
  const id = "sl" + uid(color) + tile;
  const s = tile;
  const sq = (rot: number) => {
    const r = s * 0.3;
    const pts = [0, 1, 2, 3].map((i) => {
      const a = ((i * 90 + rot) * Math.PI) / 180;
      return (s / 2 + Math.cos(a) * r).toFixed(2) + "," + (s / 2 + Math.sin(a) * r).toFixed(2);
    });
    return pts.join(" ");
  };
  const mask = "radial-gradient(circle at 50% 50%, #000 " + (p * 80).toFixed(1) + "%, transparent " + (p * 80 + 18).toFixed(1) + "%)";
  return (
    <svg width={W} height={H} style={{ position: "absolute", inset: 0, opacity, WebkitMaskImage: mask, maskImage: mask, pointerEvents: "none" }}>
      <defs>
        <pattern id={id} width={s} height={s} patternUnits="userSpaceOnUse">
          <g fill="none" stroke={color} strokeWidth={1.4}>
            <polygon points={sq(0)} />
            <polygon points={sq(45)} />
            <circle cx={s / 2} cy={s / 2} r={s * 0.09} />
            <path d={"M0 0 L " + s * 0.2 + " " + s * 0.2 + " M" + s + " 0 L " + s * 0.8 + " " + s * 0.2 + " M0 " + s + " L " + s * 0.2 + " " + s * 0.8 + " M" + s + " " + s + " L " + s * 0.8 + " " + s * 0.8} />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={"url(#" + id + ")"} />
    </svg>
  );
}

/** Pointed mehrab arch outline (double line) that draws itself. Content sits inside. */
export function Mehrab({ t, w, h, color, start = 0, children, fill }: { t: number; w: number; h: number; color: string; start?: number; children?: React.ReactNode; fill?: string }) {
  const arch = (inset: number) => {
    const x0 = inset, x1 = w - inset, y1 = h - inset, top = inset, mid = h * 0.36;
    return (
      "M" + x0 + " " + y1 + " L " + x0 + " " + mid +
      " C " + x0 + " " + (mid - h * 0.16) + ", " + (w / 2 - w * 0.2) + " " + (top + h * 0.1) + ", " + w / 2 + " " + top +
      " C " + (w / 2 + w * 0.2) + " " + (top + h * 0.1) + ", " + x1 + " " + (mid - h * 0.16) + ", " + x1 + " " + mid +
      " L " + x1 + " " + y1 + " Z"
    );
  };
  const len = (w + h) * 2.2;
  const inner = arch(16);
  return (
    <div style={{ position: "relative", width: w, height: h }}>
      {fill ? <div style={{ position: "absolute", inset: 0, background: fill, clipPath: 'path("' + inner + '")', opacity: tw(t, start + 400, 900) }} /> : null}
      <div style={{ position: "absolute", inset: 0, clipPath: 'path("' + inner + '")' }}>{children}</div>
      <svg width={w} height={h} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <path d={arch(0)} fill="none" stroke={color} strokeWidth={3} style={drawPath(t, len, { start, dur: 1800 })} />
        <path d={inner} fill="none" stroke={color} strokeWidth={1.2} style={drawPath(t, len, { start: start + 250, dur: 1800 })} />
      </svg>
    </div>
  );
}

/** Hanging fanoos lantern with a warm glow. */
export function Lantern({ t, color, glow = "#FFD27A", len = 240, size = 90, seed = 0, start = 0 }: { t: number; color: string; glow?: string; len?: number; size?: number; seed?: number; start?: number }) {
  const drop = tw(t, start, 1300, E.outBack);
  const swing = Math.sin(t / 1000 * 1.3 + seed * 2) * 3.5;
  const L = len * clamp(drop);
  const flick = 0.75 + 0.15 * Math.sin(t * 0.013 + seed) + 0.1 * Math.sin(t * 0.029 + seed * 2);
  const gid = "ln" + seed;
  return (
    <svg width={size * 2.4} height={len + size * 2} viewBox={-size * 1.2 + " 0 " + size * 2.4 + " " + (len + size * 2)} style={{ overflow: "visible" }}>
      <defs>
        <radialGradient id={gid}>
          <stop offset="0" stopColor={glow} stopOpacity={0.55} />
          <stop offset="1" stopColor={glow} stopOpacity={0} />
        </radialGradient>
      </defs>
      <g transform={"rotate(" + swing.toFixed(2) + " 0 0)"}>
        <line x1={0} y1={0} x2={0} y2={L} stroke={color} strokeWidth={1.6} />
        <g transform={"translate(0 " + L + ") scale(" + (size / 90).toFixed(3) + ")"}>
          <circle cx={0} cy={70} r={110} fill={"url(#" + gid + ")"} opacity={flick} />
          <path d="M0 0 L 14 14 L -14 14 Z" fill={color} />
          <path d="M-30 18 L 30 18 L 40 50 L 30 120 L -30 120 L -40 50 Z" fill={glow} opacity={0.35 * flick + 0.25} />
          <path d="M-30 18 L 30 18 L 40 50 L 30 120 L -30 120 L -40 50 Z" fill="none" stroke={color} strokeWidth={3} />
          <path d="M-40 50 L 40 50 M -30 120 L 0 18 L 30 120 M 0 18 L 0 120" stroke={color} strokeWidth={1.4} fill="none" opacity={0.8} />
          <path d="M-22 120 L 22 120 L 0 146 Z" fill={color} />
          <circle cx={0} cy={152} r={4} fill={color} />
        </g>
      </g>
    </svg>
  );
}

export function Crescent({ t, color, size = 120, start = 0 }: { t: number; color: string; size?: number; start?: number }) {
  const p = tw(t, start, 1200, E.outBack);
  return (
    <svg width={size} height={size} viewBox="-50 -50 100 100" style={{ overflow: "visible", transform: "rotate(" + mix(p, -40, -20).toFixed(1) + "deg) scale(" + p.toFixed(3) + ")" }}>
      <path d="M0 -40 A 40 40 0 1 0 0 40 A 32 32 0 1 1 0 -40 Z" fill={color} />
      <path d="M26 -14 l3 8 8 0 -6 5 2 8 -7 -5 -7 5 2 -8 -6 -5 8 0 Z" fill={color} transform="translate(4 0)" />
    </svg>
  );
}

/* ------------------------------------------------------------------ *
 * Sikh / Punjabi: sunburst + phulkari band
 * ------------------------------------------------------------------ */

/** Slowly turning rays of light behind a sacred symbol. */
export function Sunburst({ t, color, size = 900, rays = 36, start = 0, opacity = 0.35 }: { t: number; color: string; size?: number; rays?: number; start?: number; opacity?: number }) {
  const p = tw(t, start, 1800, E.outExpo);
  const rot = (t / 1000) * 4;
  const gid = "sb" + uid(color);
  return (
    <svg width={size} height={size} viewBox="-100 -100 200 200" style={{ opacity: opacity * p, transform: "rotate(" + rot.toFixed(2) + "deg) scale(" + mix(p, 0.6, 1).toFixed(3) + ")" }}>
      <defs>
        <radialGradient id={gid}>
          <stop offset="0.1" stopColor={color} stopOpacity={1} />
          <stop offset="1" stopColor={color} stopOpacity={0} />
        </radialGradient>
      </defs>
      {Array.from({ length: rays }).map((_, i) => (
        <path key={i} d="M0 0 L -3.2 -100 L 3.2 -100 Z" fill={"url(#" + gid + ")"} transform={"rotate(" + (i * 360) / rays + ")"} />
      ))}
    </svg>
  );
}

/** Phulkari embroidery band: nested bright diamonds, stitched in one by one. */
export function PhulkariBand({ t, W, h = 90, start = 0, colors = ["#FF6F00", "#E91E63", "#FFC107", "#7CB342"], base }: { t: number; W: number; h?: number; start?: number; colors?: string[]; base: string }) {
  const n = Math.round(W / h);
  const w = W / n;
  return (
    <svg width={W} height={h} viewBox={"0 0 " + W + " " + h} style={{ display: "block" }}>
      <rect width={W} height={h} fill={base} opacity={tw(t, start, 500)} />
      {Array.from({ length: n }).map((_, i) => {
        const p = tw(t, start + 120 + Math.abs(i - n / 2) * 70, 600, E.outBack);
        const cx = i * w + w / 2;
        const cy = h / 2;
        return (
          <g key={i} transform={"translate(" + cx + " " + cy + ") scale(" + clamp(p).toFixed(3) + ")"}>
            {[0.46, 0.33, 0.2].map((k, j) => (
              <rect key={j} x={-h * k} y={-h * k} width={h * k * 2} height={h * k * 2} transform="rotate(45)" fill={colors[(i + j) % colors.length]} />
            ))}
            <circle r={h * 0.06} fill="#fff" />
          </g>
        );
      })}
    </svg>
  );
}

/* ------------------------------------------------------------------ *
 * Celebration: rings, sparkles, confetti, lights, beams, equaliser
 * ------------------------------------------------------------------ */

/** Twinkling 4-point stars. */
export function Sparkles({ t, W, H, color = "#fff", count = 24, seed = 5, size = 22, start = 0 }: { t: number; W: number; H: number; color?: string; count?: number; seed?: number; size?: number; start?: number }) {
  const on = tw(t, start, 800);
  return (
    <svg width={W} height={H} style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity: on }}>
      {Array.from({ length: count }).map((_, i) => {
        const period = mix(rnd(i, 1, seed), 1400, 3200);
        const ph = ((t + rnd(i, 2, seed) * period) % period) / period;
        const s = Math.sin(ph * Math.PI) * mix(rnd(i, 3, seed), 0.4, 1) * size;
        return (
          <path
            key={i}
            d={"M0 -1 L 0.22 -0.22 L 1 0 L 0.22 0.22 L 0 1 L -0.22 0.22 L -1 0 L -0.22 -0.22 Z"}
            fill={color}
            transform={"translate(" + (rnd(i, 4, seed) * W).toFixed(1) + " " + (rnd(i, 5, seed) * H).toFixed(1) + ") scale(" + s.toFixed(2) + ") rotate(" + (ph * 90).toFixed(1) + ")"}
          />
        );
      })}
    </svg>
  );
}

/** Two rings roll in and lock together; a diamond flashes when they meet. */
export function Rings({ t, size = 520, metal = "#E8B4A0", metal2 = "#B9786A", start = 0 }: { t: number; size?: number; metal?: string; metal2?: string; start?: number }) {
  const p = tw(t, start, 1700, E.outQuart);
  const spin = (1 - p) * 720;
  const gx = mix(p, -110, -24);
  const bx = mix(p, 110, 24);
  const squash = (deg: number) => Math.max(0.12, Math.abs(Math.cos((deg * Math.PI) / 180)));
  const flash = Math.max(0, 1 - Math.abs(t - start - 1750) / 450);
  const gid = "rg" + uid(metal);
  const ring = (x: number, deg: number, part?: "front") => (
    <g transform={"translate(" + x.toFixed(1) + " 0) scale(" + squash(deg).toFixed(3) + " 1)"}>
      <circle r={52} fill="none" stroke={"url(#" + gid + ")"} strokeWidth={13} strokeDasharray={part ? "72 1000" : undefined} strokeDashoffset={part ? -254 : 0} />
    </g>
  );
  return (
    <svg width={size} height={size * 0.7} viewBox="-180 -130 360 250" style={{ overflow: "visible", opacity: tw(t, start, 400) }}>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff" />
          <stop offset="0.3" stopColor={metal} />
          <stop offset="0.7" stopColor={metal2} />
          <stop offset="1" stopColor={metal} />
        </linearGradient>
      </defs>
      {ring(gx, spin)}
      {ring(bx, -spin)}
      {/* re-draw only the upper crossing of the left ring on top: the rings read as linked */}
      {ring(gx, spin, "front")}
      {/* diamond on the right ring */}
      <g transform={"translate(" + bx.toFixed(1) + " -60) scale(" + squash(-spin).toFixed(3) + " 1)"}>
        <path d="M-16 0 L -9 -10 L 9 -10 L 16 0 L 0 20 Z" fill="#F1F8FF" stroke="#BFD9F2" strokeWidth={1.5} />
        <path d="M-16 0 L 16 0 M -9 -10 L 0 20 L 9 -10 M -4 0 L 0 -10 L 4 0" stroke="#BFD9F2" strokeWidth={1} fill="none" />
      </g>
      <g transform="translate(24 -66)" opacity={flash}>
        {[0, 45, 90, 135].map((a) => (
          <rect key={a} x={-1.5} y={-34 * flash - 10} width={3} height={68 * flash + 20} fill="#fff" transform={"rotate(" + a + ")"} rx={1.5} />
        ))}
      </g>
    </svg>
  );
}

/** Falling paper confetti with a fake 3D flip. */
export function Confetti({ t, W, H, colors, count = 70, seed = 9, start = 0 }: { t: number; W: number; H: number; colors: string[]; count?: number; seed?: number; start?: number }) {
  const s = Math.max(0, t - start) / 1000;
  return (
    <svg width={W} height={H} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      {Array.from({ length: count }).map((_, i) => {
        const v = mix(rnd(i, 1, seed), 120, 300);
        const y = -40 + ((s * v + rnd(i, 2, seed) * H * 1.5) % (H + 80));
        const x = rnd(i, 3, seed) * W + Math.sin(s * 1.7 + i) * 40;
        const flip = Math.cos(s * mix(rnd(i, 4, seed), 3, 8) + i);
        const rot = s * mix(rnd(i, 5, seed), 40, 200) + i * 37;
        return (
          <rect key={i} x={-7} y={-4} width={14} height={8} fill={colors[i % colors.length]} transform={"translate(" + x.toFixed(1) + " " + y.toFixed(1) + ") rotate(" + rot.toFixed(1) + ") scale(" + flip.toFixed(3) + " 1)"} />
        );
      })}
    </svg>
  );
}

/** Strings of fairy lights draped across the top. */
export function FairyLights({ t, W, strings = 3, color = "#FFE7A3", start = 0, depth = 140 }: { t: number; W: number; strings?: number; color?: string; start?: number; depth?: number }) {
  const gid = "fy" + uid(color);
  return (
    <svg width={W} height={depth * 2.2} style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none", overflow: "visible" }}>
      <defs>
        <radialGradient id={gid}>
          <stop offset="0" stopColor={color} stopOpacity={1} />
          <stop offset="0.3" stopColor={color} stopOpacity={0.6} />
          <stop offset="1" stopColor={color} stopOpacity={0} />
        </radialGradient>
      </defs>
      {Array.from({ length: strings }).map((_, si) => {
        const x0 = -60 + (si * W) / strings;
        const x1 = x0 + W / strings + 140;
        const sag = depth * (0.7 + 0.3 * rnd(si, 1));
        const yTop = 10 + si * 6;
        const n = 18;
        const path = "M" + x0 + " " + yTop + " Q " + (x0 + x1) / 2 + " " + (yTop + sag * 2) + " " + x1 + " " + yTop;
        return (
          <g key={si}>
            <path d={path} stroke="#3b3326" strokeWidth={1.4} fill="none" style={drawPath(t, (x1 - x0) * 1.3, { start: start + si * 200, dur: 1000 })} />
            {Array.from({ length: n }).map((_, i) => {
              const f = (i + 0.5) / n;
              const x = (1 - f) * (1 - f) * x0 + 2 * (1 - f) * f * ((x0 + x1) / 2) + f * f * x1;
              const y = (1 - f) * (1 - f) * yTop + 2 * (1 - f) * f * (yTop + sag * 2) + f * f * yTop;
              const on = tw(t, start + si * 200 + f * 1000, 300);
              const tw2 = 0.55 + 0.45 * Math.sin(t / 1000 * mix(rnd(i, 2, si), 1.5, 3.5) + i * 2.1);
              return (
                <g key={i} opacity={on}>
                  <circle cx={x} cy={y + 6} r={22} fill={"url(#" + gid + ")"} opacity={tw2 * 0.8} />
                  <circle cx={x} cy={y + 6} r={4} fill={color} opacity={0.6 + 0.4 * tw2} />
                </g>
              );
            })}
          </g>
        );
      })}
    </svg>
  );
}

/** Stage spotlights sweeping from the top. */
export function Beams({ t, W, H, colors, count = 4, start = 0 }: { t: number; W: number; H: number; colors: string[]; count?: number; start?: number }) {
  const on = tw(t, start, 900);
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", opacity: on, mixBlendMode: "screen" }}>
      {Array.from({ length: count }).map((_, i) => {
        const x = ((i + 0.5) / count) * W;
        const ang = Math.sin(t / 1000 * (0.6 + i * 0.17) + i * 1.3) * 26;
        const c = colors[i % colors.length];
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x - W * 0.18,
              top: -20,
              width: W * 0.36,
              height: H * 1.25,
              transformOrigin: "50% 0",
              transform: "rotate(" + ang.toFixed(2) + "deg)",
              clipPath: "polygon(46% 0, 54% 0, 100% 100%, 0 100%)",
              background: "linear-gradient(180deg, " + c + "AA 0%, " + c + "33 45%, transparent 85%)",
            }}
          />
        );
      })}
    </div>
  );
}

/** Bouncing equaliser bars (deterministic). */
export function Equalizer({ t, bars = 24, width = 600, height = 120, color, start = 0 }: { t: number; bars?: number; width?: number; height?: number; color: string; start?: number }) {
  const on = tw(t, start, 700);
  const bw = width / bars;
  return (
    <svg width={width} height={height} style={{ display: "block", opacity: on }}>
      {Array.from({ length: bars }).map((_, i) => {
        const v = 0.15 + 0.85 * Math.abs(Math.sin(t / 1000 * (2.1 + (i % 5) * 0.7) + i * 0.8) * Math.sin(t / 1000 * 0.9 + i * 0.3));
        const h = height * v * on;
        return <rect key={i} x={i * bw + bw * 0.18} y={height - h} width={bw * 0.64} height={h} rx={bw * 0.3} fill={color} opacity={0.85} />;
      })}
    </svg>
  );
}

/** Floating music notes. */
export function Notes({ t, W, H, color, count = 14, seed = 4 }: { t: number; W: number; H: number; color: string; count?: number; seed?: number }) {
  const s = t / 1000;
  const glyphs = ["♪", "♫", "♬", "♩"];
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
      {Array.from({ length: count }).map((_, i) => {
        const v = mix(rnd(i, 1, seed), 40, 110);
        const y = H + 60 - ((s * v + rnd(i, 2, seed) * H * 1.4) % (H + 160));
        const x = rnd(i, 3, seed) * W + Math.sin(s + i) * 30;
        return (
          <span key={i} style={{ position: "absolute", left: x, top: y, color, fontSize: mix(rnd(i, 4, seed), 34, 80), opacity: 0.25 + 0.4 * rnd(i, 5, seed), transform: "rotate(" + (Math.sin(s * 1.3 + i) * 18).toFixed(1) + "deg)" }}>
            {glyphs[i % glyphs.length]}
          </span>
        );
      })}
    </div>
  );
}

/** Art-deco fan for corners (receptions). */
export function DecoFan({ t, color, size = 240, start = 0, rotate = 0 }: { t: number; color: string; size?: number; start?: number; rotate?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ transform: "rotate(" + rotate + "deg)" }}>
      <g fill="none" stroke={color} strokeWidth={0.9}>
        {[30, 48, 66, 84].map((r, i) => (
          <path key={r} d={"M" + r + " 0 A " + r + " " + r + " 0 0 1 0 " + r} style={drawPath(t, (Math.PI * r) / 2, { start: start + i * 140, dur: 900 })} />
        ))}
        {Array.from({ length: 7 }).map((_, i) => {
          const a = ((i + 0.5) / 7) * (Math.PI / 2);
          return <path key={i} d={"M0 0 L " + (Math.cos(a) * 84).toFixed(2) + " " + (Math.sin(a) * 84).toFixed(2)} style={drawPath(t, 84, { start: start + 500 + i * 60, dur: 700 })} />;
        })}
        <circle cx={0} cy={0} r={14} fill={color} opacity={tw(t, start + 900, 600)} />
      </g>
    </svg>
  );
}
