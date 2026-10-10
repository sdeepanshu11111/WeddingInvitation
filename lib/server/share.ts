import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { createHash, randomBytes } from "node:crypto";
import { put } from "@vercel/blob";
import type { Project } from "../types";
import { SHARE_STORE } from "../features";
import { MEDIA_TYPES, allSrcs, mapDataUrls, mimeOfDataUrl } from "../media";
import { EXPORT_DIR } from "./paths";

/* =====================================================================
 * Share links: /v/<token>. Two kinds:
 *   live  - the project itself. The watch page plays it in the guest's
 *           browser with the same <Frame/> code as the editor.
 *   video - a finished MP4 from ./exports (only where MP4 export runs).
 * Storage (SHARE_STORE):
 *   disk  - exports/shares/<token>/{share.json, project.json, media files}
 *   blob  - Vercel Blob, same layout under shares/<token>/. In this mode the
 *           editor uploads media straight to Blob first (Vercel limits request
 *           bodies to 4.5 MB), so the project arrives with Blob URLs.
 * Shares never change after creation: the watch page is cached forever.
 * Export file names are guessable (couple names + format); tokens are not.
 * ===================================================================== */

/** What the link-preview card needs, so it never has to load the templates. */
export type Card = { bg: string; bg2: string; ink: string; soft: string; accent: string; line: string; date?: string; photo?: string };

export type Share =
  | { token: string; kind: "live"; title: string; createdAt: number; card: Card }
  | { token: string; kind: "video"; title: string; createdAt: number; file: string; vertical: boolean };

export const SHARE_DIR = path.join(EXPORT_DIR, "shares");
const TOKEN = /^[\w-]{6,32}$/;
const newToken = () => randomBytes(9).toString("base64url");

/* ---------------- storage backends ---------------- */

function blobStoreId() {
  const id = process.env.BLOB_STORE_ID ?? (process.env.BLOB_READ_WRITE_TOKEN ?? "").split("_")[3] ?? "";
  return id.replace(/^store_/, "");
}
/** Public URL prefix of this project's Blob store. */
export const blobBase = () => "https://" + blobStoreId() + ".public.blob.vercel-storage.com/";

const store = {
  async readJSON<T>(key: string): Promise<T | null> {
    try {
      if (SHARE_STORE === "blob") {
        const r = await fetch(blobBase() + "shares/" + key); // cached by Next and the Blob CDN; shares are immutable
        return r.ok ? ((await r.json()) as T) : null;
      }
      return JSON.parse(await fs.readFile(path.join(SHARE_DIR, key), "utf8")) as T;
    } catch {
      return null;
    }
  },
  async writeJSON(key: string, value: unknown) {
    const body = JSON.stringify(value);
    if (SHARE_STORE === "blob") {
      await put("shares/" + key, body, { access: "public", contentType: "application/json", addRandomSuffix: false, cacheControlMaxAge: 31536000 });
      return;
    }
    await fs.mkdir(path.dirname(path.join(SHARE_DIR, key)), { recursive: true });
    await fs.writeFile(path.join(SHARE_DIR, key), body);
  },
  /** Stores one media file of a share and returns the URL the watch page loads it from. */
  async writeMedia(token: string, buf: Buffer, mime: string): Promise<string> {
    const name = createHash("sha1").update(buf).digest("hex").slice(0, 16) + MEDIA_TYPES[mime];
    if (SHARE_STORE === "blob") {
      const r = await put("shares/" + token + "/" + name, buf, { access: "public", contentType: mime, addRandomSuffix: true, cacheControlMaxAge: 31536000 });
      return r.url;
    }
    await fs.mkdir(path.join(SHARE_DIR, token), { recursive: true });
    await fs.writeFile(path.join(SHARE_DIR, token, name), buf);
    return "/api/share/" + token + "/media/" + name;
  },
};

function assertWritable() {
  // Vercel's filesystem is read-only: without a Blob store there is nowhere to keep shares.
  if (SHARE_STORE === "disk" && process.env.VERCEL) {
    throw new Error("Sharing needs a Vercel Blob store. Connect one to this project (Storage → Blob) and redeploy.");
  }
}

/* ---------------- shares ---------------- */

export async function getShare(token: string): Promise<(Share & { path: string }) | null> {
  if (!TOKEN.test(token)) return null;
  const s = await store.readJSON<Share>(token + "/share.json");
  if (!s) return null;
  return { ...s, path: s.kind === "video" ? path.join(EXPORT_DIR, s.file) : path.join(SHARE_DIR, token) };
}

export async function getLiveProject(token: string): Promise<Project | null> {
  if (!TOKEN.test(token)) return null;
  return store.readJSON<Project>(token + "/project.json");
}

/** Link to a finished MP4 in ./exports. Reuses the token if that file was shared before. */
export async function createVideoShare(file: string, title: string): Promise<Share> {
  const name = path.basename(file);
  if (name !== file || path.extname(name).toLowerCase() !== ".mp4") throw new Error("Bad file name");
  await fs.access(path.join(EXPORT_DIR, name));
  for (const t of await fs.readdir(SHARE_DIR).catch(() => [] as string[])) {
    const s = await getShare(t);
    if (s?.kind === "video" && s.file === name) return s;
  }
  const share: Share = { token: newToken(), kind: "video", title: title.slice(0, 120), createdAt: Date.now(), file: name, vertical: /9x16/.test(name) };
  await store.writeJSON(share.token + "/share.json", share);
  return share;
}

const COLOR = /^#[0-9a-f]{3,8}$/i;

/**
 * Snapshot of a project as a live invitation. Data URLs (photos, video, music)
 * become stored files, so the watch page stays a few KB and media streams
 * separately. Media may only point at this app's own storage.
 */
export async function createLiveShare(project: Project, title: string, card: Partial<Card>): Promise<Share> {
  assertWritable();
  const token = newToken();
  let stored: Project;
  try {
    stored = await mapDataUrls(project, async (src) => {
      const mime = mimeOfDataUrl(src);
      if (!MEDIA_TYPES[mime]) throw new Error("Unsupported media type " + (mime || "unknown"));
      const comma = src.indexOf(",");
      const meta = src.slice(0, comma);
      const body = src.slice(comma + 1);
      const buf = meta.endsWith(";base64") ? Buffer.from(body, "base64") : Buffer.from(decodeURIComponent(body));
      return store.writeMedia(token, buf, mime);
    });
    const ours = (SHARE_STORE === "blob" ? blobBase() : "/api/share/" + token + "/media/").toLowerCase(); // host names ignore case
    const foreign = allSrcs(stored).find((s) => !s.toLowerCase().startsWith(ours));
    if (foreign) throw new Error("Media must be uploaded to this app, not linked from " + foreign.slice(0, 60));
    await store.writeJSON(token + "/project.json", stored);
  } catch (e) {
    if (SHARE_STORE === "disk") await fs.rm(path.join(SHARE_DIR, token), { recursive: true, force: true });
    throw e;
  }

  const firstImage = (v: any): string | undefined => {
    if (Array.isArray(v)) return v.map(firstImage).find(Boolean);
    if (!v || typeof v !== "object") return undefined;
    if (v.kind === "image" && typeof v.src === "string") return v.src;
    return Object.values(v).map(firstImage).find(Boolean);
  };
  const pick = (k: keyof Card, fallback: string) => (typeof card[k] === "string" && COLOR.test(card[k] as string) ? (card[k] as string) : fallback);
  const share: Share = {
    token,
    kind: "live",
    title: title.slice(0, 120),
    createdAt: Date.now(),
    card: {
      bg: pick("bg", "#4a0d1c"), bg2: pick("bg2", "#22050d"), ink: pick("ink", "#fff4e6"),
      soft: pick("soft", "#e8cfc0"), accent: pick("accent", "#e9c46a"), line: pick("line", "#c9a24a"),
      date: typeof card.date === "string" ? card.date.slice(0, 60) : undefined,
      photo: firstImage(stored.data),
    },
  };
  await store.writeJSON(token + "/share.json", share);
  return share;
}

/** Path of one media file inside a disk share, or null if the name is not a plain file name. */
export function shareFile(token: string, name: string): string | null {
  if (!TOKEN.test(token) || !/^[\w.-]+$/.test(name) || name.startsWith(".") || name.endsWith(".json")) return null;
  return path.join(SHARE_DIR, token, name);
}

/**
 * "localhost" links only work on this PC. When the editor is opened on
 * localhost, also offer the machine's Wi-Fi/LAN address so a phone on the
 * same network can open the link.
 */
export function lanOrigin(origin: string): string | null {
  const u = new URL(origin);
  if (!["localhost", "127.0.0.1", "[::1]"].includes(u.hostname)) return null;
  // Skip Hyper-V / WSL / VM adapters (Windows lists them first); prefer home-router ranges.
  const ips = Object.entries(os.networkInterfaces())
    .filter(([name]) => !/vethernet|virtual|vmware|vbox|wsl|hyper-v|bluetooth|loopback/i.test(name))
    .flatMap(([, list]) => list ?? [])
    .filter((a) => a.family === "IPv4" && !a.internal && !a.address.startsWith("169.254."))
    .map((a) => a.address)
    .sort((a, b) => Number(b.startsWith("192.168.")) - Number(a.startsWith("192.168.")));
  return ips.length ? u.protocol + "//" + ips[0] + (u.port ? ":" + u.port : "") : null;
}
