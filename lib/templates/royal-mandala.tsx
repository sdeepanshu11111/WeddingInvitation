import React from "react";
import type { Scene, TemplateDef } from "../types";
import { clamp, drawPath, E, fade, mix, pop, rise, tw } from "../anim";
import { Corner, DiamondRule, Layer, Mandala, Particles, Photo, Reveal, WordsUp, dateParts, prettyTime } from "@/components/primitives";
import { maskUp } from "../anim";

/* Royal Mandala — traditional Indian wedding card, gold on deep ground. */

export const royalMandala: TemplateDef = {
  id: "royal-mandala",
  name: "Royal Mandala",
  tagline: "Traditional Indian card — gold filigree, mandala, Devanagari header",
  tags: ["Traditional", "Indian", "Gold"],
  categories: ["wedding"],
  communities: ["hindu"],
  poster: "names",
  fonts: { display: "var(--f-cinzel)", script: "var(--f-vibes)", body: "var(--f-cormorant)" },
  palettes: [
    { id: "maroon", name: "Maroon & Gold", ink: "#F6E7C4", soft: "#D8B98A", accent: "#E8C178", bg: "#4A0E18", bg2: "#2C060D", line: "#C9A227" },
    { id: "emerald", name: "Emerald & Gold", ink: "#F3EBD6", soft: "#CBBE98", accent: "#E3C87E", bg: "#0C3A2E", bg2: "#05201A", line: "#BFA14A" },
    { id: "ivory", name: "Ivory & Rust", ink: "#4A2317", soft: "#8A5C3F", accent: "#B4612C", bg: "#F7EFE2", bg2: "#EADCC6", line: "#B4612C" },
    { id: "midnight", name: "Midnight & Rose Gold", ink: "#EFE3DD", soft: "#C3A69C", accent: "#D99A7C", bg: "#16131F", bg2: "#0A0810", line: "#C98B6B" },
  ],
  thumb: (p) => (
    <div style={{ width: "100%", height: "100%", background: "radial-gradient(circle at 50% 35%," + p.bg + "," + p.bg2 + ")", display: "grid", placeItems: "center" }}>
      <svg width="46" height="46" viewBox="0 0 100 100">
        <g stroke={p.accent} fill="none" strokeWidth="1.4">
          <circle cx="50" cy="50" r="34" />
          <circle cx="50" cy="50" r="20" strokeDasharray="2 4" />
          {Array.from({ length: 8 }).map((_, i) => (
            <path key={i} d="M50 16 C56 26, 56 32, 50 40 C44 32, 44 26, 50 16 Z" transform={"rotate(" + i * 45 + " 50 50)"} />
          ))}
        </g>
      </svg>
    </div>
  ),
  groups: [
    {
      title: "The couple",
      fields: [
        { key: "groomName", type: "text", label: "Groom's name", placeholder: "Aarav", max: 22 },
        { key: "brideName", type: "text", label: "Bride's name", placeholder: "Ananya", max: 22 },
        { key: "joiner", type: "select", label: "Joined by", options: [
          { value: "&", label: "&  (ampersand)" },
          { value: "weds", label: "weds" },
          { value: "विवाह", label: "विवाह" },
          { value: "♥", label: "♥" },
        ] },
      ],
    },
    {
      title: "Header",
      fields: [
        { key: "headerDeva", type: "text", label: "Devanagari header", placeholder: "॥ शुभ विवाह ॥", max: 28, hint: "Leave blank to hide" },
        { key: "kicker", type: "text", label: "Kicker line", placeholder: "Together with their families", max: 46 },
        { key: "hostLine", type: "textarea", label: "Hosted by", placeholder: "Mr. & Mrs. Sharma\nMr. & Mrs. Verma", max: 120, hint: "One family per line" },
      ],
    },
    {
      title: "When & where",
      fields: [
        { key: "weddingDate", type: "date", label: "Wedding date" },
        { key: "weddingTime", type: "time", label: "Ceremony time" },
        { key: "venueName", type: "text", label: "Venue", placeholder: "The Leela Palace", max: 40 },
        { key: "venueAddress", type: "textarea", label: "Address", placeholder: "Diplomatic Enclave, Chanakyapuri\nNew Delhi", max: 110 },
      ],
    },
    {
      title: "Photos & sign-off",
      fields: [
        { key: "coupleImage", type: "image", label: "Couple photo", ratio: "3 / 4", hint: "Portrait crops best" },
        { key: "closingLine", type: "text", label: "Closing line", placeholder: "Save the Date", max: 30 },
        { key: "hashtag", type: "text", label: "Hashtag / RSVP", placeholder: "#AaravWedsAnanya", max: 36 },
      ],
    },
  ],
  defaults: {
    groomName: "Aarav",
    brideName: "Ananya",
    joiner: "weds",
    headerDeva: "॥ शुभ विवाह ॥",
    kicker: "Together with their families",
    hostLine: "Mr. & Mrs. Rajesh Sharma\nMr. & Mrs. Vikram Verma",
    weddingDate: "2026-12-09",
    weddingTime: "19:30",
    venueName: "The Leela Palace",
    venueAddress: "Diplomatic Enclave, Chanakyapuri\nNew Delhi",
    coupleImage: null,
    closingLine: "Save the Date",
    hashtag: "#AaravWedsAnanya",
  },

  backdrop: ({ T, theme, W, H }) => (
    <>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(ellipse at 50% 30%, " + theme.bg + " 0%, " + theme.bg2 + " 72%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.1,
          backgroundImage:
            "repeating-linear-gradient(45deg, transparent 0 22px, " + theme.line + "22 22px 23px)," +
            "repeating-linear-gradient(-45deg, transparent 0 22px, " + theme.line + "18 22px 23px)",
        }}
      />
      <Particles t={T} color={theme.accent} W={W} H={H} count={22} size={4} opacity={0.28} />
    </>
  ),

  build: (data, orientation, theme) => {
    const vertical = orientation === "vertical";
    const d = dateParts(data.weddingDate);
    const time = prettyTime(data.weddingTime);
    const S = function <T>(v: T, h: T): T {
      return vertical ? v : h;
    };

    const frame = (t: number, start = 0) => (
      <>
        <div style={{ position: "absolute", top: S(70, 44), left: S(70, 90) }}>
          <Corner t={t} color={theme.line} start={start} size={S(170, 150)} />
        </div>
        <div style={{ position: "absolute", top: S(70, 44), right: S(70, 90) }}>
          <Corner t={t} color={theme.line} start={start + 120} size={S(170, 150)} rotate={90} />
        </div>
        <div style={{ position: "absolute", bottom: S(70, 44), right: S(70, 90) }}>
          <Corner t={t} color={theme.line} start={start + 240} size={S(170, 150)} rotate={180} />
        </div>
        <div style={{ position: "absolute", bottom: S(70, 44), left: S(70, 90) }}>
          <Corner t={t} color={theme.line} start={start + 360} size={S(170, 150)} rotate={270} />
        </div>
      </>
    );

    const scenes: Scene[] = [
      /* 1 — Opening ------------------------------------------------ */
      {
        id: "open",
        label: "Opening",
        duration: 4600,
        in: { kind: "fade", dur: 700 },
        out: { kind: "zoom-in", dur: 800 },
        render: ({ t }) => (
          <>
            {frame(t, 200)}
            <Layer>
              <div style={{ position: "absolute", display: "grid", placeItems: "center" }}>
                <Mandala t={t} color={theme.line} size={S(760, 620)} start={100} opacity={0.42} />
              </div>
              <div style={{ textAlign: "center", position: "relative" }}>
                {data.headerDeva ? (
                  <div
                    style={{
                      fontFamily: "var(--f-devanagari)",
                      color: theme.accent,
                      fontSize: S(52, 44),
                      letterSpacing: "0.04em",
                      marginBottom: S(34, 26),
                      ...rise(t, { start: 900, dur: 1100 }),
                    }}
                  >
                    {data.headerDeva}
                  </div>
                ) : null}
                <Reveal wrapStyle={{ marginBottom: S(26, 20) }}>
                  <span
                    style={{
                      fontFamily: theme.fontDisplay,
                      color: theme.ink,
                      fontSize: S(70, 58),
                      letterSpacing: "0.26em",
                      textTransform: "uppercase",
                      display: "block",
                      ...maskUp(t, { start: 1250, dur: 1200 }),
                    }}
                  >
                    Wedding
                  </span>
                </Reveal>
                <Reveal>
                  <span
                    style={{
                      fontFamily: theme.fontDisplay,
                      color: theme.ink,
                      fontSize: S(70, 58),
                      letterSpacing: "0.26em",
                      textTransform: "uppercase",
                      display: "block",
                      ...maskUp(t, { start: 1400, dur: 1200 }),
                    }}
                  >
                    Invitation
                  </span>
                </Reveal>
                <div style={{ display: "grid", placeItems: "center", marginTop: S(40, 30) }}>
                  <DiamondRule t={t} start={2000} width={S(360, 320)} color={theme.line} />
                </div>
                <div
                  style={{
                    fontFamily: theme.fontBody,
                    color: theme.soft,
                    fontSize: S(36, 30),
                    letterSpacing: "0.12em",
                    marginTop: S(36, 26),
                    fontStyle: "italic",
                    ...fade(t, { start: 2500, dur: 900 }),
                  }}
                >
                  {data.kicker}
                </div>
              </div>
            </Layer>
          </>
        ),
      },

      /* 2 — Hosts -------------------------------------------------- */
      {
        id: "hosts",
        label: "Families",
        duration: 4200,
        in: { kind: "fade", dur: 800 },
        out: { kind: "wipe-up", dur: 800 },
        render: ({ t }) => {
          const lines = String(data.hostLine || "").split("\n").filter(Boolean);
          return (
            <Layer>
              <div style={{ textAlign: "center", maxWidth: S(820, 1100) }}>
                <div
                  style={{
                    fontFamily: theme.fontBody,
                    color: theme.soft,
                    fontSize: S(32, 28),
                    letterSpacing: "0.3em",
                    textTransform: "uppercase",
                    marginBottom: S(52, 40),
                    ...fade(t, { start: 200, dur: 800 }),
                  }}
                >
                  With the blessings of
                </div>
                {lines.map((l, i) => (
                  <div key={i} style={{ marginBottom: S(28, 20) }}>
                    <Reveal>
                      <span
                        style={{
                          fontFamily: theme.fontDisplay,
                          color: theme.ink,
                          fontSize: S(50, 56),
                          letterSpacing: "0.06em",
                          display: "block",
                          ...maskUp(t, { start: 600 + i * 220, dur: 1100 }),
                        }}
                      >
                        {l}
                      </span>
                    </Reveal>
                  </div>
                ))}
                <div style={{ display: "grid", placeItems: "center", marginTop: S(50, 36) }}>
                  <DiamondRule t={t} start={1400} width={S(300, 280)} color={theme.line} />
                </div>
                <div
                  style={{
                    fontFamily: theme.fontBody,
                    color: theme.soft,
                    fontSize: S(34, 28),
                    fontStyle: "italic",
                    marginTop: S(34, 26),
                    ...fade(t, { start: 1900, dur: 900 }),
                  }}
                >
                  request the honour of your presence
                </div>
              </div>
            </Layer>
          );
        },
      },

      /* 3 — Names -------------------------------------------------- */
      {
        id: "names",
        label: "The names",
        duration: 5400,
        in: { kind: "fade", dur: 800 },
        out: { kind: "fade", dur: 800 },
        render: ({ t }) => (
          <>
            {frame(t, 0)}
            <Layer>
              <div style={{ position: "absolute", display: "grid", placeItems: "center", opacity: 0.6 }}>
                <Mandala t={t} color={theme.line} size={S(900, 740)} start={0} spin={-8} opacity={0.22} />
              </div>
              <div style={{ textAlign: "center", position: "relative", display: "flex", flexDirection: vertical ? "column" : "row", alignItems: "center", gap: S(0, 56) }}>
                <Reveal>
                  <span
                    style={{
                      fontFamily: theme.fontScript,
                      color: theme.ink,
                      fontSize: S(140, 128),
                      lineHeight: 1.15,
                      display: "block",
                      ...maskUp(t, { start: 400, dur: 1300 }),
                    }}
                  >
                    {data.groomName || "Groom"}
                  </span>
                </Reveal>
                <div
                  style={{
                    fontFamily: data.joiner === "विवाह" ? "var(--f-devanagari)" : theme.fontDisplay,
                    color: theme.accent,
                    fontSize: S(46, 40),
                    letterSpacing: data.joiner === "&" ? "0" : "0.3em",
                    textTransform: data.joiner === "weds" ? "uppercase" : "none",
                    margin: vertical ? S(26, 0) + "px 0" : 0,
                    ...pop(t, { start: 1100, dur: 900 }),
                  }}
                >
                  {data.joiner || "&"}
                </div>
                <Reveal>
                  <span
                    style={{
                      fontFamily: theme.fontScript,
                      color: theme.ink,
                      fontSize: S(140, 128),
                      lineHeight: 1.15,
                      display: "block",
                      ...maskUp(t, { start: 1500, dur: 1300 }),
                    }}
                  >
                    {data.brideName || "Bride"}
                  </span>
                </Reveal>
              </div>
              <div style={{ position: "absolute", bottom: S(360, 190), display: "grid", placeItems: "center", gap: 24 }}>
                <DiamondRule t={t} start={2600} width={S(420, 460)} color={theme.line} />
              </div>
            </Layer>
          </>
        ),
      },

      /* 4 — Photo -------------------------------------------------- */
      {
        id: "photo",
        label: "Couple photo",
        duration: 4800,
        in: { kind: "iris", dur: 900 },
        out: { kind: "fade", dur: 800 },
        render: ({ t, d: dur }) => (
          <Layer>
            <div style={{ position: "relative", display: "grid", placeItems: "center", ...fade(t, { start: 0, dur: 600 }) }}>
              <div
                style={{
                  width: S(720, 560),
                  height: S(980, 760),
                  borderRadius: S(360, 280) + "px " + S(360, 280) + "px 24px 24px",
                  padding: 10,
                  background: "linear-gradient(160deg," + theme.accent + "," + theme.line + "66," + theme.accent + ")",
                  boxShadow: "0 40px 100px rgba(0,0,0,0.45)",
                  transform: "scale(" + mix(tw(t, 0, 1400, E.outExpo), 0.92, 1).toFixed(4) + ")",
                }}
              >
                <Photo
                  src={data.coupleImage?.src}
                  t={t}
                  d={dur}
                  theme={theme}
                  from={1.08}
                  to={1.2}
                  panY={-2}
                  style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: S(352, 272) + "px " + S(352, 272) + "px 16px 16px",
                  }}
                />
              </div>
              <div
                style={{
                  position: "absolute",
                  bottom: S(-74, -62),
                  background: theme.bg2,
                  border: "1px solid " + theme.line,
                  padding: S("16px 48px", "13px 40px"),
                  fontFamily: theme.fontDisplay,
                  color: theme.accent,
                  fontSize: S(32, 27),
                  letterSpacing: "0.26em",
                  textTransform: "uppercase",
                  whiteSpace: "nowrap",
                  ...rise(t, { start: 1200, dur: 1000, dist: 24 }),
                }}
              >
                {data.groomName} &nbsp;·&nbsp; {data.brideName}
              </div>
            </div>
          </Layer>
        ),
      },

      /* 5 — Date --------------------------------------------------- */
      {
        id: "date",
        label: "Date & time",
        duration: 4600,
        in: { kind: "slide-up", dur: 850 },
        out: { kind: "fade", dur: 800 },
        render: ({ t }) => (
          <>
            {frame(t, 100)}
            <Layer>
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    fontFamily: theme.fontBody,
                    color: theme.soft,
                    fontSize: S(34, 28),
                    letterSpacing: "0.34em",
                    textTransform: "uppercase",
                    ...fade(t, { start: 200, dur: 700 }),
                  }}
                >
                  {d.weekday}
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: S(34, 30),
                    margin: S(30, 22) + "px 0",
                  }}
                >
                  <div style={{ height: 1, width: S(130, 150) * tw(t, 500, 900, E.inOutCubic), background: theme.line }} />
                  <Reveal>
                    <span
                      style={{
                        fontFamily: theme.fontDisplay,
                        color: theme.accent,
                        fontSize: S(190, 168),
                        lineHeight: 1,
                        display: "block",
                        ...maskUp(t, { start: 450, dur: 1300 }),
                      }}
                    >
                      {d.day}
                    </span>
                  </Reveal>
                  <div style={{ height: 1, width: S(130, 150) * tw(t, 500, 900, E.inOutCubic), background: theme.line }} />
                </div>
                <Reveal>
                  <span
                    style={{
                      fontFamily: theme.fontDisplay,
                      color: theme.ink,
                      fontSize: S(62, 54),
                      letterSpacing: "0.2em",
                      textTransform: "uppercase",
                      display: "block",
                      ...maskUp(t, { start: 900, dur: 1200 }),
                    }}
                  >
                    {d.month} {d.year}
                  </span>
                </Reveal>
                {time ? (
                  <div
                    style={{
                      fontFamily: theme.fontBody,
                      color: theme.soft,
                      fontSize: S(38, 32),
                      letterSpacing: "0.2em",
                      marginTop: S(46, 34),
                      ...rise(t, { start: 1700, dur: 1000, dist: 22 }),
                    }}
                  >
                    Ceremony at {time}
                  </div>
                ) : null}
              </div>
            </Layer>
          </>
        ),
      },

      /* 6 — Venue -------------------------------------------------- */
      {
        id: "venue",
        label: "Venue",
        duration: 4400,
        in: { kind: "fade", dur: 800 },
        out: { kind: "fade", dur: 900 },
        render: ({ t }) => (
          <Layer>
            <div style={{ textAlign: "center", maxWidth: S(860, 1180) }}>
              <div
                style={{
                  fontFamily: theme.fontBody,
                  color: theme.soft,
                  fontSize: S(32, 27),
                  letterSpacing: "0.34em",
                  textTransform: "uppercase",
                  marginBottom: S(40, 30),
                  ...fade(t, { start: 150, dur: 800 }),
                }}
              >
                at
              </div>
              <WordsUp
                text={data.venueName || ""}
                t={t}
                start={500}
                step={120}
                style={{
                  fontFamily: theme.fontDisplay,
                  color: theme.ink,
                  fontSize: S(76, 84),
                  letterSpacing: "0.05em",
                  lineHeight: 1.22,
                }}
              />
              <div style={{ display: "grid", placeItems: "center", margin: S(44, 32) + "px 0" }}>
                <DiamondRule t={t} start={1300} width={S(320, 300)} color={theme.line} />
              </div>
              {String(data.venueAddress || "").split("\n").filter(Boolean).map((l, i) => (
                <div
                  key={i}
                  style={{
                    fontFamily: theme.fontBody,
                    color: theme.soft,
                    fontSize: S(40, 40),
                    lineHeight: 1.6,
                    ...rise(t, { start: 1600 + i * 180, dur: 1000, dist: 18 }),
                  }}
                >
                  {l}
                </div>
              ))}
            </div>
          </Layer>
        ),
      },

      /* 7 — Closing ------------------------------------------------ */
      {
        id: "close",
        label: "Save the date",
        duration: 5200,
        in: { kind: "zoom-out", dur: 900 },
        render: ({ t }) => (
          <>
            {frame(t, 300)}
            <Layer>
              <div style={{ position: "absolute", display: "grid", placeItems: "center" }}>
                <Mandala t={t} color={theme.line} size={S(820, 680)} start={0} spin={10} opacity={0.3} />
              </div>
              <div style={{ textAlign: "center", position: "relative" }}>
                <Reveal>
                  <span
                    style={{
                      fontFamily: theme.fontScript,
                      color: theme.accent,
                      fontSize: S(132, 116),
                      display: "block",
                      lineHeight: 1.25,
                      ...maskUp(t, { start: 400, dur: 1400 }),
                    }}
                  >
                    {data.closingLine || "Save the Date"}
                  </span>
                </Reveal>
                <div style={{ display: "grid", placeItems: "center", marginTop: S(40, 30) }}>
                  <DiamondRule t={t} start={1500} width={S(400, 380)} color={theme.line} />
                </div>
                {data.hashtag ? (
                  <div
                    style={{
                      fontFamily: theme.fontDisplay,
                      color: theme.ink,
                      fontSize: S(40, 40),
                      letterSpacing: "0.22em",
                      marginTop: S(48, 36),
                      ...rise(t, { start: 2100, dur: 1100, dist: 22 }),
                    }}
                  >
                    {data.hashtag}
                  </div>
                ) : null}
              </div>
            </Layer>
          </>
        ),
      },
    ];

    return scenes;
  },
};
