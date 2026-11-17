#!/usr/bin/env node
/**
 * Poster images for the design cards: public/posters/<template-id>.webp, 360x640, the scene with the couple's names
 * (else the title card, else the 2nd scene), in the design's first palette, with the sample photo.
 * Cards show this picture and only start the live preview when hovered or centred on a phone
 * (components/site/TemplateCard.tsx), so a page of 26 designs no longer renders 26 live invitations and downloads
 * every design's fonts. Re-run after changing a design's look, palettes, sample text or lib/demo.ts:
 *
 *   npm run dev            (in another terminal)
 *   node scripts/posters.mjs [--only=id,id2|pattern-*]
 */
import puppeteer from "puppeteer";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const args = process.argv.slice(2);
const only = args.find((a) => a.startsWith("--only="))?.split("=")[1]?.split(",");
const wanted = (id) => !only || only.some((p) => new RegExp("^" + p.split("*").join(".*") + "$").test(id));
const origin = process.env.ORIGIN || "http://localhost:4321";
const outDir = path.resolve("public/posters");
await mkdir(outDir, { recursive: true });

const browser = await puppeteer.launch({ headless: true, args: ["--no-sandbox", "--hide-scrollbars"] });
try {
  const probe = await browser.newPage();
  await probe.goto(origin + "/render", { waitUntil: "networkidle0" });
  const templates = (await probe.evaluate("window.__templates")).filter((t) => wanted(t.id));
  await probe.close();
  let n = 0;
  for (const t of templates) {
    const page = await browser.newPage();
    await page.setViewport({ width: 1080, height: 1920, deviceScaleFactor: 1 / 3 });
    await page.goto(origin + "/render?" + new URLSearchParams({ template: t.id, orientation: "vertical", demo: "1" }), { waitUntil: "networkidle0", timeout: 120000 });
    await page.waitForFunction("window.__ready === true", { timeout: 120000 });
    const at = await page.evaluate(() => {
      const s = window.__info.scenes;
      const find = (re) => s.find((x) => re.test(x.id) || re.test(x.label));
      const pick = find(/\bnames?\b|couple/i) ?? find(/^title\b/i) ?? s[Math.min(1, s.length - 1)];
      return pick.start + pick.duration * 0.72;
    });
    await page.evaluate((x) => window.__seek(x), at);
    await new Promise((r) => setTimeout(r, 250));
    const buf = await page.screenshot({ type: "webp", quality: 72 });
    await writeFile(path.join(outDir, t.id + ".webp"), buf);
    await page.close();
    console.log(++n + "/" + templates.length, t.id, Math.round(buf.length / 1024) + " KB");
  }
} finally {
  await browser.close();
}
