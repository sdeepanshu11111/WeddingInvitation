// MP4 export needs Chrome + ffmpeg on a long-running server, so it is off on Vercel ("coming soon").
const videoExport = (process.env.VIDEO_EXPORT ?? (process.env.VERCEL ? "0" : "1")) === "1";
// Mixpanel analytics: on for the production deployment only, so local dev and preview deploys keep test
// clicks out of the real numbers. Force with MIXPANEL=1/0; MIXPANEL_TOKEN points it at another project.
const mixpanel = (process.env.MIXPANEL ?? (process.env.VERCEL_ENV === "production" ? "1" : "0")) === "1";
// Meta Pixel (ad measurement): same rule. Force with META_PIXEL=1/0; META_PIXEL_ID points it at another pixel.
const metaPixel = (process.env.META_PIXEL ?? (process.env.VERCEL_ENV === "production" ? "1" : "0")) === "1";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  // Lets a production build run alongside `npm run dev` (NEXT_DIST_DIR=.next-build).
  distDir: process.env.NEXT_DIST_DIR || ".next",
  // Feature flags for lib/features.ts, inlined into server and browser code alike.
  env: {
    NEXT_PUBLIC_VIDEO_EXPORT: videoExport ? "1" : "0",
    // Connecting a Blob store sets BLOB_STORE_ID (new stores, OIDC auth) or BLOB_READ_WRITE_TOKEN (older ones).
    NEXT_PUBLIC_SHARE_STORE: process.env.BLOB_STORE_ID || process.env.BLOB_READ_WRITE_TOKEN ? "blob" : "disk",
    // Paid links (Razorpay). Only the on/off flag and the price reach the browser, never the keys.
    NEXT_PUBLIC_PAYMENTS: process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET ? "1" : "0",
    NEXT_PUBLIC_LINK_PRICE_INR: process.env.LINK_PRICE_INR || "99",
    // Lead capture needs a private place for phone numbers and emails: MongoDB (MONGODB_URI), exports/leads.json locally.
    // On Vercel without MONGODB_URI it stays off, so the Get-link step asks for nothing.
    NEXT_PUBLIC_LEADS: process.env.LEADS === "0" ? "" : process.env.MONGODB_URI ? "mongo" : process.env.VERCEL ? "" : "disk",
    // A Mixpanel project token is public by design (every visitor's browser sends it). Empty = analytics off.
    NEXT_PUBLIC_MIXPANEL_TOKEN: mixpanel ? process.env.MIXPANEL_TOKEN || "13677b55358039a8d5f3140dd6ae82c6" : "",
    // Must match the project's data residency: US https://api-js.mixpanel.com, India https://api-in.mixpanel.com,
    // EU https://api-eu.mixpanel.com. The wrong one answers status 1 and silently drops every event.
    NEXT_PUBLIC_MIXPANEL_API_HOST: process.env.MIXPANEL_API_HOST || "https://api-js.mixpanel.com",
    // Pixel "FutureProof Wedding Web" (Futureproof 2 portfolio). Public by design, like the Mixpanel token. Empty = off.
    NEXT_PUBLIC_META_PIXEL_ID: metaPixel ? process.env.META_PIXEL_ID || "1116330824214375" : "",
  },
  // Share links moved from /v/<token> to /e/<name>; links already sent keep working.
  async redirects() {
    return [{ source: "/v/:token", destination: "/e/:token", permanent: true }];
  },
  // Font file names are content-addressed (scripts/fetch-fonts.mjs), so they can be cached forever.
  async headers() {
    return [
      { source: "/fonts/:file*", headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }] },
      // A guest page's URL carries the couple's names: never pass it on as a referrer (e.g. to the Meta Pixel
      // on a site page a guest clicks through to).
      { source: "/e/:path*", headers: [{ key: "Referrer-Policy", value: "origin" }] },
    ];
  },
  experimental: {
    serverComponentsExternalPackages: ["puppeteer", "ffmpeg-static"],
    // Without export, keep Chrome and the ffmpeg binary out of the serverless functions.
    ...(videoExport
      ? {}
      : {
          outputFileTracingExcludes: {
            "*": ["node_modules/puppeteer/**", "node_modules/puppeteer-core/**", "node_modules/@puppeteer/**", "node_modules/ffmpeg-static/**"],
          },
        }),
  },
};
export default nextConfig;
