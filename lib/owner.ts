/* Invites made on this device. There are no accounts: when the studio creates a link, the server hands back an owner
   key (see "Owner key" in lib/server/share.ts) and we keep it here, per link name. The invite page then shows the
   couple their owner tools (remove the watermark, share, leave a number) instead of the guest bar. Browser only.
   Losing it (cleared storage, another browser) only means they see their invite as a guest does. */

const KEY = "fp.owned";
const JUST = "fp.just-created";

/** fn: which function the link is for ("" = the wedding, "haldi", "reception"...; see GetLink). Links made before
    2026-11-17 have none. */
type Owned = Record<string, { key: string; at: number; fn?: string }>;

function read(): Owned {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || "{}");
    return v && typeof v === "object" ? v : {};
  } catch {
    return {}; // private mode or blocked storage
  }
}

/** Remember a link this device just made (or updated), and mark it for the one-time welcome on its page. */
export function rememberOwned(name: string, key: string, fn: string) {
  try {
    const all = read();
    all[name] = { key, at: Date.now(), fn };
    localStorage.setItem(KEY, JSON.stringify(all));
    sessionStorage.setItem(JUST, name);
  } catch {}
}

/** Note which function a link this device already owns is for (an update of a link made before functions were kept). */
export function noteFunction(name: string, fn: string) {
  try {
    const all = read();
    if (!all[name]) return;
    all[name] = { ...all[name], fn };
    localStorage.setItem(KEY, JSON.stringify(all));
  } catch {}
}

/** Every link this device made (for the wedding pack: its other invites for the same couple, lib/pack.ts). */
export const ownedNames = () => Object.keys(read());

/** The owner key for this link, if it was made on this device. */
export const ownerKeyFor = (name?: string) => (name ? read()[name]?.key ?? null : null);

/**
 * The link this device made for this couple AND this function, newest first: the one "Get link" republishes to when
 * they edit that invite again (components/editor/ShareDialog.tsx). Any other function gets a link of its own, so a
 * couple's Haldi never replaces their wedding invite (it used to: the match was on the names alone, 2026-11-17).
 * `base`: the link name without its number ("aarav-ananya-haldi"); `fn`: "" for the wedding.
 * A link from before function names (no `fn` kept) still matches its plain names, but only for the wedding, which is
 * what nearly all of them are; for any other function the safe outcome is a new link, never an overwrite.
 */
export function ownedFor(base: string, fn: string): { name: string; key: string } | null {
  const hit = Object.entries(read())
    .filter(([name, v]) => v && typeof v.key === "string" && name.replace(/^\d+-/, "") === base && (v.fn === fn || (v.fn === undefined && fn === "")))
    .sort((a, b) => (b[1].at || 0) - (a[1].at || 0))[0];
  return hit ? { name: hit[0], key: hit[1].key } : null;
}

/** True once, on the first visit right after the studio made this link (the welcome on the cover). */
export function takeJustCreated(name?: string): boolean {
  try {
    if (!name || sessionStorage.getItem(JUST) !== name) return false;
    sessionStorage.removeItem(JUST);
    return true;
  } catch {
    return false;
  }
}
