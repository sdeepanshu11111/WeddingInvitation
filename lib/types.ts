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

export type Theme = Palette & { fontDisplay: string; fontScript: string; fontBody: string };

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
  /** Small inline preview swatch for the picker. */
  thumb: (p: Palette) => ReactNode;
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
};

export type Style = CSSProperties;
