import type { Asset, TemplateDef } from "./types";

/**
 * The sample "photo" every template shows before the couple adds their own (previews, cards, the home page, posters).
 * Drawn on a canvas, so there is nothing to license and nothing to download: a golden-hour sky with soft bokeh,
 * marigold strings from the top, and an illustrated couple in silhouette (the groom in a safa with a kalgi and a
 * sherwani, the bride in a lehenga with her dupatta over her head, their hands joined) with a warm rim of light.
 * Redrawn 2026-11-18 (owner: the two grey ovals made every design look unfinished). `seed` picks the sky colour and
 * mirrors the couple on odd seeds, so a gallery of several photos does not repeat itself.
 * The figures sit in the middle band (about 28%-93% of the height), so a circle or square crop keeps them.
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

  // Sky: warm hues only (dusk rose, saffron, coral, mauve, gold, peach).
  const [hue, spread] = [[28, 18], [345, 25], [14, 22], [320, 30], [40, 16], [8, 28]][seed % 6];
  const sky = g.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, "hsl(" + (hue + spread) + ",55%,80%)");
  sky.addColorStop(0.55, "hsl(" + hue + ",62%,66%)");
  sky.addColorStop(1, "hsl(" + (hue - 10) + ",45%,30%)");
  g.fillStyle = sky;
  g.fillRect(0, 0, w, h);

  // The sun's glow behind the couple.
  const sun = g.createRadialGradient(w * 0.5, h * 0.56, 0, w * 0.5, h * 0.56, w * 0.62);
  sun.addColorStop(0, "rgba(255,246,222,0.95)");
  sun.addColorStop(0.25, "rgba(255,226,170,0.55)");
  sun.addColorStop(1, "rgba(255,210,150,0)");
  g.fillStyle = sun;
  g.fillRect(0, 0, w, h);

  // Bokeh: fairy lights out of focus.
  for (let i = 0; i < 46; i++) {
    const r = 14 + rnd(i + 3) * 70;
    g.beginPath();
    g.arc(rnd(i + 10) * w, (0.08 + rnd(i + 50) * 0.62) * h, r, 0, Math.PI * 2);
    g.fillStyle = "rgba(255,240,205," + (0.06 + rnd(i + 90) * 0.2) + ")";
    g.fill();
  }

  // Ground: a soft darker band where they stand.
  const ground = g.createLinearGradient(0, h * 0.82, 0, h);
  ground.addColorStop(0, "rgba(40,18,22,0)");
  ground.addColorStop(1, "rgba(40,18,22,0.55)");
  g.fillStyle = ground;
  g.fillRect(0, h * 0.82, w, h * 0.18);

  // Marigold strings from the top.
  const strands = 9;
  for (let s = 0; s < strands; s++) {
    const x = (w * (s + 0.5)) / strands;
    const len = h * (0.1 + rnd(s + 200) * 0.12);
    const r = w * 0.016;
    for (let y = r; y < len; y += r * 1.7) {
      g.beginPath();
      g.arc(x + Math.sin(y * 0.02 + s) * 3, y, r, 0, Math.PI * 2);
      g.fillStyle = (y / (r * 1.7)) % 3 < 1 ? "#FFC23A" : "#F2771A";
      g.fill();
    }
  }

  // The couple, in silhouette with a warm rim light.
  g.save();
  if (seed % 2) {
    g.translate(w, 0);
    g.scale(-1, 1); // mirror on odd seeds
  }
  g.fillStyle = "rgba(46,18,28,0.94)";
  g.shadowColor = "rgba(255,214,150,0.75)";
  g.shadowBlur = w * 0.025;
  const X = (f: number) => w * f;
  const Y = (f: number) => h * f;

  // Groom (left): safa with a kalgi, sherwani flaring to the knee, churidar legs.
  g.beginPath();
  g.arc(X(0.4), Y(0.405), X(0.052), 0, Math.PI * 2); // head
  g.fill();
  g.beginPath();
  g.ellipse(X(0.4), Y(0.372), X(0.066), Y(0.032), -0.08, 0, Math.PI * 2); // safa
  g.fill();
  g.beginPath(); // kalgi plume
  g.moveTo(X(0.42), Y(0.35));
  g.quadraticCurveTo(X(0.47), Y(0.3), X(0.445), Y(0.335));
  g.quadraticCurveTo(X(0.44), Y(0.345), X(0.42), Y(0.35));
  g.fill();
  g.beginPath(); // tail of the safa down the back
  g.moveTo(X(0.35), Y(0.38));
  g.quadraticCurveTo(X(0.325), Y(0.45), X(0.34), Y(0.5));
  g.lineTo(X(0.355), Y(0.495));
  g.quadraticCurveTo(X(0.345), Y(0.44), X(0.365), Y(0.39));
  g.fill();
  g.beginPath(); // neck + sherwani
  g.moveTo(X(0.385), Y(0.44));
  g.lineTo(X(0.415), Y(0.44));
  g.quadraticCurveTo(X(0.47), Y(0.455), X(0.48), Y(0.5));
  g.lineTo(X(0.49), Y(0.8));
  g.quadraticCurveTo(X(0.4), Y(0.815), X(0.31), Y(0.8));
  g.lineTo(X(0.32), Y(0.5));
  g.quadraticCurveTo(X(0.33), Y(0.455), X(0.385), Y(0.44));
  g.fill();
  g.fillRect(X(0.36), Y(0.79), X(0.032), Y(0.14)); // legs
  g.fillRect(X(0.41), Y(0.79), X(0.032), Y(0.14));

  // Bride (right): dupatta over her head, fitted choli, a full lehenga to the ground.
  g.beginPath();
  g.arc(X(0.6), Y(0.43), X(0.046), 0, Math.PI * 2); // head
  g.fill();
  g.beginPath(); // dupatta: over the head, falling behind to the waist
  g.moveTo(X(0.555), Y(0.425));
  g.quadraticCurveTo(X(0.565), Y(0.37), X(0.605), Y(0.375));
  g.quadraticCurveTo(X(0.66), Y(0.38), X(0.665), Y(0.44));
  g.quadraticCurveTo(X(0.69), Y(0.53), X(0.7), Y(0.62));
  g.lineTo(X(0.64), Y(0.6));
  g.quadraticCurveTo(X(0.6), Y(0.5), X(0.555), Y(0.425));
  g.fill();
  g.beginPath(); // shoulders + choli to the waist
  g.moveTo(X(0.585), Y(0.465));
  g.lineTo(X(0.615), Y(0.465));
  g.quadraticCurveTo(X(0.655), Y(0.48), X(0.655), Y(0.52));
  g.lineTo(X(0.635), Y(0.6));
  g.lineTo(X(0.565), Y(0.6));
  g.lineTo(X(0.545), Y(0.52));
  g.quadraticCurveTo(X(0.545), Y(0.48), X(0.585), Y(0.465));
  g.fill();
  g.beginPath(); // lehenga: a bell from the waist to a curved hem
  g.moveTo(X(0.565), Y(0.59));
  g.lineTo(X(0.635), Y(0.59));
  g.quadraticCurveTo(X(0.7), Y(0.75), X(0.775), Y(0.93));
  g.quadraticCurveTo(X(0.6), Y(0.955), X(0.425), Y(0.93));
  g.quadraticCurveTo(X(0.5), Y(0.75), X(0.565), Y(0.59));
  g.fill();

  // Joined hands between them.
  g.lineCap = "round";
  g.strokeStyle = g.fillStyle;
  g.lineWidth = X(0.022);
  g.beginPath();
  g.moveTo(X(0.47), Y(0.52));
  g.quadraticCurveTo(X(0.51), Y(0.6), X(0.555), Y(0.545));
  g.stroke();
  g.restore();

  // A touch of gold on the garland round the groom's neck (drawn after the mirror, so it follows it).
  const gx = seed % 2 ? w - X(0.4) : X(0.4);
  g.strokeStyle = "rgba(255,196,90,0.9)";
  g.lineWidth = X(0.008);
  g.beginPath();
  g.ellipse(gx, Y(0.47), X(0.05), Y(0.045), 0, 0.1 * Math.PI, 0.9 * Math.PI);
  g.stroke();

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
