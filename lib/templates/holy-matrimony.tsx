import React from "react";
import type { Scene, TemplateDef, Theme } from "../types";
import { E, drawPath, fade, mix, pop, rise, tw } from "../anim";
import { DiamondRule, Layer, Petals, Photo, Sprig, dateParts, prettyTime } from "@/components/primitives";
import { DateBlock, Headline, Kicker, VenueBlock, lines } from "@/components/blocks";

/* Holy Matrimony — a Christian church wedding: wedding bells on a ribbon bow, a cathedral rose window, the couple
   framed in a lancet (pointed) church-window arch, a verse from 1 Corinthians 13 (editable, or hidden), ceremony
   and reception. Ivory & gold by default. No cross is drawn: couples who want one can say so in a verse line. */

/** A pointed church-window arch, w × h, as a path from the bottom-left corner. `a` = height of the pointed top. */
const lancet = (w: number, h: number, a = Math.min(w * 0.62, h * 0.55)) =>
  `M0 ${h} L0 ${a} C0 ${a * 0.45} ${w * 0.28} ${a * 0.12} ${w / 2} 0 C${w * 0.72} ${a * 0.12} ${w} ${a * 0.45} ${w} ${a} L${w} ${h} Z`;

/** Two wedding bells under a ribbon bow, swinging gently. */
function Bells({ t, size, theme, start = 0 }: { t: number; size: number; theme: Theme; start?: number }) {
  const p = tw(t, start, 1100, E.outBack);
  const swing = Math.sin((t - start) / 520) * 9 * Math.min(1, tw(t, start, 1600));
  const bell = (x: number, rot: number, id: string) => (
    <g transform={`translate(${x} 34) rotate(${rot.toFixed(2)} 0 0)`}>
      <defs>
        <linearGradient id={id} x1="0" x2="1">
          <stop offset="0" stopColor={theme.line} />
          <stop offset="0.45" stopColor={theme.accent} />
          <stop offset="1" stopColor={theme.line} />
        </linearGradient>
      </defs>
      <path d="M0 0 C-11 0 -15 11 -15 23 C-15 34 -19 40 -25 45 L25 45 C19 40 15 34 15 23 C15 11 11 0 0 0 Z" fill={`url(#${id})`} />
      <rect x="-27" y="44" width="54" height="5" rx="2.5" fill={theme.line} />
      <circle cx="0" cy="54" r="5.5" fill={theme.accent} />
    </g>
  );
  return (
    <svg width={size} height={size * 0.75} viewBox="0 0 120 90" style={{ overflow: "visible", transform: "scale(" + mix(p, 0.6, 1).toFixed(3) + ")", opacity: Math.min(1, p * 1.4) }}>
      {bell(44, -14 + swing, "hm-bell-a")}
      {bell(76, 14 - swing * 0.8, "hm-bell-b")}
      {/* the bow: two loops and two tails */}
      <g fill="none" stroke={theme.accent} strokeWidth="3.2" strokeLinecap="round">
        <path d="M60 30 C48 16 38 22 44 30 C48 35 56 33 60 30 Z" />
        <path d="M60 30 C72 16 82 22 76 30 C72 35 64 33 60 30 Z" />
        <path d="M58 32 C54 42 50 48 46 52" />
        <path d="M62 32 C66 42 70 48 74 52" />
      </g>
      <circle cx="60" cy="30" r="4" fill={theme.accent} />
    </svg>
  );
}

/** A cathedral rose window: rings and twelve petals of tracery that draw themselves, turning very slowly. */
function RoseWindow({ t, size, color, start = 0, opacity = 1 }: { t: number; size: number; color: string; start?: number; opacity?: number }) {
  const ring = (r: number, d: number) => <circle cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth="0.6" style={drawPath(t, 2 * Math.PI * r, { start: start + d, dur: 1600 })} />;
  const petals = Array.from({ length: 12 }, (_, i) => i * 30);
  const pp = tw(t, start + 700, 1400, E.outCubic);
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ opacity, transform: "rotate(" + ((t / 1000) * 3).toFixed(2) + "deg)" }}>
      {ring(48, 0)}
      {ring(44, 150)}
      {ring(14, 300)}
      {ring(6, 450)}
      <g style={{ opacity: pp }}>
        {petals.map((a) => (
          <g key={a} transform={`rotate(${a} 50 50)`}>
            <ellipse cx="50" cy="29" rx="5.2" ry="14" fill="none" stroke={color} strokeWidth="0.6" />
            <circle cx="50" cy="9" r="3" fill="none" stroke={color} strokeWidth="0.5" />
          </g>
        ))}
      </g>
    </svg>
  );
}

/** A lancet arch outline drawing itself around a box of w × h. */
function ArchFrame({ t, w, h, color, start = 0, gap = 26 }: { t: number; w: number; h: number; color: string; start?: number; gap?: number }) {
  const W2 = w + gap * 2;
  const H2 = h + gap * 2;
  const outer = lancet(W2, H2);
  const inner = lancet(w, h);
  const len = 2 * H2 + 2 * W2;
  return (
    <svg width={W2} height={H2} viewBox={`0 0 ${W2} ${H2}`} style={{ position: "absolute", left: -gap, top: -gap, overflow: "visible" }}>
      <path d={outer} fill="none" stroke={color} strokeWidth="2.5" style={drawPath(t, len, { start, dur: 2000 })} />
      <path d={inner} transform={`translate(${gap} ${gap})`} fill="none" stroke={color} strokeWidth="1.2" opacity="0.7" style={drawPath(t, len, { start: start + 300, dur: 2000 })} />
    </svg>
  );
}

export const holyMatrimony: TemplateDef = {
  id: "holy-matrimony",
  name: "Holy Matrimony",
  tagline: "Church wedding: wedding bells, a cathedral rose window, your photo in a church-window arch, a verse",
  tags: ["Church", "Christian", "Elegant"],
  categories: ["wedding"],
  communities: ["christian"],
  isNew: true,
  poster: "names",
  fonts: { display: "var(--f-cormorant)", script: "var(--f-vibes)", body: "var(--f-cormorant)" },
  palettes: [
    { id: "ivory", name: "Ivory & Gold", ink: "#3B2F2A", soft: "#76665A", accent: "#B08D57", bg: "#FCF8F1", bg2: "#EFE4D1", line: "#C6A46A" },
    { id: "navy", name: "Navy & Gold", ink: "#F7F1E3", soft: "#C9C2B0", accent: "#DDB86C", bg: "#16264A", bg2: "#0A1428", line: "#C9A45C" },
    { id: "sage", name: "Sage Garden", ink: "#2E3A2E", soft: "#5D6B5B", accent: "#7F925A", bg: "#F5F7EF", bg2: "#DCE5CF", line: "#9CAF84" },
    { id: "blush", name: "Blush Rose", ink: "#4A2C33", soft: "#8A6169", accent: "#BD6B7B", bg: "#FCF2F1", bg2: "#F1D7D9", line: "#D6A1AB" },
  ],
  thumb: (p) => (
    <div style={{ width: "100%", height: "100%", background: "linear-gradient(180deg," + p.bg + "," + p.bg2 + ")", display: "grid", placeItems: "center" }}>
      <svg width="40" height="54" viewBox="0 0 40 54">
        <path d={lancet(32, 46, 22)} transform="translate(4 4)" fill="none" stroke={p.accent} strokeWidth="1.6" />
        <circle cx="20" cy="22" r="6" fill="none" stroke={p.line} strokeWidth="1" />
        <circle cx="20" cy="22" r="2" fill={p.accent} />
      </svg>
    </div>
  ),
  groups: [
    {
      title: "The couple",
      fields: [
        { key: "brideName", type: "text", label: "Bride's name", placeholder: "Anna", max: 22 },
        { key: "brideParents", type: "text", label: "Bride's parents", placeholder: "Daughter of Mr. & Mrs. Thomas D'Souza", max: 56 },
        { key: "groomName", type: "text", label: "Groom's name", placeholder: "Joel", max: 22 },
        { key: "groomParents", type: "text", label: "Groom's parents", placeholder: "Son of Mr. & Mrs. George Fernandes", max: 56 },
        { key: "photo", type: "image", label: "Couple photo", ratio: "3 / 4", hint: "Shown in a church-window arch" },
      ],
    },
    {
      title: "Opening",
      fields: [
        { key: "kicker", type: "text", label: "Opening line", placeholder: "Together with their families", max: 40 },
        { key: "invitation", type: "textarea", label: "Invitation", placeholder: "request the honour of your presence\nat the Holy Matrimony of", max: 100 },
      ],
    },
    {
      title: "Verse",
      fields: [
        { key: "showVerse", type: "toggle", label: "Show a verse" },
        { key: "verse", type: "textarea", label: "Verse", placeholder: "Love is patient, love is kind.", max: 160, hint: "One line per row" },
        { key: "verseRef", type: "text", label: "Reference", placeholder: "1 Corinthians 13:4, 7", max: 36 },
      ],
    },
    {
      title: "The ceremony",
      fields: [
        { key: "weddingDate", type: "date", label: "Date" },
        { key: "weddingTime", type: "time", label: "Time" },
        { key: "venueName", type: "text", label: "Church", placeholder: "St. Thomas Cathedral", max: 40 },
        { key: "venueAddress", type: "textarea", label: "Address", placeholder: "Fort\nMumbai", max: 100 },
      ],
    },
    {
      title: "Reception",
      fields: [
        { key: "showReception", type: "toggle", label: "Include reception" },
        { key: "receptionDate", type: "date", label: "Reception date" },
        { key: "receptionTime", type: "time", label: "Reception time" },
        { key: "receptionVenue", type: "text", label: "Reception venue", placeholder: "The Taj Mahal Palace", max: 40 },
      ],
    },
    {
      title: "Sign-off",
      fields: [
        { key: "closingLine", type: "text", label: "Closing line", placeholder: "Your presence will be our greatest blessing", max: 56 },
        { key: "rsvp", type: "text", label: "RSVP", placeholder: "RSVP · Mrs. Maria D'Souza · +91 98200 45678", max: 60, hint: "A mobile number here becomes an \"RSVP on WhatsApp\" button for guests" },
      ],
    },
  ],
  defaults: {
    brideName: "Anna",
    brideParents: "Daughter of Mr. & Mrs. Thomas D'Souza",
    groomName: "Joel",
    groomParents: "Son of Mr. & Mrs. George Fernandes",
    photo: null,
    kicker: "Together with their families",
    invitation: "request the honour of your presence\nat the Holy Matrimony of",
    showVerse: true,
    verse: "Love is patient, love is kind.\nIt always protects, always trusts,\nalways hopes, always perseveres.",
    verseRef: "1 Corinthians 13:4, 7",
    weddingDate: "2026-12-19",
    weddingTime: "16:00",
    venueName: "St. Thomas Cathedral",
    venueAddress: "Fort\nMumbai",
    showReception: true,
    receptionDate: "2026-12-19",
    receptionTime: "19:30",
    receptionVenue: "The Taj Mahal Palace",
    closingLine: "Your presence will be our greatest blessing",
    rsvp: "RSVP · Mrs. Maria D'Souza · +91 98200 45678",
  },

  backdrop: ({ T, theme, W, H, vertical }) => (
    <>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 32%," + theme.bg + " 0%," + theme.bg2 + " 100%)" }} />
      <div style={{ position: "absolute", left: vertical ? -30 : 40, top: vertical ? 40 : 30, opacity: 0.55 }}>
        <Sprig t={T} color={theme.line} size={vertical ? 300 : 260} />
      </div>
      <div style={{ position: "absolute", right: vertical ? -30 : 40, bottom: vertical ? 40 : 30, opacity: 0.55, transform: "rotate(180deg)" }}>
        <Sprig t={T} color={theme.line} size={vertical ? 300 : 260} start={300} />
      </div>
      <Petals t={T} color={theme.line} count={vertical ? 14 : 18} W={W} H={H} seed={21} />
    </>
  ),

  build: (data, orientation, theme) => {
    const v = orientation === "vertical";
    const S = function <T>(a: T, b: T): T {
      return v ? a : b;
    };
    const parents = (t: number, text: string | undefined, start: number) =>
      text ? (
        <div style={{ fontFamily: theme.fontBody, color: theme.soft, fontStyle: "italic", fontSize: S(40, 38), marginTop: S(4, 6), maxWidth: S(700, 460), marginInline: "auto", ...fade(t, { start, dur: 900 }) }}>{text}</div>
      ) : null;

    const scenes: Scene[] = [
      {
        id: "bells",
        label: "Opening",
        duration: 5200,
        in: { kind: "fade", dur: 800 },
        out: { kind: "fade", dur: 900 },
        render: ({ t }) => (
          <Layer>
            <Bells t={t} size={S(420, 300)} theme={theme} start={200} />
            <div style={{ textAlign: "center", marginTop: S(40, 20), maxWidth: S(920, 1400) }}>
              <Kicker t={t} theme={theme} v={v} start={1000} size={36}>
                {data.kicker}
              </Kicker>
              <div style={{ marginTop: S(30, 20) }}>
                {lines(data.invitation).map((l, i) => (
                  <div key={i} style={{ fontFamily: theme.fontBody, color: theme.ink, fontStyle: "italic", fontSize: S(58, 56), lineHeight: 1.4, ...rise(t, { start: 1400 + i * 220, dur: 1000, dist: 20 }) }}>
                    {l}
                  </div>
                ))}
              </div>
              <div style={{ display: "grid", placeItems: "center", marginTop: S(44, 30) }}>
                <DiamondRule t={t} start={2200} width={S(340, 380)} color={theme.line} />
              </div>
            </div>
          </Layer>
        ),
      },
      {
        id: "names",
        label: "The couple",
        duration: 6400,
        in: { kind: "zoom-out", dur: 1000 },
        out: { kind: "fade", dur: 900 },
        render: ({ t }) => {
          const w = S(760, 1240);
          const h = S(1180, 720);
          return (
            <Layer>
              <div style={{ position: "absolute", display: "grid", placeItems: "center", top: S(450, 190) }}>
                <RoseWindow t={t} size={S(420, 300)} color={theme.line} start={200} opacity={0.4} />
              </div>
              <div style={{ position: "relative", width: w, height: h, display: "flex", flexDirection: v ? "column" : "row", alignItems: "center", justifyContent: v ? "flex-end" : "center", gap: S(10, 70), paddingBottom: S(110, 0), paddingTop: S(0, 140) }}>
                <ArchFrame t={t} w={w} h={h} color={theme.line} start={100} />
                <div style={{ textAlign: "center" }}>
                  <Headline t={t} theme={theme} v={v} start={900} size={S(150, 150)} font={theme.fontScript} color={theme.ink}>
                    {data.brideName}
                  </Headline>
                  {parents(t, data.brideParents, 1300)}
                </div>
                <div style={{ fontFamily: theme.fontScript, color: theme.accent, fontSize: S(96, 110), lineHeight: 1, margin: S("6px 0", "0"), ...pop(t, { start: 1600, dur: 900 }) }}>&amp;</div>
                <div style={{ textAlign: "center" }}>
                  <Headline t={t} theme={theme} v={v} start={1900} size={S(150, 150)} font={theme.fontScript} color={theme.ink}>
                    {data.groomName}
                  </Headline>
                  {parents(t, data.groomParents, 2300)}
                </div>
              </div>
            </Layer>
          );
        },
      },
    ];

    if (data.showVerse !== false && lines(data.verse).length) {
      scenes.push({
        id: "verse",
        label: "Verse",
        duration: 6000,
        in: { kind: "fade", dur: 900 },
        out: { kind: "fade", dur: 900 },
        render: ({ t }) => (
          <Layer>
            <div style={{ position: "absolute", display: "grid", placeItems: "center" }}>
              <RoseWindow t={t} size={S(900, 820)} color={theme.line} opacity={0.16} />
            </div>
            <div style={{ textAlign: "center", maxWidth: S(900, 1400), position: "relative" }}>
              <div style={{ fontFamily: theme.fontScript, color: theme.accent, fontSize: S(140, 150), lineHeight: 0.6, height: S(70, 70), ...fade(t, { start: 200, dur: 900 }) }}>“</div>
              {lines(data.verse).map((l, i) => (
                <Headline key={i} t={t} theme={theme} v={v} start={500 + i * 420} size={S(66, 70)} italic lineHeight={1.35}>
                  {l}
                </Headline>
              ))}
              {data.verseRef ? (
                <div style={{ marginTop: S(40, 30), fontFamily: theme.fontBody, color: theme.accent, fontSize: S(40, 40), letterSpacing: "0.22em", textTransform: "uppercase", ...rise(t, { start: 900 + lines(data.verse).length * 420, dur: 1000, dist: 18 }) }}>
                  {data.verseRef}
                </div>
              ) : null}
            </div>
          </Layer>
        ),
      });
    }

    scenes.push({
      id: "photo",
      label: "Photo",
      duration: 5000,
      in: { kind: "iris", dur: 1000 },
      out: { kind: "fade", dur: 900 },
      render: ({ t, d }) => {
        const w = S(640, 520);
        const h = S(900, 760);
        return (
          <Layer>
            <div style={{ position: "relative", width: w, height: h, transform: "scale(" + mix(tw(t, 0, 1400, E.outExpo), 0.92, 1).toFixed(4) + ")" }}>
              <ArchFrame t={t} w={w} h={h} color={theme.line} start={300} gap={22} />
              <Photo src={data.photo?.src} t={t} d={d} theme={theme} style={{ position: "absolute", inset: 0, clipPath: "path('" + lancet(w, h) + "')" }} />
            </div>
            <div style={{ marginTop: S(60, 34), fontFamily: theme.fontScript, color: theme.ink, fontSize: S(96, 90), ...rise(t, { start: 1200, dur: 1000, dist: 22 }) }}>
              {data.brideName} &amp; {data.groomName}
            </div>
          </Layer>
        );
      },
    });

    scenes.push({
      id: "ceremony",
      label: "The ceremony",
      duration: 6200,
      in: { kind: "slide-up", dur: 900 },
      out: { kind: "fade", dur: 900 },
      render: ({ t }) => (
        <Layer style={{ flexDirection: v ? "column" : "row", gap: S(70, 160) }}>
          <div style={{ textAlign: "center" }}>
            <Headline t={t} theme={theme} v={v} start={100} size={S(104, 108)} font={theme.fontScript} color={theme.accent}>
              The Ceremony
            </Headline>
            <DateBlock t={t} theme={theme} v={v} start={400} date={data.weddingDate} time={data.weddingTime} timeLabel="at" divider={false} />
          </div>
          <VenueBlock t={t} theme={theme} v={v} start={1500} label="At" name={data.venueName} address={data.venueAddress} nameSize={S(78, 80)} maxWidth={S(900, 760)} />
        </Layer>
      ),
    });

    if (data.showReception !== false && data.receptionDate) {
      const r = dateParts(data.receptionDate);
      scenes.push({
        id: "reception",
        label: "Reception",
        duration: 5000,
        in: { kind: "slide-left", dur: 900 },
        out: { kind: "fade", dur: 900 },
        render: ({ t }) => (
          <Layer>
            <Kicker t={t} theme={theme} v={v} start={100} size={36}>
              followed by
            </Kicker>
            <Headline t={t} theme={theme} v={v} start={300} size={S(130, 130)} font={theme.fontScript} color={theme.accent}>
              Reception
            </Headline>
            <div style={{ display: "grid", placeItems: "center", margin: S("26px 0 30px", "18px 0 22px") }}>
              <DiamondRule t={t} start={800} width={S(300, 340)} color={theme.line} />
            </div>
            <div style={{ fontFamily: theme.fontDisplay, color: theme.ink, fontSize: S(66, 70), ...rise(t, { start: 900, dur: 900, dist: 20 }) }}>
              {r.weekday}, {Number(r.day)} {r.month}
            </div>
            {data.receptionTime ? (
              <div style={{ fontFamily: theme.fontBody, color: theme.soft, fontSize: S(48, 50), letterSpacing: "0.12em", marginTop: 12, ...rise(t, { start: 1150, dur: 900, dist: 16 }) }}>{prettyTime(data.receptionTime)} onwards</div>
            ) : null}
            {data.receptionVenue ? (
              <div style={{ fontFamily: theme.fontDisplay, color: theme.ink, fontSize: S(58, 60), marginTop: S(36, 26), ...rise(t, { start: 1400, dur: 900, dist: 16 }) }}>{data.receptionVenue}</div>
            ) : null}
          </Layer>
        ),
      });
    }

    scenes.push({
      id: "close",
      label: "Closing",
      duration: 5600,
      in: { kind: "fade", dur: 1000 },
      render: ({ t }) => (
        <Layer>
          <Bells t={t} size={S(220, 190)} theme={theme} start={100} />
          <div style={{ textAlign: "center", maxWidth: S(920, 1400), marginTop: S(36, 20) }}>
            <Headline t={t} theme={theme} v={v} start={500} size={S(92, 96)} font={theme.fontScript} color={theme.ink} lineHeight={1.3}>
              {data.closingLine}
            </Headline>
            <div style={{ fontFamily: theme.fontDisplay, color: theme.accent, fontSize: S(56, 58), letterSpacing: "0.2em", textTransform: "uppercase", marginTop: S(40, 28), ...rise(t, { start: 1500, dur: 1000, dist: 20 }) }}>
              {data.brideName} &amp; {data.groomName}
            </div>
            {data.rsvp ? (
              <div style={{ fontFamily: theme.fontBody, color: theme.soft, fontSize: S(40, 40), letterSpacing: "0.08em", marginTop: S(30, 20), ...fade(t, { start: 2100, dur: 1000 }) }}>{data.rsvp}</div>
            ) : null}
          </div>
        </Layer>
      ),
    });

    return scenes;
  },
};
