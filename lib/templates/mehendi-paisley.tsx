import React from "react";
import type { Scene, TemplateDef } from "../types";
import { fade, rise } from "../anim";
import { DiamondRule, Layer, Particles } from "@/components/primitives";
import { DateBlock, Headline, Kicker, Names, PhotoCircle, VenueBlock } from "@/components/blocks";
import { HennaRing, Paisley } from "@/components/indian";

/* Mehendi — henna green & gold, paisleys that draw themselves, handwritten Hindi. */

export const mehendiPaisley: TemplateDef = {
  id: "mehendi-paisley",
  name: "Mehendi Paisley",
  tagline: "Henna paisleys that draw themselves, scalloped henna frame, handwritten Hindi",
  tags: ["Mehendi", "Henna", "Green"],
  categories: ["mehendi"],
  communities: ["hindu", "muslim"],
  isNew: true,
  poster: "open",
  fonts: { display: "var(--f-marcellus)", script: "var(--f-vibes)", body: "var(--f-cormorant)" },
  palettes: [
    { id: "henna", name: "Henna Green", ink: "#F6EBD9", soft: "#CDBB9C", accent: "#E0B15C", bg: "#1F3D2B", bg2: "#0F2419", line: "#C9A35A" },
    { id: "rust", name: "Henna Rust", ink: "#FFF1E3", soft: "#E7C9AE", accent: "#F4B860", bg: "#7A2E12", bg2: "#4A1B0A", line: "#E3A35A" },
    { id: "mint", name: "Mint & Henna", ink: "#2F4A3A", soft: "#557562", accent: "#A2541A", bg: "#EAF5EC", bg2: "#D3EBD8", line: "#7BA889" },
    { id: "fuchsia", name: "Fuchsia", ink: "#FFF0F6", soft: "#F7C6DA", accent: "#FFD166", bg: "#9C1C5B", bg2: "#5E0B35", line: "#FFC2D9" },
  ],
  thumb: (p) => (
    <div style={{ width: "100%", height: "100%", background: "radial-gradient(circle at 50% 40%," + p.bg + "," + p.bg2 + ")", display: "grid", placeItems: "center" }}>
      <svg width="40" height="40" viewBox="0 0 100 100">
        <path d="M50 94 C 22 94 8 72 13 50 C 18 28 40 14 61 17 C 82 20 90 40 77 49 C 68 55 59 47 64 40" fill="none" stroke={p.accent} strokeWidth="5" />
        <circle cx="42" cy="62" r="8" fill="none" stroke={p.accent} strokeWidth="4" />
      </svg>
    </div>
  ),
  groups: [
    {
      title: "The couple",
      fields: [
        { key: "brideName", type: "text", label: "Bride's name", placeholder: "Ananya", max: 20 },
        { key: "groomName", type: "text", label: "Groom's name", placeholder: "Aarav", max: 20 },
        { key: "photo", type: "image", label: "Photo", ratio: "1 / 1", hint: "Framed in a henna ring" },
      ],
    },
    {
      title: "Titles",
      fields: [
        { key: "kicker", type: "text", label: "Opening line", placeholder: "Join us for the", max: 30 },
        { key: "title", type: "text", label: "Title", placeholder: "Mehendi", max: 16 },
        { key: "localTitle", type: "text", label: "Hindi / Urdu title", placeholder: "मेहंदी की रस्म", max: 26 },
      ],
    },
    {
      title: "When & where",
      fields: [
        { key: "weddingDate", type: "date", label: "Date" },
        { key: "weddingTime", type: "time", label: "Time" },
        { key: "venueName", type: "text", label: "Venue", placeholder: "The Courtyard", max: 36 },
        { key: "venueAddress", type: "textarea", label: "Address", placeholder: "Samode Haveli\nJaipur", max: 100 },
      ],
    },
    {
      title: "Sign-off",
      fields: [
        { key: "note", type: "text", label: "Note for guests", placeholder: "Mehendi artists for every guest", max: 44 },
        { key: "closingLine", type: "text", label: "Closing line", placeholder: "Henna, music & happy hearts", max: 36 },
        { key: "hashtag", type: "text", label: "Hashtag / RSVP", placeholder: "#AnanyaKiMehendi", max: 34 },
      ],
    },
  ],
  defaults: {
    brideName: "Ananya",
    groomName: "Aarav",
    photo: null,
    kicker: "Join us for the",
    title: "Mehendi",
    localTitle: "मेहंदी की रस्म",
    weddingDate: "2026-12-07",
    weddingTime: "16:00",
    venueName: "The Courtyard",
    venueAddress: "Samode Haveli\nJaipur",
    note: "Mehendi artists for every guest",
    closingLine: "Henna, music & happy hearts",
    hashtag: "#AnanyaKiMehendi",
  },

  backdrop: ({ T, theme, W, H }) => (
    <>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 35%," + theme.bg + " 0%," + theme.bg2 + " 85%)" }} />
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.12,
          backgroundImage: "radial-gradient(" + theme.line + " 1.6px, transparent 1.8px), radial-gradient(" + theme.line + " 1.6px, transparent 1.8px)",
          backgroundSize: "34px 34px",
          backgroundPosition: "0 0, 17px 17px",
        }}
      />
      <Particles t={T} color={theme.accent} W={W} H={H} count={18} size={4} opacity={0.3} seed={11} />
    </>
  ),

  build: (data, orientation, theme) => {
    const v = orientation === "vertical";
    const S = function <T>(a: T, b: T): T {
      return v ? a : b;
    };
    const corner = S(330, 300);

    const corners = (t: number, start = 0) => (
      <>
        <div style={{ position: "absolute", top: S(40, 10), left: S(20, 60) }}>
          <Paisley t={t} color={theme.line} size={corner} start={start} rotate={-30} />
        </div>
        <div style={{ position: "absolute", top: S(40, 10), right: S(20, 60) }}>
          <Paisley t={t} color={theme.line} size={corner} start={start + 200} flip rotate={-30} />
        </div>
        <div style={{ position: "absolute", bottom: S(40, 10), left: S(20, 60) }}>
          <Paisley t={t} color={theme.line} size={corner} start={start + 400} rotate={150} flip />
        </div>
        <div style={{ position: "absolute", bottom: S(40, 10), right: S(20, 60) }}>
          <Paisley t={t} color={theme.line} size={corner} start={start + 600} rotate={150} />
        </div>
      </>
    );

    const scenes: Scene[] = [
      {
        id: "open",
        label: "Mehendi",
        duration: 5000,
        in: { kind: "fade", dur: 700 },
        out: { kind: "blur", dur: 850 },
        render: ({ t }) => (
          <>
            {corners(t, 100)}
            <Layer>
              <div style={{ textAlign: "center" }}>
                <Kicker t={t} theme={theme} v={v} start={800} size={34}>
                  {data.kicker}
                </Kicker>
                <Headline t={t} theme={theme} v={v} start={1100} size={S(220, 210)} font={theme.fontScript} color={theme.accent} lineHeight={1.3} dur={1600}>
                  {data.title}
                </Headline>
                {data.localTitle ? (
                  <Headline t={t} theme={theme} v={v} start={1700} size={78} font="var(--f-kalam)" color={theme.ink}>
                    {data.localTitle}
                  </Headline>
                ) : null}
                <div style={{ display: "grid", placeItems: "center", marginTop: S(36, 28) }}>
                  <DiamondRule t={t} start={2200} width={S(320, 360)} color={theme.line} />
                </div>
              </div>
            </Layer>
          </>
        ),
      },
      {
        id: "photo",
        label: "Couple in henna ring",
        duration: 5400,
        in: { kind: "iris", dur: 1000 },
        out: { kind: "fade", dur: 800 },
        render: ({ t, d }) => {
          const ring = S(800, 700);
          return (
            <Layer style={{ flexDirection: v ? "column" : "row", gap: S(30, 90) }}>
              <div style={{ position: "relative", width: ring, height: ring, display: "grid", placeItems: "center" }}>
                <div style={{ position: "absolute", inset: 0 }}>
                  <HennaRing t={t} color={theme.line} size={ring} start={200} />
                </div>
                <PhotoCircle t={t} d={d} theme={theme} src={data.photo?.src} size={ring * 0.74} start={0} ringWidth={4} ring={theme.line} />
              </div>
              <div style={{ textAlign: "center" }}>
                <Kicker t={t} theme={theme} v={v} start={900} size={30}>
                  Celebrating
                </Kicker>
                <Names t={t} theme={theme} v={v} start={1100} a={data.brideName} b={data.groomName} size={S(120, 130)} stack color={theme.ink} />
              </div>
            </Layer>
          );
        },
      },
      {
        id: "details",
        label: "Date & venue",
        duration: 5800,
        in: { kind: "fade", dur: 800 },
        out: { kind: "fade", dur: 800 },
        render: ({ t }) => (
          <>
            {corners(t, 0)}
            <Layer style={{ flexDirection: v ? "column" : "row", gap: S(70, 0) }}>
              <div style={{ flex: v ? "0 0 auto" : "1 1 0", display: "grid", placeItems: "center" }}>
                <DateBlock t={t} theme={theme} v={v} date={data.weddingDate} time={data.weddingTime} divider={false} />
              </div>
              {!v ? <div style={{ width: 1.5, alignSelf: "stretch", margin: "300px 0", background: theme.line, opacity: 0.5 }} /> : null}
              <div style={{ flex: v ? "0 0 auto" : "1 1 0", display: "grid", placeItems: "center" }}>
                <VenueBlock t={t} theme={theme} v={v} start={1200} label="At" name={data.venueName} address={data.venueAddress} nameSize={76} maxWidth={S(880, 760)} />
              </div>
            </Layer>
          </>
        ),
      },
      {
        id: "close",
        label: "Closing",
        duration: 5200,
        in: { kind: "zoom-out", dur: 900 },
        render: ({ t }) => (
          <Layer>
            <div style={{ display: "flex", gap: S(20, 60), marginBottom: S(30, 10) }}>
              <Paisley t={t} color={theme.accent} size={S(220, 200)} start={100} rotate={20} />
              <Paisley t={t} color={theme.accent} size={S(220, 200)} start={300} flip rotate={20} />
            </div>
            <div style={{ textAlign: "center", maxWidth: S(900, 1400) }}>
              <Headline t={t} theme={theme} v={v} start={700} size={S(110, 110)} font={theme.fontScript} color={theme.ink} lineHeight={1.3}>
                {data.closingLine}
              </Headline>
              {data.note ? (
                <div style={{ fontFamily: "var(--f-kalam)", color: theme.accent, fontSize: S(44, 46), marginTop: S(34, 26), ...rise(t, { start: 1700, dur: 1000, dist: 20 }) }}>{data.note}</div>
              ) : null}
              {data.hashtag ? (
                <div style={{ fontFamily: theme.fontDisplay, color: theme.soft, fontSize: S(40, 42), letterSpacing: "0.12em", marginTop: S(40, 28), ...fade(t, { start: 2300, dur: 1000 }) }}>{data.hashtag}</div>
              ) : null}
            </div>
          </Layer>
        ),
      },
    ];
    return scenes;
  },
};
