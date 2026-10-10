#!/usr/bin/env node
/**
 * Render ONE full-resolution frame of a template (with demo photos), for close QA of type and glyphs.
 *   node scripts/frame.mjs out.png <template-id> vertical|horizontal <ms> [palette]
 * Dev server must be running (ORIGIN, default http://localhost:4321).
 */
import puppeteer from "puppeteer";

const [, , out, tpl, orientation = "vertical", ms = "3000", palette] = process.argv;
if (!out || !tpl) {
  console.log("usage: node scripts/frame.mjs out.png <template-id> vertical|horizontal <ms> [palette]");
  process.exit(1);
}
const origin = process.env.ORIGIN || "http://localhost:4321";
const W = orientation === "vertical" ? 1080 : 1920;
const H = orientation === "vertical" ? 1920 : 1080;
const b = await puppeteer.launch({ headless: true });
try {
  const p = await b.newPage();
  await p.setViewport({ width: W, height: H, deviceScaleFactor: 1 });
  const q = new URLSearchParams({ template: tpl, orientation, demo: "1", ...(palette ? { palette } : {}) });
  await p.goto(origin + "/render?" + q, { waitUntil: "networkidle0" });
  await p.waitForFunction("window.__ready === true");
  await p.evaluate("window.__seek(" + Number(ms) + ")");
  await p.screenshot({ path: out });
  console.log("wrote", out);
} finally {
  await b.close();
}
