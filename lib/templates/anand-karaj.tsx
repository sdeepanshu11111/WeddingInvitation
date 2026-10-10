import React from "react";
import type { Scene, TemplateDef } from "../types";
import { E, fade, mix, rise, tw } from "../anim";
import { DiamondRule, Layer, Particles } from "@/components/primitives";
import { DateBlock, Headline, Kicker, PhotoCircle, Schedule, VenueBlock, lines } from "@/components/blocks";
import { PhulkariBand, Sunburst } from "@/components/indian";

/* Anand Karaj — Sikh wedding: glowing Ik Onkar, Gurmukhi, phulkari embroidery band. */

const PHULKARI = ["#FF6F00", "#E91E63", "#FFC107", "#7CB342", "#FF8A65"];
const FATEH = ["ਵਾਹਿਗੁਰੂ ਜੀ ਕਾ ਖ਼ਾਲਸਾ ॥", "ਵਾਹਿਗੁਰੂ ਜੀ ਕੀ ਫ਼ਤਹਿ ॥"];

export const anandKaraj: TemplateDef = {
  id: "anand-karaj",
  name: "Anand Karaj",
  tagline: "Sikh wedding: glowing ੴ, Gurmukhi titles, phulkari embroidery, Milni & Laavan schedule",
  tags: ["Sikh", "Punjabi", "Phulkari"],
  categories: ["wedding"],
  communities: ["sikh"],
  isNew: true,
  poster: "onkar",
  fonts: { display: "var(--f-cinzel)", script: "var(--f-vibes)", body: "var(--f-cormorant)" },
  palettes: [
    { id: "kesri", name: "Kesri & Navy", ink: "#FFF7EC", soft: "#F0CFA6", accent: "#FF9933", bg: "#0E1F4D", bg2: "#06102B", line: "#F4B860" },
    { id: "royal", name: "Royal Blue", ink: "#F6F1E4", soft: "#C9C2AA", accent: "#E8C468", bg: "#123C7A", bg2: "#0A2147", line: "#E8C468" },
    { id: "ivory", name: "Ivory & Saffron", ink: "#3B2410", soft: "#6E5134", accent: "#D35F00", bg: "#FFF7EA", bg2: "#FBE6C8", line: "#E39B3A" },
    { id: "rani", name: "Rani & Gold", ink: "#FFF2F6", soft: "#F5C2D4", accent: "#FFC94A", bg: "#8E1251", bg2: "#4C0629", line: "#FFC94A" },
  ],
  thumb: (p) => (
    <div style={{ width: "100%", height: "100%", background: "radial-gradient(circle at 50% 40%," + p.bg + "," + p.bg2 + ")", display: "grid", placeItems: "center", position: "relative" }}>
      <span style={{ fontFamily: "var(--f-gurmukhi)", color: p.accent, fontSize: 30, textShadow: "0 0 10px " + p.accent }}>ੴ</span>
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 9, background: "repeating-linear-gradient(90deg,#FF6F00 0 8px,#E91E63 8px 16px,#FFC107 16px 24px,#7CB342 24px 32px)" }} />
    </div>
  ),
  groups: [
    {
      title: "The couple",
      fields: [
        { key: "groomName", type: "text", label: "Groom's name", placeholder: "Harpreet Singh", max: 26 },
        { key: "groomParents", type: "text", label: "Groom's parents", placeholder: "S/o S. Gurdeep Singh & Sdn. Manjit Kaur", max: 56 },
        { key: "brideName", type: "text", label: "Bride's name", placeholder: "Simran Kaur", max: 26 },
        { key: "brideParents", type: "text", label: "Bride's parents", placeholder: "D/o S. Jaspal Singh & Sdn. Harleen Kaur", max: 56 },
        { key: "photo", type: "image", label: "Couple photo", ratio: "1 / 1", hint: "Framed in phulkari colours" },
      ],
    },
    {
      title: "Opening",
      fields: [
        { key: "showOnkar", type: "toggle", label: "Show ੴ (Ik Onkar)" },
        { key: "localTitle", type: "text", label: "Gurmukhi title", placeholder: "ਸ਼ੁਭ ਵਿਆਹ", max: 24 },
        { key: "hosts", type: "textarea", label: "Families", placeholder: "The Bedi & Gill families", max: 120 },
      ],
    },
    {
      title: "Anand Karaj",
      fields: [
        { key: "weddingDate", type: "date", label: "Date" },
        { key: "venueName", type: "text", label: "Gurdwara", placeholder: "Gurdwara Bangla Sahib", max: 40 },
        { key: "venueAddress", type: "textarea", label: "Address", placeholder: "Ashoka Road, Connaught Place\nNew Delhi", max: 100 },
        { key: "schedule", type: "textarea", label: "Schedule", placeholder: "Milni — 8:30 AM\nAnand Karaj — 10:00 AM\nLangar — 12:30 PM", max: 200, hint: 'One per line as "Item — time"' },
      ],
    },
    {
      title: "Reception",
      fields: [
        { key: "showReception", type: "toggle", label: "Include reception" },
        { key: "receptionDate", type: "date", label: "Reception date" },
        { key: "receptionTime", type: "time", label: "Reception time" },
        { key: "receptionVenue", type: "text", label: "Reception venue", placeholder: "The Grand, Vasant Kunj", max: 40 },
      ],
    },
    {
      title: "Sign-off",
      fields: [
        { key: "showFateh", type: "toggle", label: "Close with Waheguru Ji Ka Khalsa" },
        { key: "rsvp", type: "text", label: "RSVP", placeholder: "RSVP · Gurdeep Singh · +91 98140 12345", max: 50 },
      ],
    },
  ],
  defaults: {
    groomName: "Harpreet Singh",
    groomParents: "S/o S. Gurdeep Singh & Sdn. Manjit Kaur",
    brideName: "Simran Kaur",
    brideParents: "D/o S. Jaspal Singh & Sdn. Harleen Kaur",
    photo: null,
    showOnkar: true,
    localTitle: "ਸ਼ੁਭ ਵਿਆਹ",
    hosts: "The Bedi & Gill families",
    weddingDate: "2026-11-15",
    venueName: "Gurdwara Bangla Sahib",
    venueAddress: "Ashoka Road, Connaught Place\nNew Delhi",
    schedule: "Milni — 8:30 AM\nAnand Karaj — 10:00 AM\nLangar — 12:30 PM",
    showReception: true,
    receptionDate: "2026-11-15",
    receptionTime: "19:30",
    receptionVenue: "The Grand, Vasant Kunj",
    showFateh: true,
    rsvp: "RSVP · Gurdeep Singh · +91 98140 12345",
  },

  backdrop: ({ T, theme, W, H }) => (
    <>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 35%," + theme.bg + " 0%," + theme.bg2 + " 90%)" }} />
      <Particles t={T} color={theme.accent} W={W} H={H} count={18} size={4} opacity={0.3} seed={41} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0 }}>
        <PhulkariBand t={T} W={W} h={W > H ? 64 : 80} colors={PHULKARI} base={theme.bg2} start={300} />
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 0 }}>
        <PhulkariBand t={T} W={W} h={W > H ? 64 : 80} colors={PHULKARI} base={theme.bg2} start={500} />
      </div>
    </>
  ),

  build: (data, orientation, theme) => {
    const v = orientation === "vertical";
    const S = function <T>(a: T, b: T): T {
      return v ? a : b;
    };
    const ring = "conic-gradient(" + PHULKARI.concat(PHULKARI[0]).join(",") + ")";
    const scenes: Scene[] = [];

    if (data.showOnkar !== false) {
      scenes.push({
        id: "onkar",
        label: "Ik Onkar",
        duration: 5000,
        in: { kind: "fade", dur: 900 },
        out: { kind: "fade", dur: 900 },
        render: ({ t }) => {
          const p = tw(t, 300, 1800, E.outExpo);
          return (
            <Layer>
              <div style={{ position: "absolute", display: "grid", placeItems: "center" }}>
                <Sunburst t={t} color={theme.accent} size={S(1300, 1200)} start={100} opacity={0.4} />
              </div>
              <div
                style={{
                  fontFamily: "var(--f-gurmukhi)",
                  color: theme.accent,
                  fontSize: S(300, 280),
                  lineHeight: 1.2,
                  opacity: p,
                  transform: "scale(" + mix(p, 0.7, 1).toFixed(3) + ")",
                  textShadow: "0 0 40px " + theme.accent + "AA, 0 0 100px " + theme.accent + "55",
                  position: "relative",
                }}
              >
                ੴ
              </div>
              {data.localTitle ? (
                <Headline t={t} theme={theme} v={v} start={1700} size={S(90, 84)} font="var(--f-gurmukhi)" color={theme.ink} style={{ position: "relative" }}>
                  {data.localTitle}
                </Headline>
              ) : null}
            </Layer>
          );
        },
      });
    }

    scenes.push(
      {
        id: "blessing",
        label: "With His blessings",
        duration: 4800,
        in: { kind: "fade", dur: 800 },
        out: { kind: "fade", dur: 800 },
        render: ({ t }) => (
          <Layer>
            <div style={{ textAlign: "center", maxWidth: S(900, 1300) }}>
              <Kicker t={t} theme={theme} v={v} start={200} size={30}>
                With the blessings of Waheguru
              </Kicker>
              <div style={{ marginTop: S(40, 30) }}>
                {lines(data.hosts).map((l, i) => (
                  <Headline key={i} t={t} theme={theme} v={v} start={500 + i * 220} size={S(60, 62)} lineHeight={1.4}>
                    {l}
                  </Headline>
                ))}
              </div>
              <div style={{ display: "grid", placeItems: "center", margin: S("44px 0", "32px 0") }}>
                <DiamondRule t={t} start={1200} width={S(320, 360)} color={theme.line} />
              </div>
              <div style={{ fontFamily: theme.fontBody, color: theme.soft, fontStyle: "italic", fontSize: S(44, 46), ...rise(t, { start: 1600, dur: 1000, dist: 18 }) }}>
                request your gracious presence at the Anand Karaj of
              </div>
            </div>
          </Layer>
        ),
      },
      {
        id: "names",
        label: "The couple",
        duration: 5800,
        in: { kind: "zoom-out", dur: 900 },
        out: { kind: "fade", dur: 800 },
        render: ({ t, d }) => (
          <Layer style={{ flexDirection: v ? "column" : "row", gap: S(40, 100) }}>
            <PhotoCircle t={t} d={d} theme={theme} src={data.photo?.src} size={S(500, 560)} start={0} ring={ring} ringWidth={14} />
            <div style={{ textAlign: "center" }}>
              <Headline t={t} theme={theme} v={v} start={500} size={S(110, 110)} font={theme.fontScript}>
                {data.groomName}
              </Headline>
              <div style={{ fontFamily: theme.fontBody, color: theme.soft, fontStyle: "italic", fontSize: S(30, 32), ...fade(t, { start: 900, dur: 800 }) }}>{data.groomParents}</div>
              <div style={{ fontFamily: theme.fontDisplay, color: theme.accent, fontSize: S(40, 40), letterSpacing: "0.3em", margin: S("20px 0", "14px 0"), ...fade(t, { start: 1200, dur: 800 }) }}>&amp;</div>
              <Headline t={t} theme={theme} v={v} start={1400} size={S(110, 110)} font={theme.fontScript}>
                {data.brideName}
              </Headline>
              <div style={{ fontFamily: theme.fontBody, color: theme.soft, fontStyle: "italic", fontSize: S(30, 32), ...fade(t, { start: 1800, dur: 800 }) }}>{data.brideParents}</div>
            </div>
          </Layer>
        ),
      },
      {
        id: "ceremony",
        label: "Anand Karaj",
        duration: 6200,
        in: { kind: "slide-up", dur: 850 },
        out: { kind: "fade", dur: 800 },
        render: ({ t }) => (
          <Layer style={{ flexDirection: v ? "column" : "row", gap: S(50, 140) }}>
            <div style={{ textAlign: "center" }}>
              <Headline t={t} theme={theme} v={v} start={100} size={S(110, 110)} font={theme.fontScript} color={theme.accent}>
                Anand Karaj
              </Headline>
              <DateBlock t={t} theme={theme} v={v} start={400} date={data.weddingDate} divider={false} />
              <div style={{ marginTop: S(30, 24) }}>
                <VenueBlock t={t} theme={theme} v={v} start={1000} label="" name={data.venueName} address={data.venueAddress} nameSize={60} maxWidth={S(900, 720)} />
              </div>
            </div>
            <Schedule t={t} theme={theme} v={v} start={1700} lines={lines(data.schedule)} width={S(820, 700)} size={44} />
          </Layer>
        ),
      }
    );

    if (data.showReception !== false && data.receptionVenue) {
      scenes.push({
        id: "reception",
        label: "Reception",
        duration: 5000,
        in: { kind: "slide-left", dur: 850 },
        out: { kind: "fade", dur: 800 },
        render: ({ t }) => (
          <Layer>
            <Headline t={t} theme={theme} v={v} start={100} size={S(120, 120)} font={theme.fontScript} color={theme.accent}>
              Reception
            </Headline>
            <DateBlock t={t} theme={theme} v={v} start={400} date={data.receptionDate} time={data.receptionTime} divider={false} />
            <div style={{ fontFamily: theme.fontDisplay, color: theme.ink, fontSize: S(54, 58), marginTop: S(36, 26), ...rise(t, { start: 1600, dur: 900, dist: 18 }) }}>{data.receptionVenue}</div>
          </Layer>
        ),
      });
    }

    scenes.push({
      id: "close",
      label: "Fateh",
      duration: 5200,
      in: { kind: "iris", dur: 1000 },
      render: ({ t }) => (
        <Layer>
          <div style={{ position: "absolute", display: "grid", placeItems: "center" }}>
            <Sunburst t={t} color={theme.accent} size={S(1100, 1000)} opacity={0.22} />
          </div>
          <div style={{ textAlign: "center", maxWidth: S(940, 1500), position: "relative" }}>
            {data.showFateh !== false ? (
              FATEH.map((l, i) => (
                <Headline key={i} t={t} theme={theme} v={v} start={300 + i * 300} size={S(72, 76)} font="var(--f-gurmukhi)" color={theme.accent} lineHeight={1.6} style={{ whiteSpace: "nowrap" }}>
                  {l}
                </Headline>
              ))
            ) : null}
            <div style={{ fontFamily: theme.fontScript, color: theme.ink, fontSize: S(96, 100), marginTop: S(30, 20), ...rise(t, { start: 1300, dur: 1100, dist: 24 }) }}>
              {String(data.groomName || "").split(" ")[0]} &amp; {String(data.brideName || "").split(" ")[0]}
            </div>
            {data.rsvp ? (
              <div style={{ fontFamily: theme.fontDisplay, color: theme.soft, fontSize: S(34, 36), letterSpacing: "0.08em", marginTop: S(40, 28), ...fade(t, { start: 2200, dur: 1000 }) }}>{data.rsvp}</div>
            ) : null}
          </div>
        </Layer>
      ),
    });

    return scenes;
  },
};
