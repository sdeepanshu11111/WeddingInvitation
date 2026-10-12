/* Product analytics (Mixpanel), browser only.

   Started on the public site pages (<SiteAnalytics> in the root layout, see sitePage()), by the editor and by a
   guest's invite (/e/<name>). Never by /render or /client-render, which headless Chrome screenshots during an
   export, or by /admin. The SDK (core build, no session
   replay) loads after the page, so it never slows the invite down; calls made before it arrives are
   queued in order. Off unless MIXPANEL_TOKEN is set (production deploys, see next.config.mjs).

   Nobody signs in, so everyone is an anonymous device: no identify(), and no names, emails or phone
   numbers. Guest pages also drop the URL and page title, which carry the couple's names.

   Ad measurement (Meta Pixel) rides on the same events: track() also sends the few that matter to Meta
   (see META below). The pixel runs on the site pages only (startPixel, from <MetaPixel> in the root
   layout), never on a guest's invite (/e/<name>: its URL has the names; /privacy promises this) or on
   /render and /client-render. */

import type { Mixpanel } from "mixpanel-browser";
import type { Orientation } from "./types";
import { LINK_PRICE_INR, META_PIXEL_ID, MIXPANEL_API_HOST, MIXPANEL_TOKEN, PAYMENTS } from "./features";

/** The tracking plan. Names are snake_case and fixed: never build an event or property name at runtime. */
type Events = {
  template_selected: { template_id: string; source: "sidebar" | "gallery" | "template_page" };
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

type Surface = "site" | "editor" | "guest_page";
/** Registered on every event of the page: which page it came from and, on a guest page, which invite. */
type Super = { invite_id?: string; template_id?: string; is_watermarked?: boolean };
const PAGE_KEYS = ["invite_id", "template_id", "is_watermarked"] as const;
/** Tags on the link that brought the visitor, e.g. a Meta ad's utm_source=meta&utm_campaign=... */
const UTM = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"] as const;
/** A guest page's URL and title carry the couple's names. */
const blacklist = (surface: Surface) => (surface === "guest_page" ? ["$current_url", "current_page_title", "current_url_path"] : []);

let sdk: Promise<Mixpanel | null> | null = null;

/**
 * Loads Mixpanel once and records a page view. Called again after a client-side navigation to another kind
 * of page (site → editor), it switches the super properties over to the new page.
 */
export function startAnalytics(surface: Surface, props: Super = {}) {
  if (!MIXPANEL_TOKEN) return;
  // Read now: the editor strips its query string right after this call (its effect runs first).
  const q = new URLSearchParams(location.search);
  sdk ??= import("mixpanel-browser/src/loaders/loader-module-core")
    .then((m) => {
      const mp = (m as unknown as { default: Mixpanel }).default; // its typings drop the default export
      mp.init(MIXPANEL_TOKEN, {
        api_host: MIXPANEL_API_HOST, // must match the project's data residency, or events are silently dropped
        persistence: "localStorage",
        debug: process.env.NODE_ENV !== "production",
        property_blacklist: blacklist(surface),
      });
      return mp;
    })
    .catch(() => null); // blocked or offline: the app works the same without it
  sdk.then((mp) => {
    if (!mp) return;
    mp.set_config({ property_blacklist: blacklist(surface) });
    for (const k of PAGE_KEYS) if (props[k] === undefined) mp.unregister(k);
    // An ad's tags stay on every later event (editor, payment) and visit, until a link with other tags arrives.
    if (UTM.some((k) => q.get(k))) for (const k of UTM) q.get(k) ? mp.register({ [k]: q.get(k) }) : mp.unregister(k);
    mp.register(present({ surface, ...props }));
    mp.track_pageview(); // after register, so the page view carries the super properties too
  });
}

/** The public site pages: not the editor, a guest's invite, the headless export pages or /admin. */
export const sitePage = (path: string) => !/^\/(create|e|v|render|client-render|admin)(\/|$)/.test(path);

export function track<E extends keyof Events>(event: E, ...props: {} extends Events[E] ? [Events[E]?] : [Events[E]]) {
  sdk?.then((mp) => mp?.track(event, present(props[0] ?? {})));
  const meta = (META[event] as ((p: Events[E]) => MetaEvent | null) | undefined)?.(props[0] as Events[E]);
  if (meta && pixelAllowed()) fbq()?.("track", meta[0], meta[1], meta[2] ? { eventID: meta[2] } : undefined);
}

/* ---- Meta Pixel ---- */

/** [Meta standard event, its parameters, eventID]. The eventID lets a future Conversions API (server)
    send the same event without Meta counting it twice, so it must be computable on the server too. */
type MetaEvent = [string, Record<string, unknown>, string?];
const product = (template_id: string) => ({ content_ids: [template_id], content_type: "product" });
const price = () => (PAYMENTS ? { value: LINK_PRICE_INR, currency: "INR" } : {});

/** Which tracking-plan events also go to Meta. No names or link names: only template ids and amounts. */
const META: { [E in keyof Events]?: (p: Events[E]) => MetaEvent | null } = {
  template_selected: (p) => ["ViewContent", product(p.template_id)],
  share_dialog_opened: (p) => ["AddToCart", { ...product(p.template_id), ...price() }],
  payment_started: (p) => ["InitiateCheckout", { value: p.amount_inr, currency: "INR" }],
  // One payment per invite (paid.json is write-once), so the invite id is a stable dedup key.
  payment_completed: (p) => ["Purchase", { value: p.amount_inr, currency: "INR" }, "purchase-" + p.invite_id],
  // A premium link is followed by a Purchase instead.
  invite_link_created: (p) => (p.plan === "premium" ? null : ["Lead", product(p.template_id)]),
};

type Fbq = ((...args: unknown[]) => void) & Record<string, any>;
const fbq = () => (typeof window === "undefined" ? undefined : ((window as any).fbq as Fbq | undefined));

/** Pages the pixel may see: not a guest's invite (names in the URL), not the headless export pages, not /admin. */
export const pixelAllowed = (path = typeof location === "undefined" ? "" : location.pathname) =>
  !!META_PIXEL_ID && !/^\/(e|v|render|client-render|admin)(\/|$)/.test(path);

/** Loads Meta's fbevents.js once (their base code, unminified) and sends a PageView. Call on every route change. */
export function pixelPageView() {
  if (!pixelAllowed()) return;
  const w = window as any;
  if (!w.fbq) {
    const n: Fbq = (w.fbq = function () {
      // eslint-disable-next-line prefer-rest-params
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    } as Fbq);
    w._fbq ??= n;
    n.push = n;
    n.loaded = true;
    n.version = "2.0";
    n.queue = [];
    // Our own PageView per route instead of Meta's history listener, which would also fire on /e/ pages.
    n.disablePushState = true;
    const s = document.createElement("script");
    s.async = true;
    s.src = "https://connect.facebook.net/en_US/fbevents.js";
    document.head.appendChild(s);
    // No automatic events: they read button text and page content, which in the editor is the couple's names.
    n("set", "autoConfig", false, META_PIXEL_ID);
    n("init", META_PIXEL_ID);
  }
  w.fbq("track", "PageView");
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
