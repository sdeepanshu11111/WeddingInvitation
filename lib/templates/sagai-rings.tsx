import React from "react";
import type { Scene, TemplateDef } from "../types";
import { fade, rise } from "../anim";
import { DiamondRule, Layer, Particles } from "@/components/primitives";
import { DateBlock, Headline, Kicker, Names, PhotoCircle, VenueBlock } from "@/components/blocks";
import { Rings, Sparkles } from "@/components/indian";

/* Sagai / Engagement / Roka — rose gold, rings that lock together, champagne bubbles. */

export const sagaiRings: TemplateDef = {
  id: "sagai-rings",
  name: "Sagai Rings",
  tagline: "Engagement, Roka or Sagai: two rings spin in and lock together, rose-gold sparkle",
  tags: ["Engagement", "Roka", "Rose gold"],
  categories: ["engagement"],
  communities: ["hindu", "sikh", "christian", "modern"],
  isNew: true,
  poster: "rings",
  fonts: { display: "var(--f-playfair)", script: "var(--f-vibes)", body: "var(--f-cormorant)" },
  palettes: [
    { id: "rose", name: "Rose Gold", ink: "#5A2E2E", soft: "#8E5E59", accent: "#B86B5C", bg: "#FBEDEA", bg2: "#F3D5CF", line: "#D4A194" },
    { id: "champagne", name: "Champagne", ink: "#3B2F22", soft: "#6E5C46", accent: "#A07D45", bg: "#FAF4EA", bg2: "#EEDFC6", line: "#C9A978" },
    { id: "ruby", name: "Ruby Night", ink: "#FFEFF2", soft: "#E8B3BF", accent: "#F3C38A", bg: "#5A0E24", bg2: "#2A0510", line: "#E7A9A0" },
    { id: "lavender", name: "Lavender", ink: "#3A2B4D", soft: "#6E5C85", accent: "#8A5DB3", bg: "#F3EEFA", bg2: "#E2D7F2", line: "#B79AD6" },
  ],
  thumb: (p) => (
    <div style={{ width: "100%", height: "100%", background: "linear-gradient(160deg," + p.bg + "," + p.bg2 + ")", display: "grid", placeItems: "center" }}>
      <svg width="46" height="30" viewBox="-40 -22 80 44">
        <circle cx={-10} r={15} fill="none" stroke={p.accent} strokeWidth="4" />
        <circle cx={10} r={15} fill="none" stroke={p.line} strokeWidth="4" />
      </svg>
    </div>
  ),
  groups: [
    {
      title: "Titles",
      fields: [
        { key: "kicker", type: "text", label: "Opening line", placeholder: "Two hearts, one promise", max: 34 },
        { key: "title", type: "text", label: "Ceremony", placeholder: "Engagement", max: 20, hint: "Sagai, Roka, Ring Ceremony, Mangni, Nischayathartham..." },
        { key: "localTitle", type: "text", label: "Local title", placeholder: "सगाई समारोह", max: 24 },
      ],
    },
    {
      title: "The couple",
      fields: [
        { key: "nameA", type: "text", label: "First name", placeholder: "Riya", max: 20 },
        { key: "nameB", type: "text", label: "Second name", placeholder: "Kabir", max: 20 },
        { key: "photo", type: "image", label: "Photo", ratio: "1 / 1" },
      ],
    },
    {
      title: "When & where",
      fields: [
        { key: "weddingDate", type: "date", label: "Date" },
        { key: "weddingTime", type: "time", label: "Time" },
        { key: "venueName", type: "text", label: "Venue", placeholder: "The Leela Ambience", max: 36 },
        { key: "venueAddress", type: "textarea", label: "Address", placeholder: "Gurugram", max: 100 },
      ],
    },
    {
      title: "Sign-off",
      fields: [
        { key: "closingLine", type: "text", label: "Closing line", placeholder: "Join us as we exchange rings & promises", max: 46 },
        { key: "rsvp", type: "text", label: "RSVP", placeholder: "RSVP · Mehta family · +91 98110 22334", max: 50 },
      ],
    },
  ],
  defaults: {
    kicker: "Two hearts, one promise",
    title: "Engagement",
    localTitle: "सगाई समारोह",
    nameA: "Riya",
    nameB: "Kabir",
    photo: null,
    weddingDate: "2026-10-25",
    weddingTime: "18:00",
    venueName: "The Leela Ambience",
    venueAddress: "Gurugram",
    closingLine: "Join us as we exchange rings & promises",
    rsvp: "RSVP · Mehta family · +91 98110 22334",
  },

  backdrop: ({ T, theme, W, H }) => (
    <>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(165deg," + theme.bg + " 0%," + theme.bg2 + " 100%)" }} />
      <Particles t={T} color={theme.line} W={W} H={H} count={30} size={9} opacity={0.35} seed={61} />
      <Sparkles t={T} W={W} H={H} color={theme.accent} count={16} size={14} seed={62} />
    </>
  ),

  build: (data, orientation, theme) => {
    const v = orientation === "vertical";
    const S = function <T>(a: T, b: T): T {
      return v ? a : b;
    };
    const scenes: Scene[] = [
      {
        id: "rings",
        label: "Rings",
        duration: 5200,
        in: { kind: "fade", dur: 600 },
        out: { kind: "blur", dur: 850 },
        render: ({ t }) => (
          <Layer style={{ flexDirection: v ? "column" : "row", gap: S(0, 40) }}>
            <Rings t={t} size={S(1000, 760)} metal={theme.line} metal2={theme.accent} start={200} />
            <div style={{ textAlign: "center", marginTop: S(30, 0) }}>
              <Kicker t={t} theme={theme} v={v} start={1800} size={32}>
                {data.kicker}
              </Kicker>
              <Headline t={t} theme={theme} v={v} start={2100} size={S(170, 160)} font={theme.fontScript} color={theme.accent} lineHeight={1.3}>
                {data.title}
              </Headline>
              {data.localTitle ? (
                <Headline t={t} theme={theme} v={v} start={2600} size={60} font="var(--f-devanagari)" color={theme.ink}>
                  {data.localTitle}
                </Headline>
              ) : null}
            </div>
          </Layer>
        ),
      },
      {
        id: "couple",
        label: "The couple",
        duration: 5200,
        in: { kind: "fade", dur: 800 },
        out: { kind: "fade", dur: 800 },
        render: ({ t, d }) => (
          <Layer style={{ flexDirection: v ? "column" : "row", gap: S(50, 110) }}>
            <PhotoCircle t={t} d={d} theme={theme} src={data.photo?.src} size={S(580, 600)} start={0} ringWidth={10} ring={"linear-gradient(135deg,#fff," + theme.line + "," + theme.accent + "," + theme.line + ")"} />
            <Names t={t} theme={theme} v={v} start={600} a={data.nameA} b={data.nameB} size={S(140, 140)} stack color={theme.ink} />
          </Layer>
        ),
      },
      {
        id: "details",
        label: "Date & venue",
        duration: 5600,
        in: { kind: "slide-up", dur: 850 },
        out: { kind: "fade", dur: 800 },
        render: ({ t }) => (
          <Layer style={{ flexDirection: v ? "column" : "row", gap: S(80, 160) }}>
            <DateBlock t={t} theme={theme} v={v} date={data.weddingDate} time={data.weddingTime} divider={false} />
            <VenueBlock t={t} theme={theme} v={v} start={1100} label="Venue" name={data.venueName} address={data.venueAddress} nameSize={76} maxWidth={S(900, 760)} />
          </Layer>
        ),
      },
      {
        id: "close",
        label: "Closing",
        duration: 5200,
        in: { kind: "iris", dur: 1000 },
        render: ({ t }) => (
          <Layer>
            <Rings t={t + 2400} size={S(560, 480)} metal={theme.line} metal2={theme.accent} />
            <div style={{ textAlign: "center", maxWidth: S(920, 1400), marginTop: S(20, 0) }}>
              <Headline t={t} theme={theme} v={v} start={400} size={S(100, 104)} font={theme.fontScript} color={theme.ink} lineHeight={1.3}>
                {data.closingLine}
              </Headline>
              <div style={{ display: "grid", placeItems: "center", marginTop: S(36, 26) }}>
                <DiamondRule t={t} start={1400} width={S(320, 360)} color={theme.line} />
              </div>
              <div style={{ fontFamily: theme.fontDisplay, color: theme.accent, fontSize: S(54, 56), marginTop: S(30, 22), ...rise(t, { start: 1700, dur: 1000, dist: 20 }) }}>
                {data.nameA} &amp; {data.nameB}
              </div>
              {data.rsvp ? (
                <div style={{ fontFamily: theme.fontBody, color: theme.soft, fontSize: S(34, 36), letterSpacing: "0.08em", marginTop: S(30, 22), ...fade(t, { start: 2400, dur: 1000 }) }}>{data.rsvp}</div>
              ) : null}
            </div>
          </Layer>
        ),
      },
    ];
    return scenes;
  },
};
