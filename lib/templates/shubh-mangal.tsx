import React from "react";
import type { Scene, TemplateDef, Theme } from "../types";
import { E, drawPath, fade, mix, pop, rise, tw } from "../anim";
import { DiamondRule, Layer, Particles, dateParts, prettyTime } from "@/components/primitives";
import { DateBlock, Headline, Kicker, PhotoCircle, VenueBlock, lines } from "@/components/blocks";
import { Kalash } from "@/components/indian";

/* Shubh Mangal — a Marathi wedding in Paithani silk: deep green / rani pink / peacock blue with a gold zari
   border, peacock feathers (morpankh, the Paithani signature) and a kalash. The card wording Marathi families
   expect: ॥ श्री गणेशाय नमः ॥, शुभविवाह, ॥ शुभमंगल सावधान ॥, चि. (groom) and चि. सौ. कां. (bride), शुभ मुहूर्त,
   स्वागत समारंभ (reception), आपली उपस्थिती प्रार्थनीय and आग्रहाचे निमंत्रण (with warm invitation from). */

const DEVA = "var(--f-devanagari)";
const TITLE = "var(--f-yatra), var(--f-devanagari)";

/** A zari sari border: gold rule, a row of temple triangles, dots, and a fine inner rule. It weaves in from the centre. */
function Zari({ t, W, h, theme, flip = false, start = 0 }: { t: number; W: number; h: number; theme: Theme; flip?: boolean; start?: number }) {
  const p = tw(t, start, 1600, E.inOutCubic);
  const step = h * 0.9;
  const n = Math.ceil(W / step) + 1;
  return (
    <svg width={W} height={h} viewBox={`0 0 ${W} ${h}`} style={{ display: "block", transform: (flip ? "scaleY(-1) " : "") + "scaleX(" + p.toFixed(4) + ")" }}>
      <rect x="0" y="0" width={W} height={h * 0.16} fill={theme.line} />
      {Array.from({ length: n }, (_, i) => {
        const x = i * step;
        return (
          <g key={i}>
            <path d={`M${x} ${h * 0.16} L${x + step / 2} ${h * 0.7} L${x + step} ${h * 0.16} Z`} fill={theme.accent} opacity={0.9} />
            <path d={`M${x + step * 0.25} ${h * 0.16} L${x + step / 2} ${h * 0.48} L${x + step * 0.75} ${h * 0.16} Z`} fill={theme.bg2} opacity={0.55} />
            <circle cx={x + step} cy={h * 0.6} r={h * 0.07} fill={theme.accent} />
          </g>
        );
      })}
      <rect x="0" y={h * 0.86} width={W} height={h * 0.05} fill={theme.line} opacity={0.8} />
    </svg>
  );
}

/** A peacock feather (morpankh): the stem and barbs draw themselves, then the eye opens. Sways a little. */
function MorPankh({ t, h, start = 0, flip = false, sway = 1 }: { t: number; h: number; start?: number; flip?: boolean; sway?: number }) {
  const eye = tw(t, start + 900, 1100, E.outBack);
  const rot = Math.sin((t - start) / 900) * 3 * sway;
  const barbs = Array.from({ length: 22 }, (_, i) => 40 + i * 6.4);
  return (
    <svg width={h * 0.36} height={h} viewBox="0 0 72 200" style={{ overflow: "visible", transform: (flip ? "scaleX(-1) " : "") + "rotate(" + rot.toFixed(2) + "deg)", transformOrigin: "50% 100%" }}>
      <g fill="none" strokeLinecap="round">
        {barbs.map((y, i) => (
          <g key={i} stroke="#6E9E3A" strokeWidth="0.8" opacity={tw(t, start + 300 + i * 25, 500)}>
            <path d={`M36 ${y} Q${20 - (i % 3)} ${y - 8} ${10 + (i % 4)} ${y - 22}`} />
            <path d={`M36 ${y} Q${52 + (i % 3)} ${y - 8} ${62 - (i % 4)} ${y - 22}`} />
          </g>
        ))}
        <path d="M36 198 C35 150 37 100 36 44" stroke="#C9A24A" strokeWidth="1.6" style={drawPath(t, 160, { start, dur: 900 })} />
      </g>
      <g transform={`translate(36 40) scale(${eye.toFixed(4)})`}>
        <ellipse rx="22" ry="29" fill="#2E7D32" opacity="0.85" />
        <ellipse rx="17" ry="23" fill="#C9A24A" />
        <ellipse rx="13" ry="18" fill="#0E7C86" />
        <path d="M0 -12 C7 -12 9 -3 6 3 C4 7 2 9 0 12 C-2 9 -4 7 -6 3 C-9 -3 -7 -12 0 -12 Z" fill="#1A237E" />
        <ellipse cx="-2" cy="-5" rx="2.5" ry="3.5" fill="#64B5F6" opacity="0.8" />
      </g>
    </svg>
  );
}

const ZARI_RING = (theme: Theme) =>
  "repeating-conic-gradient(from 0deg, " + theme.accent + " 0deg 6deg, " + theme.line + " 6deg 12deg, " + theme.bg + " 12deg 15deg)";

export const shubhMangal: TemplateDef = {
  id: "shubh-mangal",
  name: "Shubh Mangal",
  tagline: "Marathi wedding in Paithani silk: zari border, peacock feathers, kalash, चि. & चि. सौ. कां., शुभ मुहूर्त",
  tags: ["Marathi", "Paithani", "Peacock"],
  categories: ["wedding"],
  communities: ["hindu"],
  isNew: true,
  poster: "header",
  fonts: { display: "var(--f-playfair)", script: "var(--f-vibes)", body: "var(--f-cormorant)" },
  palettes: [
    { id: "paithani", name: "Paithani Green", ink: "#FFF4DC", soft: "#E8D7AA", accent: "#F2C14E", bg: "#0F4D3A", bg2: "#06291F", line: "#D9A93A" },
    { id: "rani", name: "Rani Pink", ink: "#FFF1E8", soft: "#F3CADB", accent: "#FFD36B", bg: "#8E1555", bg2: "#4A0A2C", line: "#E6B347" },
    { id: "peacock", name: "Peacock Blue", ink: "#F3FAFB", soft: "#BEE0E8", accent: "#F2C14E", bg: "#0B4F6C", bg2: "#05283A", line: "#D9A93A" },
    { id: "ivory", name: "Ivory Zari", ink: "#4A2511", soft: "#7A4B2A", accent: "#A3122A", bg: "#FBF4E4", bg2: "#F0E0BD", line: "#B8861B" },
  ],
  thumb: (p) => (
    <div style={{ width: "100%", height: "100%", background: "linear-gradient(180deg," + p.bg + "," + p.bg2 + ")", position: "relative", display: "grid", placeItems: "center" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 8, background: "linear-gradient(135deg," + p.accent + " 25%, transparent 25%) -4px 0/8px 8px, linear-gradient(225deg," + p.accent + " 25%, transparent 25%) -4px 0/8px 8px", borderTop: "2px solid " + p.line }} />
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 4, background: p.line }} />
      <span style={{ fontFamily: TITLE, color: p.accent, fontSize: 15, marginTop: 6 }}>शुभविवाह</span>
    </div>
  ),
  groups: [
    {
      title: "Header",
      fields: [
        { key: "invocation", type: "text", label: "Invocation", placeholder: "॥ श्री गणेशाय नमः ॥", max: 36, hint: "Your family deity works too, e.g. ॥ श्री कुलस्वामिनी प्रसन्न ॥. Leave blank to hide." },
        { key: "title", type: "text", label: "Title", placeholder: "शुभविवाह", max: 16 },
        { key: "subTitle", type: "text", label: "Below the title", placeholder: "॥ शुभमंगल सावधान ॥", max: 30 },
        { key: "hosts", type: "textarea", label: "With the blessings of", placeholder: "Shri. Vijay & Sau. Sunanda Deshpande\nShri. Prakash & Sau. Meera Kulkarni", max: 140 },
      ],
    },
    {
      title: "The couple",
      fields: [
        { key: "honorifics", type: "toggle", label: "Use चि. / चि. सौ. कां." },
        { key: "groomName", type: "text", label: "Groom's name", placeholder: "Aniket", max: 22 },
        { key: "groomParents", type: "text", label: "Groom's parents", placeholder: "Son of Shri. Vijay & Sau. Sunanda Deshpande", max: 56 },
        { key: "brideName", type: "text", label: "Bride's name", placeholder: "Gauri", max: 22 },
        { key: "brideParents", type: "text", label: "Bride's parents", placeholder: "Daughter of Shri. Prakash & Sau. Meera Kulkarni", max: 56 },
        { key: "photo", type: "image", label: "Couple photo", ratio: "1 / 1", hint: "Shown in a zari ring" },
      ],
    },
    {
      title: "Muhurt & venue",
      fields: [
        { key: "muhurtLabel", type: "text", label: "Heading", placeholder: "शुभ मुहूर्त", max: 20, hint: "e.g. गोरज मुहूर्त for an evening wedding" },
        { key: "weddingDate", type: "date", label: "Date" },
        { key: "weddingTime", type: "time", label: "Muhurt time" },
        { key: "venueName", type: "text", label: "Venue (कार्यालय)", placeholder: "Shubhankar Mangal Karyalay", max: 40 },
        { key: "venueAddress", type: "textarea", label: "Address", placeholder: "Karve Road, Kothrud\nPune", max: 100 },
      ],
    },
    {
      title: "Reception (स्वागत समारंभ)",
      fields: [
        { key: "showReception", type: "toggle", label: "Include reception" },
        { key: "receptionDate", type: "date", label: "Date" },
        { key: "receptionTime", type: "time", label: "Time" },
        { key: "receptionVenue", type: "text", label: "Venue", placeholder: "Same venue", max: 40 },
      ],
    },
    {
      title: "Sign-off",
      fields: [
        { key: "inviters", type: "textarea", label: "आग्रहाचे निमंत्रण (with warm invitation from)", placeholder: "Deshpande & Kulkarni families", max: 100 },
        { key: "closingLine", type: "text", label: "Closing line", placeholder: "Your presence and blessings are requested", max: 56 },
        { key: "rsvp", type: "text", label: "RSVP", placeholder: "RSVP · Vijay Deshpande · +91 98220 33445", max: 60, hint: "A mobile number here becomes an \"RSVP on WhatsApp\" button for guests" },
      ],
    },
  ],
  defaults: {
    invocation: "॥ श्री गणेशाय नमः ॥",
    title: "शुभविवाह",
    subTitle: "॥ शुभमंगल सावधान ॥",
    hosts: "Shri. Vijay & Sau. Sunanda Deshpande\nShri. Prakash & Sau. Meera Kulkarni",
    honorifics: true,
    groomName: "Aniket",
    groomParents: "Son of Shri. Vijay & Sau. Sunanda Deshpande",
    brideName: "Gauri",
    brideParents: "Daughter of Shri. Prakash & Sau. Meera Kulkarni",
    photo: null,
    muhurtLabel: "शुभ मुहूर्त",
    weddingDate: "2027-02-05",
    weddingTime: "12:35",
    venueName: "Shubhankar Mangal Karyalay",
    venueAddress: "Karve Road, Kothrud\nPune",
    showReception: true,
    receptionDate: "2027-02-05",
    receptionTime: "19:00",
    receptionVenue: "Shubhankar Mangal Karyalay",
    inviters: "Deshpande & Kulkarni families",
    closingLine: "Your presence and blessings are requested",
    rsvp: "RSVP · Vijay Deshpande · +91 98220 33445",
  },

  backdrop: ({ T, theme, W, H, vertical }) => {
    const bh = vertical ? 92 : 72;
    return (
      <>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 38%," + theme.bg + " 0%," + theme.bg2 + " 100%)" }} />
        {/* a faint woven texture, like silk */}
        <div style={{ position: "absolute", inset: 0, opacity: 0.07, background: "repeating-linear-gradient(45deg," + theme.line + " 0 2px, transparent 2px 14px), repeating-linear-gradient(-45deg," + theme.line + " 0 2px, transparent 2px 14px)" }} />
        <Particles t={T} color={theme.accent} W={W} H={H} count={14} size={4} opacity={0.3} seed={77} />
        <div style={{ position: "absolute", top: 0, left: 0 }}>
          <Zari t={T} W={W} h={bh} theme={theme} start={100} />
        </div>
        <div style={{ position: "absolute", bottom: 0, left: 0 }}>
          <Zari t={T} W={W} h={bh} theme={theme} flip start={300} />
        </div>
      </>
    );
  },

  build: (data, orientation, theme) => {
    const v = orientation === "vertical";
    const S = function <T>(a: T, b: T): T {
      return v ? a : b;
    };
    const chi = data.honorifics !== false;
    const hon = (text: string) => <span style={{ fontFamily: DEVA, fontSize: "0.36em", color: theme.accent, marginRight: 16, verticalAlign: "0.35em" }}>{text}</span>;
    const parents = (t: number, text: string | undefined, start: number) =>
      text ? <div style={{ fontFamily: theme.fontBody, color: theme.soft, fontStyle: "italic", fontSize: S(40, 36), maxWidth: S(880, 560), margin: "4px auto 0", ...fade(t, { start, dur: 900 }) }}>{text}</div> : null;

    const scenes: Scene[] = [
      {
        id: "header",
        label: "Shubh Vivah",
        duration: 5600,
        in: { kind: "fade", dur: 800 },
        out: { kind: "fade", dur: 900 },
        render: ({ t }) => (
          <Layer>
            {data.invocation ? (
              <div style={{ fontFamily: DEVA, color: theme.accent, fontSize: S(46, 44), marginBottom: S(30, 14), ...fade(t, { start: 100, dur: 900 }) }}>{data.invocation}</div>
            ) : null}
            <div style={{ position: "relative", display: "flex", alignItems: "flex-end", justifyContent: "center", gap: S(4, 10) }}>
              <div style={{ transform: "rotate(-24deg)", transformOrigin: "50% 100%", marginRight: S(-40, -30) }}>
                <MorPankh t={t} h={S(420, 330)} start={300} flip />
              </div>
              <div style={{ position: "relative", zIndex: 1 }}>
                <Kalash t={t} size={S(300, 230)} start={200} />
              </div>
              <div style={{ transform: "rotate(24deg)", transformOrigin: "50% 100%", marginLeft: S(-40, -30) }}>
                <MorPankh t={t} h={S(420, 330)} start={450} />
              </div>
            </div>
            <div style={{ textAlign: "center", marginTop: S(20, 6) }}>
              <Headline t={t} theme={theme} v={v} start={1300} size={S(170, 150)} font={TITLE} color={theme.accent} lineHeight={1.3}>
                {data.title}
              </Headline>
              {data.subTitle ? (
                <Kicker t={t} theme={theme} v={v} start={2000} size={52} upper={false} spacing="0.04em" font={DEVA} color={theme.ink}>
                  {data.subTitle}
                </Kicker>
              ) : null}
            </div>
          </Layer>
        ),
      },
      {
        id: "blessing",
        label: "Blessings",
        duration: 5200,
        in: { kind: "fade", dur: 800 },
        out: { kind: "fade", dur: 800 },
        render: ({ t }) => (
          <Layer>
            <div style={{ textAlign: "center", maxWidth: S(920, 1400) }}>
              <Kicker t={t} theme={theme} v={v} start={200} size={36}>
                With the blessings of
              </Kicker>
              <div style={{ marginTop: S(36, 26) }}>
                {lines(data.hosts).map((l, i) => (
                  <Headline key={i} t={t} theme={theme} v={v} start={500 + i * 220} size={S(56, 60)} lineHeight={1.5}>
                    {l}
                  </Headline>
                ))}
              </div>
              <div style={{ display: "grid", placeItems: "center", margin: S("44px 0", "30px 0") }}>
                <DiamondRule t={t} start={1300} width={S(340, 380)} color={theme.line} />
              </div>
              <div style={{ fontFamily: theme.fontBody, color: theme.soft, fontStyle: "italic", fontSize: S(48, 50), ...rise(t, { start: 1700, dur: 1000, dist: 18 }) }}>
                invite you to the wedding of their children
              </div>
            </div>
          </Layer>
        ),
      },
      {
        id: "names",
        label: "The couple",
        duration: 6200,
        in: { kind: "zoom-out", dur: 900 },
        out: { kind: "fade", dur: 800 },
        render: ({ t }) => (
          <>
            <div style={{ position: "absolute", left: S(-30, 10), bottom: S(130, 70), transform: "rotate(" + S(-14, -20) + "deg)", opacity: 0.9 }}>
              <MorPankh t={t} h={S(560, 440)} start={0} flip />
            </div>
            <div style={{ position: "absolute", right: S(-30, 10), bottom: S(130, 70), transform: "rotate(" + S(14, 20) + "deg)", opacity: 0.9 }}>
              <MorPankh t={t} h={S(560, 440)} start={150} />
            </div>
            <Layer style={{ flexDirection: v ? "column" : "row", gap: S(0, 80) }}>
              <div style={{ textAlign: "center" }}>
                <Headline t={t} theme={theme} v={v} start={500} size={S(140, 130)} font={theme.fontScript} color={theme.ink}>
                  {chi ? hon("चि.") : null}
                  {data.groomName}
                </Headline>
                {parents(t, data.groomParents, 900)}
              </div>
              <div style={{ fontFamily: theme.fontScript, color: theme.accent, fontSize: S(96, 110), lineHeight: 1, margin: S("20px 0", "0"), ...pop(t, { start: 1200, dur: 900 }) }}>&amp;</div>
              <div style={{ textAlign: "center" }}>
                <Headline t={t} theme={theme} v={v} start={1400} size={S(140, 130)} font={theme.fontScript} color={theme.ink}>
                  {chi ? hon("चि. सौ. कां.") : null}
                  {data.brideName}
                </Headline>
                {parents(t, data.brideParents, 1800)}
              </div>
            </Layer>
          </>
        ),
      },
      {
        id: "photo",
        label: "Photo",
        duration: 4800,
        in: { kind: "iris", dur: 1000 },
        out: { kind: "fade", dur: 800 },
        render: ({ t, d }) => (
          <Layer>
            <div style={{ transform: "scale(" + mix(tw(t, 0, 1200, E.outExpo), 0.9, 1).toFixed(4) + ")" }}>
              <PhotoCircle t={t} d={d} theme={theme} src={data.photo?.src} size={S(680, 620)} ring={ZARI_RING(theme)} ringWidth={18} />
            </div>
            <div style={{ marginTop: S(50, 30), fontFamily: theme.fontScript, color: theme.ink, fontSize: S(96, 90), ...rise(t, { start: 1100, dur: 1000, dist: 22 }) }}>
              {data.groomName} &amp; {data.brideName}
            </div>
          </Layer>
        ),
      },
      {
        id: "muhurt",
        label: "Muhurt, date & venue",
        duration: 6200,
        in: { kind: "slide-up", dur: 850 },
        out: { kind: "fade", dur: 800 },
        render: ({ t }) => (
          <Layer style={{ flexDirection: v ? "column" : "row", gap: S(60, 150) }}>
            <div style={{ textAlign: "center" }}>
              <Headline t={t} theme={theme} v={v} start={100} size={S(110, 110)} font={TITLE} color={theme.accent} lineHeight={1.35}>
                {data.muhurtLabel || "शुभ मुहूर्त"}
              </Headline>
              <DateBlock t={t} theme={theme} v={v} start={400} date={data.weddingDate} time={data.weddingTime} timeLabel="at" divider={false} />
            </div>
            <VenueBlock t={t} theme={theme} v={v} start={1500} label="Venue" name={data.venueName} address={data.venueAddress} nameSize={S(72, 72)} maxWidth={S(900, 760)} />
          </Layer>
        ),
      },
    ];

    if (data.showReception !== false && data.receptionDate) {
      const r = dateParts(data.receptionDate);
      scenes.push({
        id: "reception",
        label: "Reception",
        duration: 5000,
        in: { kind: "slide-left", dur: 850 },
        out: { kind: "fade", dur: 800 },
        render: ({ t }) => (
          <Layer>
            <Headline t={t} theme={theme} v={v} start={100} size={S(104, 104)} font={TITLE} color={theme.accent} lineHeight={1.35}>
              स्वागत समारंभ
            </Headline>
            <Kicker t={t} theme={theme} v={v} start={500} size={38}>
              Reception
            </Kicker>
            <div style={{ display: "grid", placeItems: "center", margin: S("30px 0", "22px 0") }}>
              <DiamondRule t={t} start={800} width={S(300, 340)} color={theme.line} />
            </div>
            <div style={{ fontFamily: theme.fontDisplay, color: theme.ink, fontSize: S(64, 68), ...rise(t, { start: 900, dur: 900, dist: 20 }) }}>
              {r.weekday}, {Number(r.day)} {r.month}
            </div>
            {data.receptionTime ? (
              <div style={{ fontFamily: theme.fontBody, color: theme.soft, fontSize: S(48, 50), letterSpacing: "0.12em", marginTop: 12, ...rise(t, { start: 1150, dur: 900, dist: 16 }) }}>{prettyTime(data.receptionTime)} onwards</div>
            ) : null}
            {data.receptionVenue ? (
              <div style={{ fontFamily: theme.fontDisplay, color: theme.ink, fontSize: S(56, 58), marginTop: S(34, 24), ...rise(t, { start: 1400, dur: 900, dist: 16 }) }}>{data.receptionVenue}</div>
            ) : null}
          </Layer>
        ),
      });
    }

    scenes.push({
      id: "close",
      label: "Closing",
      duration: 5800,
      in: { kind: "fade", dur: 900 },
      render: ({ t }) => (
        <Layer>
          <Kalash t={t + 1500} size={S(230, 190)} />
          <div style={{ textAlign: "center", maxWidth: S(940, 1400), marginTop: S(24, 10) }}>
            <Headline t={t} theme={theme} v={v} start={300} size={S(96, 96)} font={TITLE} color={theme.accent} lineHeight={1.4}>
              आपली उपस्थिती प्रार्थनीय
            </Headline>
            <div style={{ fontFamily: theme.fontBody, color: theme.ink, fontStyle: "italic", fontSize: S(50, 52), marginTop: S(14, 8), ...rise(t, { start: 900, dur: 1000, dist: 18 }) }}>{data.closingLine}</div>
            {lines(data.inviters).length ? (
              <div style={{ marginTop: S(46, 30) }}>
                <Kicker t={t} theme={theme} v={v} start={1500} size={44} upper={false} spacing="0.04em" font={DEVA} color={theme.accent}>
                  आग्रहाचे निमंत्रण
                </Kicker>
                {lines(data.inviters).map((l, i) => (
                  <div key={i} style={{ fontFamily: theme.fontDisplay, color: theme.ink, fontSize: S(52, 54), marginTop: 10, ...rise(t, { start: 1700 + i * 180, dur: 900, dist: 16 }) }}>
                    {l}
                  </div>
                ))}
              </div>
            ) : null}
            {data.rsvp ? (
              <div style={{ fontFamily: theme.fontBody, color: theme.soft, fontSize: S(40, 40), letterSpacing: "0.06em", marginTop: S(30, 20), ...fade(t, { start: 2300, dur: 1000 }) }}>{data.rsvp}</div>
            ) : null}
          </div>
        </Layer>
      ),
    });

    return scenes;
  },
};
