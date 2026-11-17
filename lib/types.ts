import type { CSSProperties, ReactNode } from "react";

export type Orientation = "vertical" | "horizontal";

/* ------------------------------------------------------------------ *
 * Field schema — drives the auto-generated editor form per template.
 * ------------------------------------------------------------------ */
export type Field =
  | { key: string; type: "text"; label: string; placeholder?: string; max?: number; hint?: string }
  | { key: string; type: "textarea"; label: string; placeholder?: string; max?: number; hint?: string }
  | { key: string; type: "date"; label: string; hint?: string }
  | { key: string; type: "time"; label: string; hint?: string }
  | { key: string; type: "image"; label: string; hint?: string; ratio?: string }
  | { key: string; type: "gallery"; label: string; min: number; max: number; hint?: string }
  | { key: string; type: "video"; label: string; hint?: string; maxSeconds?: number }
  | { key: string; type: "select"; label: string; options: { value: string; label: string }[]; hint?: string }
  | { key: string; type: "toggle"; label: string; hint?: string }
  | { key: string; type: "events"; label: string; max: number; presets: string[]; hint?: string };

/** One function in a multi-event invite (Haldi, Mehendi, Sangeet, Pheras, Reception ...). */
export type EventItem = { name: string; date: string; time: string; venue: string; note?: string };

export type FieldGroup = { title: string; fields: Field[] };

/* ------------------------------------------------------------------ *
 * Media assets. `src` is an object URL in the browser, a data URL when
 * serialised for the headless renderer.
 * ------------------------------------------------------------------ */
export type Asset = { src: string; name: string; kind: "image" | "video" | "audio"; duration?: number };

export type Palette = {
  id: string;
  name: string;
  ink: string;      // primary text
  soft: string;     // secondary text
  accent: string;   // metallic / highlight
  bg: string;       // base background
  bg2: string;      // gradient partner
  line: string;     // rules + ornament strokes
};

/** lang: set only for a language version (TemplateDef.lang). Then text in an Indian script gets room for its vowel
    signs and no wide letter-spacing or slant (components/blocks.tsx); the original designs are drawn exactly as before. */
export type Theme = Palette & { fontDisplay: string; fontScript: string; fontBody: string; lang?: string };

/* ------------------------------------------------------------------ *
 * Scene / timeline
 * ------------------------------------------------------------------ */
export type TransitionKind =
  | "fade" | "slide-up" | "slide-down" | "slide-left" | "slide-right"
  | "zoom-in" | "zoom-out" | "wipe-up" | "wipe-right" | "iris" | "blur" | "curtain" | "none";

export type Transition = { kind: TransitionKind; dur: number };

export type SceneCtx = {
  t: number;              // ms elapsed inside this scene
  d: number;              // scene duration in ms
  p: number;              // t / d, 0..1
  W: number;              // design-space width
  H: number;              // design-space height
  vertical: boolean;
  data: Record<string, any>;
  theme: Theme;
  deterministic: boolean; // true while rendering frames headlessly
  playing: boolean;       // editor transport state (lets <video> play natively)
};

export type Scene = {
  id: string;
  label: string;
  duration: number;
  in?: Transition;
  out?: Transition;
  render: (c: SceneCtx) => ReactNode;
};

/* ------------------------------------------------------------------ *
 * Catalogue taxonomy. A template can sit in several categories
 * (e.g. Save the Date + Wedding) and suit several communities.
 * ------------------------------------------------------------------ */
export type CategoryId =
  | "wedding" | "multi-event" | "engagement" | "haldi" | "mehendi"
  | "sangeet" | "reception" | "save-the-date";

export type CommunityId = "hindu" | "south-indian" | "muslim" | "sikh" | "christian" | "modern";

export type TemplateDef = {
  id: string;
  name: string;
  tagline: string;
  tags: string[];
  categories: CategoryId[];
  communities: CommunityId[];
  isNew?: boolean;
  /** Scene id used for the gallery poster frame (defaults to the 2nd/3rd scene). */
  poster?: string;
  /** Small inline preview swatch for the picker. `label`: a language version's word for it (its own script and font),
      drawn instead of the design's own word where the swatch has one. */
  thumb: (p: Palette, label?: { text: string; font: string }) => ReactNode;
  /** A language version (lib/variants.ts, lib/templates/languages.tsx): the design it was made from, and the BCP-47
      code of its language ("ta"). Listed only on its state's page, never among "all designs". */
  variantOf?: string;
  lang?: string;
  /** A language version's ritual, in English letters ("Gaye Holud", "Nalangu", or just "Haldi"). */
  ritual?: string;
  palettes: Palette[];
  fonts: { display: string; script: string; body: string };
  groups: FieldGroup[];
  defaults: Record<string, any>;
  /** Scenes may change with orientation, so it is a function. */
  build: (data: Record<string, any>, orientation: Orientation, theme: Theme) => Scene[];
  /** Optional full-bleed background painted under every scene. */
  backdrop?: (c: Omit<SceneCtx, "t" | "d" | "p"> & { T: number; total: number }) => ReactNode;
};

export type Project = {
  templateId: string;
  paletteId: string;
  orientation: Orientation;
  data: Record<string, any>;
  music: { src: string; name: string; volume: number; offset: number } | null;
  speed: number; // 0.75 .. 1.5 — scales every scene duration
  /** The guest page's interactive extras (app/e/[slug]/Interactive.tsx), each on unless set to false: a sealed envelope
      on the cover, a scratch-to-reveal date, and a "Send blessings" button at the end. Guest page only: never in a
      scene, so the MP4 export is unaffected. */
  guest?: GuestOptions;
  /** How guests reply (lib/rsvp.ts). Missing = a WhatsApp button to the number written on the invite, as before. */
  rsvp?: RsvpOptions;
  /** "How well do you know us?": one question the couple writes, shown as an extra scene before the closing one
      (lib/quiz.tsx). In the video the answer is revealed after a moment; on the guest page guests tap their answer. */
  quiz?: QuizOptions;
  /** Set when a link is made: fields still equal to the template's sample date / venue (lib/inviteDetails.ts, sampleKeys). */
  sample?: string[];
};

export type Style = CSSProperties;

export type GuestOptions = { envelope?: boolean; scratch?: boolean; blessings?: boolean; actions?: boolean; moment?: boolean };

/** RSVP settings, per invite (studio "RSVP" group; guest side app/e/[slug]/Rsvp.tsx). The contacts' numbers are shown
    to guests on purpose, like the number the family writes on the invite itself, so they live in the project. */
export type QuizOptions = { on?: boolean; question?: string; options?: string[]; answer?: number };

export type RsvpContact = { name: string; phone: string };
export type RsvpOptions = {
  mode?: "whatsapp" | "form" | "off"; // default "whatsapp": one tap opens WhatsApp with a ready reply
  contacts?: RsvpContact[]; // up to 2; empty = the numbers written on the invite
  by?: string; // reply-by date, YYYY-MM-DD
  askCount?: boolean; // form: how many people (default on)
  askEvents?: boolean; // form: which functions, when the invite has more than one (default on)
  askFood?: boolean; // form: Veg / Jain / Non-veg (default off)
  askNote?: boolean; // form: a short message (default on)
  call?: boolean; // a Call button next to WhatsApp (default off)
};
/** An extra is on unless the couple switched it off (older invites have no `guest` and get all of them). */
export const guestOn = (p: { guest?: GuestOptions }, k: keyof GuestOptions) => p.guest?.[k] !== false;
