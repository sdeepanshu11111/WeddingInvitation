// MP4 export needs Chrome + ffmpeg on a long-running server, so it is off on Vercel ("coming soon").
const videoExport = (process.env.VIDEO_EXPORT ?? (process.env.VERCEL ? "0" : "1")) === "1";
// Mixpanel analytics: on for the production deployment only, so local dev and preview deploys keep test
// clicks out of the real numbers. Force with MIXPANEL=1/0; MIXPANEL_TOKEN points it at another project.
const mixpanel = (process.env.MIXPANEL ?? (process.env.VERCEL_ENV === "production" ? "1" : "0")) === "1";

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
    // A Mixpanel project token is public by design (every visitor's browser sends it). Empty = analytics off.
    NEXT_PUBLIC_MIXPANEL_TOKEN: mixpanel ? process.env.MIXPANEL_TOKEN || "13677b55358039a8d5f3140dd6ae82c6" : "",
  },
  // Share links moved from /v/<token> to /e/<name>; links already sent keep working.
  async redirects() {
    return [{ source: "/v/:token", destination: "/e/:token", permanent: true }];
  },
  // Font file names are content-addressed (scripts/fetch-fonts.mjs), so they can be cached forever.
  async headers() {
    return [{ source: "/fonts/:file*", headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }] }];
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
