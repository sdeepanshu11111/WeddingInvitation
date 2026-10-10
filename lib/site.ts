/**
 * Public base URL of the app, for absolute links such as link-preview images.
 * Set SITE_URL in production (e.g. https://invitestudio.in). On Vercel it
 * falls back to the project's production domain, which Vercel sets itself.
 */
export const SITE_URL = (
  process.env.SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? "https://" + process.env.VERCEL_PROJECT_PRODUCTION_URL : "http://localhost:4321")
).replace(/\/$/, "");
