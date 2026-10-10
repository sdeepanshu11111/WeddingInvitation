import { spawn } from "node:child_process";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { randomUUID } from "node:crypto";
import type { Browser, Page } from "puppeteer";
import type { Project } from "../types";
import { SIZES } from "../sizes";

/* =====================================================================
 * MP4 export.
 *   1. Headless Chrome opens /render?job=ID (the same <Frame/> as the editor)
 *   2. For each frame: window.__seek(t) → wait for media → screenshot
 *   3. JPEG frames are piped straight into ffmpeg (no temp PNGs on disk)
 *   4. ffmpeg muxes music, fades it out, writes H.264 + AAC with faststart
 *   5. The MP4 is also copied to ./exports, so it is never lost even if the
 *      browser blocks downloads
 * Deterministic by construction: frame N is always the same pixels.
 * ===================================================================== */

export type Quality = "144p" | "720p" | "1080p" | "4k";
const SCALE: Record<Quality, number> = { "144p": 144 / 1080, "720p": 2 / 3, "1080p": 1, "4k": 2 };

/** A job whose progress has not moved for this long is failed and the queue moves on. */
const STALL_MS = 90_000;
/** Upper bound for any single browser step (seek, screenshot, close). */
const STEP_MS = 30_000;

export const EXPORT_DIR = path.join(process.cwd(), "exports");

export type JobStatus = "queued" | "rendering" | "encoding" | "done" | "error";
export type Job = {
  id: string;
  project: Project;
  quality: Quality;
  fps: number;
  status: JobStatus;
  progress: number; // 0..1
  frames: number;
  outPath?: string;
  savedPath?: string; // copy in ./exports
  error?: string;
  createdAt: number;
  fileName: string;
  origin: string;
};

/* State lives on globalThis so it survives Next dev hot-reloads of this module. */
const g = globalThis as any;
const jobs: Map<string, Job> = g.__inviteJobs ?? (g.__inviteJobs = new Map());
const q: { queue: string[]; running: string | null; beat: number; page: Page | null } =
  g.__inviteQueue ?? (g.__inviteQueue = { queue: [], running: null, beat: 0, page: null });
let browserP: Promise<Browser> | null = g.__inviteBrowser ?? null;

// Jobs queued by an older copy of this module (dev hot-reload) re-enter the current queue.
for (const j of jobs.values()) {
  if (j.status === "queued" && q.running !== j.id && !q.queue.includes(j.id)) q.queue.push(j.id);
}

export function getJob(id: string) {
  pump(); // polling also drives stall recovery
  return jobs.get(id);
}

/** Cancels every queued and running job. The running one stops at its next frame. Returns how many were cancelled. */
export function cancelAll() {
  let n = 0;
  for (const j of jobs.values()) {
    if (j.status === "queued" || j.status === "rendering" || j.status === "encoding") {
      j.status = "error";
      j.error = "Cancelled";
      n++;
    }
  }
  q.queue.length = 0;
  q.page?.close().catch(() => {});
  return n;
}

/** Position in queue (0 = rendering now). */
export function queuePosition(id: string) {
  if (q.running === id) return 0;
  const i = q.queue.indexOf(id);
  return i < 0 ? -1 : i + 1;
}

function withTimeout<T>(p: Promise<T>, ms: number, what: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;
  return Promise.race([
    p.finally(() => clearTimeout(timer)),
    new Promise<T>((_, rej) => {
      timer = setTimeout(() => rej(new Error(what + " timed out after " + Math.round(ms / 1000) + "s")), ms);
    }),
  ]);
}

async function browser(): Promise<Browser> {
  if (browserP) {
    const b = await browserP.catch(() => null);
    if (b && b.connected) return b;
  }
  const puppeteer = (await import("puppeteer")).default;
  browserP = puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--autoplay-policy=no-user-gesture-required", "--hide-scrollbars", "--mute-audio", "--force-color-profile=srgb"],
  });
  g.__inviteBrowser = browserP;
  return browserP;
}

function slug(s: string) {
  return String(s || "invite").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "invite";
}

export function enqueue(project: Project, quality: Quality, fps: number, origin: string): Job {
  const d = project.data;
  const who = [d.nameA ?? d.brideName ?? d.groomName, d.nameB ?? d.groomName ?? d.brideName].filter(Boolean).join("-");
  const job: Job = {
    id: randomUUID(),
    project,
    quality,
    fps,
    status: "queued",
    progress: 0,
    frames: 0,
    createdAt: Date.now(),
    fileName: slug(who) + "-" + (project.orientation === "vertical" ? "9x16" : "16x9") + "-" + quality + ".mp4",
    origin,
  };
  jobs.set(job.id, job);
  q.queue.push(job.id);
  prune();
  pump();
  return job;
}

/**
 * One render at a time (headless Chrome + x264 already use every core).
 * If the running job stops making progress it is failed and the next one starts,
 * so one bad job can never block the queue.
 */
function pump() {
  if (q.running) {
    const cur = jobs.get(q.running);
    const stalled = Date.now() - q.beat > STALL_MS;
    if (cur && (cur.status === "rendering" || cur.status === "encoding" || cur.status === "queued") && !stalled) return;
    if (cur && stalled && cur.status !== "done" && cur.status !== "error") {
      cur.status = "error";
      cur.error = "Render stopped responding and was cancelled. Please try again.";
    }
    q.page?.close().catch(() => {});
    q.page = null;
    q.running = null;
  }
  const next = q.queue.shift();
  if (!next) return;
  const job = jobs.get(next);
  if (!job || job.status !== "queued") return pump();
  q.running = job.id;
  q.beat = Date.now();
  run(job).finally(() => {
    if (q.running === job.id) {
      q.running = null;
      q.page = null;
    }
    pump();
  });
}

function prune() {
  const cutoff = Date.now() - 1000 * 60 * 60 * 6;
  for (const [id, j] of jobs) {
    if (j.createdAt < cutoff) {
      if (j.outPath) fs.rm(path.dirname(j.outPath), { recursive: true, force: true }).catch(() => {});
      jobs.delete(id);
    }
  }
}

function extFromDataUrl(src: string) {
  const m = /^data:([^;]+);/.exec(src);
  const mime = m?.[1] ?? "";
  if (mime.includes("mpeg")) return ".mp3";
  if (mime.includes("mp4") || mime.includes("m4a") || mime.includes("aac")) return ".m4a";
  if (mime.includes("wav")) return ".wav";
  if (mime.includes("ogg")) return ".ogg";
  if (mime.includes("webm")) return ".webm";
  return ".bin";
}

/** Copy to ./exports without overwriting earlier renders. */
async function saveCopy(src: string, fileName: string) {
  await fs.mkdir(EXPORT_DIR, { recursive: true });
  const ext = path.extname(fileName);
  const base = path.basename(fileName, ext);
  for (let i = 1; ; i++) {
    const dst = path.join(EXPORT_DIR, i === 1 ? fileName : base + "-" + i + ext);
    try {
      await fs.access(dst);
    } catch {
      await fs.copyFile(src, dst);
      return dst;
    }
  }
}

async function run(job: Job) {
  const tmp = await fs.mkdtemp(path.join(os.tmpdir(), "invite-"));
  const out = path.join(tmp, job.fileName);
  let page: Page | null = null;
  const beat = () => (q.beat = Date.now());
  try {
    job.status = "rendering";
    const { W, H } = SIZES[job.project.orientation];
    const b = await withTimeout(browser(), 60_000, "Starting Chrome");
    page = await withTimeout(b.newPage(), STEP_MS, "Opening render page");
    q.page = page;
    await page.setViewport({ width: W, height: H, deviceScaleFactor: SCALE[job.quality] });
    await page.goto((job.origin || "http://localhost:4321") + "/render?job=" + job.id, { waitUntil: "networkidle0", timeout: 120_000 });
    beat();
    await page.waitForFunction("window.__ready === true", { timeout: 120_000 });
    const info = (await page.evaluate("window.__info")) as { total: number; speed: number };

    const seconds = info.total / info.speed / 1000;
    const frames = Math.ceil(seconds * job.fps);
    job.frames = frames;

    // Music → temp file so ffmpeg can seek it
    let musicFile: string | null = null;
    const m = job.project.music;
    if (m?.src?.startsWith("data:")) {
      musicFile = path.join(tmp, "music" + extFromDataUrl(m.src));
      await fs.writeFile(musicFile, Buffer.from(m.src.split(",")[1], "base64"));
    }

    const ffmpegPath = (await import("ffmpeg-static")).default as unknown as string;
    const args = ["-y", "-loglevel", "error", "-f", "image2pipe", "-framerate", String(job.fps), "-c:v", "mjpeg", "-i", "-"];
    if (musicFile && m) args.push("-ss", String(m.offset || 0), "-i", musicFile);
    args.push("-map", "0:v");
    if (musicFile && m) {
      const fadeAt = Math.max(0, seconds - 2.2);
      args.push("-map", "1:a", "-c:a", "aac", "-b:a", "192k", "-af", "volume=" + (m.volume ?? 0.8) + ",afade=t=in:d=0.6,afade=t=out:st=" + fadeAt.toFixed(2) + ":d=2.2");
    }
    args.push(
      "-c:v", "libx264", "-preset", job.quality === "144p" ? "ultrafast" : "medium", "-crf", job.quality === "4k" ? "20" : job.quality === "144p" ? "26" : "18",
      "-pix_fmt", "yuv420p", "-vf", "scale=trunc(iw/2)*2:trunc(ih/2)*2",
      "-r", String(job.fps), "-t", seconds.toFixed(3), "-movflags", "+faststart", out,
    );

    const ff = spawn(ffmpegPath, args, { stdio: ["pipe", "ignore", "pipe"] });
    let ffErr = "";
    let ffExited = false;
    ff.stderr.on("data", (c) => (ffErr += c.toString()));
    ff.stdin.on("error", () => {}); // EPIPE if ffmpeg dies; surfaced via ffDone below
    const ffDone = new Promise<void>((res, rej) => {
      ff.on("error", rej);
      ff.on("close", (code) => {
        ffExited = true;
        code === 0 ? res() : rej(new Error("ffmpeg exited " + code + ": " + ffErr.slice(-600)));
      });
    });
    ffDone.catch(() => {}); // awaited later; avoid unhandled rejection while frames stream

    const write = async (buf: Uint8Array) => {
      if (ffExited) await ffDone; // throws the real ffmpeg error
      if (!ff.stdin.write(buf)) {
        await Promise.race([new Promise((r) => ff.stdin.once("drain", r)), ffDone]);
      }
    };

    for (let i = 0; i < frames; i++) {
      if ((job.status as JobStatus) === "error") throw new Error(job.error || "Cancelled"); // cancelled by the watchdog
      const T = (i / job.fps) * 1000 * info.speed;
      await withTimeout(page.evaluate("window.__seek(" + T + ")"), STEP_MS, "Frame " + i);
      const shot = await withTimeout(page.screenshot({ type: "jpeg", quality: job.quality === "144p" ? 70 : 92, optimizeForSpeed: true }), STEP_MS, "Screenshot " + i);
      await write(shot as Uint8Array);
      job.progress = (i + 1) / frames;
      beat();
    }
    job.status = "encoding";
    ff.stdin.end();
    await withTimeout(ffDone, 10 * 60_000, "Encoding");
    job.outPath = out;
    job.savedPath = await saveCopy(out, job.fileName);
    job.status = "done";
    job.progress = 1;
  } catch (e: any) {
    if (job.status !== "error") {
      job.status = "error";
      job.error = String(e?.message || e);
    }
  } finally {
    if (page) await withTimeout(page.close(), 10_000, "Closing page").catch(() => {});
  }
}
