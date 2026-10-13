import type { StartNames } from "./project";

/* Names typed on the home page or a template page, handed to the studio through sessionStorage, never the URL:
   /create's address reaches Mixpanel and the Meta Pixel, and names must not (AGENTS.md). Browser only. */

const KEY = "start-names";
/** The longest name every template takes (the shortest `max` of a name field). */
export const NAME_MAX = 20;

export function saveStart(n: StartNames) {
  try {
    if (n.bride.trim() || n.groom.trim()) sessionStorage.setItem(KEY, JSON.stringify(n));
    else sessionStorage.removeItem(KEY);
  } catch {}
}

/** Read without using up: the home hero and template pages fill their name boxes with what was typed before. */
export function peekStart(): StartNames | null {
  try {
    const n = JSON.parse(sessionStorage.getItem(KEY) || "null");
    return n && typeof n.bride === "string" && typeof n.groom === "string" ? n : null;
  } catch {
    return null;
  }
}

/** Read once: the studio applies them on arrival, and a later reload keeps the couple's own edits. */
export function takeStart(): StartNames | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    sessionStorage.removeItem(KEY);
    const n = raw ? JSON.parse(raw) : null;
    return n && typeof n.bride === "string" && typeof n.groom === "string" ? n : null;
  } catch {
    return null;
  }
}
