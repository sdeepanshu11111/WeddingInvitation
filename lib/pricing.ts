/* What it costs to remove the watermark from an invite (rupees, one time).

   Since 2026-11-23 (owner: "ask him to pay 99rs for each template", no price shown anywhere before the couple has
   made their link) every NEW link costs FLAT_PRICE_INR, whatever the design: priceOf() answers that. A link knows it is
   new by `flat: true` in its share.json, written by the server code of that release (lib/server/share.ts), so no clock
   decides it. Older links keep the price their design had when they were made (the old per-design table, LEGACY,
   below), because the studio showed the couple that price. Always price a real link with priceForLink(templateId, share).

   Prices live here, in one dependency-free file, so the server (orders, the invite page) can read them without loading
   the templates. Changing a price never touches links that are already paid: a payment records how many rupees it
   covers (lib/server/share.ts, Paid.covers), and a link is clear of the watermark while that covers its price. */

import { LINK_PRICE_INR, PAYMENTS } from "./features";
import { baseOf } from "./variants";

/** Every link made by the flat-price release or later (`flat` in its share.json) costs this, whatever the design (owner, 2026-11-23). */
export const FLAT_PRICE_INR = 99;

/** What a link made today costs to clear of the watermark: FLAT_PRICE_INR, or 0 when payments are off. */
export function priceOf(_templateId?: string): number {
  return PAYMENTS ? FLAT_PRICE_INR : 0;
}

const PRICE_FLOOR = 9;
const PRICE_CEILING = 600;

/** The per-design prices before the flat price (₹9 to ₹399; unlisted = LINK_PRICE_INR). Only links without `flat` use it. */
const LEGACY: Record<string, number> = {
  "blush-botanical": 9,
  "aurora-modern": 9,
  "sagai-rings": 9,
  "haldi-marigold": 29,
  "mehendi-paisley": 29,
  "polaroid-memories": 29,
  "sangeet-night": 99,
  "reception-gala": 99,
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
  "rajwada-palace": 149,
  "floral-rangoli": 49,
  "lavender-garden": 29,
  "shaadi-utsav": 299,
  "cinematic-reel": 399,
};

/** The old per-design price (a language version costs what its design costs), for links without `flat`. */
function legacyPriceOf(templateId: string): number {
  if (!PAYMENTS) return 0;
  const p = LEGACY[templateId] ?? LEGACY[baseOf(templateId)] ?? LINK_PRICE_INR;
  return p <= 0 ? 0 : Math.min(PRICE_CEILING, Math.max(PRICE_FLOOR, Math.round(p)));
}

/* Links made while a design was free stay free: its couple sent it out without a watermark, and it must not grow one.
   The cut-off is the release that made them ₹9: commit 4b6dfa0 at 16:24 IST on 17 Nov, live a few minutes later
   (16:35 leaves room for the deploy). Keyed by design; versions follow it. */
const RELEASED_9 = Date.parse("2026-11-17T16:35:00+05:30");
const FREE_UNTIL: Record<string, number> = {
  "blush-botanical": RELEASED_9,
  "aurora-modern": RELEASED_9,
  "sagai-rings": RELEASED_9,
};

/** What THIS link costs: FLAT_PRICE_INR for a link made by the flat-price release (`flat` in its share.json); an older
    one costs its design's price then, or 0 when it was made while its design was free (FREE_UNTIL). Use this, not
    priceOf, wherever a real link is priced: its invite page, its order and its payment. */
export function priceForLink(templateId: string, link: { createdAt: number; flat?: boolean }): number {
  if (link.flat) return priceOf(templateId);
  const until = FREE_UNTIL[templateId] ?? FREE_UNTIL[baseOf(templateId)];
  return until && link.createdAt < until ? 0 : legacyPriceOf(templateId);
}

/** What a link costs now, for the policy pages ("₹99"). */
export const PRICE_MIN = PAYMENTS ? FLAT_PRICE_INR : LINK_PRICE_INR;
export const PRICE_RANGE = "₹" + PRICE_MIN;

/* ---- Wedding pack (owner, 2026-11-17): one payment for every invite of one couple's wedding. ----
   No longer offered (2026-11-23: one flat price per invite, nothing else on the pay sheet). The server side stays so
   packs already bought keep clearing that couple's links (app/api/pay/pack). */
export const PACK_PRICE_INR = 199;
export const PACK_COVERS = 149;
/** True when the pack could cover an invite of this price. */
export const packCovers = (price: number) => PAYMENTS && price > 0 && price <= PACK_COVERS;
