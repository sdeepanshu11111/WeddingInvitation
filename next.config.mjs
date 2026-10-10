/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  // Lets a production build run alongside `npm run dev` (NEXT_DIST_DIR=.next-build).
  distDir: process.env.NEXT_DIST_DIR || ".next",
  experimental: {
    serverComponentsExternalPackages: ["puppeteer", "ffmpeg-static"],
  },
};
export default nextConfig;
