import type { Orientation, Project, Scene, TemplateDef, Theme } from "./types";
import { getTemplate } from "./templates";
import { layout } from "./anim";

export { SIZES, FPS } from "./sizes";

export function makeTheme(t: TemplateDef, paletteId: string): Theme {
  const p = t.palettes.find((x) => x.id === paletteId) ?? t.palettes[0];
  return { ...p, fontDisplay: t.fonts.display, fontScript: t.fonts.script, fontBody: t.fonts.body };
}

export function defaultProject(templateId: string, prev?: Project): Project {
  const t = getTemplate(templateId);
  // Carry over facts (names, date, venue, uploaded media) — not template-specific copy,
  // since e.g. "kicker" means a different line in each template.
  const carried: Record<string, any> = {};
  if (prev) {
    const fields = t.groups.flatMap((g) => g.fields);
    const keys = new Set(fields.map((f) => f.key));
    const FACTS = new Set(["brideName", "groomName", "nameA", "nameB", "groomParents", "brideParents", "weddingDate", "weddingTime", "venueName", "venueAddress", "venueCity", "rsvpLine", "hashtag", "events", "hosts"]);
    const media = new Set(fields.filter((f) => f.type === "image" || f.type === "gallery" || f.type === "video").map((f) => f.key));
    for (const [k, v] of Object.entries(prev.data)) {
      if (keys.has(k) && (FACTS.has(k) || media.has(k)) && v != null && v !== "") carried[k] = v;
    }
    // Common aliases between templates
    const alias: Record<string, string[]> = {
      nameA: ["brideName", "groomName"], nameB: ["groomName", "brideName"],
      brideName: ["nameA"], groomName: ["nameB"],
    };
    for (const [k, from] of Object.entries(alias)) {
      if (!keys.has(k) || carried[k]) continue;
      const src = from.find((f) => prev.data[f]);
      if (src) carried[k] = prev.data[src];
    }
    // Uploaded photos follow the couple: fill empty image slots in order, galleries get them all.
    const photos: any[] = Object.values(prev.data)
      .flatMap((v) => (Array.isArray(v) ? v : [v]))
      .filter((v) => v && typeof v === "object" && v.kind === "image");
    let next = 0;
    for (const f of fields) {
      if (carried[f.key]) continue;
      if (f.type === "image" && photos.length) carried[f.key] = photos[next++ % photos.length];
      if (f.type === "gallery" && photos.length) carried[f.key] = photos.slice(0, f.max);
    }
  }
  return {
    templateId: t.id,
    paletteId: t.palettes[0].id,
    orientation: prev?.orientation ?? "vertical",
    data: { ...t.defaults, ...carried },
    music: prev?.music ?? null,
    speed: prev?.speed ?? 1,
  };
}

export function buildTimeline(project: Project) {
  const template = getTemplate(project.templateId);
  const theme = makeTheme(template, project.paletteId);
  const scenes: Scene[] = template.build(project.data, project.orientation, theme);
  const { slots, total } = layout(scenes.map((s) => s.duration), scenes.map((s) => s.out));
  return { template, theme, scenes, slots, total, realTotal: total / project.speed };
}

/* ---------------- media helpers (browser only) ---------------- */

export function readAsDataURL(file: Blob): Promise<string> {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(String(r.result));
    r.onerror = () => rej(r.error);
    r.readAsDataURL(file);
  });
}

/** Downscale photos on upload: keeps projects small and renders fast. */
export async function compressImage(file: File, maxEdge = 2000, quality = 0.9): Promise<string> {
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    const k = Math.min(1, maxEdge / Math.max(img.naturalWidth, img.naturalHeight));
    const c = document.createElement("canvas");
    c.width = Math.round(img.naturalWidth * k);
    c.height = Math.round(img.naturalHeight * k);
    c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
    return c.toDataURL("image/jpeg", quality);
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function mediaDuration(src: string, kind: "video" | "audio"): Promise<number> {
  return new Promise((res) => {
    const el = document.createElement(kind);
    el.preload = "metadata";
    el.onloadedmetadata = () => res(el.duration || 0);
    el.onerror = () => res(0);
    el.src = src;
  });
}

/* ---------------- tiny IndexedDB store (projects can hold MBs of media) ---------------- */

const DB = "invite-studio";
const STORE = "kv";

function db(): Promise<IDBDatabase> {
  return new Promise((res, rej) => {
    const r = indexedDB.open(DB, 1);
    r.onupgradeneeded = () => r.result.createObjectStore(STORE);
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });
}

export async function idbSet(key: string, val: unknown) {
  const d = await db();
  return new Promise<void>((res, rej) => {
    const tx = d.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(val, key);
    tx.oncomplete = () => res();
    tx.onerror = () => rej(tx.error);
  });
}

export async function idbGet<T>(key: string): Promise<T | undefined> {
  const d = await db();
  return new Promise((res, rej) => {
    const tx = d.transaction(STORE, "readonly");
    const r = tx.objectStore(STORE).get(key);
    r.onsuccess = () => res(r.result as T);
    r.onerror = () => rej(r.error);
  });
}
