import React from "react";
import type { Scene, TemplateDef } from "../types";
import { E, fade, mix, rise, tw } from "../anim";
import { Layer } from "@/components/primitives";
import { DateBlock, Headline, Kicker, PhotoCircle, VenueBlock, lines } from "@/components/blocks";
import { Beams, Confetti, Equalizer, Notes, Sparkles } from "@/components/indian";

/* Sangeet — Bollywood party night: spotlights, neon type, equaliser, confetti. */

export const sangeetNight: TemplateDef = {
  id: "sangeet-night",
  name: "Sangeet Night",
  tagline: "Bollywood party: sweeping spotlights, neon titles, equaliser and confetti",
  tags: ["Sangeet", "Party", "Neon"],
  categories: ["sangeet"],
  communities: ["hindu", "sikh", "modern"],
  isNew: true,
  poster: "title",
  fonts: { display: "var(--f-rozha)", script: "var(--f-vibes)", body: "var(--f-inter)" },
  palettes: [
    { id: "neon", name: "Neon Night", ink: "#FFFFFF", soft: "#C9B8FF", accent: "#FF3D9A", bg: "#130B2E", bg2: "#2A0F4F", line: "#22E1FF" },
    { id: "bolly", name: "Bollywood Gold", ink: "#FFF6E0", soft: "#D9C08A", accent: "#FFC94A", bg: "#0B0B0B", bg2: "#2A1A00", line: "#FF8A3D" },
    { id: "disco", name: "Disco Pink", ink: "#FFFFFF", soft: "#FFD1E8", accent: "#FFE066", bg: "#7A0F5C", bg2: "#2B0A3D", line: "#FF7AC6" },
    { id: "sunset", name: "Sunset Party", ink: "#FFF5EC", soft: "#FFD1B3", accent: "#FFEA5C", bg: "#C2381F", bg2: "#5E1846", line: "#FFB86B" },
  ],
  thumb: (p) => (
    <div style={{ width: "100%", height: "100%", background: "linear-gradient(180deg," + p.bg2 + "," + p.bg + ")", display: "grid", placeItems: "center", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: -10, left: 4, width: 26, height: 100, background: "linear-gradient(" + p.accent + "88, transparent)", transform: "rotate(-18deg)" }} />
      <div style={{ position: "absolute", top: -10, right: 4, width: 26, height: 100, background: "linear-gradient(" + p.line + "88, transparent)", transform: "rotate(18deg)" }} />
      <span style={{ fontFamily: "var(--f-rozha)", color: p.ink, fontSize: 17, textShadow: "0 0 8px " + p.accent, position: "relative" }}>संगीत</span>
    </div>
  ),
  groups: [
    {
      title: "Titles",
      fields: [
        { key: "hook", type: "text", label: "Hook (first words)", placeholder: "Let's Dance!", max: 18 },
        { key: "title", type: "text", label: "Title", placeholder: "Sangeet Night", max: 20 },
        { key: "localTitle", type: "text", label: "Hindi title", placeholder: "संगीत संध्या", max: 22 },
      ],
    },
    {
      title: "The couple",
      fields: [
        { key: "brideName", type: "text", label: "Bride's name", placeholder: "Ananya", max: 20 },
        { key: "groomName", type: "text", label: "Groom's name", placeholder: "Aarav", max: 20 },
        { key: "photo", type: "image", label: "Photo (optional)", ratio: "1 / 1", hint: "Gets a neon ring" },
      ],
    },
    {
      title: "Line-up",
      fields: [{ key: "highlights", type: "textarea", label: "Highlights", placeholder: "Family dance-off\nLive dhol\nDJ till late\nDinner & drinks", max: 160, hint: "One per line, up to 5" }],
    },
    {
      title: "When & where",
      fields: [
        { key: "weddingDate", type: "date", label: "Date" },
        { key: "weddingTime", type: "time", label: "Time" },
        { key: "venueName", type: "text", label: "Venue", placeholder: "The Grand Ballroom", max: 36 },
        { key: "venueAddress", type: "textarea", label: "Address", placeholder: "ITC Rajputana\nJaipur", max: 100 },
      ],
    },
    {
      title: "Sign-off",
      fields: [
        { key: "dressCode", type: "text", label: "Dress code", placeholder: "Bollywood glam", max: 28 },
        { key: "closingLine", type: "text", label: "Closing line", placeholder: "Bring your dancing shoes!", max: 34 },
        { key: "hashtag", type: "text", label: "Hashtag / RSVP", placeholder: "#AnAuraSangeet", max: 34 },
      ],
    },
  ],
  defaults: {
    hook: "Let's Dance!",
    title: "Sangeet Night",
    localTitle: "संगीत संध्या",
    brideName: "Ananya",
    groomName: "Aarav",
    photo: null,
    highlights: "Family dance-off\nLive dhol\nDJ till late\nDinner & drinks",
    weddingDate: "2026-12-07",
    weddingTime: "19:30",
    venueName: "The Grand Ballroom",
    venueAddress: "ITC Rajputana\nJaipur",
    dressCode: "Bollywood glam",
    closingLine: "Bring your dancing shoes!",
    hashtag: "#AnAuraSangeet",
  },

  backdrop: ({ T, theme, W, H }) => (
    <>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg," + theme.bg2 + " 0%," + theme.bg + " 70%)" }} />
      <Beams t={T} W={W} H={H} colors={[theme.accent, theme.line, theme.ink]} count={W > H ? 5 : 3} />
      <Notes t={T} W={W} H={H} color={theme.soft} count={12} />
      <Sparkles t={T} W={W} H={H} color={theme.ink} count={22} size={16} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: H * 0.18, background: "linear-gradient(transparent," + theme.bg + ")" }} />
    </>
  ),

  build: (data, orientation, theme) => {
    const v = orientation === "vertical";
    const S = function <T>(a: T, b: T): T {
      return v ? a : b;
    };
    const glow = (c: string) => "0 0 18px " + c + ", 0 0 46px " + c + "AA, 0 0 90px " + c + "66";
    const hl = lines(data.highlights).slice(0, 5);

    const scenes: Scene[] = [
      {
        id: "hook",
        label: "Hook",
        duration: 3800,
        in: { kind: "fade", dur: 500 },
        out: { kind: "zoom-in", dur: 700 },
        render: ({ t }) => {
          const words = String(data.hook || "").split(/\s+/).filter(Boolean);
          return (
            <Layer>
              <div style={{ display: "flex", flexDirection: v ? "column" : "row", alignItems: "center", gap: S(0, 50) }}>
                {words.map((w: string, i: number) => {
                  const p = tw(t, 300 + i * 380, 900, E.outBack);
                  const flick = i === words.length - 1 && t > 1600 && t < 2000 && Math.floor(t / 70) % 2 === 0 ? 0.35 : 1;
                  return (
                    <div
                      key={i}
                      style={{
                        fontFamily: theme.fontDisplay,
                        color: i % 2 ? theme.accent : theme.ink,
                        fontSize: S(240, 230),
                        lineHeight: 1,
                        textShadow: glow(i % 2 ? theme.accent : theme.line),
                        opacity: Math.min(1, p * 1.4) * flick,
                        transform: "scale(" + mix(p, 2.2, 1).toFixed(3) + ") rotate(" + mix(p, i % 2 ? 12 : -12, i % 2 ? 3 : -3).toFixed(2) + "deg)",
                      }}
                    >
                      {w}
                    </div>
                  );
                })}
              </div>
            </Layer>
          );
        },
      },
      {
        id: "title",
        label: "Sangeet Night",
        duration: 5200,
        in: { kind: "fade", dur: 600 },
        out: { kind: "slide-left", dur: 800 },
        render: ({ t, d }) => (
          <Layer style={{ flexDirection: v ? "column" : "row", gap: S(40, 100) }}>
            {data.photo?.src ? (
              <PhotoCircle t={t} d={d} theme={theme} src={data.photo.src} size={S(460, 520)} start={0} ringWidth={8} ring={"conic-gradient(" + theme.accent + "," + theme.line + "," + theme.accent + ")"} />
            ) : null}
            <div style={{ textAlign: "center" }}>
              {data.localTitle ? (
                <div style={{ fontFamily: theme.fontDisplay, color: theme.accent, fontSize: S(110, 110), textShadow: glow(theme.accent), ...rise(t, { start: 200, dur: 900 }) }}>{data.localTitle}</div>
              ) : null}
              <div style={{ fontFamily: theme.fontDisplay, color: theme.ink, fontSize: S(150, 160), lineHeight: 1.05, textShadow: glow(theme.line), ...rise(t, { start: 600, dur: 1100, dist: 60 }) }}>{data.title}</div>
              <Kicker t={t} theme={theme} v={v} start={1300} size={30} color={theme.soft} style={{ marginTop: S(40, 30) }}>
                Celebrating
              </Kicker>
              <Headline t={t} theme={theme} v={v} start={1600} size={S(110, 104)} font={theme.fontScript} color={theme.ink}>
                {data.brideName} &amp; {data.groomName}
              </Headline>
            </div>
          </Layer>
        ),
      },
      {
        id: "lineup",
        label: "Line-up",
        duration: 5000,
        in: { kind: "slide-left", dur: 800 },
        out: { kind: "fade", dur: 700 },
        render: ({ t }) => (
          <Layer>
            <div style={{ textAlign: "center" }}>
              <Kicker t={t} theme={theme} v={v} start={200} size={32} color={theme.line}>
                Tonight's line-up
              </Kicker>
              <div style={{ marginTop: S(50, 34) }}>
                {hl.map((h, i) => {
                  const p = tw(t, 500 + i * 300, 800, E.outBack);
                  return (
                    <div
                      key={i}
                      style={{
                        fontFamily: theme.fontDisplay,
                        color: theme.ink,
                        fontSize: S(84, 80),
                        lineHeight: 1.3,
                        opacity: Math.min(1, p * 1.4),
                        transform: "translate3d(" + mix(p, i % 2 ? 160 : -160, 0).toFixed(1) + "px,0,0)",
                      }}
                    >
                      <span style={{ color: theme.accent, textShadow: glow(theme.accent), marginRight: 26 }}>★</span>
                      {h}
                    </div>
                  );
                })}
              </div>
              <div style={{ display: "grid", placeItems: "center", marginTop: S(60, 40) }}>
                <Equalizer t={t} start={600} width={S(760, 900)} height={S(130, 110)} bars={S(26, 34)} color={theme.line} />
              </div>
            </div>
          </Layer>
        ),
      },
      {
        id: "details",
        label: "Date & venue",
        duration: 5600,
        in: { kind: "fade", dur: 700 },
        out: { kind: "fade", dur: 800 },
        render: ({ t }) => (
          <Layer style={{ flexDirection: v ? "column" : "row", gap: S(80, 160) }}>
            <DateBlock t={t} theme={theme} v={v} date={data.weddingDate} time={data.weddingTime} dayFont={theme.fontDisplay} divider={false} />
            <VenueBlock t={t} theme={theme} v={v} start={1100} label="Venue" name={data.venueName} address={data.venueAddress} nameSize={80} maxWidth={S(900, 760)} />
          </Layer>
        ),
      },
      {
        id: "close",
        label: "Closing",
        duration: 5400,
        in: { kind: "zoom-out", dur: 800 },
        render: ({ t, W, H }) => (
          <>
            <Confetti t={t} W={W} H={H} colors={[theme.accent, theme.line, theme.ink, "#FFD54F"]} start={0} count={S(70, 90)} />
            <Layer>
              <div style={{ textAlign: "center", maxWidth: S(920, 1500) }}>
                {data.dressCode ? (
                  <Kicker t={t} theme={theme} v={v} start={200} size={34} color={theme.line}>
                    Dress code · {data.dressCode}
                  </Kicker>
                ) : null}
                <div style={{ fontFamily: theme.fontDisplay, color: theme.ink, fontSize: S(130, 130), lineHeight: 1.1, marginTop: S(40, 30), textShadow: glow(theme.accent), ...rise(t, { start: 500, dur: 1100, dist: 50 }) }}>
                  {data.closingLine}
                </div>
                {data.hashtag ? (
                  <div style={{ fontFamily: theme.fontBody, color: theme.accent, fontSize: S(48, 50), fontWeight: 600, marginTop: S(50, 36), ...fade(t, { start: 1600, dur: 900 }) }}>{data.hashtag}</div>
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
