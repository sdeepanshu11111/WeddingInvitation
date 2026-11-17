/* What it costs to remove the watermark from an invite, per design (rupees, one time). 0 = a free design: its links
   never carry a watermark and there is nothing to pay. Prices live here, in one dependency-free file, so the server
   (orders, the invite page) can read them without loading the templates. A design that is not listed costs
   LINK_PRICE_INR. Keep every paid price between PRICE_FLOOR and PRICE_CEILING (owner's range, 2026-11-14; the floor
   went from ₹30 to ₹29 on 2026-11-16 for the ₹29 function designs, and to ₹9 on 2026-11-17 when the three free
   designs became ₹9: owner's call, "for the free template do the 9rs").

   Changing a price never touches links that are already paid: a payment records how many rupees it covers
   (lib/server/share.ts, Paid.covers), and a link is clear of the watermark while that covers its design's price.
   Someone who paid for a cheaper design and then moves the same link to a dearer one pays only the difference. */

import { LINK_PRICE_INR, PAYMENTS } from "./features";
import { baseOf } from "./variants";

export const PRICE_FLOOR = 9;
export const PRICE_CEILING = 600;

const PRICES: Record<string, number> = {
  // ₹9: the entry designs (free until 2026-11-17; links made before then stay free, see FREE_UNTIL). Their
  // language versions cost the same (an engagement in Tamil is ₹9 too).
  "blush-botanical": 9,
  "aurora-modern": 9,
  "sagai-rings": 9,
  // Single functions: ₹29 (owner, 2026-11-16; ₹49 before), the "from ₹29" entry price. Weddings stay ₹99 and up.
  "haldi-marigold": 29,
  "mehendi-paisley": 29,
  "polaroid-memories": 29,
  "sangeet-night": 99,
  "reception-gala": 99,
  // Weddings.
  "royal-mandala": 99,
  "south-kalyanam": 99,
  "tamil-thirumanam": 99,
  "telugu-pelli": 99,
  "kerala-vivaham": 99,
  "kannada-maduve": 99,
  "hindi-shubh-vivah": 99,
  "punjabi-viah": 99,
  "nikah-mubarak": 149,
  "anand-karaj": 149,
  "holy-matrimony": 149,
  "shubh-mangal": 149,
  "shubho-bibaho": 149,
  // The most in one invite: every function on its own scene, or the couple's own video.
  "shaadi-utsav": 299,
  "cinematic-reel": 399,
};

/** Rupees to remove the watermark from a link made with this design; 0 when the design is free or payments are off.
    A language version (haldi-marigold-tamil) costs what its design costs. */
export function priceOf(templateId: string): number {
  if (!PAYMENTS) return 0;
  const p = PRICES[templateId] ?? PRICES[baseOf(templateId)] ?? LINK_PRICE_INR;
  return p <= 0 ? 0 : Math.min(PRICE_CEILING, Math.max(PRICE_FLOOR, Math.round(p)));
}

export const isFree = (templateId: string) => priceOf(templateId) === 0;

/* Links made while a design was free stay free: its couple sent it out without a watermark, and it must not grow one.
   The cut-off is the release that made them ₹9 (deploy on or before this moment; a link made on the old free code
   AFTER it would gain a watermark). Keyed by design; language versions follow their design. */
const FREE_UNTIL: Record<string, number> = {
  "blush-botanical": Date.parse("2026-11-18T00:00:00+05:30"),
  "aurora-modern": Date.parse("2026-11-18T00:00:00+05:30"),
  "sagai-rings": Date.parse("2026-11-18T00:00:00+05:30"),
};

/** What THIS link costs: the design's price, or 0 for a link made while its design was free (FREE_UNTIL). Use this,
    not priceOf, wherever a real link is priced: its invite page and its order. */
export function priceForLink(templateId: string, createdAt: number): number {
  const until = FREE_UNTIL[templateId] ?? FREE_UNTIL[baseOf(templateId)];
  return until && createdAt < until ? 0 : priceOf(templateId);
}

const paid = Object.keys(PRICES).map(priceOf).filter((p) => p > 0);
/** The cheapest and dearest paid design, for "from ₹X" on the site and the policy pages. */
export const PRICE_MIN = paid.length ? Math.min(...paid) : LINK_PRICE_INR;
export const PRICE_MAX = paid.length ? Math.max(...paid) : LINK_PRICE_INR;
export const FREE_COUNT = Object.keys(PRICES).filter((id) => priceOf(id) === 0).length;
/** "₹29" or "₹29 to ₹399": the paid range in words, for copy and the policy pages. */
export const PRICE_RANGE = PRICE_MIN === PRICE_MAX ? "₹" + PRICE_MIN : "₹" + PRICE_MIN + " to ₹" + PRICE_MAX;

/* ---- Wedding pack (owner, 2026-11-17): one payment for every invite of one couple's wedding. ----
   Bought on any of their invites (app/api/pay/order with pack: true); it then clears every invite this same phone
   makes for the same couple's names (app/api/pay/pack, both links' owner keys required). Each invite in the pack is
   covered up to PACK_COVERS: every design but Shaadi Utsav and Cinematic Reel, which then need only the difference. */
export const PACK_PRICE_INR = 199;
export const PACK_COVERS = 149;
/** True when the pack can be offered on an invite of this price: payments on, and a design the pack covers in full. */
export const packCovers = (price: number) => PAYMENTS && price > 0 && price <= PACK_COVERS;
