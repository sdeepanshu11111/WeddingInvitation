/* Share-link names, e.g. /e/aarav-ananya. Shared by the editor and the server. */

/** 3–50 chars of a-z, 0-9 and single hyphens, not starting or ending with a hyphen. */
export const SLUG_RE = /^[a-z0-9](?:[a-z0-9]|-(?=[a-z0-9])){2,49}$/;

/** "Aarav & Ananya" → "aarav-ananya". Accents are dropped; other scripts give "" (the user then types one). */
export function slugify(s: string): string {
  return s
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50)
    .replace(/-+$/, "");
}
