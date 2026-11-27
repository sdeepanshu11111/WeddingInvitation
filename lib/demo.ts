import type { Asset, TemplateDef } from "./types";

/**
 * Generates soft, abstract "photos" on a canvas so every template can be
 * previewed (and thumbnail-rendered) before the couple uploads anything.
 */
export function demoPhoto(seed: number, w = 1200, h = 1500): Asset {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const g = c.getContext("2d")!;
  const rnd = (k: number) => {
    const x = Math.sin(seed * 99.13 + k * 17.7) * 43758.5453;
    return x - Math.floor(x);
  };
  const hues = [[28, 60], [340, 20], [200, 35], [140, 30], [12, 45], [260, 25]][seed % 6];
  const grad = g.createLinearGradient(0, 0, w * rnd(1), h);
  grad.addColorStop(0, "hsl(" + hues[0] + ",45%,72%)");
  grad.addColorStop(1, "hsl(" + (hues[0] + hues[1]) + ",40%,30%)");
  g.fillStyle = grad;
  g.fillRect(0, 0, w, h);
  // bokeh
  for (let i = 0; i < 40; i++) {
    const r = 20 + rnd(i + 3) * 120;
    g.beginPath();
    g.arc(rnd(i + 10) * w, rnd(i + 50) * h * 0.6, r, 0, Math.PI * 2);
    g.fillStyle = "rgba(255,245,225," + (0.05 + rnd(i + 90) * 0.18) + ")";
    g.fill();
  }
  // two silhouettes
  g.fillStyle = "rgba(20,14,12,0.55)";
  const base = h * 0.98;
  [[0.4, 0.95], [0.6, 1]].forEach(([x, s]) => {
    g.beginPath();
    g.arc(w * x, base - h * 0.47 * s, w * 0.075 * s, 0, Math.PI * 2);
    g.fill();
    g.beginPath();
    g.ellipse(w * x, base - h * 0.12 * s, w * 0.15 * s, h * 0.3 * s, 0, 0, Math.PI * 2);
    g.fill();
  });
  return { src: c.toDataURL("image/jpeg", 0.86), name: "sample-" + (seed + 1) + ".jpg", kind: "image" };
}

/** Fill every empty image / gallery field of a template with demo photos. */
export function withDemoMedia(t: TemplateDef, data: Record<string, any>): Record<string, any> {
  const out = { ...data };
  let n = 0;
  for (const f of t.groups.flatMap((g) => g.fields)) {
    if (f.type === "image" && !out[f.key]) out[f.key] = demoPhoto(n++);
    if (f.type === "gallery" && !(out[f.key] || []).length) {
      out[f.key] = Array.from({ length: Math.min(f.max, 5) }, () => demoPhoto(n++));
    }
  }
  return out;
}
