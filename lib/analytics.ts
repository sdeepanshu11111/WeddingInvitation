/* Product analytics (Mixpanel), browser only.

   Started on the public site pages (<SiteAnalytics> in the root layout, see sitePage()), by the editor and by a
   guest's invite (/e/<name>). Never by /render or /client-render, which headless Chrome screenshots during an
   export, or by /admin. The SDK (core build, no session
   replay) loads after the page, so it never slows the invite down; calls made before it arrives are
   queued in order. Off unless MIXPANEL_TOKEN is set (production deploys, see next.config.mjs).

   Nobody signs in, so everyone is an anonymous device: no identify(), and no names, emails or phone
   numbers. Guest pages also drop the URL and page title, which carry the couple's names. A link is known here
   only by its invite_id (a hash, lib/inviteId.ts); the address itself is in the private link record
   (lib/server/links.ts, /admin/links), which stores the same invite_id so the two can be matched.

   Every event carries `source` (where this visit came from: google, chatgpt, whatsapp, invite, direct...) and
   `first_source` (where the device first came from), see trafficSource(). Devices that have opened /admin carry
   is_internal: true, and automated browsers send nothing.

   Ad measurement (Meta Pixel) rides on the same events: track() also sends the few that matter to Meta
   (see META below). The pixel runs on the site pages only (startPixel, from <MetaPixel> in the root
   layout), never on a guest's invite (/e/<name>: its URL has the names; /privacy promises this) or on
   /render and /client-render. */

import type { Mixpanel } from "mixpanel-browser";
import type { Orientation } from "./types";
import { GA_ID, META_PIXEL_ID, MIXPANEL_API_HOST, MIXPANEL_TOKEN } from "./features";
import { priceOf } from "./pricing";

/** The tracking plan. Names are snake_case and fixed: never build an event or property name at runtime. */
export type Events = {
  /** A visitor tapped a state on /templates ("Wedding in which state?"): a region id from lib/regions.ts, or "all". */
  state_selected: { state: string };
  /** The couple rated their invite in the owner sheet (app/api/review). The stars only: never the words or names. */
  review_submitted: { rating: number; has_text: boolean; is_public: boolean };
  /** Get link found the date / venue still the design's example (components/editor/SampleCheck): what the couple chose. */
  sample_warning: { template_id: string; field_count: number; choice: "fix" | "anyway" };
  /** The couple tapped one of their other functions in the owner sheet (lib/nextInvites.ts): a second purchase starting. */
  next_invite_clicked: { template_id: string; from_template_id: string };
  /** The studio (/create) finished loading a project. has_design_param: arrived with a chosen design
      (?template=); has_draft: this browser had a saved invite; has_names: names typed on the site came along. */
  studio_opened: { template_id: string; has_design_param: boolean; has_draft: boolean; has_names: boolean };
  /** The first field the couple changed in this studio visit (the field's key, never its content). */
  invite_edit_started: { template_id: string; field: string };
  /** language: the studio's Language row switched the design to another language version (lib/variants.ts). */
  template_selected: { template_id: string; source: "sidebar" | "gallery" | "template_page" | "language" };
  share_dialog_opened: { template_id: string };
  /** Get link did not produce a link: media upload or link creation failed (stage). */
  invite_link_failed: { template_id: string; stage: "upload" | "create" };
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
    price_inr: number; // what removing the watermark costs for this design (0 = free design)
    is_free: boolean;
    sample_field_count: number; // date / venue fields still holding the template's sample
  };
  /** The couple changed their invite and published it again to the link they already had (no new link). */
  invite_link_updated: { invite_id: string; template_id: string };
  /** "Export MP4" (only where export is on: the hosted site hides it and doesn't mention video). */
  video_export_clicked: { is_available: boolean };
  payment_started: { invite_id: string; amount_inr: number };
  /** Razorpay Checkout is on screen (the order exists). Started without opened = the order or Checkout failed. */
  checkout_opened: { invite_id: string; amount_inr: number };
  payment_completed: { invite_id: string; amount_inr: number };
  payment_cancelled: { invite_id: string };
  payment_failed: { invite_id: string };
  /** A guest tapped "Open invitation" on the cover. */
  invite_opened: { orientation: Orientation };
  /** A guest watched to the end (once per visit). */
  invite_watched: {};
  invite_shared: { channel: "whatsapp" | "native_share" | "copy"; invite_id?: string };
  /** A guest used the card at the end of an invite (app/e/[slug]/GuestDetails.tsx), or "Make your own invitation". */
  guest_action_clicked: { action: "calendar" | "directions" | "rsvp" | "call" | "make_own" | "blessing"; where?: "scene" };
  /** A guest sent an RSVP from the form (lib/rsvp.ts). people: 0 unless attending. No name, no answers beyond these. */
  rsvp_sent: { response: "yes" | "maybe" | "no"; people: number; changed: boolean };
  /** The tap moment on the names scene ended: how many times the guest tapped (0 = it went on by itself). */
  tap_moment: { kind: string; taps: number };
  /** A guest answered the couple's quiz. */
  quiz_answered: { correct: boolean };
  /** Home page: a call to action was tapped; `section` says which part of the page it was in. */
  home_cta_clicked: { section: "hero" | "designs" | "guest_demo" | "link" | "how" | "pricing" | "pricing_pack" | "final" };
  /** Home hero: the visitor started typing their names (once per page view; the names are never sent). */
  hero_names_typed: {};
  /** Home hero: a design card was picked, or a function chip ("What are you inviting for?"). */
  hero_design_picked: { template_id: string; function: string };
  hero_function_picked: { function: string };
  /** Home hero: the playing invite was tapped (flowers shower over it), once per page view. */
  hero_phone_tapped: { template_id: string };
  /** Home page: the visitor tried a step of the "What your guests will do" demo (components/site/GuestDemo.tsx). */
  home_demo_step: { step: "open" | "scratch" | "shower" | "quiz" | "rsvp" };
  /** The scratch-to-reveal date card on a guest's invite was cleared by the guest (completed) or dissolved by itself. */
  date_scratched: { completed: boolean };
  /** The couple made a personal link for one guest (?to=<name>). The name is never sent. */
  invite_personalised: { invite_id: string; channel: "whatsapp" | "copy" };
  /** The couple's sheet (remove watermark, share) came up: by itself on the cover or at the end, or from their bar. */
  owner_sheet_opened: { trigger: "cover" | "end" | "bar" };
};
/* `payment_confirmed` is NOT here: the server sends it, once per payment (lib/server/mixpanel.ts). */

type Surface = "site" | "editor" | "guest_page";
/** Registered on every event of the page: which page it came from and, on a guest page, which invite and whether
    the viewer is the couple who made it (is_owner: the link was created in this browser, lib/owner.ts). */
type Super = { invite_id?: string; template_id?: string; is_watermarked?: boolean; is_owner?: boolean };
const PAGE_KEYS = ["invite_id", "template_id", "is_watermarked", "is_owner"] as const;
/** Tags on the link that brought the visitor, e.g. a Meta ad's utm_source=meta&utm_campaign=... */
const UTM = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"] as const;
/** A guest page's URL and title carry the couple's names. */
const blacklist = (surface: Surface) => (surface === "guest_page" ? ["$current_url", "current_page_title", "current_url_path"] : []);

let sdk: Promise<Mixpanel | null> | null = null;

/* ---- where the visitor came from ---- */

const SRC_VISIT = "fp.src"; // sessionStorage: this visit
const SRC_FIRST = "fp.src1"; // localStorage: the first visit ever on this device
const INTERNAL = "fp.internal"; // localStorage: this device has opened /admin
const store = (kind: "local" | "session") => {
  try {
    return kind === "local" ? localStorage : sessionStorage;
  } catch {
    return null; // private mode or blocked storage
  }
};

/**
 * One readable word for where a visit came from: the link's utm_source if it has one (ChatGPT adds
 * utm_source=chatgpt.com to the links it gives; our guest pages add utm_source=invite), else the site that linked
 * here. Known names are folded together (google.co.in and google.com are "google"); anything else is the tag or the
 * domain itself; no tag and no other site = "direct" (typed, a bookmark, or an app that hides where it came from,
 * as WhatsApp does).
 */
export function trafficSource(search: string, referrer: string, host: string): string {
  const utm = (new URLSearchParams(search).get("utm_source") || "").trim().toLowerCase();
  let ref = "";
  try {
    ref = referrer ? new URL(referrer).hostname.toLowerCase() : "";
  } catch {}
  const s = utm || (ref && ref !== host.toLowerCase() ? ref : "");
  if (!s) return "direct";
  const known: [RegExp, string][] = [
    [/chatgpt|openai/, "chatgpt"],
    [/perplexity/, "perplexity"],
    [/gemini|bard\./, "gemini"],
    [/copilot/, "copilot"],
    [/claude\.ai|anthropic/, "claude"],
    [/(^|\.)google\.|^google$/, "google"],
    [/(^|\.)bing\.|^bing$/, "bing"],
    [/duckduckgo/, "duckduckgo"],
    [/yahoo/, "yahoo"],
    [/whatsapp|^wa\.me$/, "whatsapp"],
    [/instagram/, "instagram"],
    [/facebook|^fb\.|(^|\.)fb\.com$|^meta$/, "facebook"],
    [/youtube|youtu\.be/, "youtube"],
    [/^t\.co$|twitter|(^|\.)x\.com$/, "x"],
    [/linkedin|lnkd\.in/, "linkedin"],
    [/telegram|^t\.me$/, "telegram"],
  ];
  return (known.find(([re]) => re.test(s))?.[1] ?? s.replace(/[^\w.:-]/g, "").slice(0, 40)) || "other";
}

/** This visit's source and the device's first one, remembered so later pages of the visit (and the link record
    made at the end of it) keep them. A page that arrives with its own utm_source starts a new visit source. */
function sources(): { visit: string; first: string } {
  if (typeof window === "undefined") return { visit: "direct", first: "direct" };
  const session = store("session");
  const local = store("local");
  const tagged = new URLSearchParams(location.search).has("utm_source");
  let visit = tagged ? null : session?.getItem(SRC_VISIT) ?? null;
  if (!visit) {
    visit = trafficSource(location.search, document.referrer, location.hostname);
    try {
      session?.setItem(SRC_VISIT, visit);
    } catch {}
  }
  let first = local?.getItem(SRC_FIRST) ?? null;
  if (!first) {
    first = visit;
    try {
      local?.setItem(SRC_FIRST, first);
    } catch {}
  }
  return { visit, first };
}

/** True on a device that has opened /admin (components/MarkInternal.tsx): the owner's own testing. */
export const isInternal = () => store("local")?.getItem(INTERNAL) === "1";
export function markInternal() {
  try {
    store("local")?.setItem(INTERNAL, "1");
  } catch {}
}

/** What POST /api/share stores with a new link's record: where its maker came from, and whether it is a test. */
export const visitorOrigin = () => {
  const { visit, first } = sources();
  return { source: first, visit_source: visit, internal: isInternal() };
};

/** An automated browser (crawlers that run scripts, screenshot and monitoring services): not a visitor. */
const automated = () => typeof navigator !== "undefined" && navigator.webdriver === true;

/**
 * Loads Mixpanel once and records a page view. Called again after a client-side navigation to another kind
 * of page (site → editor), it switches the super properties over to the new page.
 */
export function startAnalytics(surface: Surface, props: Super = {}) {
  // Before anything else: the editor strips its query string right after this call, and the link record wants the
  // source even where Mixpanel is off.
  const src = sources();
  if (!MIXPANEL_TOKEN || automated()) return;
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
    mp.register(present({ surface, source: src.visit, is_internal: isInternal() || undefined, ...props }));
    mp.register_once({ first_source: src.first });
    mp.track_pageview(); // after register, so the page view carries the super properties too
  });
}

/** More about the page for every later event, once it is known (the editor learns its design after loading). */
export function setPageProps(props: Super) {
  sdk?.then((mp) => mp?.register(present(props)));
}

/** This browser's anonymous Mixpanel id, for the server's `payment_confirmed` (lib/server/mixpanel.ts). Null when
    Mixpanel is off, blocked or still loading after a moment: Checkout must never wait on analytics. */
export function deviceId(): Promise<string | null> {
  if (!sdk) return Promise.resolve(null);
  const id = sdk.then((mp) => (mp?.get_distinct_id?.() as string | undefined) ?? null).catch(() => null);
  return Promise.race([id, new Promise<null>((r) => setTimeout(() => r(null), 700))]);
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
const price = (template_id: string) => (priceOf(template_id) ? { value: priceOf(template_id), currency: "INR" } : {});

/** Which tracking-plan events also go to Meta. No names or link names: only template ids and amounts. */
const META: { [E in keyof Events]?: (p: Events[E]) => MetaEvent | null } = {
  template_selected: (p) => ["ViewContent", product(p.template_id)],
  share_dialog_opened: (p) => ["AddToCart", { ...product(p.template_id), ...price(p.template_id) }],
  payment_started: (p) => ["InitiateCheckout", { value: p.amount_inr, currency: "INR" }],
  // One payment per invite (paid.json is write-once), so the invite id is a stable dedup key.
  payment_completed: (p) => ["Purchase", { value: p.amount_inr, currency: "INR" }, "purchase-" + p.invite_id],
  // A premium link is followed by a Purchase instead.
  invite_link_created: (p) => (p.plan === "premium" ? null : ["Lead", product(p.template_id)]),
};

type Fbq = ((...args: unknown[]) => void) & Record<string, any>;
const fbq = () => (typeof window === "undefined" ? undefined : ((window as any).fbq as Fbq | undefined));

/** Pages no ad or Google tool may see: a guest's invite (names in the URL), the headless export pages, /admin. */
const PRIVATE_PATH = /^\/(e|v|render|client-render|admin)(\/|$)/;
/** True for a guest's invite, the export pages and /admin: no ad, Google or Vercel tool may report these. */
export const privatePath = (path: string) => PRIVATE_PATH.test(path);
const herePath = () => (typeof location === "undefined" ? "" : location.pathname);

/** Pages the pixel may see: not a guest's invite (names in the URL), not the headless export pages, not /admin. */
export const pixelAllowed = (path = herePath()) => !!META_PIXEL_ID && !PRIVATE_PATH.test(path);

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

/* ---- Google Analytics (GA4) ---- */

/** Pages Google Analytics may see: the same ones as the pixel (site pages and the editor). */
export const gaAllowed = (path = herePath()) => !!GA_ID && !PRIVATE_PATH.test(path);

/** Loads Google's gtag.js once (their snippet, as given by the GA admin). Call on every route change.
    Page views are gtag's own: one when it loads, then one per history change (GA's "enhanced measurement",
    on by default in the property), so nothing is sent by hand here and nothing is counted twice.
    No events from track(): GA gets page views only. */
export function gaPageView() {
  if (!GA_ID) return;
  const w = window as any;
  const ok = gaAllowed();
  // Google's documented switch: while it is true, gtag sends nothing for this property. It covers the case
  // where gtag is already loaded and the router moves to a private page (today every way into /e/ is a full
  // page load, where gtag is never loaded at all).
  w["ga-disable-" + GA_ID] = !ok;
  if (!ok || w.gtag) return;
  w.dataLayer = w.dataLayer || [];
  w.gtag = function () {
    // gtag reads the arguments object itself; an array is ignored.
    // eslint-disable-next-line prefer-rest-params
    w.dataLayer.push(arguments);
  };
  w.gtag("js", new Date());
  w.gtag("config", GA_ID);
  const s = document.createElement("script");
  s.async = true;
  s.src = "https://www.googletagmanager.com/gtag/js?id=" + GA_ID;
  document.head.appendChild(s);
}

/** Mixpanel wants a missing property left out, not sent as null or "". */
const present = (o: Record<string, unknown>) => Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined && v !== null && v !== ""));

/** The invite's id in Mixpanel (a hash of its link name): lib/inviteId.ts. */
export { inviteId } from "./inviteId";
