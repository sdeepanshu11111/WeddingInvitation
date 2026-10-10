import path from "node:path";

/** Finished MP4s, saved projects and (without Vercel Blob) share links. Kept apart from render.ts so
    share code does not pull Chrome and ffmpeg into its serverless bundle. */
export const EXPORT_DIR = path.join(process.cwd(), "exports");
