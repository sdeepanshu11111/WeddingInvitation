import React from "react";
import type { Scene, TemplateDef } from "../types";
import { fade, rise } from "../anim";
import { DiamondRule, Layer, Particles, dateParts, prettyTime } from "@/components/primitives";
import { DateBlock, Headline, Kicker, PhotoCircle, VenueBlock, lines } from "@/components/blocks";
import { BananaLeaf, Bell, Kolam, StandingLamp, TempleBorder } from "@/components/indian";

/* South Indian Kalyanam — temple border, kuthuvilakku, bells, kolam, banana leaves.
   Header in Tamil / Telugu / Malayalam / Kannada. */

const SCRIPT_FONT = "var(--f-tamil), var(--f-telugu), var(--f-malayalam), var(--f-kannada), var(--f-devanagari), serif";

const HEADERS: Record<string, { title: string; sub: string }> = {
  tamil: { title: "சுப முகூர்த்தம்", sub: "திருமண அழைப்பிதழ்" },
  telugu: { title: "శుభ వివాహం", sub: "శుభలేఖ" },
  malayalam: { title: "ശുഭ വിവാഹം", sub: "വിവാഹ ക്ഷണം" },
  kannada: { title: "ಶುಭ ವಿವಾಹ", sub: "ಮದುವೆಯ ಆಮಂತ್ರಣ" },
  english: { title: "Subha Muhurtham", sub: "Wedding Invitation" },
};

export const southKalyanam: TemplateDef = {
  id: "south-kalyanam",
  name: "Kalyanam",
  tagline: "South Indian: temple border, brass lamp, bells, kolam, banana leaves, header in 4 scripts",
  tags: ["South Indian", "Temple", "Kolam"],
  categories: ["wedding"],
  communities: ["south-indian", "hindu"],
  isNew: true,
  poster: "names",
  fonts: { display: "var(--f-playfair)", script: "var(--f-vibes)", body: "var(--f-cormorant)" },
  palettes: [
    { id: "temple", name: "Temple Maroon", ink: "#FFF3D6", soft: "#E8C99A", accent: "#F2B705", bg: "#6E0F1A", bg2: "#3D0710", line: "#D4A017" },
    { id: "kasavu", name: "Kerala Kasavu", ink: "#3E2A12", soft: "#6E5230", accent: "#A0740A", bg: "#FBF5E6", bg2: "#F1E4C4", line: "#C9A227" },
    { id: "banana", name: "Banana Leaf", ink: "#FFF8E1", soft: "#D7E8C0", accent: "#FFD54F", bg: "#1E4D2B", bg2: "#0E2A17", line: "#E2B33C" },
    { id: "peacock", name: "Peacock Silk", ink: "#F1FBFA", soft: "#A7D8D3", accent: "#F2C14E", bg: "#0D4D57", bg2: "#3A0C33", line: "#E8B94A" },
  ],
  thumb: (p) => (
    <div style={{ width: "100%", height: "100%", background: p.bg, position: "relative", display: "grid", placeItems: "center" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 10, background: "linear-gradient(135deg," + p.line + " 25%, transparent 25%) -5px 0/10px 10px, linear-gradient(225deg," + p.line + " 25%, transparent 25%) -5px 0/10px 10px" }} />
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 6, background: p.line }} />
      <span style={{ fontFamily: "var(--f-tamil)", color: p.accent, fontSize: 11 }}>சுப முகூர்த்தம்</span>
    </div>
  ),
  groups: [
    {
      title: "Header",
      fields: [
        {
          key: "language",
          type: "select",
          label: "Header language",
          options: [
            { value: "tamil", label: "Tamil · சுப முகூர்த்தம்" },
            { value: "telugu", label: "Telugu · శుభ వివాహం" },
            { value: "malayalam", label: "Malayalam · ശുഭ വിവാഹം" },
            { value: "kannada", label: "Kannada · ಶುಭ ವಿವಾಹ" },
            { value: "english", label: "English" },
          ],
        },
        { key: "headerText", type: "text", label: "Custom header (optional)", placeholder: "Overrides the language default", max: 30 },
        { key: "hosts", type: "textarea", label: "With the blessings of", placeholder: "Shri. R. Venkatesan & Smt. Meena\nShri. S. Raghavan & Smt. Padma", max: 140 },
      ],
    },
    {
      title: "The couple",
      fields: [
        { key: "honorifics", type: "toggle", label: 'Use "Chi." / "Sow." honorifics' },
        { key: "groomName", type: "text", label: "Groom's name", placeholder: "Karthik", max: 24 },
        { key: "groomParents", type: "text", label: "Groom's parents", placeholder: "S/o Shri. R. Venkatesan & Smt. Meena", max: 56 },
        { key: "brideName", type: "text", label: "Bride's name", placeholder: "Lakshmi", max: 24 },
        { key: "brideParents", type: "text", label: "Bride's parents", placeholder: "D/o Shri. S. Raghavan & Smt. Padma", max: 56 },
        { key: "photo", type: "image", label: "Couple photo", ratio: "1 / 1" },
      ],
    },
    {
      title: "Muhurtham",
      fields: [
        { key: "weddingDate", type: "date", label: "Date" },
        { key: "muhurthamStart", type: "time", label: "Muhurtham from" },
        { key: "muhurthamEnd", type: "time", label: "Muhurtham to" },
        { key: "venueName", type: "text", label: "Kalyana mandapam", placeholder: "Sri Kalyana Mahal", max: 40 },
        { key: "venueAddress", type: "textarea", label: "Address", placeholder: "12, North Usman Road, T. Nagar\nChennai", max: 100 },
      ],
    },
    {
      title: "Reception",
      fields: [
        { key: "showReception", type: "toggle", label: "Include reception" },
        { key: "receptionDate", type: "date", label: "Reception date" },
        { key: "receptionTime", type: "time", label: "Reception time" },
        { key: "receptionVenue", type: "text", label: "Reception venue", placeholder: "Same venue", max: 40 },
      ],
    },
    {
      title: "Sign-off",
      fields: [
        { key: "compliments", type: "textarea", label: "With best compliments from", placeholder: "Relatives & Friends", max: 100 },
        { key: "closingLine", type: "text", label: "Closing line", placeholder: "Your presence and blessings are our greatest gift", max: 56 },
      ],
    },
  ],
  defaults: {
    language: "tamil",
    headerText: "",
    hosts: "Shri. R. Venkatesan & Smt. Meena\nShri. S. Raghavan & Smt. Padma",
    honorifics: true,
    groomName: "Karthik",
    groomParents: "S/o Shri. R. Venkatesan & Smt. Meena",
    brideName: "Lakshmi",
    brideParents: "D/o Shri. S. Raghavan & Smt. Padma",
    photo: null,
    weddingDate: "2027-01-22",
    muhurthamStart: "07:30",
    muhurthamEnd: "09:00",
    venueName: "Sri Kalyana Mahal",
    venueAddress: "12, North Usman Road, T. Nagar\nChennai",
    showReception: true,
    receptionDate: "2027-01-21",
    receptionTime: "18:30",
    receptionVenue: "Sri Kalyana Mahal",
    compliments: "Relatives & Friends",
    closingLine: "Your presence and blessings are our greatest gift",
  },

  backdrop: ({ T, theme, W, H, vertical }) => {
    const bh = vertical ? 86 : 70;
    return (
      <>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 40%," + theme.bg + " 0%," + theme.bg2 + " 95%)" }} />
        <Particles t={T} color={theme.accent} W={W} H={H} count={16} size={4} opacity={0.28} seed={51} />
        <div style={{ position: "absolute", top: 0, left: 0 }}>
          <TempleBorder t={T} W={W} h={bh} color={theme.line} color2={theme.bg2} flip start={100} />
        </div>
        <div style={{ position: "absolute", bottom: 0, left: 0 }}>
          <TempleBorder t={T} W={W} h={bh} color={theme.line} color2={theme.bg2} start={300} />
        </div>
      </>
    );
  },

  build: (data, orientation, theme) => {
    const v = orientation === "vertical";
    const S = function <T>(a: T, b: T): T {
      return v ? a : b;
    };
    const hdr = HEADERS[data.language] ?? HEADERS.tamil;
    const title = data.headerText || hdr.title;
    const chi = data.honorifics !== false;
    const range = [prettyTime(data.muhurthamStart), prettyTime(data.muhurthamEnd)].filter(Boolean).join(" – ");

    const bells = (t: number) => (
      <>
        <div style={{ position: "absolute", top: S(70, 50), left: S(80, 220) }}>
          <Bell t={t} len={S(300, 170)} size={S(72, 62)} seed={1} />
        </div>
        <div style={{ position: "absolute", top: S(70, 50), right: S(80, 220) }}>
          <Bell t={t} len={S(300, 170)} size={S(72, 62)} seed={2} start={250} />
        </div>
      </>
    );

    const scenes: Scene[] = [
      {
        id: "lamp",
        label: "Header",
        duration: 5200,
        in: { kind: "fade", dur: 800 },
        out: { kind: "fade", dur: 900 },
        render: ({ t }) => (
          <>
            {bells(t)}
            <Layer>
              <StandingLamp t={t} size={S(420, 320)} start={200} />
              <div style={{ textAlign: "center", marginTop: S(30, 16) }}>
                <Headline t={t} theme={theme} v={v} start={1400} size={S(108, 100)} font={SCRIPT_FONT} color={theme.accent} lineHeight={1.45}>
                  {title}
                </Headline>
                {!data.headerText ? (
                  <Kicker t={t} theme={theme} v={v} start={2100} size={40} upper={false} spacing="0.04em" font={SCRIPT_FONT} color={theme.ink}>
                    {hdr.sub}
                  </Kicker>
                ) : null}
              </div>
            </Layer>
          </>
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
            <div style={{ position: "absolute", display: "grid", placeItems: "center", opacity: 0.14 }}>
              <Kolam t={t} color={theme.ink} size={S(980, 820)} start={0} />
            </div>
            <div style={{ textAlign: "center", maxWidth: S(900, 1300), position: "relative" }}>
              <Kicker t={t} theme={theme} v={v} start={300} size={30}>
                With the blessings of
              </Kicker>
              <div style={{ marginTop: S(36, 28) }}>
                {lines(data.hosts).map((l, i) => (
                  <Headline key={i} t={t} theme={theme} v={v} start={600 + i * 220} size={S(52, 56)} lineHeight={1.5}>
                    {l}
                  </Headline>
                ))}
              </div>
              <div style={{ display: "grid", placeItems: "center", margin: S("44px 0", "30px 0") }}>
                <DiamondRule t={t} start={1400} width={S(320, 360)} color={theme.line} />
              </div>
              <div style={{ fontFamily: theme.fontBody, color: theme.soft, fontStyle: "italic", fontSize: S(44, 46), ...rise(t, { start: 1800, dur: 1000, dist: 18 }) }}>
                solicit your gracious presence with family and friends for the marriage of
              </div>
            </div>
          </Layer>
        ),
      },
      {
        id: "names",
        label: "The couple",
        duration: 6000,
        in: { kind: "zoom-out", dur: 900 },
        out: { kind: "fade", dur: 800 },
        render: ({ t }) => (
          <>
            {/* leaves rise from the bottom corners and lean outward, framing the names */}
            <div style={{ position: "absolute", left: S(-120, 40), bottom: S(-60, -120), transform: "rotate(-16deg)", transformOrigin: "50% 100%" }}>
              <BananaLeaf t={t} height={S(1050, 1050)} seed={1} start={0} />
            </div>
            <div style={{ position: "absolute", right: S(-120, 40), bottom: S(-60, -120), transform: "rotate(16deg)", transformOrigin: "50% 100%" }}>
              <BananaLeaf t={t} height={S(1050, 1050)} seed={2} start={150} flip />
            </div>
            <Layer>
              <div style={{ textAlign: "center", position: "relative" }}>
                <Headline t={t} theme={theme} v={v} start={500} size={S(120, 120)} font={theme.fontScript} color={theme.ink}>
                  {chi ? <span style={{ fontFamily: theme.fontDisplay, fontSize: "0.4em", color: theme.accent, marginRight: 14 }}>Chi.</span> : null}
                  {data.groomName}
                </Headline>
                <div style={{ fontFamily: theme.fontBody, color: theme.soft, fontStyle: "italic", fontSize: S(40, 34), ...fade(t, { start: 900, dur: 800 }) }}>{data.groomParents}</div>
                <div style={{ fontFamily: theme.fontDisplay, color: theme.accent, fontSize: S(38, 40), letterSpacing: "0.3em", margin: S("26px 0", "18px 0"), ...fade(t, { start: 1200, dur: 800 }) }}>WITH</div>
                <Headline t={t} theme={theme} v={v} start={1400} size={S(120, 120)} font={theme.fontScript} color={theme.ink}>
                  {chi ? <span style={{ fontFamily: theme.fontDisplay, fontSize: "0.4em", color: theme.accent, marginRight: 14 }}>Sow.</span> : null}
                  {data.brideName}
                </Headline>
                <div style={{ fontFamily: theme.fontBody, color: theme.soft, fontStyle: "italic", fontSize: S(40, 34), ...fade(t, { start: 1800, dur: 800 }) }}>{data.brideParents}</div>
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
            <div style={{ position: "absolute", display: "grid", placeItems: "center", opacity: 0.3 }}>
              <Kolam t={t + 2500} color={theme.line} size={S(900, 780)} n={6} />
            </div>
            <PhotoCircle t={t} d={d} theme={theme} src={data.photo?.src} size={S(640, 640)} ringWidth={14} />
          </Layer>
        ),
      },
      {
        id: "muhurtham",
        label: "Muhurtham",
        duration: 6000,
        in: { kind: "slide-up", dur: 850 },
        out: { kind: "fade", dur: 800 },
        render: ({ t }) => (
          <>
            {bells(t)}
            <Layer style={{ flexDirection: v ? "column" : "row", gap: S(60, 150) }}>
              <div style={{ textAlign: "center" }}>
                <Headline t={t} theme={theme} v={v} start={100} size={S(110, 110)} font={theme.fontScript} color={theme.accent}>
                  Muhurtham
                </Headline>
                <DateBlock t={t} theme={theme} v={v} start={400} date={data.weddingDate} divider={false} />
                {range ? (
                  <div style={{ fontFamily: theme.fontBody, color: theme.ink, fontSize: S(44, 48), letterSpacing: "0.1em", marginTop: S(26, 20), ...rise(t, { start: 1400, dur: 900, dist: 16 }) }}>{range}</div>
                ) : null}
              </div>
              <VenueBlock t={t} theme={theme} v={v} start={1600} label="Venue" name={data.venueName} address={data.venueAddress} nameSize={70} maxWidth={S(900, 720)} />
            </Layer>
          </>
        ),
      },
    ];

    if (data.showReception !== false && data.receptionDate) {
      const r = dateParts(data.receptionDate);
      scenes.push({
        id: "reception",
        label: "Reception",
        duration: 4800,
        in: { kind: "slide-left", dur: 850 },
        out: { kind: "fade", dur: 800 },
        render: ({ t }) => (
          <Layer>
            <Headline t={t} theme={theme} v={v} start={100} size={S(120, 120)} font={theme.fontScript} color={theme.accent}>
              Reception
            </Headline>
            <div style={{ fontFamily: theme.fontDisplay, color: theme.ink, fontSize: S(64, 70), marginTop: S(20, 14), ...rise(t, { start: 600, dur: 900, dist: 20 }) }}>
              {r.weekday}, {Number(r.day)} {r.month}
            </div>
            <div style={{ fontFamily: theme.fontBody, color: theme.soft, fontSize: S(44, 48), letterSpacing: "0.12em", marginTop: 14, ...rise(t, { start: 900, dur: 900, dist: 16 }) }}>{prettyTime(data.receptionTime)} onwards</div>
            <div style={{ fontFamily: theme.fontBody, color: theme.ink, fontSize: S(46, 50), marginTop: S(36, 26), ...rise(t, { start: 1200, dur: 900, dist: 16 }) }}>{data.receptionVenue}</div>
          </Layer>
        ),
      });
    }

    scenes.push({
      id: "close",
      label: "Compliments",
      duration: 5400,
      in: { kind: "fade", dur: 900 },
      render: ({ t }) => (
        <Layer>
          <StandingLamp t={t + 1200} size={S(300, 240)} />
          <div style={{ textAlign: "center", maxWidth: S(920, 1400), marginTop: S(30, 16) }}>
            <Headline t={t} theme={theme} v={v} start={300} size={S(84, 88)} font={theme.fontScript} color={theme.ink} lineHeight={1.3}>
              {data.closingLine}
            </Headline>
            {lines(data.compliments).length ? (
              <div style={{ marginTop: S(46, 30) }}>
                <Kicker t={t} theme={theme} v={v} start={1300} size={28} color={theme.accent}>
                  With best compliments from
                </Kicker>
                {lines(data.compliments).map((l, i) => (
                  <div key={i} style={{ fontFamily: theme.fontDisplay, color: theme.ink, fontSize: S(46, 48), marginTop: 12, ...rise(t, { start: 1500 + i * 180, dur: 900, dist: 16 }) }}>
                    {l}
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </Layer>
      ),
    });

    return scenes;
  },
};
