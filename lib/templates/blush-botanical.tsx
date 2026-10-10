import React from "react";
import type { Scene, TemplateDef } from "../types";
import { E, fade, maskUp, mix, pop, rise, tw } from "../anim";
import { DiamondRule, Layer, Petals, Photo, Reveal, Rule, Sprig, WordsUp, dateParts, prettyTime } from "@/components/primitives";

/* Blush Botanical — soft, light, hand-drawn florals. The "pretty" default. */

export const blushBotanical: TemplateDef = {
  id: "blush-botanical",
  name: "Blush Botanical",
  tagline: "Airy and floral — drawn sprigs, falling petals, script names",
  tags: ["Floral", "Light", "Romantic"],
  categories: ["wedding", "save-the-date"],
  communities: ["christian", "modern"],
  poster: "open",
  fonts: { display: "var(--f-marcellus)", script: "var(--f-vibes)", body: "var(--f-cormorant)" },
  palettes: [
    { id: "blush", name: "Blush & Sage", ink: "#4A423C", soft: "#85766A", accent: "#C98B8B", bg: "#FBF6F1", bg2: "#F1E6DD", line: "#A8B49A" },
    { id: "dusty", name: "Dusty Blue", ink: "#2F3A44", soft: "#687786", accent: "#7E9BB5", bg: "#F6F8FA", bg2: "#E4EBF1", line: "#9FB4C4" },
    { id: "terracotta", name: "Terracotta", ink: "#4A2E22", soft: "#9B7259", accent: "#C06A42", bg: "#FAF2EA", bg2: "#F0DFD0", line: "#B08968" },
    { id: "noir", name: "Ink & Olive", ink: "#1E201C", soft: "#5C6055", accent: "#6E7B4E", bg: "#F4F4F0", bg2: "#E5E6DE", line: "#8A9470" },
  ],
  thumb: (p) => (
    <div style={{ width: "100%", height: "100%", background: "linear-gradient(160deg," + p.bg + "," + p.bg2 + ")", display: "grid", placeItems: "center" }}>
      <svg width="40" height="46" viewBox="0 0 100 100">
        <path d="M50 96 C46 70, 50 42, 62 8" stroke={p.line} fill="none" strokeWidth="3" />
        {Array.from({ length: 6 }).map((_, i) => {
          const f = i / 5;
          const side = i % 2 === 0 ? 1 : -1;
          return <ellipse key={i} cx={48 + f * 13 + side * 9} cy={88 - f * 72} rx="9" ry="5" fill={p.accent} transform={"rotate(" + side * 35 + " " + (48 + f * 13) + " " + (88 - f * 72) + ")"} />;
        })}
      </svg>
    </div>
  ),
  groups: [
    {
      title: "The couple",
      fields: [
        { key: "brideName", type: "text", label: "First name", placeholder: "Sophia", max: 20 },
        { key: "groomName", type: "text", label: "Second name", placeholder: "Daniel", max: 20 },
        { key: "kicker", type: "text", label: "Opening line", placeholder: "We're getting married", max: 44 },
      ],
    },
    {
      title: "When & where",
      fields: [
        { key: "weddingDate", type: "date", label: "Wedding date" },
        { key: "weddingTime", type: "time", label: "Ceremony time" },
        { key: "venueName", type: "text", label: "Venue", placeholder: "Villa Serena", max: 38 },
        { key: "venueAddress", type: "textarea", label: "Address", placeholder: "Lake Como\nItaly", max: 100 },
      ],
    },
    {
      title: "Photos",
      fields: [
        { key: "heroImage", type: "image", label: "Hero photo", ratio: "3 / 4" },
        { key: "secondImage", type: "image", label: "Second photo", ratio: "4 / 5", hint: "Shown beside the date" },
      ],
    },
    {
      title: "Sign-off",
      fields: [
        { key: "rsvpLine", type: "text", label: "RSVP line", placeholder: "Kindly RSVP by 1 November", max: 44 },
        { key: "closingLine", type: "text", label: "Closing", placeholder: "Save the Date", max: 26 },
        { key: "showPetals", type: "toggle", label: "Falling petals" },
      ],
    },
  ],
  defaults: {
    brideName: "Sophia",
    groomName: "Daniel",
    kicker: "We're getting married",
    weddingDate: "2026-06-20",
    weddingTime: "16:00",
    venueName: "Villa Serena",
    venueAddress: "Lake Como\nItaly",
    heroImage: null,
    secondImage: null,
    rsvpLine: "Kindly RSVP by 1 November",
    closingLine: "Save the Date",
    showPetals: true,
  },

  backdrop: ({ T, theme, W, H, data }) => (
    <>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(165deg," + theme.bg + " 0%," + theme.bg2 + " 100%)" }} />
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.5,
          background:
            "radial-gradient(circle at 15% 12%, " + theme.accent + "1E 0%, transparent 42%)," +
            "radial-gradient(circle at 85% 88%, " + theme.line + "26 0%, transparent 45%)",
        }}
      />
      {data.showPetals !== false ? <Petals t={T} color={theme.accent} W={W} H={H} count={14} /> : null}
    </>
  ),

  build: (data, orientation, theme) => {
    const vertical = orientation === "vertical";
    const S = function <T>(v: T, h: T): T {
      return vertical ? v : h;
    };
    const d = dateParts(data.weddingDate);
    const time = prettyTime(data.weddingTime);

    return [
      /* 1 — Opening with sprigs opening like curtains */
      {
        id: "open",
        label: "Opening",
        duration: 4600,
        in: { kind: "fade", dur: 700 },
        out: { kind: "blur", dur: 850 },
        render: ({ t }) => (
          <Layer>
            <div style={{ position: "absolute", left: S(-30, 120), top: S(140, 60), transform: "rotate(-14deg)" }}>
              <Sprig t={t} color={theme.line} size={S(420, 380)} start={200} opacity={0.75} />
            </div>
            <div style={{ position: "absolute", right: S(-30, 120), bottom: S(140, 60), transform: "rotate(166deg)" }}>
              <Sprig t={t} color={theme.line} size={S(420, 380)} start={420} opacity={0.75} />
            </div>
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  fontFamily: theme.fontBody,
                  color: theme.soft,
                  fontSize: S(34, 29),
                  letterSpacing: "0.42em",
                  textTransform: "uppercase",
                  ...fade(t, { start: 700, dur: 900 }),
                }}
              >
                {data.kicker}
              </div>
              <div style={{ display: "grid", placeItems: "center", marginTop: S(54, 40) }}>
                <Rule t={t} start={1100} width={S(300, 300)} color={theme.accent} />
              </div>
              <div style={{ marginTop: S(56, 40) }}>
                <Reveal>
                  <span
                    style={{
                      fontFamily: theme.fontScript,
                      color: theme.ink,
                      fontSize: S(176, 150),
                      lineHeight: 1.1,
                      display: "block",
                      ...maskUp(t, { start: 1500, dur: 1500 }),
                    }}
                  >
                    {data.brideName}
                  </span>
                </Reveal>
                <div
                  style={{
                    fontFamily: theme.fontDisplay,
                    color: theme.accent,
                    fontSize: S(42, 48),
                    letterSpacing: "0.4em",
                    textTransform: "uppercase",
                    margin: S(18, 12) + "px 0",
                    ...pop(t, { start: 2100, dur: 800 }),
                  }}
                >
                  and
                </div>
                <Reveal>
                  <span
                    style={{
                      fontFamily: theme.fontScript,
                      color: theme.ink,
                      fontSize: S(176, 150),
                      lineHeight: 1.1,
                      display: "block",
                      ...maskUp(t, { start: 2350, dur: 1500 }),
                    }}
                  >
                    {data.groomName}
                  </span>
                </Reveal>
              </div>
            </div>
          </Layer>
        ),
      },

      /* 2 — Hero photo with a drawn arch */
      {
        id: "hero",
        label: "Hero photo",
        duration: 4600,
        in: { kind: "wipe-up", dur: 900 },
        out: { kind: "fade", dur: 800 },
        render: ({ t, d: dur }) => {
          const arch = tw(t, 100, 1400, E.outExpo);
          return (
            <Layer>
              <div
                style={{
                  display: "flex",
                  flexDirection: vertical ? "column" : "row",
                  alignItems: "center",
                  gap: S(60, 100),
                }}
              >
                <div
                  style={{
                    width: S(700, 520),
                    height: S(920, 720),
                    borderRadius: S(350, 260) + "px " + S(350, 260) + "px 10px 10px",
                    overflow: "hidden",
                    boxShadow: "0 30px 80px " + theme.ink + "22",
                    clipPath: "inset(" + ((1 - arch) * 100).toFixed(1) + "% 0 0 0)",
                  }}
                >
                  <Photo
                    src={data.heroImage?.src}
                    t={t}
                    d={dur}
                    theme={theme}
                    from={1.1}
                    to={1.22}
                    style={{ width: "100%", height: "100%" }}
                  />
                </div>
                <div style={{ textAlign: vertical ? "center" : "left" }}>
                  <div
                    style={{
                      fontFamily: theme.fontBody,
                      color: theme.soft,
                      fontSize: S(32, 34),
                      letterSpacing: "0.36em",
                      textTransform: "uppercase",
                      ...rise(t, { start: 1100, dur: 900, dist: 20 }),
                    }}
                  >
                    together forever
                  </div>
                  <div
                    style={{
                      fontFamily: theme.fontDisplay,
                      color: theme.ink,
                      fontSize: S(56, 84),
                      letterSpacing: "0.1em",
                      marginTop: S(20, 18),
                      ...rise(t, { start: 1350, dur: 1000, dist: 24 }),
                    }}
                  >
                    {data.brideName} &amp; {data.groomName}
                  </div>
                </div>
              </div>
            </Layer>
          );
        },
      },

      /* 3 — Date, split with the second photo in landscape */
      {
        id: "date",
        label: "Date",
        duration: 4800,
        in: { kind: "fade", dur: 800 },
        out: { kind: "fade", dur: 800 },
        render: ({ t, d: dur }) => {
          const dateBlock = (
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  fontFamily: theme.fontBody,
                  color: theme.soft,
                  fontSize: S(32, 34),
                  letterSpacing: "0.4em",
                  textTransform: "uppercase",
                  ...fade(t, { start: 200, dur: 800 }),
                }}
              >
                {d.weekday}
              </div>
              <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "center", gap: S(22, 18), margin: S(26, 20) + "px 0" }}>
                <Reveal>
                  <span
                    style={{
                      fontFamily: theme.fontDisplay,
                      color: theme.accent,
                      fontSize: S(200, 230),
                      lineHeight: 0.92,
                      display: "block",
                      ...maskUp(t, { start: 450, dur: 1300 }),
                    }}
                  >
                    {d.day}
                  </span>
                </Reveal>
                <div style={{ paddingBottom: S(22, 18) }}>
                  <Reveal>
                    <span
                      style={{
                        fontFamily: theme.fontDisplay,
                        color: theme.ink,
                        fontSize: S(54, 64),
                        letterSpacing: "0.14em",
                        textTransform: "uppercase",
                        display: "block",
                        ...maskUp(t, { start: 750, dur: 1200 }),
                      }}
                    >
                      {d.month}
                    </span>
                  </Reveal>
                  <Reveal>
                    <span
                      style={{
                        fontFamily: theme.fontBody,
                        color: theme.soft,
                        fontSize: S(40, 46),
                        letterSpacing: "0.3em",
                        display: "block",
                        ...maskUp(t, { start: 900, dur: 1200 }),
                      }}
                    >
                      {d.year}
                    </span>
                  </Reveal>
                </div>
              </div>
              <div style={{ display: "grid", placeItems: "center" }}>
                <DiamondRule t={t} start={1500} width={S(300, 280)} color={theme.line} />
              </div>
              {time ? (
                <div
                  style={{
                    fontFamily: theme.fontBody,
                    color: theme.ink,
                    fontSize: S(40, 46),
                    letterSpacing: "0.2em",
                    marginTop: S(34, 26),
                    ...rise(t, { start: 1900, dur: 900, dist: 18 }),
                  }}
                >
                  {time}
                </div>
              ) : null}
            </div>
          );

          return (
            <Layer>
              <div style={{ display: "flex", flexDirection: vertical ? "column" : "row", alignItems: "center", gap: S(70, 120) }}>
                <div
                  style={{
                    width: S(560, 480),
                    height: S(700, 620),
                    overflow: "hidden",
                    borderRadius: 8,
                    boxShadow: "0 24px 70px " + theme.ink + "1F",
                    transform: "translate3d(0," + mix(tw(t, 100, 1200, E.outExpo), 40, 0).toFixed(1) + "px,0)",
                    opacity: tw(t, 100, 900),
                  }}
                >
                  <Photo src={data.secondImage?.src} t={t} d={dur} theme={theme} from={1.04} to={1.14} panX={1.5} style={{ width: "100%", height: "100%" }} />
                </div>
                {dateBlock}
              </div>
            </Layer>
          );
        },
      },

      /* 4 — Venue */
      {
        id: "venue",
        label: "Venue",
        duration: 4400,
        in: { kind: "slide-up", dur: 850 },
        out: { kind: "fade", dur: 900 },
        render: ({ t }) => (
          <Layer>
            <div style={{ position: "absolute", top: S(150, 70), display: "grid", placeItems: "center", transform: "rotate(180deg)" }}>
              <Sprig t={t} color={theme.line} size={S(260, 220)} start={300} opacity={0.6} />
            </div>
            <div style={{ textAlign: "center", maxWidth: S(840, 1100) }}>
              <div
                style={{
                  fontFamily: theme.fontBody,
                  color: theme.soft,
                  fontSize: S(32, 34),
                  letterSpacing: "0.42em",
                  textTransform: "uppercase",
                  marginBottom: S(36, 28),
                  ...fade(t, { start: 200, dur: 800 }),
                }}
              >
                Celebrating at
              </div>
              <WordsUp
                text={data.venueName || ""}
                t={t}
                start={600}
                step={130}
                style={{ fontFamily: theme.fontDisplay, color: theme.ink, fontSize: S(86, 112), letterSpacing: "0.04em", lineHeight: 1.2 }}
              />
              <div style={{ marginTop: S(40, 30) }}>
                {String(data.venueAddress || "").split("\n").filter(Boolean).map((l, i) => (
                  <div
                    key={i}
                    style={{
                      fontFamily: theme.fontBody,
                      color: theme.soft,
                      fontSize: S(42, 48),
                      lineHeight: 1.55,
                      ...rise(t, { start: 1500 + i * 180, dur: 1000, dist: 16 }),
                    }}
                  >
                    {l}
                  </div>
                ))}
              </div>
              {data.rsvpLine ? (
                <div
                  style={{
                    fontFamily: theme.fontDisplay,
                    color: theme.accent,
                    fontSize: S(34, 40),
                    letterSpacing: "0.2em",
                    marginTop: S(60, 44),
                    ...fade(t, { start: 2300, dur: 1000 }),
                  }}
                >
                  {data.rsvpLine}
                </div>
              ) : null}
            </div>
          </Layer>
        ),
      },

      /* 5 — Closing */
      {
        id: "close",
        label: "Save the date",
        duration: 5000,
        in: { kind: "iris", dur: 1000 },
        render: ({ t }) => (
          <Layer>
            <div style={{ position: "absolute", left: S(40, 160), bottom: S(120, 40), transform: "rotate(-20deg)" }}>
              <Sprig t={t} color={theme.line} size={S(380, 340)} start={300} opacity={0.5} />
            </div>
            <div style={{ position: "absolute", right: S(40, 160), top: S(120, 40), transform: "rotate(160deg)" }}>
              <Sprig t={t} color={theme.line} size={S(380, 340)} start={500} opacity={0.5} />
            </div>
            <div style={{ textAlign: "center" }}>
              <Reveal>
                <span
                  style={{
                    fontFamily: theme.fontScript,
                    color: theme.accent,
                    fontSize: S(150, 130),
                    display: "block",
                    lineHeight: 1.2,
                    ...maskUp(t, { start: 500, dur: 1500 }),
                  }}
                >
                  {data.closingLine || "Save the Date"}
                </span>
              </Reveal>
              <div style={{ display: "grid", placeItems: "center", marginTop: S(44, 32) }}>
                <Rule t={t} start={1700} width={S(360, 340)} color={theme.line} />
              </div>
              <div
                style={{
                  fontFamily: theme.fontDisplay,
                  color: theme.ink,
                  fontSize: S(40, 46),
                  letterSpacing: "0.28em",
                  textTransform: "uppercase",
                  marginTop: S(44, 32),
                  ...rise(t, { start: 2100, dur: 1100, dist: 20 }),
                }}
              >
                {data.brideName} &nbsp;·&nbsp; {data.groomName}
              </div>
            </div>
          </Layer>
        ),
      },
    ] as Scene[];
  },
};
