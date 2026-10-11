/* Build-time feature flags, set in next.config.mjs and inlined into both the
   server and the browser bundle, so the editor and the API always agree. */

/** MP4 export needs Chrome + ffmpeg on a long-running server: on locally, "coming soon" on Vercel. Force with VIDEO_EXPORT=1/0. */
export const VIDEO_EXPORT = process.env.NEXT_PUBLIC_VIDEO_EXPORT === "1";

/** Where share links keep their files: "blob" (Vercel Blob, when a store is connected: BLOB_STORE_ID or
    BLOB_READ_WRITE_TOKEN) or "disk" (./exports). */
export const SHARE_STORE: "blob" | "disk" = process.env.NEXT_PUBLIC_SHARE_STORE === "blob" ? "blob" : "disk";

/** Response for export endpoints while video export is switched off. */
export const exportOff = () =>
  Response.json({ error: "Video export is coming soon. Use Share to send a link for now." }, { status: 501 });
