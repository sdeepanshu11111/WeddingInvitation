import React from "react";
import type { Scene, TemplateDef } from "../types";
import { E, fade, maskUp, mix, rise, tw } from "../anim";
import { Layer, Photo, Reveal, Rule, dateParts, prettyTime } from "@/components/primitives";

/* Aurora Modern — minimal luxury. Moving gradient light, oversized kinetic type. */

export const auroraModern: TemplateDef = {
  id: "aurora-modern",
  name: "Aurora Modern",
  tagline: "Minimal and bold — drifting colour light, oversized kinetic type",
  tags: ["Modern", "Minimal", "Bold"],
  categories: ["save-the-date", "wedding"],
  communities: ["modern"],
  poster: "names",
  fonts: { display: "var(--f-bodoni)", script: "var(--f-vibes)", body: "var(--f-inter)" },
  palettes: [
    { id: "aurora", name: "Aurora", ink: "#FFFFFF", soft: "#D5D0E8", accent: "#FFD6A5", bg: "#1B1033", bg2: "#3B1D5C", line: "#FFFFFF" },
    { id: "sunset", name: "Sunset", ink: "#FFFFFF", soft: "#FFE3D3", accent: "#FFF1B5", bg: "#C2410C", bg2: "#BE185D", line: "#FFFFFF" },
    { id: "ocean", name: "Ocean", ink: "#F0FDFA", soft: "#B6E3E0", accent: "#FDE68A", bg: "#042F2E", bg2: "#0E4D6B", line: "#F0FDFA" },
    { id: "champagne", name: "Champagne", ink: "#2B2116", soft: "#7A6A55", accent: "#A2783C", bg: "#F6EEE3", bg2: "#EAD7BF", line: "#2B2116" },
  ],
  thumb: (p) => (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "radial-gradient(circle at 25% 30%," + p.bg2 + ",transparent 60%), radial-gradient(circle at 80% 75%," + p.accent + "88,transparent 55%)," + p.bg,
        display: "grid",
        placeItems: "center",
        color: p.ink,
        fontFamily: "var(--f-bodoni)",
        fontSize: 22,
        fontStyle: "italic",
      }}
    >
      &amp;
    </div>
  ),
  groups: [
    {
      title: "The couple",
      fields: [
        { key: "nameA", type: "text", label: "First name", placeholder: "Maya", max: 16, hint: "Short names look boldest" },
        { key: "nameB", type: "text", label: "Second name", placeholder: "Leo", max: 16 },
        { key: "statement", type: "text", label: "Big statement", placeholder: "We said yes.", max: 30 },
      ],
    },
    {
      title: "When & where",
      fields: [
        { key: "weddingDate", type: "date", label: "Wedding date" },
        { key: "weddingTime", type: "time", label: "Ceremony time" },
        { key: "venueName", type: "text", label: "Venue", placeholder: "The Glasshouse", max: 32 },
        { key: "venueCity", type: "text", label: "City", placeholder: "Mumbai", max: 28 },
      ],
    },
    {
      title: "Photo & sign-off",
      fields: [
        { key: "portrait", type: "image", label: "Portrait", ratio: "4 / 5", hint: "Shown in a sliding panel" },
        { key: "dressCode", type: "text", label: "Dress code", placeholder: "Black tie", max: 28 },
        { key: "rsvpLine", type: "text", label: "RSVP", placeholder: "rsvp by 01.11", max: 36 },
      ],
    },
  ],
  defaults: {
    nameA: "Maya",
    nameB: "Leo",
    statement: "We said yes.",
    weddingDate: "2026-11-21",
    weddingTime: "18:30",
    venueName: "The Glasshouse",
    venueCity: "Mumbai",
    portrait: null,
    dressCode: "Black tie",
    rsvpLine: "rsvp by 01.11",
  },

  /* Three soft blobs orbiting slowly — the "aurora". Pure function of T. */
  backdrop: ({ T, theme, W, H }) => {
    const s = T / 1000;
    const blob = (cx: number, cy: number, r: number, color: string, k: number) => {
      const x = cx + Math.sin(s * 0.35 * k + k) * W * 0.12;
      const y = cy + Math.cos(s * 0.28 * k + k * 2) * H * 0.1;
      return (
        <div
          style={{
            position: "absolute",
            left: x - r,
            top: y - r,
            width: r * 2,
            height: r * 2,
            borderRadius: "50%",
            background: "radial-gradient(circle," + color + " 0%, transparent 68%)",
          }}
        />
      );
    };
    const R = Math.max(W, H);
    return (
      <>
        <div style={{ position: "absolute", inset: 0, background: theme.bg }} />
        {blob(W * 0.2, H * 0.25, R * 0.55, theme.bg2, 1)}
        {blob(W * 0.85, H * 0.7, R * 0.5, theme.accent + "55", 1.6)}
        {blob(W * 0.55, H * 0.95, R * 0.45, theme.bg2 + "CC", 0.8)}
      </>
    );
  },

  build: (data, orientation, theme) => {
    const vertical = orientation === "vertical";
    const S = function <T>(v: T, h: T): T {
      return vertical ? v : h;
    };
    const d = dateParts(data.weddingDate);
    const time = prettyTime(data.weddingTime);

    const big = (text: string, t: number, start: number, size: number, extra: React.CSSProperties = {}) => (
      <Reveal>
        <span
          style={{
            fontFamily: theme.fontDisplay,
            color: theme.ink,
            fontSize: size,
            lineHeight: 0.98,
            letterSpacing: "-0.03em",
            display: "block",
            ...maskUp(t, { start, dur: 1300 }),
            ...extra,
          }}
        >
          {text}
        </span>
      </Reveal>
    );

    return [
      /* 1 — Statement */
      {
        id: "statement",
        label: "Statement",
        duration: 3800,
        in: { kind: "fade", dur: 700 },
        out: { kind: "blur", dur: 800 },
        render: ({ t }) => (
          <Layer>
            <div
              style={{
                textAlign: "center",
                padding: "0 70px",
                display: "flex",
                flexDirection: vertical ? "column" : "row",
                flexWrap: "wrap",
                justifyContent: "center",
                columnGap: "0.32em",
                fontSize: S(190, 200),
              }}
            >
              {String(data.statement || "")
                .split(" ")
                .map((w: string, i: number) => (
                  <React.Fragment key={i}>{big(w, t, 300 + i * 160, S(190, 200), { fontStyle: i % 2 ? "italic" : "normal" })}</React.Fragment>
                ))}
            </div>
          </Layer>
        ),
      },

      /* 2 — Names, huge, offset */
      {
        id: "names",
        label: "Names",
        duration: 5000,
        in: { kind: "fade", dur: 700 },
        out: { kind: "slide-left", dur: 900 },
        render: ({ t }) => (
          <Layer center={false} style={{ justifyContent: "center", padding: S("0 80px", "0 160px") }}>
            <div style={{ width: "100%" }}>
              <div style={{ textAlign: "left" }}>{big(data.nameA || "", t, 200, S(230, 220))}</div>
              <div
                style={{
                  textAlign: "center",
                  fontFamily: theme.fontScript,
                  color: theme.accent,
                  fontSize: S(180, 150),
                  lineHeight: 0.9,
                  margin: S("10px 0", "-20px 0"),
                  ...rise(t, { start: 800, dur: 1100, dist: 30 }),
                }}
              >
                &amp;
              </div>
              <div style={{ textAlign: "right" }}>{big(data.nameB || "", t, 1100, S(230, 220), { fontStyle: "italic" })}</div>
              <div style={{ display: "flex", justifyContent: vertical ? "center" : "flex-end", marginTop: S(70, 40) }}>
                <div
                  style={{
                    fontFamily: theme.fontBody,
                    color: theme.soft,
                    fontSize: S(28, 24),
                    letterSpacing: "0.5em",
                    textTransform: "uppercase",
                    ...fade(t, { start: 2000, dur: 900 }),
                  }}
                >
                  are getting married
                </div>
              </div>
            </div>
          </Layer>
        ),
      },

      /* 3 — Portrait panel slides in, date beside it */
      {
        id: "portrait",
        label: "Portrait + date",
        duration: 5400,
        in: { kind: "slide-left", dur: 900 },
        out: { kind: "fade", dur: 800 },
        render: ({ t, d: dur }) => {
          const open = tw(t, 200, 1400, E.inOutExpo);
          const panel = (
            <div
              style={{
                width: S(860, 760),
                height: S(1000, 940),
                overflow: "hidden",
                clipPath: vertical
                  ? "inset(0 0 " + ((1 - open) * 100).toFixed(2) + "% 0)"
                  : "inset(0 " + ((1 - open) * 100).toFixed(2) + "% 0 0)",
                borderRadius: 6,
              }}
            >
              <Photo src={data.portrait?.src} t={t} d={dur} theme={theme} from={1.18} to={1.04} style={{ width: "100%", height: "100%" }} />
            </div>
          );
          return (
            <Layer style={{ flexDirection: vertical ? "column" : "row", gap: S(60, 110) }}>
              {panel}
              <div style={{ textAlign: vertical ? "center" : "left" }}>
                {big(d.day, t, 900, S(220, 260))}
                {big(d.month, t, 1100, S(80, 90), { letterSpacing: "0", fontStyle: "italic" })}
                <div
                  style={{
                    fontFamily: theme.fontBody,
                    color: theme.soft,
                    fontSize: S(30, 28),
                    letterSpacing: "0.44em",
                    marginTop: S(24, 26),
                    ...fade(t, { start: 1700, dur: 900 }),
                  }}
                >
                  {d.year}
                  {time ? " — " + time : ""}
                </div>
              </div>
            </Layer>
          );
        },
      },

      /* 4 — Venue as a list */
      {
        id: "details",
        label: "Details",
        duration: 5000,
        in: { kind: "fade", dur: 800 },
        out: { kind: "zoom-in", dur: 900 },
        render: ({ t }) => {
          const rows: [string, string][] = [
            ["Where", data.venueName || ""],
            ["City", data.venueCity || ""],
            ["When", d.weekday + (time ? ", " + time : "")],
          ];
          if (data.dressCode) rows.push(["Dress", data.dressCode]);
          return (
            <Layer center={false} style={{ justifyContent: "center", padding: S("0 90px", "0 220px") }}>
              <div style={{ width: "100%" }}>
                {rows.map(([k, v], i) => {
                  const st = 200 + i * 260;
                  return (
                    <div key={k} style={{ marginBottom: S(46, 30) }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "baseline",
                          justifyContent: "space-between",
                          gap: 40,
                          paddingBottom: S(22, 16),
                        }}
                      >
                        <span
                          style={{
                            fontFamily: theme.fontBody,
                            color: theme.soft,
                            fontSize: S(26, 24),
                            letterSpacing: "0.4em",
                            textTransform: "uppercase",
                            ...fade(t, { start: st, dur: 700 }),
                          }}
                        >
                          {k}
                        </span>
                        <Reveal>
                          <span
                            style={{
                              fontFamily: theme.fontDisplay,
                              color: theme.ink,
                              fontSize: S(64, 66),
                              display: "block",
                              textAlign: "right",
                              lineHeight: 1.05,
                              ...maskUp(t, { start: st + 100, dur: 1100 }),
                            }}
                          >
                            {v}
                          </span>
                        </Reveal>
                      </div>
                      <Rule t={t} start={st} dur={1100} width={S(900, 1480)} color={theme.line} style={{ opacity: 0.35 }} />
                    </div>
                  );
                })}
              </div>
            </Layer>
          );
        },
      },

      /* 5 — Close */
      {
        id: "close",
        label: "Close",
        duration: 4600,
        in: { kind: "fade", dur: 900 },
        render: ({ t }) => (
          <Layer>
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  fontFamily: theme.fontBody,
                  color: theme.soft,
                  fontSize: S(28, 24),
                  letterSpacing: "0.5em",
                  textTransform: "uppercase",
                  ...fade(t, { start: 200, dur: 800 }),
                }}
              >
                Save the date
              </div>
              <div style={{ marginTop: S(40, 30) }}>
                {big(d.day + "." + String((data.weddingDate || "").slice(5, 7)) + "." + d.year.slice(2), t, 500, S(170, 190))}
              </div>
              <div
                style={{
                  fontFamily: theme.fontScript,
                  color: theme.accent,
                  fontSize: S(96, 86),
                  marginTop: S(30, 20),
                  transform: "scale(" + mix(tw(t, 1300, 1200, E.outBack), 0.8, 1).toFixed(3) + ")",
                  opacity: tw(t, 1300, 700),
                }}
              >
                {data.nameA} &amp; {data.nameB}
              </div>
              {data.rsvpLine ? (
                <div
                  style={{
                    fontFamily: theme.fontBody,
                    color: theme.soft,
                    fontSize: S(26, 23),
                    letterSpacing: "0.34em",
                    textTransform: "uppercase",
                    marginTop: S(40, 28),
                    ...fade(t, { start: 2200, dur: 1000 }),
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
