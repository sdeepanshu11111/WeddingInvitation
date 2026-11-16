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

/** The function part of a link name (components/editor/ShareDialog.tsx, functionOf): 1-aarav-ananya-haldi. */
const FUNCTION_SUFFIX = /-(haldi|mehendi|sangeet|reception|engagement|save-the-date)$/;

/** The couple a link is for, from its name: "3-aarav-ananya-haldi" → "aarav-ananya". The wedding pack covers every
    link with the same couple (lib/pricing.ts); links made before function names (2026-11-17) have none to strip. */
export const coupleBase = (name: string) => name.replace(/^\d+-/, "").replace(FUNCTION_SUFFIX, "");
