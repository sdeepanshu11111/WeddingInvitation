import React from "react";
import type { Scene, TemplateDef, Theme } from "../types";
import { fade, maskUp, rise } from "../anim";
import { DiamondRule, Layer, Particles, Photo, Reveal } from "@/components/primitives";
import { DateBlock, Headline, Kicker, VenueBlock, lines } from "@/components/blocks";
import { Crescent, Lantern, Mehrab, StarLattice } from "@/components/indian";

/* Nikah Mubarak — emerald & gold, Islamic geometry, mehrab arch, lanterns. */

const BISMILLAH = "بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ";
const BISMILLAH_EN = "In the name of Allah, the Most Gracious, the Most Merciful";
// The wedding dua of the Prophet ﷺ (Abu Dawud 2130)
const DUA = "بَارَكَ ٱللَّٰهُ لَكُمَا وَبَارَكَ عَلَيْكُمَا وَجَمَعَ بَيْنَكُمَا فِي خَيْرٍ";
const DUA_EN = "May Allah bless you both, shower His blessings upon you, and unite you in goodness";

function Arabic({ t, start, size, color, children }: { t: number; start: number; size: number; color: string; children: string }) {
  return (
    <Reveal>
      <span dir="rtl" lang="ar" style={{ display: "block", fontFamily: "var(--f-arabic)", fontSize: size, color, lineHeight: 1.9, ...maskUp(t, { start, dur: 1500 }) }}>
        {children}
      </span>
    </Reveal>
  );
}

function Details({ t, theme, v, title, date, time, venue, address }: { t: number; theme: Theme; v: boolean; title: string; date?: string; time?: string; venue?: string; address?: string }) {
  return (
    <Layer style={{ flexDirection: v ? "column" : "row", gap: v ? 60 : 150 }}>
      <div style={{ textAlign: "center" }}>
        <Headline t={t} theme={theme} v={v} start={100} size={v ? 120 : 110} font={theme.fontScript} color={theme.accent} style={{ marginBottom: 10 }}>
          {title}
        </Headline>
        <DateBlock t={t} theme={theme} v={v} start={500} date={date} time={time} divider={false} />
      </div>
      <VenueBlock t={t} theme={theme} v={v} start={1300} label="Venue" name={venue} address={address} nameSize={72} maxWidth={v ? 880 : 760} />
    </Layer>
  );
}

export const nikahMubarak: TemplateDef = {
  id: "nikah-mubarak",
  name: "Nikah Mubarak",
  tagline: "Bismillah in Arabic, mehrab arch, star lattice and lanterns, with optional Walima",
  tags: ["Nikah", "Walima", "Islamic"],
  categories: ["wedding", "reception"],
  communities: ["muslim"],
  isNew: true,
  poster: "photo",
  fonts: { display: "var(--f-marcellus)", script: "var(--f-vibes)", body: "var(--f-cormorant)" },
  palettes: [
    { id: "emerald", name: "Emerald & Gold", ink: "#F4EEDC", soft: "#C8BE9C", accent: "#D9B45A", bg: "#0B3D2E", bg2: "#062219", line: "#C9A54E" },
    { id: "midnight", name: "Midnight Silver", ink: "#EEF1F6", soft: "#A9B3C6", accent: "#D7DEEA", bg: "#0F1B33", bg2: "#070D1A", line: "#9FB0CF" },
    { id: "ivory", name: "Ivory & Gold", ink: "#3A2E1C", soft: "#6E5D42", accent: "#9C7728", bg: "#FBF6EA", bg2: "#EFE4CC", line: "#B8934A" },
    { id: "plum", name: "Royal Plum", ink: "#F8EEF4", soft: "#D6B9CB", accent: "#E7C27D", bg: "#4A1436", bg2: "#26081B", line: "#D7AE62" },
  ],
  thumb: (p) => (
    <div style={{ width: "100%", height: "100%", background: "radial-gradient(circle at 50% 40%," + p.bg + "," + p.bg2 + ")", display: "grid", placeItems: "center" }}>
      <svg width="40" height="54" viewBox="0 0 100 135">
        <path d="M8 130 L 8 52 C 8 30, 30 14, 50 4 C 70 14, 92 30, 92 52 L 92 130" fill="none" stroke={p.accent} strokeWidth="4" />
        <path d="M50 50 A 16 16 0 1 0 50 82 A 13 13 0 1 1 50 50 Z" fill={p.accent} transform="translate(-6 0)" />
      </svg>
    </div>
  ),
  groups: [
    {
      title: "The couple",
      fields: [
        { key: "groomName", type: "text", label: "Groom's name", placeholder: "Ayaan", max: 22 },
        { key: "groomParents", type: "text", label: "Groom's parents", placeholder: "S/o Mr. & Mrs. Imran Khan", max: 50 },
        { key: "brideName", type: "text", label: "Bride's name", placeholder: "Zara", max: 22 },
        { key: "brideParents", type: "text", label: "Bride's parents", placeholder: "D/o Mr. & Mrs. Farhan Siddiqui", max: 50 },
        { key: "photo", type: "image", label: "Photo", ratio: "3 / 4", hint: "Shown inside the arch" },
      ],
    },
    {
      title: "Opening",
      fields: [
        { key: "showBismillah", type: "toggle", label: "Bismillah in Arabic" },
        { key: "showTranslation", type: "toggle", label: "English translations" },
        { key: "hosts", type: "textarea", label: "Hosted by", placeholder: "Mr. & Mrs. Imran Khan\nMr. & Mrs. Farhan Siddiqui", max: 120 },
      ],
    },
    {
      title: "Nikah",
      fields: [
        { key: "weddingDate", type: "date", label: "Nikah date" },
        { key: "weddingTime", type: "time", label: "Nikah time" },
        { key: "venueName", type: "text", label: "Venue", placeholder: "Taj Falaknuma Palace", max: 36 },
        { key: "venueAddress", type: "textarea", label: "Address", placeholder: "Engine Bowli, Falaknuma\nHyderabad", max: 100 },
      ],
    },
    {
      title: "Walima",
      fields: [
        { key: "showWalima", type: "toggle", label: "Include Walima" },
        { key: "walimaDate", type: "date", label: "Walima date" },
        { key: "walimaTime", type: "time", label: "Walima time" },
        { key: "walimaVenue", type: "text", label: "Walima venue", placeholder: "Novotel HICC", max: 36 },
        { key: "walimaAddress", type: "textarea", label: "Walima address", placeholder: "HITEC City\nHyderabad", max: 100 },
      ],
    },
    {
      title: "Sign-off",
      fields: [{ key: "rsvp", type: "text", label: "RSVP", placeholder: "RSVP · Imran Khan · +91 98480 12345", max: 50 }],
    },
  ],
  defaults: {
    groomName: "Ayaan",
    groomParents: "S/o Mr. & Mrs. Imran Khan",
    brideName: "Zara",
    brideParents: "D/o Mr. & Mrs. Farhan Siddiqui",
    photo: null,
    showBismillah: true,
    showTranslation: true,
    hosts: "Mr. & Mrs. Imran Khan\nMr. & Mrs. Farhan Siddiqui",
    weddingDate: "2026-12-11",
    weddingTime: "19:00",
    venueName: "Taj Falaknuma Palace",
    venueAddress: "Engine Bowli, Falaknuma\nHyderabad",
    showWalima: true,
    walimaDate: "2026-12-13",
    walimaTime: "20:00",
    walimaVenue: "Novotel HICC",
    walimaAddress: "HITEC City\nHyderabad",
    rsvp: "RSVP · Imran Khan · +91 98480 12345",
  },

  backdrop: ({ T, theme, W, H }) => (
    <>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 30%," + theme.bg + " 0%," + theme.bg2 + " 90%)" }} />
      <StarLattice t={T} W={W} H={H} color={theme.line} tile={W > H ? 130 : 140} opacity={0.13} />
      <Particles t={T} color={theme.accent} W={W} H={H} count={16} size={3.5} opacity={0.28} seed={31} />
    </>
  ),

  build: (data, orientation, theme) => {
    const v = orientation === "vertical";
    const S = function <T>(a: T, b: T): T {
      return v ? a : b;
    };
    const en = data.showTranslation !== false;
    const lanterns = (t: number) => (
      <>
        <div style={{ position: "absolute", top: 0, left: S(70, 170) }}>
          <Lantern t={t} color={theme.line} len={S(260, 120)} size={S(80, 70)} seed={1} />
        </div>
        <div style={{ position: "absolute", top: 0, right: S(70, 170) }}>
          <Lantern t={t} color={theme.line} len={S(400, 200)} size={S(80, 70)} seed={2} start={250} />
        </div>
      </>
    );

    const scenes: Scene[] = [];

    if (data.showBismillah !== false) {
      scenes.push({
        id: "bismillah",
        label: "Bismillah",
        duration: 5000,
        in: { kind: "fade", dur: 900 },
        out: { kind: "fade", dur: 900 },
        render: ({ t }) => (
          <>
            {lanterns(t)}
            <Layer>
              <Crescent t={t} color={theme.accent} size={S(130, 110)} start={200} />
              <div style={{ textAlign: "center", marginTop: S(30, 20), maxWidth: S(960, 1500) }}>
                <Arabic t={t} start={700} size={S(92, 96)} color={theme.accent}>
                  {BISMILLAH}
                </Arabic>
                {en ? (
                  <div style={{ fontFamily: theme.fontBody, fontStyle: "italic", color: theme.soft, fontSize: S(36, 38), marginTop: 10, ...fade(t, { start: 2000, dur: 1000 }) }}>{BISMILLAH_EN}</div>
                ) : null}
              </div>
            </Layer>
          </>
        ),
      });
    }

    scenes.push(
      {
        id: "hosts",
        label: "Hosts",
        duration: 4800,
        in: { kind: "fade", dur: 800 },
        out: { kind: "fade", dur: 800 },
        render: ({ t }) => (
          <Layer>
            <div style={{ textAlign: "center", maxWidth: S(900, 1300) }}>
              <Kicker t={t} theme={theme} v={v} start={200} size={30}>
                Together with their families
              </Kicker>
              <div style={{ marginTop: S(40, 30) }}>
                {lines(data.hosts).map((l, i) => (
                  <Headline key={i} t={t} theme={theme} v={v} start={500 + i * 220} size={S(54, 58)} lineHeight={1.5}>
                    {l}
                  </Headline>
                ))}
              </div>
              <div style={{ display: "grid", placeItems: "center", margin: S("44px 0", "32px 0") }}>
                <DiamondRule t={t} start={1300} width={S(320, 360)} color={theme.line} />
              </div>
              <div style={{ fontFamily: theme.fontBody, color: theme.soft, fontStyle: "italic", fontSize: S(44, 46), ...rise(t, { start: 1700, dur: 1000, dist: 18 }) }}>
                request the honour of your presence at the Nikah of
              </div>
            </div>
          </Layer>
        ),
      },
      {
        id: "names",
        label: "The couple",
        duration: 5600,
        in: { kind: "fade", dur: 800 },
        out: { kind: "iris", dur: 900 },
        render: ({ t }) => (
          <Layer>
            <div style={{ display: "flex", flexDirection: v ? "column" : "row", alignItems: "center", gap: S(10, 90), textAlign: "center" }}>
              <div>
                <Headline t={t} theme={theme} v={v} start={300} size={S(150, 140)} font={theme.fontScript}>
                  {data.groomName}
                </Headline>
                <div style={{ fontFamily: theme.fontBody, color: theme.soft, fontStyle: "italic", fontSize: S(42, 36), ...fade(t, { start: 800, dur: 800 }) }}>{data.groomParents}</div>
              </div>
              <div style={{ margin: S("30px 0", "0") }}>
                <Crescent t={t} color={theme.accent} size={S(90, 100)} start={1100} />
              </div>
              <div>
                <Headline t={t} theme={theme} v={v} start={1400} size={S(150, 140)} font={theme.fontScript}>
                  {data.brideName}
                </Headline>
                <div style={{ fontFamily: theme.fontBody, color: theme.soft, fontStyle: "italic", fontSize: S(42, 36), ...fade(t, { start: 1900, dur: 800 }) }}>{data.brideParents}</div>
              </div>
            </div>
          </Layer>
        ),
      },
      {
        id: "photo",
        label: "Nikah Mubarak",
        duration: 5200,
        in: { kind: "fade", dur: 900 },
        out: { kind: "fade", dur: 800 },
        render: ({ t, d }) => (
          <>
            {lanterns(t)}
            <Layer style={{ flexDirection: v ? "column" : "row", gap: S(40, 110) }}>
              <Mehrab t={t} w={S(640, 560)} h={S(900, 800)} color={theme.accent} start={0} fill={theme.bg2}>
                <Photo src={data.photo?.src} t={t} d={d} theme={theme} from={1.08} to={1.18} style={{ width: "100%", height: "100%" }} />
              </Mehrab>
              <div style={{ textAlign: "center" }}>
                <Headline t={t} theme={theme} v={v} start={1200} size={S(120, 130)} font={theme.fontScript} color={theme.accent}>
                  Nikah Mubarak
                </Headline>
                <Kicker t={t} theme={theme} v={v} start={1900} size={32} color={theme.ink} style={{ marginTop: 10 }}>
                  {data.groomName} &amp; {data.brideName}
                </Kicker>
              </div>
            </Layer>
          </>
        ),
      },
      {
        id: "nikah",
        label: "Nikah details",
        duration: 5600,
        in: { kind: "slide-up", dur: 850 },
        out: { kind: "fade", dur: 800 },
        render: ({ t }) => <Details t={t} theme={theme} v={v} title="Nikah" date={data.weddingDate} time={data.weddingTime} venue={data.venueName} address={data.venueAddress} />,
      }
    );

    if (data.showWalima !== false) {
      scenes.push({
        id: "walima",
        label: "Walima",
        duration: 5400,
        in: { kind: "slide-left", dur: 850 },
        out: { kind: "fade", dur: 800 },
        render: ({ t }) => <Details t={t} theme={theme} v={v} title="Walima" date={data.walimaDate} time={data.walimaTime} venue={data.walimaVenue} address={data.walimaAddress} />,
      });
    }

    scenes.push({
      id: "dua",
      label: "Dua",
      duration: 5600,
      in: { kind: "zoom-out", dur: 900 },
      render: ({ t }) => (
        <>
          {lanterns(t)}
          <Layer>
            <div style={{ textAlign: "center", maxWidth: S(960, 1500), padding: "0 40px" }}>
              <Arabic t={t} start={400} size={S(70, 76)} color={theme.accent}>
                {DUA}
              </Arabic>
              {en ? (
                <div style={{ fontFamily: theme.fontBody, fontStyle: "italic", color: theme.ink, fontSize: S(38, 40), marginTop: 16, ...fade(t, { start: 1800, dur: 1000 }) }}>{DUA_EN}</div>
              ) : null}
              <div style={{ display: "grid", placeItems: "center", marginTop: S(50, 34) }}>
                <DiamondRule t={t} start={2200} width={S(320, 360)} color={theme.line} />
              </div>
              {data.rsvp ? (
                <div style={{ fontFamily: theme.fontDisplay, color: theme.soft, fontSize: S(36, 38), letterSpacing: "0.08em", marginTop: S(40, 30), ...rise(t, { start: 2600, dur: 900, dist: 16 }) }}>{data.rsvp}</div>
              ) : null}
            </div>
          </Layer>
        </>
      ),
    });

    return scenes;
  },
};
