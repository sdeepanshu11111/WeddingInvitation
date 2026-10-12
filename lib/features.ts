/* Build-time feature flags, set in next.config.mjs and inlined into both the
   server and the browser bundle, so the editor and the API always agree. */

/** MP4 export needs Chrome + ffmpeg on a long-running server: on locally, "coming soon" on Vercel. Force with VIDEO_EXPORT=1/0. */
export const VIDEO_EXPORT = process.env.NEXT_PUBLIC_VIDEO_EXPORT === "1";

/** Where share links keep their files: "blob" (Vercel Blob, when a store is connected: BLOB_STORE_ID or
    BLOB_READ_WRITE_TOKEN) or "disk" (./exports). */
export const SHARE_STORE: "blob" | "disk" = process.env.NEXT_PUBLIC_SHARE_STORE === "blob" ? "blob" : "disk";

/** Paid links: on when RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are set. Then free links carry a watermark and
    removing it costs LINK_PRICE_INR. Without keys there is no watermark and no paid option. */
export const PAYMENTS = process.env.NEXT_PUBLIC_PAYMENTS === "1";
export const LINK_PRICE_INR = Number(process.env.NEXT_PUBLIC_LINK_PRICE_INR) || 99;

/** Lead capture (a WhatsApp number in the Share step, payers' contacts, /admin/leads), kept in lib/server/leads.ts:
    "db" when a Postgres database is connected (Neon sets DATABASE_URL), "disk" locally, "" = off (no number asked).
    Force off with LEADS=0. */
export const LEADS: "db" | "disk" | "" = process.env.NEXT_PUBLIC_LEADS === "db" ? "db" : process.env.NEXT_PUBLIC_LEADS === "disk" ? "disk" : "";

/** Mixpanel project token, set only on the production deployment (or with MIXPANEL=1). Empty = analytics off. */
export const MIXPANEL_TOKEN = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN || "";
/** Mixpanel ingestion host for the project's data residency (MIXPANEL_API_HOST; default US). */
export const MIXPANEL_API_HOST = process.env.NEXT_PUBLIC_MIXPANEL_API_HOST || "https://api-js.mixpanel.com";

/** Meta Pixel ID for ad measurement, set only on the production deployment (or with META_PIXEL=1). Empty = off. */
export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || "";

/** Response for export endpoints while video export is switched off. */
export const exportOff = () =>
  Response.json({ error: "Video export is coming soon. Use Share to send a link for now." }, { status: 501 });
