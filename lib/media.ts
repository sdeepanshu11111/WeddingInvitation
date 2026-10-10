/* Helpers for the media inside a project (photos, video clips, music).
   No Node or browser APIs here: used by the editor and by server code. */

/** Media types a share may hold, with their file extension. Anything else is refused:
    SVG or HTML served from our origin could run script. */
export const MEDIA_TYPES: Record<string, string> = {
  "image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp", "image/gif": ".gif",
  "video/mp4": ".mp4", "video/webm": ".webm", "video/quicktime": ".mov",
  "audio/mpeg": ".mp3", "audio/mp3": ".mp3", "audio/mp4": ".m4a", "audio/x-m4a": ".m4a", "audio/aac": ".aac",
  "audio/wav": ".wav", "audio/x-wav": ".wav", "audio/ogg": ".ogg",
};

/** Upper bound for one uploaded file (the editor already suggests keeping videos under ~80 MB). */
export const MAX_MEDIA_BYTES = 100 * 1024 * 1024;

export const mimeOfDataUrl = (src: string) => /^data:([^;,]+)/.exec(src)?.[1]?.toLowerCase() ?? "";

/**
 * Deep-copies `value`, replacing every `src: "data:..."` string with `await fn(src)`.
 * `fn` runs once per distinct data URL, so a photo used in two fields is stored once.
 */
export async function mapDataUrls<T>(value: T, fn: (dataUrl: string) => Promise<string>): Promise<T> {
  const done = new Map<string, Promise<string>>();
  const walk = async (v: any): Promise<any> => {
    if (Array.isArray(v)) return Promise.all(v.map(walk));
    if (!v || typeof v !== "object") return v;
    const out: Record<string, any> = {};
    for (const [k, x] of Object.entries<any>(v)) {
      if (k === "src" && typeof x === "string" && x.startsWith("data:")) {
        if (!done.has(x)) done.set(x, fn(x));
        out[k] = await done.get(x)!;
      } else out[k] = await walk(x);
    }
    return out;
  };
  return walk(value);
}

/** Every `src` string in a project, for validating where media points. */
export function allSrcs(value: unknown): string[] {
  const out: string[] = [];
  const walk = (v: any) => {
    if (Array.isArray(v)) v.forEach(walk);
    else if (v && typeof v === "object")
      for (const [k, x] of Object.entries<any>(v)) {
        if (k === "src" && typeof x === "string") out.push(x);
        else walk(x);
      }
  };
  walk(value);
  return out;
}
