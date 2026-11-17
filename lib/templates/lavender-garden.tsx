import React from "react";
import type { Scene, TemplateDef, Theme } from "../types";
import { E, clamp, drawPath, fade, mix, rise, tw } from "../anim";
import { Layer, Petals, Photo, Typewriter } from "@/components/primitives";
import { DateBlock, Headline, Kicker, VenueBlock } from "@/components/blocks";

/* Lavender Garden (2026-11-17): a modern pastel invitation. Flowering vines climb the sides of the frame, a short love
   note types itself out, the couple's photo sits in an oval, and the date blooms in. Any community; a save-the-date or
   a light wedding invitation. Pure function of t. */

/** A vine that climbs from the bottom edge, with leaves and small flowers opening along it. */
function Vine({ t, h, theme, start = 0, flip = false, seed = 1 }: { t: number; h: number; theme: Theme; start?: number; flip?: boolean; seed?: number }) {
  const w = 220;
  const sway = Math.sin(t / 1400 + seed) * 6;
  const path = "M110 " + h + " C40 " + h * 0.8 + " 180 " + h * 0.62 + " 100 " + h * 0.45 + " C30 " + h * 0.3 + " 170 " + h * 0.16 + " 120 0";
  const buds = 9;
  return (
    <svg width={w} height={h} viewBox={"0 0 " + w + " " + h} style={{ overflow: "visible", transform: (flip ? "scaleX(-1) " : "") + "rotate(" + sway.toFixed(2) + "deg)", transformOrigin: "50% 100%" }}>
      <path d={path} fill="none" stroke={theme.line} strokeWidth={4} strokeLinecap="round" style={drawPath(t, h * 1.6, { start, dur: 2200 })} />
      {Array.from({ length: buds }).map((_, i) => {
        const f = (i + 1) / (buds + 1);
        const y = h * (1 - f);
        const x = 110 + Math.sin(f * Math.PI * 3.2 + seed) * 55;
        const p = clamp(tw(t, start + 300 + f * 1800, 700, E.outBack));
        const flower = i % 2 === 0;
        return (
          <g key={i} transform={"translate(" + x.toFixed(1) + " " + y.toFixed(1) + ") scale(" + p.toFixed(3) + ")"}>
            {flower ? (
              <>
                {Array.from({ length: 5 }).map((__, k) => (
                  <ellipse key={k} rx={9} ry={15} cy={-14} transform={"rotate(" + k * 72 + ")"} fill={k % 2 ? theme.accent : theme.soft} opacity={0.9} />
                ))}
                <circle r={6} fill={theme.bg} />
              </>
            ) : (
              <path d={"M0 0 C" + (i % 4 === 1 ? 26 : -26) + " -8 " + (i % 4 === 1 ? 30 : -30) + " -26 0 -30 C-6 -18 -4 -8 0 0 Z"} fill={theme.line} opacity={0.75} />
            )}
          </g>
        );
      })}
    </svg>
  );
}

export const lavenderGarden: TemplateDef = {
  id: "lavender-garden",
  name: "Lavender Garden",
  tagline: "Modern pastel: flowering vines climb the frame, a love note types itself, your photo in an oval",
  tags: ["Modern", "Pastel", "Floral"],
  categories: ["save-the-date", "wedding", "engagement"],
  communities: ["modern"],
  isNew: true,
  poster: "names",
  fonts: { display: "var(--f-playfair)", script: "var(--f-vibes)", body: "var(--f-cormorant)" },
  palettes: [
    { id: "lavender", name: "Lavender", ink: "#3A2E52", soft: "#7C66B0", accent: "#CF7FAB", bg: "#F6F1FC", bg2: "#E6DDF6", line: "#7E9C77" },
    { id: "peach", name: "Peach Blossom", ink: "#5A3328", soft: "#B9694B", accent: "#E0954A", bg: "#FFF5EF", bg2: "#FBE3D6", line: "#8BA47E" },
    { id: "mint", name: "Mint & Rose", ink: "#2C4A40", soft: "#B85A6E", accent: "#D97C92", bg: "#F1FAF6", bg2: "#DDF1E8", line: "#6E9F86" },
    { id: "dusk", name: "Lilac Dusk", ink: "#F4EEFF", soft: "#C7B4F0", accent: "#F2A9C9", bg: "#3B2F5C", bg2: "#211A38", line: "#9DC3A2" },
  ],
  thumb: (p) => (
    <div style={{ width: "100%", height: "100%", background: "linear-gradient(160deg," + p.bg + "," + p.bg2 + ")", display: "grid", placeItems: "center" }}>
      <svg width="40" height="40" viewBox="-20 -20 40 40">
        {Array.from({ length: 5 }).map((_, k) => (
          <ellipse key={k} rx={5} ry={9} cy={-8} transform={"rotate(" + k * 72 + ")"} fill={k % 2 ? p.accent : p.soft} />
        ))}
        <circle r={3.5} fill={p.line} />
      </svg>
    </div>
  ),
  groups: [
    {
      title: "Titles",
      fields: [
        { key: "kicker", type: "text", label: "Opening line", placeholder: "Save the date", max: 30 },
        { key: "note", type: "textarea", label: "Your note", placeholder: "Two families, one story, and a day we want to share with you.", max: 140 },
      ],
    },
    {
      title: "The couple",
      fields: [
        { key: "nameA", type: "text", label: "First name", placeholder: "Zara", max: 20 },
        { key: "nameB", type: "text", label: "Second name", placeholder: "Kabir", max: 20 },
        { key: "photo", type: "image", label: "Photo", ratio: "3 / 4" },
      ],
    },
    {
      title: "When & where",
      fields: [
        { key: "weddingDate", type: "date", label: "Date" },
        { key: "weddingTime", type: "time", label: "Time" },
        { key: "venueName", type: "text", label: "Venue", placeholder: "The Garden Courtyard", max: 40 },
        { key: "venueCity", type: "text", label: "City", placeholder: "Goa", max: 30 },
      ],
    },
    {
      title: "Sign-off",
      fields: [
        { key: "closingLine", type: "text", label: "Closing line", placeholder: "Formal invitation to follow", max: 40 },
        { key: "rsvp", type: "text", label: "RSVP", placeholder: "RSVP · name · mobile number", max: 60, hint: "A mobile number here becomes an \"RSVP on WhatsApp\" button for guests." },
      ],
    },
  ],
  defaults: {
    kicker: "Save the date",
    note: "Two families, one story, and a day we want to share with you.",
    nameA: "Zara",
    nameB: "Kabir",
    photo: null,
    weddingDate: "2027-03-06",
    weddingTime: "17:00",
    venueName: "The Garden Courtyard",
    venueCity: "Goa",
    closingLine: "Formal invitation to follow",
    rsvp: "", // no sample number: a mobile here becomes a live "RSVP on WhatsApp" button for guests
  },

  backdrop: ({ T, theme, W, H, vertical }) => (
    <>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(170deg," + theme.bg + " 0%," + theme.bg2 + " 100%)" }} />
      <Petals t={T} color={theme.accent} W={W} H={H} count={vertical ? 14 : 18} seed={33} />
      <div style={{ position: "absolute", left: vertical ? -40 : 30, bottom: 0 }}>
        <Vine t={T} h={vertical ? 1500 : 1000} theme={theme} start={100} seed={1} />
      </div>
      <div style={{ position: "absolute", right: vertical ? -40 : 30, bottom: 0 }}>
        <Vine t={T} h={vertical ? 1300 : 900} theme={theme} start={400} flip seed={2} />
      </div>
    </>
  ),

  build: (data, orientation, theme) => {
    const v = orientation === "vertical";
    const S = function <T>(a: T, b: T): T {
      return v ? a : b;
    };
    const scenes: Scene[] = [
      {
        id: "names",
        label: "The couple",
        duration: 5800,
        in: { kind: "fade", dur: 800 },
        out: { kind: "blur", dur: 800 },
        render: ({ t }) => (
          <Layer>
            <div style={{ textAlign: "center" }}>
              <Kicker t={t} theme={theme} v={v} start={500} size={36}>
                {data.kicker}
              </Kicker>
              <Headline t={t} theme={theme} v={v} start={900} size={S(200, 190)} font={theme.fontScript} color={theme.ink} lineHeight={1.25}>
                {data.nameA}
              </Headline>
              <div style={{ fontFamily: theme.fontDisplay, color: theme.soft, fontSize: S(70, 70), fontStyle: "italic", ...fade(t, { start: 1500, dur: 800 }) }}>and</div>
              <Headline t={t} theme={theme} v={v} start={1800} size={S(200, 190)} font={theme.fontScript} color={theme.ink} lineHeight={1.25}>
                {data.nameB}
              </Headline>
            </div>
          </Layer>
        ),
      },
      {
        id: "note",
        label: "Note",
        duration: 6400,
        in: { kind: "fade", dur: 700 },
        out: { kind: "fade", dur: 700 },
        render: ({ t }) => (
          <Layer>
            <div style={{ maxWidth: S(820, 1200), padding: S("60px 56px", "50px 80px"), borderRadius: 30, background: theme.bg + "CC", border: "2px solid " + theme.soft + "55", boxShadow: "0 30px 70px -40px rgba(0,0,0,0.35)", textAlign: "center", ...rise(t, { start: 100, dur: 900, dist: 24 }) }}>
              <Typewriter text={data.note} t={t} start={700} cps={26} theme={theme} style={{ fontFamily: theme.fontBody, fontStyle: "italic", color: theme.ink, fontSize: S(64, 62), lineHeight: 1.45 }} />
            </div>
          </Layer>
        ),
      },
      {
        id: "photo",
        label: "Photo",
        duration: 5000,
        in: { kind: "zoom-out", dur: 900 },
        out: { kind: "fade", dur: 800 },
        render: ({ t, d }) => {
          const w = S(640, 560);
          const h = S(840, 740);
          const p = tw(t, 0, 1200, E.outExpo);
          return (
            <Layer>
              <div style={{ width: w, height: h, borderRadius: "50%", padding: 12, background: "conic-gradient(from 120deg," + theme.soft + "," + theme.accent + "," + theme.line + "," + theme.soft + ")", transform: "scale(" + mix(p, 0.9, 1).toFixed(4) + ")", opacity: clamp(p * 1.4) }}>
                <Photo src={data.photo?.src} t={t} d={d} theme={theme} style={{ width: "100%", height: "100%", borderRadius: "50%" }} />
              </div>
            </Layer>
          );
        },
      },
      {
        id: "date",
        label: "Date & venue",
        duration: 6200,
        in: { kind: "slide-up", dur: 850 },
        out: { kind: "fade", dur: 800 },
        render: ({ t }) => (
          <Layer style={{ flexDirection: v ? "column" : "row", gap: S(70, 150) }}>
            <DateBlock t={t} theme={theme} v={v} start={300} date={data.weddingDate} time={data.weddingTime} divider={false} />
            <VenueBlock t={t} theme={theme} v={v} start={1300} label="Where" name={data.venueName} address={data.venueCity} nameSize={S(78, 80)} maxWidth={S(860, 760)} />
          </Layer>
        ),
      },
      {
        id: "close",
        label: "Closing",
        duration: 5000,
        in: { kind: "iris", dur: 1000 },
        render: ({ t }) => (
          <Layer>
            <div style={{ textAlign: "center", maxWidth: S(900, 1400) }}>
              <Headline t={t} theme={theme} v={v} start={300} size={S(150, 150)} font={theme.fontScript} color={theme.ink} lineHeight={1.3}>
                {data.nameA} &amp; {data.nameB}
              </Headline>
              <div style={{ fontFamily: theme.fontDisplay, color: theme.line, fontSize: S(48, 50), fontStyle: "italic", marginTop: S(18, 12), ...rise(t, { start: 1200, dur: 900, dist: 16 }) }}>{data.closingLine}</div>
              {data.rsvp ? (
                <div style={{ fontFamily: theme.fontBody, color: theme.ink, opacity: 0.8, fontSize: S(40, 38), marginTop: S(26, 18), ...fade(t, { start: 1900, dur: 900 }) }}>{data.rsvp}</div>
              ) : null}
            </div>
          </Layer>
        ),
      },
    ];
    return scenes;
  },
};
