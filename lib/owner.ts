/* Invites made on this device. There are no accounts: when the studio creates a link, the server hands back an owner
   key (see "Owner key" in lib/server/share.ts) and we keep it here, per link name. The invite page then shows the
   couple their owner tools (remove the watermark, share, leave a number) instead of the guest bar. Browser only.
   Losing it (cleared storage, another browser) only means they see their invite as a guest does. */

const KEY = "fp.owned";
const JUST = "fp.just-created";

type Owned = Record<string, { key: string; at: number }>;

function read(): Owned {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || "{}");
    return v && typeof v === "object" ? v : {};
  } catch {
    return {}; // private mode or blocked storage
  }
}

/** Remember a link this device just made, and mark it for the one-time welcome on its page. */
export function rememberOwned(name: string, key: string) {
  try {
    const all = read();
    all[name] = { key, at: Date.now() };
    localStorage.setItem(KEY, JSON.stringify(all));
    sessionStorage.setItem(JUST, name);
  } catch {}
}

/** The owner key for this link, if it was made on this device. */
export const ownerKeyFor = (name?: string) => (name ? read()[name]?.key ?? null : null);

/** The link this device made most recently, with its owner key: the one "Get link" updates when the couple edits
    their invite again (components/editor/ShareDialog.tsx). */
export function lastOwned(): { name: string; key: string } | null {
  const all = Object.entries(read()).filter(([, v]) => v && typeof v.key === "string");
  if (!all.length) return null;
  const [name, v] = all.sort((a, b) => (b[1].at || 0) - (a[1].at || 0))[0];
  return { name, key: v.key };
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
