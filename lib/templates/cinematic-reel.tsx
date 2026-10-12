import React from "react";
import type { Scene, TemplateDef } from "../types";
import { clamp, E, fade, maskUp, mix, rise, tw } from "../anim";
import { Clip, Grain, Layer, Photo, Reveal, Typewriter, dateParts, prettyTime } from "@/components/primitives";

/* Cinematic Reel — dark, letterboxed, film-trailer pacing. Accepts video. */

export const cinematicReel: TemplateDef = {
  id: "cinematic-reel",
  name: "Cinematic Reel",
  tagline: "Film-trailer feel — your own clip, letterbox bars, grain, type-on titles",
  tags: ["Video", "Dark", "Modern"],
  categories: ["save-the-date", "wedding"],
  communities: ["modern"],
  poster: "clip",
  fonts: { display: "var(--f-playfair)", script: "var(--f-vibes)", body: "var(--f-inter)" },
  palettes: [
    { id: "noir", name: "Noir", ink: "#F5F2ED", soft: "#9E9890", accent: "#D9B98C", bg: "#0B0B0C", bg2: "#131315", line: "#5A5248" },
    { id: "sepia", name: "Warm Sepia", ink: "#F6EBDC", soft: "#B29A80", accent: "#E0A567", bg: "#14100C", bg2: "#1E1812", line: "#6B5440" },
    { id: "steel", name: "Cold Steel", ink: "#EAF0F4", soft: "#8C9BA6", accent: "#7FB3D5", bg: "#0A0E12", bg2: "#131A21", line: "#3E5160" },
    { id: "rose", name: "Rose Noir", ink: "#F7EDEF", soft: "#B0959B", accent: "#D98C9E", bg: "#120B0E", bg2: "#1C1114", line: "#5E3E47" },
  ],
  thumb: (p) => (
    <div style={{ width: "100%", height: "100%", background: p.bg, display: "grid", placeItems: "center", position: "relative" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "22%", background: "#000" }} />
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "22%", background: "#000" }} />
      <div style={{ fontFamily: "var(--f-playfair)", color: p.accent, fontSize: 13, letterSpacing: "0.3em" }}>A&nbsp;&amp;&nbsp;B</div>
    </div>
  ),
  groups: [
    {
      title: "Titles",
      fields: [
        { key: "studioLine", type: "text", label: "Opening card", placeholder: "A love story", max: 34 },
        { key: "nameA", type: "text", label: "First name", placeholder: "Isabella", max: 20 },
        { key: "nameB", type: "text", label: "Second name", placeholder: "Mateo", max: 20 },
        { key: "tagline", type: "text", label: "Tagline", placeholder: "Two families. One beginning.", max: 56 },
      ],
    },
    {
      title: "Footage",
      fields: [
        { key: "heroVideo", type: "video", label: "Hero clip", maxSeconds: 20, hint: "Muted and trimmed to the scene length" },
        { key: "clipStart", type: "text", label: "Start the clip at (seconds)", placeholder: "0", max: 5 },
        { key: "montage", type: "gallery", label: "Montage photos", min: 0, max: 6, hint: "Up to 6 — each gets its own beat" },
      ],
    },
    {
      title: "When & where",
      fields: [
        { key: "weddingDate", type: "date", label: "Wedding date" },
        { key: "weddingTime", type: "time", label: "Ceremony time" },
        { key: "venueName", type: "text", label: "Venue", placeholder: "Casa del Mar", max: 36 },
        { key: "venueCity", type: "text", label: "City", placeholder: "Tulum, Mexico", max: 34 },
      ],
    },
    {
      title: "End card",
      fields: [
        { key: "closingLine", type: "text", label: "End card", placeholder: "Save the Date", max: 26 },
        { key: "rsvpLine", type: "text", label: "Small print", placeholder: "rsvp at bellaandmateo.com", max: 44 },
        { key: "letterbox", type: "toggle", label: "Letterbox bars" },
      ],
    },
  ],
  defaults: {
    studioLine: "A love story",
    nameA: "Isabella",
    nameB: "Mateo",
    tagline: "Two families. One beginning.",
    heroVideo: null,
    clipStart: "0",
    montage: [],
    weddingDate: "2026-09-12",
    weddingTime: "17:00",
    venueName: "Casa del Mar",
    venueCity: "Tulum, Mexico",
    closingLine: "Save the Date",
    rsvpLine: "rsvp at bellaandmateo.com",
    letterbox: true,
  },

  backdrop: ({ T, theme, W, H }) => (
    <>
      <div style={{ position: "absolute", inset: 0, background: theme.bg }} />
      <Grain t={T} W={W} H={H} intensity={0.08} />
    </>
  ),

  build: (data, orientation, theme) => {
    const vertical = orientation === "vertical";
    const S = function <T>(v: T, h: T): T {
      return vertical ? v : h;
    };
    const d = dateParts(data.weddingDate);
    const time = prettyTime(data.weddingTime);
    const trim = parseFloat(data.clipStart) || 0;
    const montage: any[] = Array.isArray(data.montage) ? data.montage.filter(Boolean) : [];

    const bars = (t: number) =>
      data.letterbox === false ? null : (
        <>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: S(190, 110) * tw(t, 0, 900, E.outExpo), background: "#000", zIndex: 5 }} />
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: S(190, 110) * tw(t, 0, 900, E.outExpo), background: "#000", zIndex: 5 }} />
        </>
      );

    const scenes: Scene[] = [
      /* 1 — Studio card */
      {
        id: "card",
        label: "Opening card",
        duration: 3600,
        in: { kind: "fade", dur: 600 },
        out: { kind: "fade", dur: 700 },
        render: ({ t }) => (
          <>
            {bars(t)}
            <Layer>
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    fontFamily: theme.fontBody,
                    color: theme.soft,
                    fontSize: S(38, 34),
                    letterSpacing: "0.5em",
                    textTransform: "uppercase",
                    ...fade(t, { start: 400, dur: 1000 }),
                  }}
                >
                  <Typewriter text={data.studioLine || ""} t={t} start={500} cps={13} theme={theme} />
                </div>
                <div
                  style={{
                    width: S(180, 180) * tw(t, 1800, 900, E.inOutCubic),
                    height: 1,
                    background: theme.accent,
                    margin: S(40, 30) + "px auto 0",
                  }}
                />
              </div>
            </Layer>
          </>
        ),
      },

      /* 2 — Hero clip with name supers */
      {
        id: "clip",
        label: "Hero clip",
        duration: 6200,
        in: { kind: "fade", dur: 700 },
        out: { kind: "fade", dur: 900 },
        render: ({ t, d: dur, deterministic, playing }) => (
          <>
            <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
              {data.heroVideo?.src ? (
                <Clip
                  src={data.heroVideo.src}
                  t={t}
                  d={dur}
                  trimStart={trim}
                  deterministic={deterministic}
                  playing={playing}
                  theme={theme}
                  style={{
                    width: "100%",
                    height: "100%",
                    transform: "scale(" + mix(clamp(t / dur), 1.06, 1.14).toFixed(4) + ")",
                    filter: "saturate(0.92) contrast(1.06)",
                  }}
                />
              ) : (
                <Photo src={montage[0]?.src} t={t} d={dur} theme={theme} label="Add a video clip" from={1.08} to={1.2} style={{ width: "100%", height: "100%" }} />
              )}
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.1) 38%, rgba(0,0,0,0.72) 100%)" }} />
            </div>
            {bars(t)}
            <Layer center={false} style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: S(380, 190), zIndex: 6 }}>
              <div style={{ textAlign: "center" }}>
                <Reveal>
                  <span
                    style={{
                      fontFamily: theme.fontDisplay,
                      color: theme.ink,
                      fontSize: S(118, 134),
                      letterSpacing: "0.04em",
                      display: "block",
                      lineHeight: 1.1,
                      textShadow: "0 6px 40px rgba(0,0,0,0.6)",
                      ...maskUp(t, { start: 1400, dur: 1400 }),
                    }}
                  >
                    {data.nameA}
                  </span>
                </Reveal>
                <div
                  style={{
                    fontFamily: theme.fontBody,
                    color: theme.accent,
                    fontSize: S(30, 36),
                    letterSpacing: "0.6em",
                    textTransform: "uppercase",
                    margin: S(22, 16) + "px 0",
                    ...fade(t, { start: 2200, dur: 900 }),
                  }}
                >
                  and
                </div>
                <Reveal>
                  <span
                    style={{
                      fontFamily: theme.fontDisplay,
                      color: theme.ink,
                      fontSize: S(118, 134),
                      letterSpacing: "0.04em",
                      display: "block",
                      lineHeight: 1.1,
                      textShadow: "0 6px 40px rgba(0,0,0,0.6)",
                      ...maskUp(t, { start: 2500, dur: 1400 }),
                    }}
                  >
                    {data.nameB}
                  </span>
                </Reveal>
              </div>
            </Layer>
          </>
        ),
      },

      /* 3 — Tagline on black */
      {
        id: "tagline",
        label: "Tagline",
        duration: 3800,
        in: { kind: "fade", dur: 700 },
        out: { kind: "fade", dur: 700 },
        render: ({ t }) => (
          <>
            {bars(t)}
            <Layer>
              <div style={{ textAlign: "center", maxWidth: S(880, 1200), padding: "0 60px" }}>
                <div
                  style={{
                    fontFamily: theme.fontDisplay,
                    color: theme.ink,
                    fontSize: S(68, 84),
                    lineHeight: 1.4,
                    fontStyle: "italic",
                    ...rise(t, { start: 400, dur: 1300, dist: 26 }),
                  }}
                >
                  {data.tagline}
                </div>
              </div>
            </Layer>
          </>
        ),
      },
    ];

    /* 4 — Montage: one fast beat per photo */
    if (montage.length) {
      montage.slice(0, 6).forEach((img, i) => {
        scenes.push({
          id: "montage-" + i,
          label: "Montage " + (i + 1),
          duration: 1700,
          in: { kind: i % 2 === 0 ? "wipe-right" : "slide-left", dur: 420 },
          out: { kind: "fade", dur: 260 },
          render: ({ t, d: dur }) => (
            <>
              <Photo
                src={img.src}
                t={t}
                d={dur}
                theme={theme}
                from={1.12}
                to={1.02}
                panX={i % 2 === 0 ? 1.2 : -1.2}
                style={{ position: "absolute", inset: 0 }}
              />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,rgba(0,0,0,0.35),rgba(0,0,0,0.25))" }} />
              {bars(t)}
              <Layer center={false} style={{ justifyContent: "flex-end", alignItems: "flex-start", padding: S("0 90px 320px", "0 140px 150px"), zIndex: 6 }}>
                <div
                  style={{
                    fontFamily: theme.fontBody,
                    color: theme.ink,
                    fontSize: S(26, 22),
                    letterSpacing: "0.4em",
                    textTransform: "uppercase",
                    opacity: tw(t, 200, 500),
                  }}
                >
                  {String(i + 1).padStart(2, "0")} / {String(Math.min(montage.length, 6)).padStart(2, "0")}
                </div>
              </Layer>
            </>
          ),
        });
      });
    }

    /* 5 — Date slate */
    scenes.push({
      id: "date",
      label: "Date slate",
      duration: 4600,
      in: { kind: "blur", dur: 800 },
      out: { kind: "fade", dur: 800 },
      render: ({ t }) => (
        <>
          {bars(t)}
          <Layer>
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  fontFamily: theme.fontBody,
                  color: theme.soft,
                  fontSize: S(28, 32),
                  letterSpacing: "0.55em",
                  textTransform: "uppercase",
                  ...fade(t, { start: 200, dur: 800 }),
                }}
              >
                Coming
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: S(26, 24), margin: S(34, 26) + "px 0" }}>
                {[d.day, d.monthShort, d.year].map((seg, i) => (
                  <React.Fragment key={i}>
                    {i > 0 && (
                      <span style={{ color: theme.accent, fontSize: S(60, 72), opacity: tw(t, 900 + i * 150, 600) }}>·</span>
                    )}
                    <Reveal>
                      <span
                        style={{
                          fontFamily: theme.fontDisplay,
                          color: theme.ink,
                          fontSize: S(104, 140),
                          letterSpacing: "0.08em",
                          display: "block",
                          lineHeight: 1.1,
                          ...maskUp(t, { start: 500 + i * 180, dur: 1200 }),
                        }}
                      >
                        {seg}
                      </span>
                    </Reveal>
                  </React.Fragment>
                ))}
              </div>
              <div
                style={{
                  width: S(420, 420) * tw(t, 1500, 1000, E.inOutCubic),
                  height: 1,
                  background: theme.line,
                  margin: "0 auto",
                }}
              />
              <div
                style={{
                  fontFamily: theme.fontBody,
                  color: theme.soft,
                  fontSize: S(30, 36),
                  letterSpacing: "0.3em",
                  textTransform: "uppercase",
                  marginTop: S(40, 30),
                  ...rise(t, { start: 2000, dur: 1000, dist: 18 }),
                }}
              >
                {[data.venueName, data.venueCity].filter(Boolean).join(" · ")}
                {time ? " · " + time : ""}
              </div>
            </div>
          </Layer>
        </>
      ),
    });

    /* 6 — End card */
    scenes.push({
      id: "end",
      label: "End card",
      duration: 5000,
      in: { kind: "fade", dur: 900 },
      render: ({ t }) => (
        <>
          {bars(t)}
          <Layer>
            <div style={{ textAlign: "center" }}>
              <Reveal>
                <span
                  style={{
                    fontFamily: theme.fontScript,
                    color: theme.accent,
                    fontSize: S(148, 172),
                    display: "block",
                    lineHeight: 1.25,
                    ...maskUp(t, { start: 500, dur: 1500 }),
                  }}
                >
                  {data.closingLine || "Save the Date"}
                </span>
              </Reveal>
              <div
                style={{
                  fontFamily: theme.fontDisplay,
                  color: theme.ink,
                  fontSize: S(44, 52),
                  letterSpacing: "0.3em",
                  textTransform: "uppercase",
                  marginTop: S(50, 38),
                  ...rise(t, { start: 1700, dur: 1100, dist: 22 }),
                }}
              >
                {data.nameA} &nbsp;&amp;&nbsp; {data.nameB}
              </div>
              {data.rsvpLine ? (
                <div
                  style={{
                    fontFamily: theme.fontBody,
                    color: theme.soft,
                    fontSize: S(28, 32),
                    letterSpacing: "0.26em",
                    marginTop: S(36, 26),
                    ...fade(t, { start: 2600, dur: 1200 }),
                  }}
                >
                  {data.rsvpLine}
                </div>
              ) : null}
            </div>
          </Layer>
        </>
      ),
    });

    return scenes;
  },
};
