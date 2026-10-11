/* Product analytics (Mixpanel), browser only.

   Started by the two pages people use: the editor and a guest's invite (/e/<name>). Never by /render or
   /client-render, which headless Chrome screenshots during an export. The SDK (core build, no session
   replay) loads after the page, so it never slows the invite down; calls made before it arrives are
   queued in order. Off unless MIXPANEL_TOKEN is set (production deploys, see next.config.mjs).

   Nobody signs in, so everyone is an anonymous device: no identify(), and no names, emails or phone
   numbers. Guest pages also drop the URL and page title, which carry the couple's names. */

import type { Mixpanel } from "mixpanel-browser";
import type { Orientation } from "./types";
import { MIXPANEL_API_HOST, MIXPANEL_TOKEN } from "./features";

/** The tracking plan. Names are snake_case and fixed: never build an event or property name at runtime. */
type Events = {
  template_selected: { template_id: string; source: "sidebar" | "gallery" };
  share_dialog_opened: { template_id: string };
  /** The value moment: the couple has a link guests can open. */
  invite_link_created: {
    invite_id: string;
    template_id: string;
    palette_id: string;
    orientation: Orientation;
    plan?: "free" | "premium"; // only while paid links are on
    is_custom_name: boolean;
    has_music: boolean;
    photo_count: number;
    has_video: boolean;
    duration_seconds: number;
  };
  /** "Export MP4", while it is still "Soon" on the hosted site: how many people want video. */
  video_export_clicked: { is_available: boolean };
  payment_started: { invite_id: string; amount_inr: number };
  payment_completed: { invite_id: string; amount_inr: number };
  payment_cancelled: { invite_id: string };
  payment_failed: { invite_id: string };
  /** A guest tapped "Open invitation" on the cover. */
  invite_opened: { orientation: Orientation };
  /** A guest watched to the end (once per visit). */
  invite_watched: {};
  invite_shared: { channel: "whatsapp" | "native_share" | "copy"; invite_id?: string };
};

/** Registered on every event of the page: which page it came from and, on a guest page, which invite. */
type Super = { invite_id?: string; template_id?: string; is_watermarked?: boolean };

let sdk: Promise<Mixpanel | null> | null = null;

export function startAnalytics(surface: "editor" | "guest_page", props: Super = {}) {
  if (!MIXPANEL_TOKEN || sdk) return;
  sdk = import("mixpanel-browser/src/loaders/loader-module-core")
    .then((m) => {
      const mp = (m as unknown as { default: Mixpanel }).default; // its typings drop the default export
      mp.init(MIXPANEL_TOKEN, {
        api_host: MIXPANEL_API_HOST, // must match the project's data residency, or events are silently dropped
        persistence: "localStorage",
        debug: process.env.NODE_ENV !== "production",
        property_blacklist: surface === "guest_page" ? ["$current_url", "current_page_title", "current_url_path"] : [],
      });
      mp.register(present({ surface, ...props }));
      mp.track_pageview(); // after register, so the page view carries the super properties too
      return mp;
    })
    .catch(() => null); // blocked or offline: the app works the same without it
}

export function track<E extends keyof Events>(event: E, ...props: {} extends Events[E] ? [Events[E]?] : [Events[E]]) {
  sdk?.then((mp) => mp?.track(event, present(props[0] ?? {})));
}

/** Mixpanel wants a missing property left out, not sent as null or "". */
const present = (o: Record<string, unknown>) => Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined && v !== null && v !== ""));

/**
 * A stable id for an invite that does not show the couple's names (its link name does), so reports can
 * join a link's creation, its guests' views and its payment. cyrb53, base 36.
 */
export function inviteId(name: string) {
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;
  for (let i = 0; i < name.length; i++) {
    const c = name.charCodeAt(i);
    h1 = Math.imul(h1 ^ c, 2654435761);
    h2 = Math.imul(h2 ^ c, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(36);
}
