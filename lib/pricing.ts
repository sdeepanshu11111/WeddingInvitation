/* What it costs to remove the watermark from an invite, per design (rupees, one time). 0 = a free design: its links
   never carry a watermark and there is nothing to pay. Prices live here, in one dependency-free file, so the server
   (orders, the invite page) can read them without loading the templates. A design that is not listed costs
   LINK_PRICE_INR. Keep every paid price between PRICE_FLOOR and PRICE_CEILING (owner's range, 2026-11-14).

   Changing a price never touches links that are already paid: a payment records how many rupees it covers
   (lib/server/share.ts, Paid.covers), and a link is clear of the watermark while that covers its design's price.
   Someone who paid for a cheaper design and then moves the same link to a dearer one pays only the difference. */

import { LINK_PRICE_INR, PAYMENTS } from "./features";

export const PRICE_FLOOR = 30;
export const PRICE_CEILING = 600;

const PRICES: Record<string, number> = {
  // Free: simple, modern designs that bring people in (their guests see "Make your own invitation").
  "blush-botanical": 0,
  "aurora-modern": 0,
  "sagai-rings": 0,
  // Single functions.
  "haldi-marigold": 49,
  "mehendi-paisley": 49,
  "polaroid-memories": 49,
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

/** Rupees to remove the watermark from a link made with this design; 0 when the design is free or payments are off. */
export function priceOf(templateId: string): number {
  if (!PAYMENTS) return 0;
  const p = PRICES[templateId] ?? LINK_PRICE_INR;
  return p <= 0 ? 0 : Math.min(PRICE_CEILING, Math.max(PRICE_FLOOR, Math.round(p)));
}

export const isFree = (templateId: string) => priceOf(templateId) === 0;

const paid = Object.keys(PRICES).map(priceOf).filter((p) => p > 0);
/** The cheapest and dearest paid design, for "from ₹X" on the site and the policy pages. */
export const PRICE_MIN = paid.length ? Math.min(...paid) : LINK_PRICE_INR;
export const PRICE_MAX = paid.length ? Math.max(...paid) : LINK_PRICE_INR;
export const FREE_COUNT = Object.keys(PRICES).filter((id) => priceOf(id) === 0).length;
/** "₹49" or "₹49 to ₹399": the paid range in words, for copy and the policy pages. */
export const PRICE_RANGE = PRICE_MIN === PRICE_MAX ? "₹" + PRICE_MIN : "₹" + PRICE_MIN + " to ₹" + PRICE_MAX;
