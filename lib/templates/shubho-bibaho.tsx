import React from "react";
import type { Scene, TemplateDef, Theme } from "../types";
import { E, drawPath, fade, mix, pop, rise, tw } from "../anim";
import { DiamondRule, Layer, Particles, dateParts, prettyTime } from "@/components/primitives";
import { DateBlock, Headline, Kicker, PhotoCircle, VenueBlock, lines } from "@/components/blocks";

/* Shubho Bibaho — a Bengali wedding: a lal-paar (red-bordered white) sari border, a prajapati (butterfly, the symbol
   printed on Bengali wedding cards) fluttering in over "শ্রী শ্রী প্রজাপতয়ে নমঃ", a white alpana drawing itself, the
   shankha-pola (white conch and red coral bangles) as the couple's ring, শ্রীমান (groom) and কল্যাণীয়া (bride),
   বৌভাত (Bou Bhaat) as the reception, and the closing আপনাদের উপস্থিতি একান্ত কাম্য, signed বিনীত. */

const BN = "var(--f-bengali)";
const SHANKHA = "#FFFFFF";
const POLA = "#B3121F";

/** A lal-paar sari border: a red band edged in gold with a row of small white dots. */
function LalPaar({ t, W, h, theme, flip = false, start = 0 }: { t: number; W: number; h: number; theme: Theme; flip?: boolean; start?: number }) {
  const p = tw(t, start, 1500, E.inOutCubic);
  const n = Math.ceil(W / (h * 0.7));
  return (
    <svg width={W} height={h} viewBox={`0 0 ${W} ${h}`} style={{ display: "block", transform: (flip ? "scaleY(-1) " : "") + "scaleX(" + p.toFixed(4) + ")" }}>
      <rect x="0" y="0" width={W} height={h * 0.74} fill={POLA} />
      <rect x="0" y={h * 0.1} width={W} height={h * 0.05} fill={theme.line} />
      <rect x="0" y={h * 0.6} width={W} height={h * 0.05} fill={theme.line} />
      {Array.from({ length: n }, (_, i) => (
        <circle key={i} cx={(i + 0.5) * h * 0.7} cy={h * 0.375} r={h * 0.07} fill={SHANKHA} opacity={0.9} />
      ))}
      <rect x="0" y={h * 0.82} width={W} height={h * 0.04} fill={POLA} opacity={0.7} />
    </svg>
  );
}

/** A prajapati (butterfly) that flies in and keeps beating its wings. */
function Prajapati({ t, size, theme, start = 0 }: { t: number; size: number; theme: Theme; start?: number }) {
  const p = tw(t, start, 1900, E.outCubic);
  const flap = 0.35 + 0.65 * Math.abs(Math.cos((t - start) / 170));
  const x = mix(p, -size * 1.6, 0);
  const y = mix(p, size * 0.9, 0) + Math.sin((t - start) / 420) * size * 0.04;
  const wing = (d: string, fill: string) => <path d={d} fill={fill} stroke={theme.line} strokeWidth="0.8" />;
  const half = (
    <g>
      {wing("M0 0 C-10 -30 -46 -40 -44 -12 C-42 6 -16 6 0 0 Z", POLA)}
      {wing("M0 0 C-14 10 -34 30 -20 36 C-8 40 -2 20 0 0 Z", theme.accent)}
      <circle cx="-26" cy="-14" r="5" fill={SHANKHA} opacity="0.9" />
      <circle cx="-16" cy="22" r="3" fill={SHANKHA} opacity="0.85" />
    </g>
  );
  return (
    <svg width={size} height={size * 0.8} viewBox="-50 -42 100 84" style={{ overflow: "visible", transform: `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) rotate(${mix(p, -25, -6).toFixed(2)}deg)`, opacity: Math.min(1, p * 2) }}>
      <g transform={`scale(${flap.toFixed(3)} 1)`}>
        {half}
        <g transform="scale(-1 1)">{half}</g>
      </g>
      <ellipse cx="0" cy="2" rx="2.6" ry="17" fill={theme.ink} />
      <path d="M-1 -14 C-5 -24 -9 -28 -13 -30 M1 -14 C5 -24 9 -28 13 -30" stroke={theme.ink} strokeWidth="1.2" fill="none" strokeLinecap="round" />
    </svg>
  );
}

/** A white alpana (rice-paste floor art): rings of dots, lotus petals and swirls, drawn in from the centre. */
function Alpana({ t, size, color, start = 0, opacity = 1 }: { t: number; size: number; color: string; start?: number; opacity?: number }) {
  const ring = (r: number, d: number, dotted = false) => (
    <circle cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth={dotted ? 1.6 : 0.7} strokeLinecap="round" strokeDasharray={dotted ? "0.01 3.2" : undefined} style={dotted ? { opacity: tw(t, start + d, 900) } : drawPath(t, 2 * Math.PI * r, { start: start + d, dur: 1400 })} />
  );
  const petals = tw(t, start + 500, 1200, E.outCubic);
  const swirls = tw(t, start + 900, 1200, E.outCubic);
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ opacity, transform: "rotate(" + ((t / 1000) * 2.5).toFixed(2) + "deg)" }}>
      {ring(5, 0)}
      {ring(11, 100)}
      {ring(15, 200, true)}
      <g style={{ opacity: petals }}>
        {Array.from({ length: 16 }, (_, i) => (
          <path key={i} transform={`rotate(${i * 22.5} 50 50)`} d="M50 18 C45.5 24 45.5 30 50 34 C54.5 30 54.5 24 50 18 Z" fill="none" stroke={color} strokeWidth="0.8" />
        ))}
      </g>
      {ring(37, 400)}
      <g style={{ opacity: swirls }}>
        {Array.from({ length: 8 }, (_, i) => (
          <path key={i} transform={`rotate(${i * 45 + 22.5} 50 50)`} d="M50 5 C56 7 57 13 52 15 C49 16 48 13 50 12" fill="none" stroke={color} strokeWidth="0.8" strokeLinecap="round" />
        ))}
      </g>
      {ring(46, 600, true)}
    </svg>
  );
}

/** Shankha-pola: a white conch bangle and a red coral bangle, the sign of a Bengali bride. */
function ShankhaPola({ t, size, edge, start = 0 }: { t: number; size: number; edge: string; start?: number }) {
  const p = tw(t, start, 900, E.outBack);
  return (
    <svg width={size} height={size * 0.62} viewBox="0 0 100 62" style={{ transform: "scale(" + p.toFixed(3) + ")" }}>
      {/* the white conch bangle gets a fine edge, so it shows on ivory too */}
      <circle cx="38" cy="31" r="22" fill="none" stroke={edge} strokeWidth="11" />
      <circle cx="38" cy="31" r="22" fill="none" stroke={SHANKHA} strokeWidth="9" />
      <circle cx="38" cy="31" r="22" fill="none" stroke={edge} strokeWidth="1" strokeDasharray="1 3" />
      <circle cx="62" cy="31" r="22" fill="none" stroke={POLA} strokeWidth="9" />
    </svg>
  );
}

export const shubhoBibaho: TemplateDef = {
  id: "shubho-bibaho",
  name: "Shubho Bibaho",
  tagline: "Bengali wedding: lal-paar border, prajapati butterfly, alpana, shankha-pola, শ্রীমান & কল্যাণীয়া, বৌভাত",
  tags: ["Bengali", "Alpana", "Lal-paar"],
  categories: ["wedding"],
  communities: ["hindu"],
  isNew: true,
  poster: "header",
  fonts: { display: "var(--f-playfair)", script: "var(--f-vibes)", body: "var(--f-cormorant)" },
  palettes: [
    { id: "lalpaar", name: "Lal Paar", ink: "#4E0C12", soft: "#86413F", accent: "#B3121F", bg: "#FCF7EE", bg2: "#F1E4CC", line: "#C9962F" },
    { id: "sindoor", name: "Sindoor Red", ink: "#FFF3E6", soft: "#F1C9B8", accent: "#F4C542", bg: "#9B0F1A", bg2: "#4C060C", line: "#E9C46A" },
    { id: "banarasi", name: "Banarasi", ink: "#FFEFD9", soft: "#E8C8A6", accent: "#E8B54A", bg: "#5A0B23", bg2: "#28040F", line: "#D9A441" },
    { id: "shola", name: "Shola & Leaf", ink: "#2C4627", soft: "#5B7254", accent: "#B3121F", bg: "#F8F8F2", bg2: "#E4ECDA", line: "#7FA05A" },
  ],
  thumb: (p) => (
    <div style={{ width: "100%", height: "100%", background: "linear-gradient(180deg," + p.bg + "," + p.bg2 + ")", position: "relative", display: "grid", placeItems: "center" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 7, background: POLA, borderBottom: "2px solid " + p.line }} />
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 7, background: POLA, borderTop: "2px solid " + p.line }} />
      <span style={{ fontFamily: BN, color: p.accent === POLA ? POLA : p.accent, fontSize: 14 }}>শুভ বিবাহ</span>
    </div>
  ),
  groups: [
    {
      title: "Header",
      fields: [
        { key: "invocation", type: "text", label: "Invocation", placeholder: "শ্রী শ্রী প্রজাপতয়ে নমঃ", max: 36, hint: "Leave blank to hide" },
        { key: "title", type: "text", label: "Title", placeholder: "শুভ বিবাহ", max: 16 },
        { key: "hosts", type: "textarea", label: "With the blessings of", placeholder: "Shri Subrata & Smt. Mitali Banerjee\nShri Partha & Smt. Rupa Chatterjee", max: 140 },
      ],
    },
    {
      title: "The couple",
      fields: [
        { key: "honorifics", type: "toggle", label: "Use শ্রীমান / কল্যাণীয়া" },
        { key: "groomName", type: "text", label: "Groom's name", placeholder: "Arnab", max: 22 },
        { key: "groomParents", type: "text", label: "Groom's parents", placeholder: "Son of Shri Subrata & Smt. Mitali Banerjee", max: 56 },
        { key: "brideName", type: "text", label: "Bride's name", placeholder: "Ishita", max: 22 },
        { key: "brideParents", type: "text", label: "Bride's parents", placeholder: "Daughter of Shri Partha & Smt. Rupa Chatterjee", max: 56 },
        { key: "photo", type: "image", label: "Couple photo", ratio: "1 / 1", hint: "Shown in a shankha-pola ring" },
      ],
    },
    {
      title: "The wedding",
      fields: [
        { key: "weddingDate", type: "date", label: "Date" },
        { key: "weddingTime", type: "time", label: "Lagna (time)" },
        { key: "bengaliDate", type: "text", label: "Bengali date (optional)", placeholder: "e.g. ১৪ মাঘ ১৪৩৩", max: 30 },
        { key: "venueName", type: "text", label: "Venue", placeholder: "Rajbari Banquets", max: 40 },
        { key: "venueAddress", type: "textarea", label: "Address", placeholder: "Salt Lake, Sector V\nKolkata", max: 100 },
      ],
    },
    {
      title: "Bou Bhaat (reception)",
      fields: [
        { key: "showReception", type: "toggle", label: "Include Bou Bhaat" },
        { key: "receptionLabel", type: "text", label: "Name", placeholder: "Bou Bhaat", max: 24 },
        { key: "receptionDate", type: "date", label: "Date" },
        { key: "receptionTime", type: "time", label: "Time" },
        { key: "receptionVenue", type: "text", label: "Venue", placeholder: "Banerjee Bhavan, Behala", max: 40 },
      ],
    },
    {
      title: "Sign-off",
      fields: [
        { key: "closingLine", type: "text", label: "Closing line", placeholder: "Your presence is earnestly requested", max: 56 },
        { key: "inviters", type: "textarea", label: "বিনীত (humbly, from)", placeholder: "Banerjee & Chatterjee families", max: 100 },
        { key: "rsvp", type: "text", label: "RSVP", placeholder: "RSVP · Subrata Banerjee · +91 98310 22445", max: 60, hint: "A mobile number here becomes an \"RSVP on WhatsApp\" button for guests" },
      ],
    },
  ],
  defaults: {
    invocation: "শ্রী শ্রী প্রজাপতয়ে নমঃ",
    title: "শুভ বিবাহ",
    hosts: "Shri Subrata & Smt. Mitali Banerjee\nShri Partha & Smt. Rupa Chatterjee",
    honorifics: true,
    groomName: "Arnab",
    groomParents: "Son of Shri Subrata & Smt. Mitali Banerjee",
    brideName: "Ishita",
    brideParents: "Daughter of Shri Partha & Smt. Rupa Chatterjee",
    photo: null,
    weddingDate: "2027-01-28",
    weddingTime: "20:15",
    bengaliDate: "",
    venueName: "Rajbari Banquets",
    venueAddress: "Salt Lake, Sector V\nKolkata",
    showReception: true,
    receptionLabel: "Bou Bhaat",
    receptionDate: "2027-01-30",
    receptionTime: "19:30",
    receptionVenue: "Banerjee Bhavan, Behala",
    closingLine: "Your presence is earnestly requested",
    inviters: "Banerjee & Chatterjee families",
    rsvp: "RSVP · Subrata Banerjee · +91 98310 22445",
  },

  backdrop: ({ T, theme, W, H, vertical }) => {
    const bh = vertical ? 78 : 62;
    return (
      <>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 40%," + theme.bg + " 0%," + theme.bg2 + " 100%)" }} />
        <Particles t={T} color={theme.line} W={W} H={H} count={12} size={4} opacity={0.3} seed={91} />
        <div style={{ position: "absolute", top: 0, left: 0 }}>
          <LalPaar t={T} W={W} h={bh} theme={theme} start={100} />
        </div>
        <div style={{ position: "absolute", bottom: 0, left: 0 }}>
          <LalPaar t={T} W={W} h={bh} theme={theme} flip start={300} />
        </div>
      </>
    );
  },

  build: (data, orientation, theme) => {
    const v = orientation === "vertical";
    const S = function <T>(a: T, b: T): T {
      return v ? a : b;
    };
    const hon = data.honorifics !== false;
    const honor = (text: string) => <div style={{ fontFamily: BN, fontSize: S(44, 42), color: theme.accent, lineHeight: 1.2 }}>{text}</div>;
    const parents = (t: number, text: string | undefined, start: number) =>
      text ? <div style={{ fontFamily: theme.fontBody, color: theme.soft, fontStyle: "italic", fontSize: S(40, 36), maxWidth: S(880, 560), margin: "4px auto 0", ...fade(t, { start, dur: 900 }) }}>{text}</div> : null;
    const alpanaColor = theme.line;

    const scenes: Scene[] = [
      {
        id: "header",
        label: "Shubho Bibaho",
        duration: 5800,
        in: { kind: "fade", dur: 800 },
        out: { kind: "fade", dur: 900 },
        render: ({ t }) => (
          <Layer>
            <div style={{ position: "absolute", display: "grid", placeItems: "center" }}>
              <Alpana t={t} size={S(900, 760)} color={alpanaColor} start={200} opacity={0.32} />
            </div>
            <Prajapati t={t} size={S(300, 230)} theme={theme} start={100} />
            {data.invocation ? (
              <div style={{ fontFamily: BN, color: theme.accent, fontSize: S(50, 46), marginTop: S(30, 16), ...fade(t, { start: 1500, dur: 900 }) }}>{data.invocation}</div>
            ) : null}
            <Headline t={t} theme={theme} v={v} start={1900} size={S(190, 170)} font={BN} color={theme.ink} lineHeight={1.35}>
              {data.title}
            </Headline>
            <Kicker t={t} theme={theme} v={v} start={2600} size={38}>
              Wedding Invitation
            </Kicker>
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
                request the pleasure of your company
                {v ? <br /> : " "}
                at the wedding of
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
          <Layer style={{ flexDirection: v ? "column" : "row", gap: S(0, 70) }}>
            <div style={{ textAlign: "center", ...fade(t, { start: 300, dur: 900 }) }}>
              {hon ? honor("শ্রীমান") : null}
              <Headline t={t} theme={theme} v={v} start={500} size={S(140, 130)} font={theme.fontScript} color={theme.ink}>
                {data.groomName}
              </Headline>
              {parents(t, data.groomParents, 900)}
            </div>
            <div style={{ margin: S("30px 0", "0"), display: "grid", placeItems: "center" }}>
              <ShankhaPola t={t} size={S(170, 160)} edge={theme.line} start={1200} />
            </div>
            <div style={{ textAlign: "center", ...fade(t, { start: 1300, dur: 900 }) }}>
              {hon ? honor("কল্যাণীয়া") : null}
              <Headline t={t} theme={theme} v={v} start={1500} size={S(140, 130)} font={theme.fontScript} color={theme.ink}>
                {data.brideName}
              </Headline>
              {parents(t, data.brideParents, 1900)}
            </div>
          </Layer>
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
            <div style={{ position: "absolute", display: "grid", placeItems: "center" }}>
              <Alpana t={t + 2000} size={S(980, 820)} color={alpanaColor} opacity={0.3} />
            </div>
            <div style={{ transform: "scale(" + mix(tw(t, 0, 1200, E.outExpo), 0.9, 1).toFixed(4) + ")" }}>
              <PhotoCircle t={t} d={d} theme={theme} src={data.photo?.src} size={S(660, 600)} ring={"repeating-conic-gradient(" + POLA + " 0deg 15deg, " + SHANKHA + " 15deg 30deg)"} ringWidth={18} />
            </div>
            <div style={{ marginTop: S(50, 30), fontFamily: theme.fontScript, color: theme.ink, fontSize: S(96, 90), ...rise(t, { start: 1100, dur: 1000, dist: 22 }) }}>
              {data.groomName} &amp; {data.brideName}
            </div>
          </Layer>
        ),
      },
      {
        id: "wedding",
        label: "Date & venue",
        duration: 6200,
        in: { kind: "slide-up", dur: 850 },
        out: { kind: "fade", dur: 800 },
        render: ({ t }) => (
          <Layer style={{ flexDirection: v ? "column" : "row", gap: S(60, 150) }}>
            <div style={{ textAlign: "center" }}>
              <Headline t={t} theme={theme} v={v} start={100} size={S(110, 110)} font={theme.fontScript} color={theme.accent}>
                The Wedding
              </Headline>
              <DateBlock t={t} theme={theme} v={v} start={400} date={data.weddingDate} time={data.weddingTime} timeLabel="Lagna" divider={false} />
              {data.bengaliDate ? <div style={{ fontFamily: BN, color: theme.soft, fontSize: S(46, 46), marginTop: S(16, 12), ...fade(t, { start: 1500, dur: 900 }) }}>{data.bengaliDate}</div> : null}
            </div>
            <VenueBlock t={t} theme={theme} v={v} start={1500} label="Venue" name={data.venueName} address={data.venueAddress} nameSize={S(72, 72)} maxWidth={S(900, 760)} />
          </Layer>
        ),
      },
    ];

    if (data.showReception !== false && data.receptionDate) {
      const r = dateParts(data.receptionDate);
      const label = data.receptionLabel || "Bou Bhaat";
      scenes.push({
        id: "reception",
        label: label,
        duration: 5000,
        in: { kind: "slide-left", dur: 850 },
        out: { kind: "fade", dur: 800 },
        render: ({ t }) => (
          <Layer>
            {/^bou ?bhaa?t$/i.test(label) ? (
              <Headline t={t} theme={theme} v={v} start={100} size={S(130, 120)} font={BN} color={theme.accent} lineHeight={1.35}>
                বৌভাত
              </Headline>
            ) : null}
            <Headline t={t} theme={theme} v={v} start={400} size={S(96, 96)} font={theme.fontScript} color={theme.ink}>
              {label}
            </Headline>
            <div style={{ display: "grid", placeItems: "center", margin: S("26px 0", "20px 0") }}>
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
          <Prajapati t={t} size={S(200, 170)} theme={theme} start={0} />
          <div style={{ textAlign: "center", maxWidth: S(940, 1400), marginTop: S(24, 10) }}>
            <Headline t={t} theme={theme} v={v} start={500} size={S(84, 86)} font={BN} color={theme.accent} lineHeight={1.45}>
              আপনাদের উপস্থিতি{v ? <br /> : " "}একান্ত কাম্য
            </Headline>
            <div style={{ fontFamily: theme.fontBody, color: theme.ink, fontStyle: "italic", fontSize: S(50, 52), marginTop: S(10, 6), ...rise(t, { start: 1100, dur: 1000, dist: 18 }) }}>{data.closingLine}</div>
            {lines(data.inviters).length ? (
              <div style={{ marginTop: S(44, 28) }}>
                <div style={{ fontFamily: BN, color: theme.accent, fontSize: S(48, 46), ...fade(t, { start: 1600, dur: 900 }) }}>বিনীত</div>
                {lines(data.inviters).map((l, i) => (
                  <div key={i} style={{ fontFamily: theme.fontDisplay, color: theme.ink, fontSize: S(52, 54), marginTop: 8, ...rise(t, { start: 1800 + i * 180, dur: 900, dist: 16 }) }}>
                    {l}
                  </div>
                ))}
              </div>
            ) : null}
            {data.rsvp ? (
              <div style={{ fontFamily: theme.fontBody, color: theme.soft, fontSize: S(40, 40), letterSpacing: "0.06em", marginTop: S(30, 20), ...fade(t, { start: 2400, dur: 1000 }) }}>{data.rsvp}</div>
            ) : null}
          </div>
        </Layer>
      ),
    });

    return scenes;
  },
};
