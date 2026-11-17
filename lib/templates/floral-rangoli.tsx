import React from "react";
import type { Scene, TemplateDef, Theme } from "../types";
import { E, clamp, fade, mix, rise, tw } from "../anim";
import { DiamondRule, Layer } from "@/components/primitives";
import { DateBlock, Headline, Kicker, Names, VenueBlock } from "@/components/blocks";
import { Diya } from "@/components/indian";

/* Floral Rangoli (2026-11-17): a rangoli of petals that draws itself ring by ring from the centre, in the palette's
   colours, turning slowly. It frames the title, the date and the closing; the names sit on a petal-lined band.
   For any function: the title is a field (Haldi, Mehendi, Griha Pravesh, Engagement, Wedding…). Pure function of t. */

/** Concentric rings of petals; ring k appears at start + k·gap and the whole rangoli turns slowly. */
function Rangoli({ t, size, theme, start = 0, rings = 5, gap = 320 }: { t: number; size: number; theme: Theme; start?: number; rings?: number; gap?: number }) {
  const colors = [theme.accent, theme.line, theme.soft, theme.accent, theme.ink];
  const turn = (t / 1000) * 4; // degrees per second
  return (
    <svg width={size} height={size} viewBox="-100 -100 200 200" style={{ overflow: "visible" }}>
      <g transform={"rotate(" + turn.toFixed(2) + ")"}>
        {Array.from({ length: rings }).map((_, k) => {
          const n = 8 + k * 4;
          const r = 14 + k * 17;
          const p = tw(t, start + k * gap, 900, E.outBack);
          const len = 7 + k * 1.6;
          const wide = 3 + k * 0.6;
          return (
            <g key={k} opacity={clamp(tw(t, start + k * gap, 400, E.outCubic))} transform={"rotate(" + (k % 2 ? 180 / n : 0) + ")"}>
              {Array.from({ length: n }).map((_, i) => (
                <g key={i} transform={"rotate(" + (i * 360) / n + ") translate(0 " + -r * p + ") scale(" + clamp(p).toFixed(3) + ")"}>
                  <path d={"M0 " + len + " C" + wide + " " + len / 3 + " " + wide + " " + -len / 3 + " 0 " + -len + " C" + -wide + " " + -len / 3 + " " + -wide + " " + len / 3 + " 0 " + len + " Z"} fill={colors[k % colors.length]} opacity={0.92} />
                  <circle cy={-len - 2.4} r={1.2} fill={theme.ink} opacity={0.7} />
                </g>
              ))}
              <circle r={r * p} fill="none" stroke={theme.line} strokeWidth={0.5} strokeDasharray="1.5 2.5" opacity={0.6} />
            </g>
          );
        })}
        <circle r={8 * clamp(tw(t, start, 600, E.outBack))} fill={theme.accent} />
        <circle r={4 * clamp(tw(t, start + 200, 600, E.outBack))} fill={theme.bg} />
      </g>
    </svg>
  );
}

/** A band of small petals across the scene, laid down left to right. */
function PetalBand({ t, width, theme, start = 0 }: { t: number; width: number; theme: Theme; start?: number }) {
  const n = Math.round(width / 46);
  return (
    <svg width={width} height={40} viewBox={"0 -20 " + width + " 40"}>
      {Array.from({ length: n }).map((_, i) => {
        const p = tw(t, start + i * 40, 500, E.outBack);
        const x = (i + 0.5) * (width / n);
        return (
          <g key={i} transform={"translate(" + x.toFixed(1) + " 0) rotate(" + (i % 2 ? 45 : -45) + ") scale(" + clamp(p).toFixed(3) + ")"}>
            <path d="M0 11 C6 4 6 -4 0 -11 C-6 -4 -6 4 0 11 Z" fill={i % 3 === 0 ? theme.accent : i % 3 === 1 ? theme.line : theme.soft} />
          </g>
        );
      })}
    </svg>
  );
}

export const floralRangoli: TemplateDef = {
  id: "floral-rangoli",
  name: "Floral Rangoli",
  tagline: "A rangoli of petals draws itself ring by ring, for any function: haldi, mehendi, wedding, griha pravesh",
  tags: ["Rangoli", "Festive", "Any function"],
  categories: ["wedding", "engagement", "haldi", "mehendi", "reception"],
  communities: ["hindu", "south-indian"],
  isNew: true,
  poster: "title",
  fonts: { display: "var(--f-playfair)", script: "var(--f-vibes)", body: "var(--f-cormorant)" },
  palettes: [
    { id: "festive", name: "Festive Marigold", ink: "#4A1206", soft: "#E8792A", accent: "#D7263D", bg: "#FFF4DE", bg2: "#FDDDA4", line: "#F2A007" },
    { id: "peacock", name: "Peacock Night", ink: "#F3FBF8", soft: "#4FC3A1", accent: "#F2C14E", bg: "#0C3B4A", bg2: "#061E27", line: "#E86A92" },
    { id: "lotus", name: "Lotus Pink", ink: "#4A1630", soft: "#C2577F", accent: "#E8A33D", bg: "#FFF0F4", bg2: "#F8D3DF", line: "#8E2C5C" },
    { id: "leaf", name: "Mango Leaf", ink: "#FFF8E1", soft: "#9CCC65", accent: "#FFB300", bg: "#1E4D2B", bg2: "#0E2A17", line: "#F4511E" },
  ],
  thumb: (p) => (
    <div style={{ width: "100%", height: "100%", background: "linear-gradient(160deg," + p.bg + "," + p.bg2 + ")", display: "grid", placeItems: "center" }}>
      <svg width="46" height="46" viewBox="-20 -20 40 40">
        {Array.from({ length: 8 }).map((_, i) => (
          <path key={i} transform={"rotate(" + i * 45 + ") translate(0 -9)"} d="M0 6 C3 2 3 -2 0 -6 C-3 -2 -3 2 0 6 Z" fill={i % 2 ? p.accent : p.line} />
        ))}
        <circle r={3.4} fill={p.accent} />
      </svg>
    </div>
  ),
  groups: [
    {
      title: "Titles",
      fields: [
        { key: "kicker", type: "text", label: "Opening line", placeholder: "You are warmly invited", max: 36 },
        { key: "title", type: "text", label: "Function", placeholder: "Haldi Ceremony", max: 24, hint: "Wedding, Haldi, Mehendi, Engagement, Griha Pravesh, Naamkaran…" },
      ],
    },
    {
      title: "Names",
      fields: [
        { key: "nameA", type: "text", label: "First name", placeholder: "Ananya", max: 22 },
        { key: "nameB", type: "text", label: "Second name", placeholder: "Rohan", max: 22, hint: "Leave empty for one name (a birthday, a griha pravesh)." },
        { key: "hosts", type: "text", label: "Hosted by", placeholder: "The Iyer & Kapoor families", max: 60 },
      ],
    },
    {
      title: "When & where",
      fields: [
        { key: "weddingDate", type: "date", label: "Date" },
        { key: "weddingTime", type: "time", label: "Time" },
        { key: "venueName", type: "text", label: "Venue", placeholder: "Iyer Residence", max: 40 },
        { key: "venueAddress", type: "textarea", label: "Address", placeholder: "Koramangala, Bengaluru", max: 100 },
        { key: "dressCode", type: "text", label: "Dress code (optional)", placeholder: "Shades of yellow", max: 30 },
      ],
    },
    {
      title: "Sign-off",
      fields: [
        { key: "closingLine", type: "text", label: "Closing line", placeholder: "Come, celebrate with us", max: 44 },
        { key: "rsvp", type: "text", label: "RSVP", placeholder: "RSVP · name · mobile number", max: 60, hint: "A mobile number here becomes an \"RSVP on WhatsApp\" button for guests." },
      ],
    },
  ],
  defaults: {
    kicker: "You are warmly invited",
    title: "Haldi Ceremony",
    nameA: "Ananya",
    nameB: "Rohan",
    hosts: "The Iyer & Kapoor families",
    weddingDate: "2027-01-14",
    weddingTime: "10:30",
    venueName: "Iyer Residence",
    venueAddress: "Koramangala, Bengaluru",
    dressCode: "Shades of yellow",
    closingLine: "Come, celebrate with us",
    rsvp: "", // no sample number: a mobile here becomes a live "RSVP on WhatsApp" button for guests
  },

  backdrop: ({ T, theme }) => (
    <>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 50% 45%," + theme.bg + " 0%," + theme.bg2 + " 100%)" }} />
      {/* soft dots, like rice-flour rangoli dots, drifting very slowly */}
      <div style={{ position: "absolute", inset: 0, opacity: 0.12, backgroundImage: "radial-gradient(" + theme.line + " 2px, transparent 2.5px)", backgroundSize: "48px 48px", backgroundPosition: (T / 120).toFixed(1) + "px 0" }} />
    </>
  ),

  build: (data, orientation, theme) => {
    const v = orientation === "vertical";
    const S = function <T>(a: T, b: T): T {
      return v ? a : b;
    };
    const two = !!String(data.nameB || "").trim();
    const scenes: Scene[] = [
      {
        id: "title",
        label: "Title",
        duration: 6000,
        in: { kind: "fade", dur: 700 },
        out: { kind: "zoom-in", dur: 900 },
        render: ({ t }) => (
          <Layer>
            <div style={{ position: "absolute", display: "grid", placeItems: "center" }}>
              <Rangoli t={t} size={S(1000, 900)} theme={theme} start={100} />
            </div>
            <div style={{ position: "relative", textAlign: "center", padding: S("110px 120px", "90px 150px"), borderRadius: "50%", background: "radial-gradient(closest-side," + theme.bg + " 72%," + theme.bg + "00)", ...fade(t, { start: 1500, dur: 900 }) }}>
              <Kicker t={t} theme={theme} v={v} start={1700} size={36} color={theme.ink}>
                {data.kicker}
              </Kicker>
              <Headline t={t} theme={theme} v={v} start={2000} size={S(110, 110)} font={theme.fontScript} color={theme.accent} lineHeight={1.3}>
                {data.title}
              </Headline>
            </div>
          </Layer>
        ),
      },
      {
        id: "names",
        label: "The names",
        duration: 5800,
        in: { kind: "fade", dur: 800 },
        out: { kind: "fade", dur: 800 },
        render: ({ t }) => (
          <Layer style={{ gap: S(36, 26) }}>
            <PetalBand t={t} width={S(860, 1200)} theme={theme} start={100} />
            {two ? (
              <Names t={t} theme={theme} v={v} start={500} a={data.nameA} b={data.nameB} size={S(150, 150)} stack={v} color={theme.ink} />
            ) : (
              <Headline t={t} theme={theme} v={v} start={500} size={S(170, 170)} font={theme.fontScript} color={theme.ink} lineHeight={1.3}>
                {data.nameA}
              </Headline>
            )}
            {data.hosts ? (
              <div style={{ fontFamily: theme.fontBody, color: theme.soft, fontStyle: "italic", fontSize: S(42, 40), ...rise(t, { start: 1900, dur: 900, dist: 16 }) }}>Hosted by {data.hosts}</div>
            ) : null}
            <PetalBand t={t} width={S(860, 1200)} theme={theme} start={900} />
          </Layer>
        ),
      },
      {
        id: "date",
        label: "Date",
        duration: 5600,
        in: { kind: "iris", dur: 900 },
        out: { kind: "fade", dur: 800 },
        render: ({ t }) => (
          <Layer>
            <div style={{ position: "absolute", display: "grid", placeItems: "center", opacity: 0.35 }}>
              <Rangoli t={t + 2400} size={S(980, 860)} theme={theme} rings={5} />
            </div>
            <div style={{ position: "relative", textAlign: "center", padding: S("50px 40px", "40px 70px"), borderRadius: 40, background: theme.bg + "E6" }}>
              <DateBlock t={t} theme={theme} v={v} start={400} date={data.weddingDate} time={data.weddingTime} divider={false} />
            </div>
          </Layer>
        ),
      },
      {
        id: "venue",
        label: "Venue",
        duration: 5200,
        in: { kind: "slide-up", dur: 850 },
        out: { kind: "fade", dur: 800 },
        render: ({ t }) => (
          <Layer style={{ gap: S(30, 24) }}>
            <Diya t={t} size={S(190, 170)} start={100} />
            <VenueBlock t={t} theme={theme} v={v} start={400} label="Venue" name={data.venueName} address={data.venueAddress} nameSize={S(84, 88)} maxWidth={S(920, 1400)} />
            {data.dressCode ? (
              <div style={{ fontFamily: theme.fontDisplay, color: theme.accent, fontSize: S(40, 40), marginTop: S(10, 6), ...fade(t, { start: 1800, dur: 900 }) }}>Dress code · {data.dressCode}</div>
            ) : null}
          </Layer>
        ),
      },
      {
        id: "close",
        label: "Closing",
        duration: 5400,
        in: { kind: "zoom-out", dur: 900 },
        render: ({ t }) => (
          <Layer>
            <div style={{ position: "absolute", display: "grid", placeItems: "center", opacity: mix(clamp(tw(t, 0, 1200)), 0, 0.9) }}>
              <Rangoli t={t} size={S(820, 700)} theme={theme} rings={4} gap={220} />
            </div>
            <div style={{ position: "relative", textAlign: "center", maxWidth: S(820, 1300), padding: S("40px 50px", "30px 60px"), borderRadius: 40, background: theme.bg + "E6", ...fade(t, { start: 800, dur: 900 }) }}>
              <Headline t={t} theme={theme} v={v} start={1000} size={S(96, 100)} font={theme.fontScript} color={theme.ink} lineHeight={1.3}>
                {data.closingLine}
              </Headline>
              <div style={{ display: "grid", placeItems: "center", margin: S("26px 0", "18px 0") }}>
                <DiamondRule t={t} start={1700} width={S(280, 320)} color={theme.line} />
              </div>
              <div style={{ fontFamily: theme.fontDisplay, color: theme.accent, fontSize: S(50, 52), ...rise(t, { start: 1900, dur: 900, dist: 16 }) }}>
                {two ? data.nameA + " & " + data.nameB : data.nameA}
              </div>
              {data.rsvp ? (
                <div style={{ fontFamily: theme.fontBody, color: theme.soft, fontSize: S(40, 38), marginTop: S(22, 16), ...fade(t, { start: 2400, dur: 900 }) }}>{data.rsvp}</div>
              ) : null}
            </div>
          </Layer>
        ),
      },
    ];
    return scenes;
  },
};
