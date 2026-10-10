#!/usr/bin/env node
/**
 * Contact sheets: one PNG per template x orientation, showing every scene
 * at its "settled" moment, filled with generated demo photos.
 *
 *   npm run dev            (in another terminal)
 *   node scripts/snapshot.mjs [outDir] [--only=template-id] [--palette=id]
 *
 * Handy for QA after editing a template, and for marketing thumbnails.
 */
import puppeteer from "puppeteer";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const args = process.argv.slice(2);
const outDir = path.resolve(args.find((a) => !a.startsWith("--")) || "snapshots");
const only = args.find((a) => a.startsWith("--only="))?.split("=")[1];
const palette = args.find((a) => a.startsWith("--palette="))?.split("=")[1];
const origin = process.env.ORIGIN || "http://localhost:4321";
const AT = 0.72; // how far into each scene to capture

await mkdir(outDir, { recursive: true });
const browser = await puppeteer.launch({ headless: true, args: ["--no-sandbox", "--hide-scrollbars"] });

try {
  const probe = await browser.newPage();
  await probe.goto(origin + "/render", { waitUntil: "networkidle0" });
  const templates = await probe.evaluate("window.__templates");
  await probe.close();

  for (const t of templates) {
    if (only && t.id !== only) continue;
    for (const orientation of ["vertical", "horizontal"]) {
      const W = orientation === "vertical" ? 1080 : 1920;
      const H = orientation === "vertical" ? 1920 : 1080;
      const page = await browser.newPage();
      await page.setViewport({ width: W, height: H, deviceScaleFactor: 0.32 });
      const q = new URLSearchParams({ template: t.id, orientation, demo: "1", ...(palette ? { palette } : {}) });
      await page.goto(origin + "/render?" + q, { waitUntil: "networkidle0", timeout: 120000 });
      await page.waitForFunction("window.__ready === true", { timeout: 120000 });
      const info = await page.evaluate("window.__info");

      const shots = [];
      for (const s of info.scenes) {
        await page.evaluate("window.__seek(" + (s.start + s.duration * AT) + ")");
        const b64 = await page.screenshot({ type: "jpeg", quality: 85, encoding: "base64" });
        shots.push({ label: s.label, b64 });
      }
      await page.close();

      // Tile into one sheet
      const cols = orientation === "vertical" ? Math.min(shots.length, 7) : Math.min(shots.length, 4);
      const cellW = orientation === "vertical" ? 240 : 400;
      const sheet = await browser.newPage();
      await sheet.setViewport({ width: cols * (cellW + 12) + 12, height: 400, deviceScaleFactor: 1 });
      await sheet.setContent(
        '<body style="margin:0;background:#111;font:12px sans-serif;color:#aaa">' +
          '<div style="padding:10px 12px;color:#ddd">' + t.id + " · " + orientation + " · " + (info.total / 1000).toFixed(1) + "s</div>" +
          '<div style="display:grid;grid-template-columns:repeat(' + cols + "," + cellW + 'px);gap:12px;padding:0 12px 12px">' +
          shots
            .map((s, i) => '<figure style="margin:0"><img style="width:100%;display:block;border-radius:4px" src="data:image/jpeg;base64,' + s.b64 + '"><figcaption style="padding-top:4px">' + (i + 1) + ". " + s.label + "</figcaption></figure>")
            .join("") +
          "</div></body>"
      );
      const file = path.join(outDir, t.id + "-" + orientation + ".png");
      await writeFile(file, await sheet.screenshot({ fullPage: true }));
      await sheet.close();
      console.log("wrote", file);
    }
  }
} finally {
  await browser.close();
}
