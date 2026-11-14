import React from "react";
import type { ReactNode } from "react";
import type { CommunityId, Palette, Scene, TemplateDef, Theme } from "../types";
import { fade, rise } from "../anim";
import { DiamondRule, Layer, Particles } from "@/components/primitives";
import { DateBlock, Headline, Kicker, PhotoCircle, VenueBlock } from "@/components/blocks";

/* Regional weddings written in the family's own language (Tamil, Telugu, Malayalam, Kannada, Hindi, Punjabi): one
   shared structure, so the designs stay consistent, and each file (tamil-thirumanam, telugu-pelli, ...) supplies its script
   font, its words, its palettes and its own ornaments. Unlike south-kalyanam (one design, header in four scripts,
   body in English), here the labels and the invitation line are in the language itself; every line is an editable
   field, so a family can reword anything.

   Shared field names (weddingDate, weddingTime, venueName, venueAddress, rsvp) keep the guest card's calendar,
   directions and RSVP working, and scene ids ("names", "muhurtham", "venue", "close") are the ones lib/fieldScene.ts
   looks for. No phone number in defaults: a mobile in any field becomes a live WhatsApp button for guests. */

type S = <T>(vertical: T, horizontal: T) => T;
/** k: size multiplier, so the same ornament can be drawn smaller on the later scenes. */
type Draw = (c: { t: number; theme: Theme; v: boolean; S: S; W: number; H: number; k: number }) => ReactNode;

export type NativeWedding = {
  id: string;
  name: string;
  tagline: string;
  tags: string[];
  /** Who it is filed under in the gallery (default: South Indian, Hindu). */
  communities?: CommunityId[];
  /** CSS font variable of the script, e.g. "var(--f-tamil)". */
  font: string;
  palettes: Palette[];
  thumbGlyph: string;
  /** Words in the language; each is the default of an editable field. */
  words: {
    title: string; // "Wedding invitation"
    groomTitle: string; // honorific before the groom's name
    brideTitle: string; // honorific before the bride's name
    joiner: string; // between the two names
    muhurtham: string; // "Auspicious time"
    venue: string; // "Venue"
    invite: string; // "We request your presence..."
    closing: string; // short blessing / welcome on the last scene
  };
  /** Sample couple, parents and venue shown in previews (no phone numbers). */
  sample: { groom: string; groomParents: string; bride: string; brideParents: string; date: string; time: string; venueName: string; venueAddress: string };
  /** Painted under every scene. */
  backdrop: Draw;
  /** The ornament of the opening scene, above the title. */
  centerpiece: Draw;
  /** Shown beside the names when the couple adds no photo. */
  emblem: Draw;
};

export function makeNativeWedding(c: NativeWedding): TemplateDef {
  const w = c.words;
  return {
    id: c.id,
    name: c.name,
    tagline: c.tagline,
    tags: c.tags,
    categories: ["wedding"],
    communities: c.communities ?? ["south-indian", "hindu"],
    isNew: true,
    poster: "names",
    fonts: { display: "var(--f-cinzel)", script: c.font, body: "var(--f-cormorant)" },
    palettes: c.palettes,
    thumb: (p) => (
      <div style={{ width: "100%", height: "100%", background: "linear-gradient(160deg," + p.bg + "," + p.bg2 + ")", display: "grid", placeItems: "center", color: p.accent, fontFamily: c.font, fontSize: 22, lineHeight: 1 }}>
        {c.thumbGlyph}
      </div>
    ),
    groups: [
      {
        title: "Titles",
        fields: [
          { key: "headerText", type: "text", label: "Title", placeholder: w.title, max: 30 },
          { key: "kicker", type: "text", label: "Line under the title", placeholder: "Wedding Invitation", max: 34 },
        ],
      },
      {
        title: "The couple",
        fields: [
          { key: "groomTitle", type: "text", label: "Before the groom's name", placeholder: w.groomTitle, max: 16 },
          { key: "groomName", type: "text", label: "Groom", placeholder: c.sample.groom, max: 24 },
          { key: "groomParents", type: "text", label: "Groom's parents", placeholder: c.sample.groomParents, max: 60 },
          { key: "brideTitle", type: "text", label: "Before the bride's name", placeholder: w.brideTitle, max: 16 },
          { key: "brideName", type: "text", label: "Bride", placeholder: c.sample.bride, max: 24 },
          { key: "brideParents", type: "text", label: "Bride's parents", placeholder: c.sample.brideParents, max: 60 },
          { key: "photo", type: "image", label: "Photo (optional)", ratio: "1 / 1" },
        ],
      },
      {
        title: "Muhurtham & venue",
        fields: [
          { key: "muhurthamLabel", type: "text", label: "Heading", placeholder: w.muhurtham, max: 24 },
          { key: "weddingDate", type: "date", label: "Date" },
          { key: "weddingTime", type: "time", label: "Time" },
          { key: "venueLabel", type: "text", label: "Venue heading", placeholder: w.venue, max: 20 },
          { key: "venueName", type: "text", label: "Venue", placeholder: c.sample.venueName, max: 40 },
          { key: "venueAddress", type: "textarea", label: "Address", placeholder: c.sample.venueAddress, max: 100 },
        ],
      },
      {
        title: "Sign-off",
        fields: [
          { key: "inviteLine", type: "textarea", label: "Invitation line", placeholder: w.invite, max: 90 },
          { key: "closingLine", type: "text", label: "Closing word", placeholder: w.closing, max: 30 },
          { key: "rsvp", type: "text", label: "RSVP", placeholder: "RSVP · name · mobile number", max: 60, hint: "A mobile number here becomes an \"RSVP on WhatsApp\" button for guests." },
        ],
      },
    ],
    defaults: {
      headerText: w.title,
      kicker: "Wedding Invitation",
      groomTitle: w.groomTitle,
      groomName: c.sample.groom,
      groomParents: c.sample.groomParents,
      brideTitle: w.brideTitle,
      brideName: c.sample.bride,
      brideParents: c.sample.brideParents,
      photo: null,
      muhurthamLabel: w.muhurtham,
      weddingDate: c.sample.date,
      weddingTime: c.sample.time,
      venueLabel: w.venue,
      venueName: c.sample.venueName,
      venueAddress: c.sample.venueAddress,
      inviteLine: w.invite,
      closingLine: w.closing,
      rsvp: "",
    },

    backdrop: ({ T, theme, W, H, vertical }) => {
      const S: S = (a, b) => (vertical ? a : b);
      return (
        <>
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 38%," + theme.bg + " 0%," + theme.bg2 + " 96%)" }} />
          <Particles t={T} color={theme.accent} W={W} H={H} count={18} size={4} opacity={0.26} seed={71} />
          {c.backdrop({ t: T, theme, v: vertical, S, W, H, k: 1 })}
        </>
      );
    },

    build: (data, orientation, theme) => {
      const v = orientation === "vertical";
      const S: S = function <T>(a: T, b: T): T {
        return v ? a : b;
      };
      const native = c.font;
      // A person: small honorific, the name in the script, the parents' line under it.
      const person = (t: number, start: number, title: string, name: string, parents: string) => (
        <div style={{ textAlign: "center" }}>
          {title ? (
            <div style={{ fontFamily: native, color: theme.accent, fontSize: S(46, 44), lineHeight: 1.5, ...fade(t, { start, dur: 800 }) }}>{title}</div>
          ) : null}
          <Headline t={t} theme={theme} v={v} start={start + 150} size={S(118, 112)} font={native} color={theme.ink} lineHeight={1.5}>
            {name}
          </Headline>
          {parents ? (
            <div style={{ fontFamily: theme.fontBody, color: theme.soft, fontStyle: "italic", fontSize: S(40, 36), marginTop: S(4, 2), ...fade(t, { start: start + 600, dur: 800 }) }}>{parents}</div>
          ) : null}
        </div>
      );

      const scenes: Scene[] = [
        {
          id: "header",
          label: "Header",
          duration: 5200,
          in: { kind: "fade", dur: 800 },
          out: { kind: "fade", dur: 900 },
          render: ({ t, W, H }) => (
            <Layer>
              {c.centerpiece({ t, theme, v, S, W, H, k: 1 })}
              <div style={{ textAlign: "center", marginTop: S(36, 18), maxWidth: S(960, 1500) }}>
                <Headline t={t} theme={theme} v={v} start={1300} size={S(100, 96)} font={native} color={theme.accent} lineHeight={1.5}>
                  {data.headerText}
                </Headline>
                {data.kicker ? (
                  <Kicker t={t} theme={theme} v={v} start={2100} size={36} style={{ marginTop: S(18, 12) }}>
                    {data.kicker}
                  </Kicker>
                ) : null}
              </div>
            </Layer>
          ),
        },
        {
          id: "names",
          label: "The couple",
          duration: 6400,
          in: { kind: "zoom-out", dur: 900 },
          out: { kind: "fade", dur: 800 },
          render: ({ t, d, W, H }) => (
            <Layer style={{ flexDirection: v ? "column" : "row", gap: S(40, 110) }}>
              {data.photo?.src ? (
                <PhotoCircle t={t} d={d} theme={theme} src={data.photo.src} size={S(430, 520)} ringWidth={12} />
              ) : (
                <div style={{ opacity: 0.9 }}>{c.emblem({ t, theme, v, S, W, H, k: 1 })}</div>
              )}
              <div>
                {person(t, 500, data.groomTitle, data.groomName, data.groomParents)}
                <div style={{ textAlign: "center", fontFamily: native, color: theme.accent, fontSize: S(44, 42), margin: S("18px 0", "10px 0"), ...fade(t, { start: 1500, dur: 800 }) }}>{w.joiner}</div>
                {person(t, 1700, data.brideTitle, data.brideName, data.brideParents)}
              </div>
            </Layer>
          ),
        },
        {
          id: "muhurtham",
          label: "Muhurtham & date",
          duration: 5600,
          in: { kind: "slide-up", dur: 850 },
          out: { kind: "fade", dur: 800 },
          render: ({ t, W, H }) => (
            <Layer style={{ flexDirection: v ? "column" : "row", gap: S(30, 120) }}>
              {c.emblem({ t, theme, v, S, W, H, k: S(0.7, 0.85) })}
              <div style={{ textAlign: "center" }}>
                <Headline t={t} theme={theme} v={v} start={100} size={S(88, 86)} font={native} color={theme.accent} lineHeight={1.5}>
                  {data.muhurthamLabel}
                </Headline>
                <div style={{ display: "grid", placeItems: "center", margin: S("20px 0 34px", "12px 0 22px") }}>
                  <DiamondRule t={t} start={500} width={S(320, 360)} color={theme.line} />
                </div>
                <DateBlock t={t} theme={theme} v={v} start={600} date={data.weddingDate} time={data.weddingTime} divider={false} />
              </div>
            </Layer>
          ),
        },
        {
          id: "venue",
          label: "Venue",
          duration: 5200,
          in: { kind: "slide-left", dur: 850 },
          out: { kind: "fade", dur: 800 },
          render: ({ t, W, H }) => (
            <Layer>
              {v ? <div style={{ marginBottom: 30 }}>{c.emblem({ t, theme, v, S, W, H, k: 0.5 })}</div> : null}
              {data.venueLabel ? (
                <Headline t={t} theme={theme} v={v} start={100} size={S(76, 74)} font={native} color={theme.accent} lineHeight={1.5} style={{ marginBottom: S(24, 14) }}>
                  {data.venueLabel}
                </Headline>
              ) : null}
              <VenueBlock t={t} theme={theme} v={v} start={500} label="" name={data.venueName} address={data.venueAddress} nameSize={S(84, 84)} maxWidth={S(920, 1400)} />
            </Layer>
          ),
        },
        {
          id: "close",
          label: "Closing",
          duration: 5600,
          in: { kind: "iris", dur: 1000 },
          render: ({ t }) => (
            <Layer>
              <div style={{ textAlign: "center", maxWidth: S(940, 1500) }}>
                {String(data.inviteLine || "")
                  .split("\n")
                  .filter(Boolean)
                  .map((l: string, i: number) => (
                    <Headline key={i} t={t} theme={theme} v={v} start={300 + i * 260} size={S(62, 64)} font={native} color={theme.ink} lineHeight={1.6}>
                      {l}
                    </Headline>
                  ))}
                <div style={{ display: "grid", placeItems: "center", margin: S("36px 0", "24px 0") }}>
                  <DiamondRule t={t} start={1300} width={S(320, 360)} color={theme.line} />
                </div>
                <div style={{ fontFamily: native, color: theme.accent, fontSize: S(64, 62), lineHeight: 1.5, ...rise(t, { start: 1600, dur: 1000, dist: 20 }) }}>
                  {data.groomName} {w.joiner} {data.brideName}
                </div>
                {data.closingLine ? (
                  <div style={{ fontFamily: native, color: theme.soft, fontSize: S(48, 46), lineHeight: 1.5, marginTop: S(20, 12), ...fade(t, { start: 2100, dur: 900 }) }}>{data.closingLine}</div>
                ) : null}
                {data.rsvp ? (
                  <div style={{ fontFamily: theme.fontBody, color: theme.soft, fontSize: S(42, 38), letterSpacing: "0.06em", marginTop: S(30, 20), ...fade(t, { start: 2600, dur: 1000 }) }}>{data.rsvp}</div>
                ) : null}
              </div>
            </Layer>
          ),
        },
      ];
      return scenes;
    },
  };
}
