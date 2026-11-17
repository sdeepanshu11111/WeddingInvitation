import React from "react";
import type { Scene, TemplateDef, Theme } from "../types";
import { E, clamp, drawPath, fade, rise, tw } from "../anim";
import { DiamondRule, Layer, Particles, Photo } from "@/components/primitives";
import { DateBlock, Headline, Kicker, Names, VenueBlock } from "@/components/blocks";
import { Lantern } from "@/components/indian";

/* Rajwada Palace (2026-11-17): a Rajasthani palace wedding. A palace skyline draws itself (domes, chhatris, a
   crenellated wall), and every scene sits inside a jharokha: a cusped arch window that opens, with the couple's photo
   in the central one. Lanterns hang from the top. Everything is a function of t; ornaments are plain SVG. */

/** A jharokha arch (a pointed, slightly cusped arch on straight jambs) as an SVG path in a w × h box. */
const arch = (w: number, h: number) => {
  const spring = h * 0.38; // where the curve starts
  const cusp = w * 0.06;
  return (
    "M0 " + h + " L0 " + spring.toFixed(1) +
    " C0 " + (spring * 0.55).toFixed(1) + " " + (w * 0.22).toFixed(1) + " " + (spring * 0.3).toFixed(1) + " " + (w * 0.36).toFixed(1) + " " + (spring * 0.18).toFixed(1) +
    " Q" + (w / 2 - cusp).toFixed(1) + " " + (spring * 0.12).toFixed(1) + " " + (w / 2).toFixed(1) + " 0" +
    " Q" + (w / 2 + cusp).toFixed(1) + " " + (spring * 0.12).toFixed(1) + " " + (w * 0.64).toFixed(1) + " " + (spring * 0.18).toFixed(1) +
    " C" + (w * 0.78).toFixed(1) + " " + (spring * 0.3).toFixed(1) + " " + w + " " + (spring * 0.55).toFixed(1) + " " + w + " " + spring.toFixed(1) +
    " L" + w + " " + h + " Z"
  );
};

/** The arch outline with an inner second line and a small finial, drawn on over `dur`. */
function Jharokha({ t, w, h, theme, start = 0, children }: { t: number; w: number; h: number; theme: Theme; start?: number; children?: React.ReactNode }) {
  const pad = 22;
  const outer = arch(w, h);
  const inner = arch(w - pad * 2, h - pad);
  const len = (w + h) * 2.4;
  const open = tw(t, start + 300, 1200, E.outCubic);
  return (
    <div style={{ position: "relative", width: w, height: h }}>
      {children ? (
        <div style={{ position: "absolute", left: pad, top: pad, width: w - pad * 2, height: h - pad, clipPath: "path('" + inner + "')", opacity: open }}>{children}</div>
      ) : null}
      <svg width={w} height={h + 40} viewBox={"0 -40 " + w + " " + (h + 40)} style={{ position: "absolute", left: 0, top: -40, overflow: "visible" }}>
        <path d={outer} fill="none" stroke={theme.line} strokeWidth={5} style={drawPath(t, len, { start, dur: 1500 })} />
        <path d={inner} transform={"translate(" + pad + " " + pad + ")"} fill="none" stroke={theme.accent} strokeWidth={2} opacity={0.8} style={drawPath(t, len, { start: start + 250, dur: 1500 })} />
        {/* finial: a small kalash shape on the point */}
        <g transform={"translate(" + w / 2 + " -6) scale(" + clamp(tw(t, start + 1100, 700, E.outBack)).toFixed(3) + ")"}>
          <circle cy={-18} r={9} fill={theme.accent} />
          <path d="M-6 -10 L6 -10 L3 0 L-3 0 Z" fill={theme.line} />
          <path d="M0 -38 L0 -27" stroke={theme.accent} strokeWidth={3} />
        </g>
      </svg>
    </div>
  );
}

/** A palace skyline: central dome on a drum, two chhatris, a crenellated wall with arched openings. Drawn on. */
function Palace({ t, w, theme, start = 0 }: { t: number; w: number; theme: Theme; start?: number }) {
  const h = w * 0.62;
  const s = w / 1000;
  const dome = (cx: number, base: number, r: number) =>
    "M" + (cx - r) + " " + base + " C" + (cx - r) + " " + (base - r * 1.25) + " " + (cx - r * 0.2) + " " + (base - r * 1.45) + " " + cx + " " + (base - r * 1.8) +
    " C" + (cx + r * 0.2) + " " + (base - r * 1.45) + " " + (cx + r) + " " + (base - r * 1.25) + " " + (cx + r) + " " + base + " Z";
  const merlons = Array.from({ length: 21 }, (_, i) => "M" + (i * 50) + " 410 h28 v-22 h-28 Z").join(" ");
  const openings = [140, 260, 380, 620, 740, 860].map((x) => "M" + (x - 26) + " 600 V512 Q" + x + " 470 " + (x + 26) + " 512 V600").join(" ");
  const p = tw(t, start, 1600, E.outCubic);
  return (
    <svg width={w} height={h} viewBox="0 0 1000 620" style={{ overflow: "visible", opacity: clamp(p * 1.4) }}>
      <g fill={theme.bg2} fillOpacity={0.35} stroke={theme.line} strokeWidth={4 / Math.max(s, 0.4)} strokeLinejoin="round">
        <path d="M40 620 V410 H960 V620 Z" style={drawPath(t, 2600, { start, dur: 1400 })} />
        <path d={merlons} fillOpacity={0.6} />
        <path d="M380 410 V250 H620 V410" style={drawPath(t, 900, { start: start + 300, dur: 1300 })} />
        <path d={dome(500, 250, 120)} fill={theme.accent} fillOpacity={0.22} style={drawPath(t, 900, { start: start + 500, dur: 1300 })} />
        <path d="M150 410 V320 H250 V410 M750 410 V320 H850 V410" style={drawPath(t, 700, { start: start + 700, dur: 1200 })} />
        <path d={dome(200, 320, 58)} fill={theme.accent} fillOpacity={0.22} style={drawPath(t, 500, { start: start + 900, dur: 1100 })} />
        <path d={dome(800, 320, 58)} fill={theme.accent} fillOpacity={0.22} style={drawPath(t, 500, { start: start + 900, dur: 1100 })} />
        <path d={openings} fill={theme.bg} fillOpacity={0.4} style={drawPath(t, 1600, { start: start + 1000, dur: 1200 })} />
      </g>
      {/* finials on the three domes */}
      {[
        [500, 34],
        [200, 216],
        [800, 216],
      ].map(([x, y], i) => (
        <g key={i} transform={"translate(" + x + " " + y + ") scale(" + clamp(tw(t, start + 1500 + i * 120, 600, E.outBack)).toFixed(3) + ")"}>
          <path d="M0 -40 V0" stroke={theme.accent} strokeWidth={5} />
          <circle cy={-46} r={9} fill={theme.accent} />
        </g>
      ))}
    </svg>
  );
}

export const rajwadaPalace: TemplateDef = {
  id: "rajwada-palace",
  name: "Rajwada Palace",
  tagline: "A Rajasthani palace wedding: the palace draws itself, jharokha arch windows open, lanterns glow",
  tags: ["Palace", "Rajasthani", "Royal"],
  categories: ["wedding"],
  communities: ["hindu"],
  isNew: true,
  poster: "names",
  fonts: { display: "var(--f-cinzel)", script: "var(--f-vibes)", body: "var(--f-cormorant)" },
  palettes: [
    { id: "jaipur", name: "Jaipur Pink", ink: "#FFF2EA", soft: "#F2C9C0", accent: "#F3C969", bg: "#9C2F4A", bg2: "#4E0F22", line: "#E8B04A" },
    { id: "udaipur", name: "Udaipur Lake", ink: "#F3F7FA", soft: "#BFD3DE", accent: "#E9C46A", bg: "#14445C", bg2: "#08202D", line: "#D9B35A" },
    { id: "jodhpur", name: "Jodhpur Blue & Ivory", ink: "#1E2E4A", soft: "#4D5E7A", accent: "#B5822A", bg: "#F7F1E6", bg2: "#E7DCC7", line: "#B5822A" },
    { id: "jaisalmer", name: "Jaisalmer Gold", ink: "#3D2410", soft: "#6E4B2C", accent: "#A0441E", bg: "#F5D9A8", bg2: "#E2B474", line: "#8E5A20" },
  ],
  thumb: (p) => (
    <div style={{ width: "100%", height: "100%", background: "linear-gradient(160deg," + p.bg + "," + p.bg2 + ")", display: "grid", placeItems: "center" }}>
      <svg width="44" height="44" viewBox="0 0 100 100">
        <path d="M18 96 V52 C18 36 34 30 42 26 Q48 22 50 10 Q52 22 58 26 C66 30 82 36 82 52 V96" fill="none" stroke={p.accent} strokeWidth={5} />
      </svg>
    </div>
  ),
  groups: [
    {
      title: "Titles",
      fields: [
        { key: "kicker", type: "text", label: "Opening line", placeholder: "With the blessings of our elders", max: 40 },
        { key: "title", type: "text", label: "Title", placeholder: "Shubh Vivah", max: 24 },
      ],
    },
    {
      title: "The couple",
      fields: [
        { key: "groomName", type: "text", label: "Groom", placeholder: "Vikram", max: 22 },
        { key: "groomParents", type: "text", label: "Groom's parents", placeholder: "Son of Mr & Mrs Rathore", max: 60 },
        { key: "brideName", type: "text", label: "Bride", placeholder: "Meera", max: 22 },
        { key: "brideParents", type: "text", label: "Bride's parents", placeholder: "Daughter of Mr & Mrs Shekhawat", max: 60 },
        { key: "photo", type: "image", label: "Photo (in the arch)", ratio: "3 / 4" },
      ],
    },
    {
      title: "When & where",
      fields: [
        { key: "weddingDate", type: "date", label: "Date" },
        { key: "weddingTime", type: "time", label: "Time" },
        { key: "venueName", type: "text", label: "Venue", placeholder: "City Palace", max: 40 },
        { key: "venueAddress", type: "textarea", label: "Address", placeholder: "Udaipur, Rajasthan", max: 100 },
      ],
    },
    {
      title: "Sign-off",
      fields: [
        { key: "closingLine", type: "text", label: "Closing line", placeholder: "Padharo mhare des", max: 48 },
        { key: "rsvp", type: "text", label: "RSVP", placeholder: "RSVP · name · mobile number", max: 60, hint: "A mobile number here becomes an \"RSVP on WhatsApp\" button for guests." },
      ],
    },
  ],
  defaults: {
    kicker: "With the blessings of our elders",
    title: "Shubh Vivah",
    groomName: "Vikram",
    groomParents: "Son of Mr & Mrs Rathore",
    brideName: "Meera",
    brideParents: "Daughter of Mr & Mrs Shekhawat",
    photo: null,
    weddingDate: "2027-02-11",
    weddingTime: "19:30",
    venueName: "City Palace",
    venueAddress: "Udaipur, Rajasthan",
    closingLine: "Padharo mhare des",
    rsvp: "", // no sample number: a mobile here becomes a live "RSVP on WhatsApp" button for guests
  },

  backdrop: ({ T, theme, W, H, vertical }) => (
    <>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 30%," + theme.bg + " 0%," + theme.bg2 + " 92%)" }} />
      {/* faint lattice of small arches */}
      <svg width={W} height={H} style={{ position: "absolute", inset: 0, opacity: 0.07 }}>
        <defs>
          <pattern id="rp-jali" width="90" height="120" patternUnits="userSpaceOnUse">
            <path d="M10 120 V60 C10 40 30 30 45 12 C60 30 80 40 80 60 V120" fill="none" stroke={theme.line} strokeWidth={3} />
          </pattern>
        </defs>
        <rect width={W} height={H} fill="url(#rp-jali)" />
      </svg>
      <Particles t={T} color={theme.accent} W={W} H={H} count={20} size={4} opacity={0.3} seed={91} />
      <div style={{ position: "absolute", top: 0, left: vertical ? 70 : 220 }}>
        <Lantern t={T} color={theme.line} glow={theme.accent} len={vertical ? 220 : 120} size={vertical ? 60 : 50} seed={1} />
      </div>
      <div style={{ position: "absolute", top: 0, right: vertical ? 70 : 220 }}>
        <Lantern t={T} color={theme.line} glow={theme.accent} len={vertical ? 160 : 90} size={vertical ? 52 : 44} seed={2} start={200} />
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
        id: "palace",
        label: "Palace",
        duration: 5600,
        in: { kind: "fade", dur: 700 },
        out: { kind: "fade", dur: 800 },
        render: ({ t }) => (
          <Layer style={{ gap: S(40, 26) }}>
            <Kicker t={t} theme={theme} v={v} start={200} size={34}>
              {data.kicker}
            </Kicker>
            <Palace t={t} w={S(900, 980)} theme={theme} start={300} />
            <Headline t={t} theme={theme} v={v} start={1900} size={S(150, 140)} font={theme.fontScript} color={theme.accent} lineHeight={1.3}>
              {data.title}
            </Headline>
          </Layer>
        ),
      },
      {
        id: "names",
        label: "The couple",
        duration: 6600,
        in: { kind: "zoom-out", dur: 900 },
        out: { kind: "fade", dur: 800 },
        render: ({ t, d }) => (
          <Layer style={{ flexDirection: v ? "column" : "row", gap: S(50, 120) }}>
            <Jharokha t={t} w={S(520, 520)} h={S(640, 660)} theme={theme} start={0}>
              <Photo src={data.photo?.src} t={t} d={d} theme={theme} style={{ width: "100%", height: "100%" }} />
            </Jharokha>
            <div style={{ textAlign: "center", maxWidth: S(940, 820) }}>
              <Names t={t} theme={theme} v={v} start={900} a={data.groomName} b={data.brideName} size={S(130, 130)} stack color={theme.ink} />
              <div style={{ fontFamily: theme.fontBody, color: theme.soft, fontStyle: "italic", fontSize: S(44, 42), marginTop: S(24, 18), lineHeight: 1.5, ...rise(t, { start: 2300, dur: 900, dist: 16 }) }}>
                {[data.groomParents, data.brideParents].filter(Boolean).map((l, i) => (
                  <div key={i}>{l}</div>
                ))}
              </div>
            </div>
          </Layer>
        ),
      },
      {
        id: "date",
        label: "Date",
        duration: 5600,
        in: { kind: "slide-up", dur: 850 },
        out: { kind: "fade", dur: 800 },
        render: ({ t }) => (
          <Layer>
            <Jharokha t={t} w={S(820, 900)} h={S(1000, 760)} theme={theme} start={0} />
            <div style={{ position: "absolute", display: "grid", placeItems: "center", textAlign: "center", marginTop: S(160, 120) }}>
              <Kicker t={t} theme={theme} v={v} start={700} size={34}>
                Save the date
              </Kicker>
              <div style={{ marginTop: S(30, 22) }}>
                <DateBlock t={t} theme={theme} v={v} start={900} date={data.weddingDate} time={data.weddingTime} divider={false} />
              </div>
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
        render: ({ t }) => (
          <Layer style={{ gap: S(40, 30) }}>
            <div style={{ opacity: 0.55 }}>
              <Palace t={t + 1600} w={S(620, 560)} theme={theme} />
            </div>
            <VenueBlock t={t} theme={theme} v={v} start={400} label="Venue" name={data.venueName} address={data.venueAddress} nameSize={S(84, 88)} maxWidth={S(920, 1400)} />
          </Layer>
        ),
      },
      {
        id: "close",
        label: "Closing",
        duration: 5400,
        in: { kind: "iris", dur: 1000 },
        render: ({ t }) => (
          <Layer>
            <div style={{ textAlign: "center", maxWidth: S(940, 1500) }}>
              <Headline t={t} theme={theme} v={v} start={300} size={S(110, 112)} font={theme.fontScript} color={theme.ink} lineHeight={1.3}>
                {data.closingLine}
              </Headline>
              <div style={{ display: "grid", placeItems: "center", margin: S("36px 0", "26px 0") }}>
                <DiamondRule t={t} start={1200} width={S(320, 360)} color={theme.line} />
              </div>
              <div style={{ fontFamily: theme.fontDisplay, color: theme.accent, fontSize: S(56, 58), letterSpacing: "0.06em", ...rise(t, { start: 1500, dur: 1000, dist: 20 }) }}>
                {data.groomName} &amp; {data.brideName}
              </div>
              {data.rsvp ? (
                <div style={{ fontFamily: theme.fontBody, color: theme.soft, fontSize: S(42, 38), letterSpacing: "0.06em", marginTop: S(30, 20), ...fade(t, { start: 2200, dur: 1000 }) }}>{data.rsvp}</div>
              ) : null}
            </div>
          </Layer>
        ),
      },
    ];
    return scenes;
  },
};
