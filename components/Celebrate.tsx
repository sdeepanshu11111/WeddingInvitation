/* The "it worked" moment: a confetti burst (link created in the studio, watermark removed on the invite page).
   UI chrome, not a template scene, so CSS animation is fine here; the pieces are still placed by a seeded
   formula, so every burst looks the same. Styles: .confetti in globals.css (reduced motion skips it). */

import type { CSSProperties } from "react";

const COLORS = ["#a01d38", "#c48a2c", "#f3b33d", "#e86f8b", "#2f7d4f", "#ffffff", "#f1cf8f"];
const rnd = (i: number, k: number) => {
  const x = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453;
  return x - Math.floor(x);
};

/** Pieces fly out from (x%, y%) of the parent, then fall. The parent needs position: relative/fixed/absolute. */
export function Confetti({ count = 70, x = 50, y = 38 }: { count?: number; x?: number; y?: number }) {
  return (
    <div className="confetti" aria-hidden style={{ ["--ox" as any]: x + "%", ["--oy" as any]: y + "%" }}>
      {Array.from({ length: count }, (_, i) => {
        const angle = rnd(i, 1) * Math.PI * 2;
        const power = 120 + rnd(i, 2) * 260;
        const style = {
          "--dx": Math.cos(angle) * power + "px",
          "--up": Math.min(0, Math.sin(angle) * power) - 60 + "px",
          "--fall": 380 + rnd(i, 3) * 420 + "px",
          "--r": (rnd(i, 4) > 0.5 ? 1 : -1) * (360 + rnd(i, 5) * 720) + "deg",
          "--d": 1.5 + rnd(i, 6) * 1.1 + "s",
          "--delay": rnd(i, 7) * 0.18 + "s",
          width: 6 + Math.round(rnd(i, 8) * 6),
          height: rnd(i, 9) > 0.6 ? 6 + Math.round(rnd(i, 10) * 4) : 12 + Math.round(rnd(i, 11) * 8),
          borderRadius: rnd(i, 12) > 0.7 ? "50%" : 2,
          background: COLORS[i % COLORS.length],
        } as CSSProperties;
        return <i key={i} style={style} />;
      })}
    </div>
  );
}

/** A tick drawing itself inside a circle. */
export function DrawnCheck({ size = 76 }: { size?: number }) {
  return (
    <svg className="drawn-check" width={size} height={size} viewBox="0 0 76 76" aria-hidden>
      <circle cx="38" cy="38" r="34" />
      <path d="M23 39.5 33.5 50 54 28" />
    </svg>
  );
}
