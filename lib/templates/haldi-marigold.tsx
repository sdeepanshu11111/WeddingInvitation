import React from "react";
import type { Scene, TemplateDef } from "../types";
import { E, pop, rise, tw } from "../anim";
import { DiamondRule, Layer } from "@/components/primitives";
import { DateBlock, Headline, Kicker, Names, PhotoCircle, VenueBlock } from "@/components/blocks";
import { Diya, Garlands } from "@/components/indian";

/* Haldi — turmeric yellow, swaying marigold laris, bold Rozha One type. */

const MARIGOLD_RING = "conic-gradient(from 0deg, #FB8C00, #FFC107, #FB8C00, #FFC107, #FB8C00, #FFC107, #FB8C00)";

export const haldiMarigold: TemplateDef = {
  id: "haldi-marigold",
  name: "Haldi Marigold",
  tagline: "Turmeric yellow with swaying marigold garlands, bold Hindi titles",
  tags: ["Haldi", "Bright", "Marigold"],
  categories: ["haldi"],
  communities: ["hindu"],
  isNew: true,
  poster: "open",
  fonts: { display: "var(--f-rozha)", script: "var(--f-vibes)", body: "var(--f-cormorant)" },
  palettes: [
    { id: "turmeric", name: "Turmeric", ink: "#4A2304", soft: "#7A4A12", accent: "#C2410C", bg: "#FFD54F", bg2: "#FFB300", line: "#B45309" },
    { id: "marigold", name: "Marigold", ink: "#FFF8E1", soft: "#FFE0B2", accent: "#FFEB3B", bg: "#F57C00", bg2: "#D84315", line: "#FFE082" },
    { id: "mango", name: "Mango Leaf", ink: "#FFF8E1", soft: "#DCEDC8", accent: "#FFCA28", bg: "#2E7D32", bg2: "#1B5E20", line: "#FFD54F" },
    { id: "pastel", name: "Pastel Sun", ink: "#5D4037", soft: "#8D6E63", accent: "#E67E00", bg: "#FFF8E1", bg2: "#FFE7A8", line: "#E6A23C" },
  ],
  thumb: (p) => (
    <div style={{ width: "100%", height: "100%", background: "linear-gradient(180deg," + p.bg + "," + p.bg2 + ")", position: "relative", display: "grid", placeItems: "center" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, display: "flex", justifyContent: "space-around" }}>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} style={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {Array.from({ length: i % 2 ? 3 : 5 }).map((_, j) => (
              <span key={j} style={{ width: 7, height: 7, borderRadius: "50%", background: (i + j) % 3 ? "#FB8C00" : "#FFC107", display: "block" }} />
            ))}
          </div>
        ))}
      </div>
      <span style={{ fontFamily: "var(--f-rozha)", color: p.accent, fontSize: 18, marginTop: 26 }}>हल्दी</span>
    </div>
  ),
  groups: [
    {
      title: "The couple",
      fields: [
        { key: "brideName", type: "text", label: "Bride's name", placeholder: "Ananya", max: 20 },
        { key: "groomName", type: "text", label: "Groom's name", placeholder: "Aarav", max: 20 },
        { key: "photo", type: "image", label: "Photo", ratio: "1 / 1", hint: "Shown in a marigold ring" },
      ],
    },
    {
      title: "Titles",
      fields: [
        { key: "kicker", type: "text", label: "Opening line", placeholder: "You're invited to the", max: 36 },
        { key: "title", type: "text", label: "Title", placeholder: "Haldi", max: 14 },
        { key: "localTitle", type: "text", label: "Hindi title", placeholder: "हल्दी रस्म", max: 24, hint: "Any language works. Leave blank to hide." },
      ],
    },
    {
      title: "When & where",
      fields: [
        { key: "weddingDate", type: "date", label: "Date" },
        { key: "weddingTime", type: "time", label: "Time" },
        { key: "venueName", type: "text", label: "Venue", placeholder: "Sharma Residence", max: 36 },
        { key: "venueAddress", type: "textarea", label: "Address", placeholder: "C-12, Vaishali Nagar\nJaipur", max: 100 },
      ],
    },
    {
      title: "Sign-off",
      fields: [
        { key: "dressCode", type: "text", label: "Dress code", placeholder: "Shades of yellow", max: 30 },
        { key: "closingLine", type: "text", label: "Closing line", placeholder: "Turmeric, laughter & lots of love", max: 40 },
        { key: "hashtag", type: "text", label: "Hashtag / RSVP", placeholder: "#AnanyaKiHaldi", max: 34 },
      ],
    },
  ],
  defaults: {
    brideName: "Ananya",
    groomName: "Aarav",
    photo: null,
    kicker: "You're invited to the",
    title: "Haldi",
    localTitle: "हल्दी रस्म",
    weddingDate: "2026-12-07",
    weddingTime: "10:00",
    venueName: "Sharma Residence",
    venueAddress: "C-12, Vaishali Nagar\nJaipur",
    dressCode: "Shades of yellow",
    closingLine: "Turmeric, laughter & lots of love",
    hashtag: "#AnanyaKiHaldi",
  },

  backdrop: ({ T, theme, W, H, vertical }) => {
    const s = T / 1000;
    const blob = (x: number, y: number, r: number, k: number) => (
      <div
        style={{
          position: "absolute",
          left: x + Math.sin(s * 0.3 * k + k) * 40 - r,
          top: y + Math.cos(s * 0.25 * k) * 40 - r,
          width: r * 2,
          height: r * 2,
          borderRadius: "50%",
          background: "radial-gradient(circle, " + theme.bg2 + " 0%, transparent 70%)",
          opacity: 0.85,
        }}
      />
    );
    return (
      <>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(170deg," + theme.bg + " 20%," + theme.bg2 + " 100%)" }} />
        {blob(W * 0.15, H * 0.7, W * 0.45, 1)}
        {blob(W * 0.9, H * 0.35, W * 0.35, 1.7)}
        <Garlands t={T} W={W} H={H} strands={vertical ? 7 : 11} maxLen={vertical ? 0.2 : 0.27} flower={vertical ? 30 : 26} />
      </>
    );
  },

  build: (data, orientation, theme) => {
    const v = orientation === "vertical";
    const S = function <T>(a: T, b: T): T {
      return v ? a : b;
    };
    const top = S(380, 250); // keep text clear of the garlands

    const scenes: Scene[] = [
      {
        id: "open",
        label: "Haldi",
        duration: 4600,
        in: { kind: "fade", dur: 700 },
        out: { kind: "zoom-in", dur: 800 },
        render: ({ t }) => (
          <Layer style={{ paddingTop: top }}>
            <div style={{ textAlign: "center" }}>
              <Kicker t={t} theme={theme} v={v} start={1100} size={36} color={theme.ink} spacing="0.22em" upper={false} font={theme.fontBody} style={{ fontStyle: "italic" }}>
                {data.kicker}
              </Kicker>
              <div style={{ ...pop(t, { start: 1400, dur: 1100 }) }}>
                <div style={{ fontFamily: theme.fontDisplay, color: theme.accent, fontSize: S(250, 240), lineHeight: 1.05, textShadow: "0 6px 0 " + theme.line + "33" }}>{data.title}</div>
              </div>
              {data.localTitle ? (
                <Headline t={t} theme={theme} v={v} start={2000} size={84} color={theme.ink}>
                  {data.localTitle}
                </Headline>
              ) : null}
              <div style={{ display: "grid", placeItems: "center", marginTop: S(30, 24) }}>
                <DiamondRule t={t} start={2400} width={S(320, 360)} color={theme.line} />
              </div>
            </div>
          </Layer>
        ),
      },
      {
        id: "couple",
        label: "The couple",
        duration: 5000,
        in: { kind: "fade", dur: 800 },
        out: { kind: "fade", dur: 800 },
        render: ({ t, d }) => (
          <Layer style={{ paddingTop: top * 0.7, flexDirection: v ? "column" : "row", gap: S(50, 110) }}>
            <PhotoCircle t={t} d={d} theme={theme} src={data.photo?.src} size={S(560, 560)} start={100} ring={MARIGOLD_RING} ringWidth={18} />
            <div style={{ textAlign: "center" }}>
              <Kicker t={t} theme={theme} v={v} start={500} size={30} color={theme.ink}>
                Celebrating
              </Kicker>
              <Names t={t} theme={theme} v={v} start={700} a={data.brideName} b={data.groomName} size={S(140, 130)} stack color={theme.ink} />
            </div>
          </Layer>
        ),
      },
      {
        id: "date",
        label: "Date",
        duration: 4600,
        in: { kind: "slide-up", dur: 850 },
        out: { kind: "fade", dur: 800 },
        render: ({ t }) => (
          <Layer style={{ paddingTop: top * 0.6 }}>
            <DateBlock t={t} theme={theme} v={v} date={data.weddingDate} time={data.weddingTime} timeLabel="from" />
          </Layer>
        ),
      },
      {
        id: "venue",
        label: "Venue & dress code",
        duration: 5000,
        in: { kind: "fade", dur: 800 },
        out: { kind: "fade", dur: 800 },
        render: ({ t }) => (
          <Layer style={{ paddingTop: top * 0.6 }}>
            <VenueBlock t={t} theme={theme} v={v} label="At" name={data.venueName} address={data.venueAddress} nameSize={92} />
            {data.dressCode ? (
              <div style={{ marginTop: S(70, 44), textAlign: "center", ...rise(t, { start: 1800, dur: 1000, dist: 24 }) }}>
                <div style={{ display: "flex", justifyContent: "center", gap: 14, marginBottom: 20 }}>
                  {["#FFF176", "#FFD54F", "#FFB300", "#FB8C00"].map((c, i) => (
                    <span key={c} style={{ width: 54, height: 54, borderRadius: "50%", background: c, border: "3px solid " + theme.ink + "33", transform: "scale(" + tw(t, 2000 + i * 120, 600, E.outBack).toFixed(3) + ")" }} />
                  ))}
                </div>
                <div style={{ fontFamily: theme.fontBody, color: theme.ink, fontSize: S(40, 44), letterSpacing: "0.1em" }}>
                  <span style={{ opacity: 0.7 }}>Dress code: </span>
                  <b style={{ fontWeight: 600 }}>{data.dressCode}</b>
                </div>
              </div>
            ) : null}
          </Layer>
        ),
      },
      {
        id: "close",
        label: "Closing",
        duration: 5200,
        in: { kind: "iris", dur: 1000 },
        render: ({ t }) => (
          <Layer style={{ paddingTop: top * 0.6 }}>
            <div style={{ textAlign: "center", maxWidth: S(900, 1400) }}>
              <Headline t={t} theme={theme} v={v} start={400} size={S(110, 104)} font={theme.fontScript} color={theme.ink} lineHeight={1.25}>
                {data.closingLine}
              </Headline>
              {data.hashtag ? (
                <div style={{ fontFamily: theme.fontDisplay, color: theme.accent, fontSize: S(54, 56), marginTop: S(40, 30), ...rise(t, { start: 1600, dur: 1000, dist: 20 }) }}>{data.hashtag}</div>
              ) : null}
            </div>
            <div style={{ position: "absolute", bottom: S(160, 70), display: "flex", gap: S(70, 120) }}>
              {[0, 1, 2].map((i) => (
                <Diya key={i} t={t} size={S(210, 190)} seed={i} start={1200 + i * 250} />
              ))}
            </div>
          </Layer>
        ),
      },
    ];
    return scenes;
  },
};

