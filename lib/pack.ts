/* Wedding pack, browser side (lib/pricing.ts): which of this device's links holds a paid pack, per couple, and asking
   the server to clear the couple's other links from it (app/api/pay/pack). The server checks everything again:
   both owner keys and the couple's names. Browser only; without storage the pack still clears the invites that
   exist when it is bought, the others can be cleared from the phone that has their keys. */

import { ownedNames, ownerKeyFor } from "./owner";
import { coupleBase } from "./slug";

const KEY = "fp.packs"; // couple base → the link the pack was bought on

function read(): Record<string, string> {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || "{}");
    return v && typeof v === "object" ? v : {};
  } catch {
    return {};
  }
}

/** The pack was bought on this link: every invite for the same couple made on this device is covered. */
export function rememberPack(link: string) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ ...read(), [coupleBase(link)]: link }));
  } catch {}
}

/** The link holding this couple's pack on this device, or null. */
export const packFor = (link: string): string | null => read()[coupleBase(link)] ?? null;

/**
 * Clears links from the couple's pack. `targets`: the links to clear (default: every other link this device made for
 * the same couple). Resolves to the links that are clear now; never throws (the invite page tries again next visit).
 */
export async function claimPack(link: string, targets?: string[]): Promise<string[]> {
  const from = packFor(link);
  const fromKey = from ? ownerKeyFor(from) : null;
  if (!from || !fromKey) return [];
  const couple = coupleBase(from);
  const names = (targets ?? ownedNames()).filter((n) => n !== from && coupleBase(n) === couple);
  const to = names.map((name) => ({ name, key: ownerKeyFor(name) })).filter((x) => x.key);
  if (!to.length) return [];
  try {
    const res = await fetch("/api/pay/pack", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ from, fromKey, to }) });
    const r = await res.json().catch(() => ({}));
    return res.ok && Array.isArray(r.covered) ? r.covered : [];
  } catch {
    return [];
  }
}
