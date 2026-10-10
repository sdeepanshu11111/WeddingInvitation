#!/usr/bin/env node
/**
 * Render a saved project file (Export → "Save project file") to MP4 from the command line.
 * Uses the same /api/render pipeline as the editor, so the server must be running.
 *
 *   npm run render -- invite-project.json                 → orientation saved in the file
 *   npm run render -- invite-project.json --both --4k     → 9:16 and 16:9, 4K
 *   npm run render -- a.json b.json c.json --720p         → batch
 *
 * Env: ORIGIN (default http://localhost:4321)
 */
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const argv = process.argv.slice(2);
const files = argv.filter((a) => !a.startsWith("--"));
const flag = (f) => argv.includes("--" + f);
const quality = flag("4k") ? "4k" : flag("720p") ? "720p" : flag("144p") ? "144p" : "1080p";
const fps = flag("60fps") ? 60 : flag("24fps") ? 24 : 30;
const origin = process.env.ORIGIN || "http://localhost:4321";

if (!files.length) {
  console.log("usage: npm run render -- <project.json> [more.json] [--both] [--144p|--720p|--4k] [--24fps|--60fps]");
  process.exit(1);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

for (const file of files) {
  const project = JSON.parse(await readFile(file, "utf8"));
  const orientations = flag("both") ? ["vertical", "horizontal"] : [project.orientation];
  for (const orientation of orientations) {
    const res = await fetch(origin + "/api/render", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ project: { ...project, orientation }, quality, fps }),
    }).catch(() => null);
    if (!res?.ok) {
      console.error("Could not reach " + origin + " - is `npm run dev` running?");
      process.exit(1);
    }
    const { id, fileName } = await res.json();
    const t0 = Date.now();
    process.stdout.write(fileName + " ");
    for (;;) {
      await sleep(1000);
      const s = await (await fetch(origin + "/api/render/" + id)).json();
      process.stdout.write("\r" + fileName + "  " + s.status.padEnd(9) + " " + String(Math.round(s.progress * 100)).padStart(3) + "%");
      if (s.status === "error") {
        console.error("\n  failed: " + s.error);
        break;
      }
      if (s.status === "done") {
        const buf = Buffer.from(await (await fetch(origin + "/api/render/" + id + "/file")).arrayBuffer());
        const out = path.join(path.dirname(file), fileName);
        await writeFile(out, buf);
        console.log("  -> " + out + " (" + (buf.length / 1e6).toFixed(1) + " MB, " + ((Date.now() - t0) / 1000).toFixed(0) + "s)");
        break;
      }
    }
  }
}
