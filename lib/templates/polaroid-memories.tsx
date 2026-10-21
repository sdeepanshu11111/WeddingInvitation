import React from "react";
import type { Scene, TemplateDef } from "../types";
import { E, fade, maskUp, mix, rise, tw } from "../anim";
import { Layer, Photo, Reveal, Rule, Tape, WordsUp, dateParts, prettyTime } from "@/components/primitives";

/* Polaroid Memories — scrapbook. Photos drop in on tape, slightly askew. */

export const polaroidMemories: TemplateDef = {
  id: "polaroid-memories",
  name: "Polaroid Memories",
  tagline: "Scrapbook of photos on tape — playful, warm, handwritten captions",
  tags: ["Photos", "Playful", "Warm"],
  categories: ["save-the-date", "engagement"],
  communities: ["modern"],
  poster: "spread",
  fonts: { display: "var(--f-playfair)", script: "var(--f-caveat)", body: "var(--f-inter)" },
  palettes: [
    { id: "paper", name: "Kraft Paper", ink: "#33291F", soft: "#8A7765", accent: "#C7603C", bg: "#F3E9DA", bg2: "#E2D2BB", line: "#B99C76" },
    { id: "mint", name: "Mint Pop", ink: "#17332E", soft: "#5E8178", accent: "#E0785A", bg: "#EDF6F2", bg2: "#D6E9E1", line: "#8FBDAF" },
    { id: "slate", name: "Slate", ink: "#1C2430", soft: "#6F7D8C", accent: "#E6B655", bg: "#EEF1F4", bg2: "#DBE1E8", line: "#9BA9B8" },
    { id: "dusk", name: "Dusk", ink: "#F0E9F2", soft: "#A897B0", accent: "#F0A868", bg: "#241B2E", bg2: "#17101F", line: "#6B5878" },
  ],
  thumb: (p) => (
    <div style={{ width: "100%", height: "100%", background: p.bg, display: "grid", placeItems: "center" }}>
      <div style={{ display: "flex", gap: 3 }}>
        {[-8, 4, -3].map((r, i) => (
          <div key={i} style={{ width: 16, height: 20, background: "#fff", border: "1px solid " + p.line, transform: "rotate(" + r + "deg)", padding: 2 }}>
            <div style={{ width: "100%", height: "70%", background: i === 1 ? p.accent : p.bg2 }} />
          </div>
        ))}
      </div>
    </div>
  ),
  groups: [
    {
      title: "The couple",
      fields: [
        { key: "nameA", type: "text", label: "First name", placeholder: "Riya", max: 20 },
        { key: "nameB", type: "text", label: "Second name", placeholder: "Karan", max: 20 },
        { key: "kicker", type: "text", label: "Opening line", placeholder: "It's finally happening!", max: 40 },
      ],
    },
    {
      title: "Photos",
      fields: [
        { key: "photos", type: "gallery", label: "Scrapbook photos", min: 1, max: 8, hint: "3–6 works best. Order = order on screen." },
        { key: "caption1", type: "text", label: "Caption 1", placeholder: "the day we met", max: 28 },
        { key: "caption2", type: "text", label: "Caption 2", placeholder: "the proposal", max: 28 },
        { key: "caption3", type: "text", label: "Caption 3", placeholder: "forever starts now", max: 28 },
      ],
    },
    {
      title: "When & where",
      fields: [
        { key: "weddingDate", type: "date", label: "Wedding date" },
        { key: "weddingTime", type: "time", label: "Ceremony time" },
        { key: "venueName", type: "text", label: "Venue", placeholder: "The Old Granary", max: 36 },
        { key: "venueCity", type: "text", label: "City", placeholder: "Goa", max: 30 },
      ],
    },
    {
      title: "Sign-off",
      fields: [
        { key: "closingLine", type: "text", label: "Closing", placeholder: "Come celebrate with us", max: 34 },
        { key: "rsvpLine", type: "text", label: "RSVP", placeholder: "rsvp · +91 98765 43210", max: 40 },
      ],
    },
  ],
  defaults: {
    nameA: "Riya",
    nameB: "Karan",
    kicker: "It's finally happening!",
    photos: [],
    caption1: "the day we met",
    caption2: "the proposal",
    caption3: "forever starts now",
    weddingDate: "2026-02-14",
    weddingTime: "11:00",
    venueName: "The Old Granary",
    venueCity: "Goa",
    closingLine: "Come celebrate with us",
    rsvpLine: "rsvp · +91 98765 43210",
  },

  backdrop: ({ theme }) => (
    <>
      <div style={{ position: "absolute", inset: 0, background: theme.bg }} />
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.55,
          background:
            "radial-gradient(circle at 20% 15%," + theme.bg2 + " 0%, transparent 50%)," +
            "radial-gradient(circle at 80% 85%," + theme.bg2 + " 0%, transparent 50%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.08,
          backgroundImage:
            "radial-gradient(" + theme.ink + " 1px, transparent 1px)",
          backgroundSize: "7px 7px",
        }}
      />
    </>
  ),

  build: (data, orientation, theme) => {
    const vertical = orientation === "vertical";
    const S = function <T>(v: T, h: T): T {
      return vertical ? v : h;
    };
    const d = dateParts(data.weddingDate);
    const time = prettyTime(data.weddingTime);
    const photos: any[] = (Array.isArray(data.photos) ? data.photos : []).filter(Boolean);
    const pick = (i: number) => photos[i % Math.max(photos.length, 1)];
    const captions = [data.caption1, data.caption2, data.caption3].filter(Boolean);

    /** One polaroid: white border, tape, rotation, drop-in. */
    const Card = ({
      t,
      dur,
      src,
      caption,
      start,
      rotate,
      w,
      h,
      tapeRotate = -7,
    }: {
      t: number;
      dur: number;
      src?: string;
      caption?: string;
      start: number;
      rotate: number;
      w: number;
      h: number;
      tapeRotate?: number;
    }) => {
      const p = tw(t, start, 1000, E.outBack);
      return (
        <div
          style={{
            position: "relative",
            background: "#fff",
            padding: S(22, 18),
            paddingBottom: caption ? S(78, 64) : S(22, 18),
            boxShadow: "0 24px 50px rgba(0,0,0,0.22)",
            transform:
              "rotate(" + mix(p, rotate * 2.4, rotate).toFixed(2) + "deg) translate3d(0," + mix(p, -70, 0).toFixed(1) + "px,0) scale(" + mix(p, 0.86, 1).toFixed(3) + ")",
            opacity: Math.min(1, tw(t, start, 400, E.outCubic) * 1.3),
          }}
        >
          <div style={{ position: "absolute", top: S(-16, -13), left: "50%", transform: "translateX(-50%)" }}>
            <Tape rotate={tapeRotate} w={S(140, 118)} h={S(38, 32)} color={theme.accent + "66"} />
          </div>
          <Photo src={src} t={t} d={dur} theme={theme} from={1.02} to={1.1} style={{ width: w, height: h }} />
          {caption ? (
            <div
              style={{
                position: "absolute",
                bottom: S(18, 14),
                left: 0,
                right: 0,
                textAlign: "center",
                fontFamily: theme.fontScript,
                color: "#3A3A3A",
                fontSize: S(42, 36),
                opacity: tw(t, start + 500, 700),
              }}
            >
              {caption}
            </div>
          ) : null}
        </div>
      );
    };

    return [
      /* 1 — Opening */
      {
        id: "open",
        label: "Opening",
        duration: 4000,
        in: { kind: "fade", dur: 600 },
        out: { kind: "slide-up", dur: 700 },
        render: ({ t }) => (
          <Layer>
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  fontFamily: theme.fontScript,
                  color: theme.accent,
                  fontSize: S(80, 86),
                  transform: "rotate(-3deg)",
                  ...rise(t, { start: 300, dur: 1000, dist: 30 }),
                }}
              >
                {data.kicker}
              </div>
              <div style={{ marginTop: S(50, 36) }}>
                <WordsUp
                  text={(data.nameA || "") + " & " + (data.nameB || "")}
                  t={t}
                  start={900}
                  step={140}
                  style={{
                    fontFamily: theme.fontDisplay,
                    color: theme.ink,
                    fontSize: S(140, 150),
                    letterSpacing: "-0.01em",
                    lineHeight: 1.1,
                  }}
                />
              </div>
              <div style={{ display: "grid", placeItems: "center", marginTop: S(44, 32) }}>
                <Rule t={t} start={1900} width={S(280, 280)} color={theme.line} thickness={2} />
              </div>
              <div
                style={{
                  fontFamily: theme.fontBody,
                  color: theme.soft,
                  fontSize: S(38, 34),
                  letterSpacing: "0.36em",
                  textTransform: "uppercase",
                  marginTop: S(38, 28),
                  ...fade(t, { start: 2300, dur: 900 }),
                }}
              >
                are getting married
              </div>
            </div>
          </Layer>
        ),
      },

      /* 2 — Scrapbook spread */
      {
        id: "spread",
        label: "Photo spread",
        duration: 5600,
        in: { kind: "fade", dur: 600 },
        out: { kind: "fade", dur: 700 },
        render: ({ t, d: dur }) =>
          vertical ? (
            /* Tall frame: a staggered zig-zag down the page, overlapping only at the corners */
            <Layer center={false}>
              <div style={{ position: "absolute", top: 150, left: 70 }}>
                <Card t={t} dur={dur} src={pick(0)?.src} caption={captions[0]} start={300} rotate={-6} w={500} h={500} tapeRotate={-9} />
              </div>
              <div style={{ position: "absolute", top: 690, right: 70 }}>
                <Card t={t} dur={dur} src={pick(1)?.src} caption={captions[1]} start={800} rotate={5} w={500} h={500} tapeRotate={6} />
              </div>
              <div style={{ position: "absolute", top: 1230, left: 110 }}>
                <Card t={t} dur={dur} src={pick(2)?.src} caption={captions[2]} start={1300} rotate={-3} w={500} h={430} tapeRotate={-5} />
              </div>
            </Layer>
          ) : (
            <Layer>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 50 }}>
                <Card t={t} dur={dur} src={pick(0)?.src} caption={captions[0]} start={300} rotate={-6} w={460} h={520} tapeRotate={-9} />
                <Card t={t} dur={dur} src={pick(1)?.src} caption={captions[1]} start={800} rotate={5} w={460} h={520} tapeRotate={6} />
                <Card t={t} dur={dur} src={pick(2)?.src} caption={captions[2]} start={1300} rotate={-4} w={460} h={520} tapeRotate={-5} />
              </div>
            </Layer>
          ),
      },

      /* 3 — Date, stamped */
      {
        id: "date",
        label: "Date",
        duration: 4400,
        in: { kind: "zoom-out", dur: 700 },
        out: { kind: "fade", dur: 700 },
        render: ({ t }) => {
          const stamp = tw(t, 600, 700, E.outBack);
          return (
            <Layer>
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    fontFamily: theme.fontBody,
                    color: theme.soft,
                    fontSize: S(36, 32),
                    letterSpacing: "0.44em",
                    textTransform: "uppercase",
                    ...fade(t, { start: 150, dur: 700 }),
                  }}
                >
                  mark your calendar
                </div>
                <div
                  style={{
                    marginTop: S(44, 32),
                    display: "inline-block",
                    border: S(5, 4) + "px solid " + theme.accent,
                    borderRadius: 10,
                    padding: S("28px 54px", "22px 46px"),
                    transform: "rotate(-4deg) scale(" + mix(stamp, 1.5, 1).toFixed(3) + ")",
                    opacity: tw(t, 600, 350),
                  }}
                >
                  <div
                    style={{
                      fontFamily: theme.fontDisplay,
                      color: theme.accent,
                      fontSize: S(132, 152),
                      lineHeight: 1,
                      letterSpacing: "0.02em",
                    }}
                  >
                    {d.day} {d.monthShort}
                  </div>
                  <div
                    style={{
                      fontFamily: theme.fontBody,
                      color: theme.accent,
                      fontSize: S(40, 44),
                      letterSpacing: "0.42em",
                      marginTop: S(10, 8),
                    }}
                  >
                    {d.year}
                  </div>
                </div>
                <div
                  style={{
                    fontFamily: theme.fontScript,
                    color: theme.ink,
                    fontSize: S(58, 66),
                    marginTop: S(52, 38),
                    ...rise(t, { start: 1500, dur: 1000, dist: 22 }),
                  }}
                >
                  {d.weekday}
                  {time ? " · " + time : ""}
                </div>
              </div>
            </Layer>
          );
        },
      },

      /* 4 — Venue */
      {
        id: "venue",
        label: "Venue",
        duration: 4200,
        in: { kind: "slide-left", dur: 700 },
        out: { kind: "fade", dur: 700 },
        render: ({ t, d: dur }) => (
          <Layer>
            <div style={{ display: "flex", flexDirection: vertical ? "column" : "row", alignItems: "center", gap: S(56, 90) }}>
              <Card t={t} dur={dur} src={pick(3)?.src} start={200} rotate={-5} w={S(460, 420)} h={S(460, 420)} />
              <div style={{ textAlign: vertical ? "center" : "left" }}>
                <div
                  style={{
                    fontFamily: theme.fontBody,
                    color: theme.soft,
                    fontSize: S(36, 32),
                    letterSpacing: "0.4em",
                    textTransform: "uppercase",
                    ...fade(t, { start: 700, dur: 800 }),
                  }}
                >
                  the place
                </div>
                <div style={{ marginTop: S(22, 18) }}>
                  <WordsUp
                    text={data.venueName || ""}
                    t={t}
                    start={1000}
                    step={120}
                    justify={vertical ? "center" : "flex-start"}
                    style={{ fontFamily: theme.fontDisplay, color: theme.ink, fontSize: S(76, 98), lineHeight: 1.16 }}
                  />
                </div>
                <div
                  style={{
                    fontFamily: theme.fontScript,
                    color: theme.accent,
                    fontSize: S(56, 66),
                    marginTop: S(18, 14),
                    ...rise(t, { start: 1700, dur: 900, dist: 18 }),
                  }}
                >
                  {data.venueCity}
                </div>
              </div>
            </div>
          </Layer>
        ),
      },

      /* 5 — Closing */
      {
        id: "close",
        label: "Closing",
        duration: 4800,
        in: { kind: "fade", dur: 700 },
        render: ({ t, d: dur }) => (
          <Layer>
            <div style={{ position: "absolute", top: S(170, 60), transform: "rotate(4deg)" }}>
              <Card t={t} dur={dur} src={pick(4)?.src} start={200} rotate={4} w={S(360, 320)} h={S(250, 220)} />
            </div>
            <div style={{ textAlign: "center", marginTop: S(220, 120) }}>
              <Reveal>
                <span
                  style={{
                    fontFamily: theme.fontScript,
                    color: theme.ink,
                    fontSize: S(96, 112),
                    display: "block",
                    lineHeight: 1.25,
                    ...maskUp(t, { start: 800, dur: 1300 }),
                  }}
                >
                  {data.closingLine}
                </span>
              </Reveal>
              <div
                style={{
                  fontFamily: theme.fontDisplay,
                  color: theme.accent,
                  fontSize: S(46, 54),
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  marginTop: S(40, 30),
                  ...rise(t, { start: 1700, dur: 1000, dist: 20 }),
                }}
              >
                {data.nameA} &amp; {data.nameB}
              </div>
              {data.rsvpLine ? (
                <div
                  style={{
                    fontFamily: theme.fontBody,
                    color: theme.soft,
                    fontSize: S(36, 32),
                    letterSpacing: "0.2em",
                    marginTop: S(32, 24),
                    ...fade(t, { start: 2400, dur: 1000 }),
                  }}
                >
                  {data.rsvpLine}
                </div>
              ) : null}
            </div>
          </Layer>
        ),
      },
    ] as Scene[];
  },
};
