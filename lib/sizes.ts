import type { Orientation } from "./types";

/** Design-space sizes. Kept dependency-free so server code can import it. */
export const SIZES: Record<Orientation, { W: number; H: number; label: string; hint: string }> = {
  vertical: { W: 1080, H: 1920, label: "9:16", hint: "Reels · Stories · WhatsApp Status" },
  horizontal: { W: 1920, H: 1080, label: "16:9", hint: "YouTube · TV · Email" },
};

export const FPS = 30;
