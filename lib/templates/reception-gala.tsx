import React from "react";
import type { Scene, TemplateDef } from "../types";
import { E, fade, mix, rise, tw } from "../anim";
import { DiamondRule, Layer, Particles, Photo } from "@/components/primitives";
import { DateBlock, Headline, Kicker, Schedule, VenueBlock, lines } from "@/components/blocks";
import { DecoFan, FairyLights } from "@/components/indian";

/* Reception Gala — navy & gold art deco, fairy lights, evening programme. */

export const receptionGala: TemplateDef = {
  id: "reception-gala",
  name: "Reception Gala",
  tagline: "Art-deco evening: fairy lights, gold fans, a programme of the night",
  tags: ["Reception", "Art deco", "Evening"],
  categories: ["reception"],
  communities: ["hindu", "muslim", "sikh", "christian", "modern"],
  isNew: true,
  poster: "couple",
  fonts: { display: "var(--f-bodoni)", script: "var(--f-vibes)", body: "var(--f-inter)" },
  palettes: [
    { id: "navy", name: "Navy & Gold", ink: "#F7F1E3", soft: "#B9B3A3", accent: "#D8B66A", bg: "#0E1A33", bg2: "#060B18", line: "#D8B66A" },
    { id: "noir", name: "Black Champagne", ink: "#F5EFE6", soft: "#A79F93", accent: "#E5C9A0", bg: "#141210", bg2: "#050505", line: "#CDB38B" },
    { id: "wine", name: "Wine", ink: "#FBEFF1", soft: "#D8AEB6", accent: "#EBC27F", bg: "#4C0F23", bg2: "#22060F", line: "#D9A86C" },
    { id: "ivory", name: "Ivory", ink: "#2A2622", soft: "#625A50", accent: "#97753A", bg: "#FAF7F1", bg2: "#ECE5D8", line: "#B8995C" },
  ],
  thumb: (p) => (
    <div style={{ width: "100%", height: "100%", background: "linear-gradient(180deg," + p.bg + "," + p.bg2 + ")", display: "grid", placeItems: "center", position: "relative" }}>
      <div style={{ position: "absolute", top: 6, left: 0, right: 0, display: "flex", justifyContent: "space-around" }}>
        {[0, 1, 2, 3, 4].map((i) => (
          <span key={i} style={{ width: 4, height: 4, borderRadius: "50%", background: "#FFE7A3", boxShadow: "0 0 6px #FFE7A3", marginTop: Math.sin(i) * 4 + 4 }} />
        ))}
      </div>
      <span style={{ fontFamily: "var(--f-bodoni)", color: p.accent, fontSize: 9, letterSpacing: "0.2em" }}>RECEPTION</span>
    </div>
  ),
  groups: [
    {
      title: "Titles",
      fields: [
        { key: "kicker", type: "text", label: "Opening line", placeholder: "You are cordially invited to the", max: 40 },
        { key: "title", type: "text", label: "Title", placeholder: "Wedding Reception", max: 24 },
      ],
    },
    {
      title: "The couple",
      fields: [
        { key: "nameA", type: "text", label: "First name", placeholder: "Aarav", max: 20 },
        { key: "nameB", type: "text", label: "Second name", placeholder: "Ananya", max: 20 },
        { key: "photo", type: "image", label: "Photo", ratio: "4 / 5" },
      ],
    },
    {
      title: "When & where",
      fields: [
        { key: "weddingDate", type: "date", label: "Date" },
        { key: "weddingTime", type: "time", label: "Time" },
        { key: "venueName", type: "text", label: "Venue", placeholder: "Taj Lands End", max: 36 },
        { key: "venueAddress", type: "textarea", label: "Address", placeholder: "Bandstand, Bandra West\nMumbai", max: 100 },
      ],
    },
    {
      title: "Programme & sign-off",
      fields: [
        { key: "programme", type: "textarea", label: "The evening", placeholder: "Cocktails — 7:30 PM\nCouple's entry — 8:30 PM\nDinner — 9:00 PM\nDJ & dancing — 10:00 PM", max: 220, hint: 'One per line as "Item — time"' },
        { key: "dressCode", type: "text", label: "Dress code", placeholder: "Black tie / Indo-western", max: 34 },
        { key: "rsvp", type: "text", label: "RSVP", placeholder: "RSVP by 25 Nov · +91 98200 11223", max: 50 },
      ],
    },
  ],
  defaults: {
    kicker: "You are cordially invited to the",
    title: "Wedding Reception",
    nameA: "Aarav",
    nameB: "Ananya",
    photo: null,
    weddingDate: "2026-12-09",
    weddingTime: "19:30",
    venueName: "Taj Lands End",
    venueAddress: "Bandstand, Bandra West\nMumbai",
    programme: "Cocktails — 7:30 PM\nCouple's entry — 8:30 PM\nDinner — 9:00 PM\nDJ & dancing — 10:00 PM",
    dressCode: "Black tie / Indo-western",
    rsvp: "RSVP by 25 Nov · +91 98200 11223",
  },

  backdrop: ({ T, theme, W, H, vertical }) => (
    <>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 20%," + theme.bg + " 0%," + theme.bg2 + " 90%)" }} />
      <Particles t={T} color={theme.accent} W={W} H={H} count={14} size={3.5} opacity={0.3} seed={71} />
      <FairyLights t={T} W={W} strings={vertical ? 3 : 4} depth={vertical ? 120 : 90} start={200} />
      <div style={{ position: "absolute", left: 0, bottom: 0 }}>
        <DecoFan t={T} color={theme.line} size={vertical ? 260 : 220} start={600} rotate={-90} />
      </div>
      <div style={{ position: "absolute", right: 0, bottom: 0 }}>
        <DecoFan t={T} color={theme.line} size={vertical ? 260 : 220} start={800} rotate={180} />
      </div>
    </>
  ),

  build: (data, orientation, theme) => {
    const v = orientation === "vertical";
    const S = function <T>(a: T, b: T): T {
      return v ? a : b;
    };
    const scenes: Scene[] = [
      {
        id: "open",
        label: "Reception",
        duration: 4600,
        in: { kind: "fade", dur: 800 },
        out: { kind: "fade", dur: 800 },
        render: ({ t }) => (
          <Layer>
            <div style={{ textAlign: "center", maxWidth: S(940, 1500) }}>
              <Kicker t={t} theme={theme} v={v} start={1000} size={30}>
                {data.kicker}
              </Kicker>
              <div style={{ marginTop: S(36, 26) }}>
                {String(data.title || "").split(" ").map((w: string, i: number) => (
                  <Headline key={i} t={t} theme={theme} v={v} start={1300 + i * 200} size={S(132, 130)} spacing="0.12em" lineHeight={1.1} style={{ textTransform: "uppercase" }}>
                    {w}
                  </Headline>
                ))}
              </div>
              <div style={{ display: "grid", placeItems: "center", marginTop: S(40, 30) }}>
                <DiamondRule t={t} start={2200} width={S(360, 400)} color={theme.line} />
              </div>
            </div>
          </Layer>
        ),
      },
      {
        id: "couple",
        label: "The couple",
        duration: 5400,
        in: { kind: "wipe-up", dur: 900 },
        out: { kind: "fade", dur: 800 },
        render: ({ t, d }) => {
          const p = tw(t, 100, 1400, E.outExpo);
          return (
            <Layer style={{ flexDirection: v ? "column" : "row", gap: S(50, 110) }}>
              <div style={{ padding: 12, border: "2px solid " + theme.line, transform: "scale(" + mix(p, 0.92, 1).toFixed(3) + ")", opacity: p }}>
                <div style={{ padding: 8, border: "1px solid " + theme.line + "88" }}>
                  <Photo src={data.photo?.src} t={t} d={d} theme={theme} from={1.06} to={1.16} style={{ width: S(560, 520), height: S(700, 650) }} />
                </div>
              </div>
              <div style={{ textAlign: "center" }}>
                <Kicker t={t} theme={theme} v={v} start={700} size={28}>
                  In honour of the newlyweds
                </Kicker>
                <Headline t={t} theme={theme} v={v} start={1000} size={S(130, 130)} font={theme.fontScript} color={theme.accent} lineHeight={1.3}>
                  {data.nameA}
                </Headline>
                <div style={{ fontFamily: theme.fontDisplay, color: theme.ink, fontSize: S(44, 46), fontStyle: "italic", ...fade(t, { start: 1500, dur: 800 }) }}>&amp;</div>
                <Headline t={t} theme={theme} v={v} start={1700} size={S(130, 130)} font={theme.fontScript} color={theme.accent} lineHeight={1.3}>
                  {data.nameB}
                </Headline>
              </div>
            </Layer>
          );
        },
      },
      {
        id: "details",
        label: "Date & venue",
        duration: 5600,
        in: { kind: "fade", dur: 800 },
        out: { kind: "fade", dur: 800 },
        render: ({ t }) => (
          <Layer style={{ flexDirection: v ? "column" : "row", gap: S(80, 160) }}>
            <DateBlock t={t} theme={theme} v={v} date={data.weddingDate} time={data.weddingTime} timeLabel="from" divider={false} />
            <VenueBlock t={t} theme={theme} v={v} start={1100} label="At" name={data.venueName} address={data.venueAddress} nameSize={80} maxWidth={S(900, 760)} />
          </Layer>
        ),
      },
    ];

    const prog = lines(data.programme);
    if (prog.length) {
      scenes.push({
        id: "programme",
        label: "The evening",
        duration: 5000 + prog.length * 250,
        in: { kind: "slide-up", dur: 850 },
        out: { kind: "fade", dur: 800 },
        render: ({ t }) => (
          <Layer>
            <Headline t={t} theme={theme} v={v} start={100} size={S(110, 110)} font={theme.fontScript} color={theme.accent} style={{ marginBottom: S(30, 20) }}>
              The Evening
            </Headline>
            <Schedule t={t} theme={theme} v={v} start={500} lines={prog} width={S(860, 1100)} size={48} />
          </Layer>
        ),
      });
    }

    scenes.push({
      id: "close",
      label: "Closing",
      duration: 5000,
      in: { kind: "zoom-out", dur: 900 },
      render: ({ t }) => (
        <Layer>
          <div style={{ textAlign: "center", maxWidth: S(920, 1400) }}>
            {(v ? ["Dinner", "Drinks", "Dancing"] : ["Dinner · Drinks · Dancing"]).map((w, i) => (
              <Headline key={w} t={t} theme={theme} v={v} start={300 + i * 180} size={S(84, 62)} spacing="0.26em" lineHeight={1.25} style={{ textTransform: "uppercase", whiteSpace: "nowrap" }}>
                {w}
              </Headline>
            ))}
            <div style={{ display: "grid", placeItems: "center", marginTop: S(40, 30) }}>
              <DiamondRule t={t} start={1000} width={S(360, 400)} color={theme.line} />
            </div>
            {data.dressCode ? (
              <div style={{ fontFamily: theme.fontBody, color: theme.ink, fontSize: S(40, 42), marginTop: S(40, 30), ...rise(t, { start: 1300, dur: 900, dist: 18 }) }}>
                <span style={{ color: theme.soft }}>Dress code · </span>
                {data.dressCode}
              </div>
            ) : null}
            {data.rsvp ? (
              <div style={{ fontFamily: theme.fontBody, color: theme.accent, fontSize: S(36, 38), letterSpacing: "0.08em", marginTop: S(30, 22), ...fade(t, { start: 1900, dur: 1000 }) }}>{data.rsvp}</div>
            ) : null}
            <div style={{ fontFamily: theme.fontScript, color: theme.ink, fontSize: S(96, 100), marginTop: S(50, 34), ...rise(t, { start: 2300, dur: 1100, dist: 24 }) }}>
              {data.nameA} &amp; {data.nameB}
            </div>
          </div>
        </Layer>
      ),
    });

    return scenes;
  },
};
