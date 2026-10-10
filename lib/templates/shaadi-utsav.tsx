import React from "react";
import type { EventItem, Scene, TemplateDef, Theme } from "../types";
import { fade, rise } from "../anim";
import { DiamondRule, Layer, Particles } from "@/components/primitives";
import { EventCard, EventsOverview, Headline, Kicker, Names, PhotoCircle, lines } from "@/components/blocks";
import { Diya, Kalash, Paisley, Rings, Toran } from "@/components/indian";

/* Shaadi Utsav — every function in one video: toran, kalash, one scene per event,
   then a schedule card that works as a screenshot for WhatsApp. */

export const EVENT_PRESETS = ["Roka", "Engagement", "Haldi", "Mehendi", "Sangeet", "Cocktail", "Baraat", "Wedding (Pheras)", "Reception"];

/** Picks a motif for a function from its name. */
function EventIcon({ name, t, theme, v }: { name: string; t: number; theme: Theme; v: boolean }) {
  const n = name.toLowerCase();
  const sz = v ? 1.5 : 1.15;
  if (/haldi|turmeric|pithi|ubtan/.test(n))
    return (
      <svg width={170 * sz} height={130 * sz} viewBox="-60 -40 120 90">
        <ellipse cx={0} cy={-6} rx={46} ry={12} fill="#FFC107" />
        <path d="M-50 -6 Q -46 40 0 42 Q 46 40 50 -6 Z" fill={theme.accent} />
        <path d="M-50 -6 Q 0 8 50 -6" stroke={theme.line} strokeWidth={3} fill="none" />
      </svg>
    );
  if (/mehen?di|henna/.test(n)) return <Paisley t={t + 3000} color={theme.accent} size={170 * sz} />;
  if (/sangeet|cocktail|dance|party|dj/.test(n))
    return <div style={{ fontSize: 150 * sz, color: theme.accent, lineHeight: 1, textShadow: "0 0 30px " + theme.accent + "88" }}>♫</div>;
  if (/ring|engage|sagai|roka|mangni|misri/.test(n)) return <Rings t={t + 3000} size={300 * sz} metal={theme.accent} metal2={theme.line} />;
  if (/wedding|phera|shaadi|vivah|lagna|kalyan|nikah|anand/.test(n)) return <Kalash t={t + 3000} size={220 * sz} />;
  return <Diya t={t} size={170 * sz} seed={n.length} />;
}

export const shaadiUtsav: TemplateDef = {
  id: "shaadi-utsav",
  name: "Shaadi Utsav",
  tagline: "All functions in one video: Haldi to Reception, each with its own date, time and venue",
  tags: ["All functions", "Toran", "Kalash"],
  categories: ["multi-event", "wedding"],
  communities: ["hindu"],
  isNew: true,
  poster: "couple",
  fonts: { display: "var(--f-cinzel)", script: "var(--f-vibes)", body: "var(--f-cormorant)" },
  palettes: [
    { id: "rani", name: "Rani Pink", ink: "#FFF4E6", soft: "#F3C9C9", accent: "#F6C453", bg: "#8B1538", bg2: "#4F0A1F", line: "#E8B04A" },
    { id: "cream", name: "Marigold Cream", ink: "#5B1A0B", soft: "#8C5A3C", accent: "#C2410C", bg: "#FFF3DC", bg2: "#FBDDA8", line: "#C8892B" },
    { id: "peacock", name: "Peacock", ink: "#F2FBF8", soft: "#A8D5CC", accent: "#E9C46A", bg: "#0B4F5C", bg2: "#05262D", line: "#E9C46A" },
    { id: "purple", name: "Royal Purple", ink: "#FBF1FF", soft: "#D3B8E3", accent: "#F2C46D", bg: "#4A1D6B", bg2: "#220A36", line: "#E1B15C" },
  ],
  thumb: (p) => (
    <div style={{ width: "100%", height: "100%", background: "linear-gradient(180deg," + p.bg + "," + p.bg2 + ")", position: "relative", padding: "14px 6px 0" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 10, background: "repeating-linear-gradient(90deg,#2E7D32 0 6px,#FB8C00 6px 12px)" }} />
      {["Haldi", "Sangeet", "Pheras", "Reception"].map((x) => (
        <div key={x} style={{ fontSize: 7.5, color: p.ink, borderBottom: "1px solid " + p.line + "66", padding: "3px 0", fontFamily: "var(--f-cinzel)" }}>
          <span style={{ color: p.accent }}>● </span>
          {x}
        </div>
      ))}
    </div>
  ),
  groups: [
    {
      title: "The couple",
      fields: [
        { key: "groomName", type: "text", label: "Groom's name", placeholder: "Aarav", max: 22 },
        { key: "groomParents", type: "text", label: "Groom's parents", placeholder: "S/o Mr. & Mrs. Rajesh Sharma", max: 50 },
        { key: "brideName", type: "text", label: "Bride's name", placeholder: "Ananya", max: 22 },
        { key: "brideParents", type: "text", label: "Bride's parents", placeholder: "D/o Mr. & Mrs. Vikram Verma", max: 50 },
        { key: "photo", type: "image", label: "Couple photo", ratio: "1 / 1" },
      ],
    },
    {
      title: "Functions",
      fields: [
        {
          key: "events",
          type: "events",
          label: "Functions",
          max: 8,
          presets: EVENT_PRESETS,
          hint: "Each function gets its own scene. The icon is picked from the name (Haldi, Mehendi, Sangeet, Pheras, Reception...).",
        },
      ],
    },
    {
      title: "Header & hosts",
      fields: [
        { key: "blessing", type: "text", label: "Blessing line", placeholder: "॥ श्री गणेशाय नमः ॥", max: 30, hint: "Leave blank to hide" },
        { key: "localTitle", type: "text", label: "Hindi title", placeholder: "शुभ विवाह", max: 20 },
        { key: "hosts", type: "textarea", label: "With the blessings of", placeholder: "Smt. Kamla Devi & Late Shri Ramesh Sharma\nSharma & Verma families", max: 160 },
      ],
    },
    {
      title: "Sign-off",
      fields: [
        { key: "closingLine", type: "text", label: "Closing line", placeholder: "Your presence is our blessing", max: 40 },
        { key: "rsvp", type: "textarea", label: "RSVP contacts", placeholder: "Rajesh Sharma · +91 98290 12345\nVikram Verma · +91 98100 54321", max: 140 },
      ],
    },
  ],
  defaults: {
    groomName: "Aarav",
    groomParents: "S/o Mr. & Mrs. Rajesh Sharma",
    brideName: "Ananya",
    brideParents: "D/o Mr. & Mrs. Vikram Verma",
    photo: null,
    events: [
      { name: "Haldi", date: "2026-12-07", time: "10:00", venue: "Sharma Residence, Jaipur" },
      { name: "Mehendi & Sangeet", date: "2026-12-07", time: "18:30", venue: "The Lawns, Rambagh Palace" },
      { name: "Wedding (Pheras)", date: "2026-12-08", time: "19:30", venue: "Rambagh Palace, Jaipur", note: "Baraat assembles at 6:30 PM" },
      { name: "Reception", date: "2026-12-09", time: "20:00", venue: "Taj Ballroom, Jaipur" },
    ] satisfies EventItem[],
    blessing: "॥ श्री गणेशाय नमः ॥",
    localTitle: "शुभ विवाह",
    hosts: "Smt. Kamla Devi & Late Shri Ramesh Sharma\nSharma & Verma families",
    closingLine: "Your presence is our blessing",
    rsvp: "Rajesh Sharma · +91 98290 12345\nVikram Verma · +91 98100 54321",
  },

  backdrop: ({ T, theme, W, H, vertical }) => (
    <>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 30%," + theme.bg + " 0%," + theme.bg2 + " 90%)" }} />
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.07,
          backgroundImage:
            "radial-gradient(circle at 50% 50%, transparent 38%, " + theme.line + " 39%, " + theme.line + " 41%, transparent 42%)",
          backgroundSize: "90px 90px",
        }}
      />
      <Particles t={T} color={theme.accent} W={W} H={H} count={20} size={4} opacity={0.3} seed={21} />
      <Toran t={T} W={W} size={vertical ? 2.3 : 1.9} start={200} />
    </>
  ),

  build: (data, orientation, theme) => {
    const v = orientation === "vertical";
    const S = function <T>(a: T, b: T): T {
      return v ? a : b;
    };
    const events: EventItem[] = (Array.isArray(data.events) ? data.events : []).filter((e: EventItem) => e && e.name);
    const top = S(200, 130); // clear of the toran

    const scenes: Scene[] = [
      {
        id: "blessing",
        label: "Shubh Vivah",
        duration: 5000,
        in: { kind: "fade", dur: 700 },
        out: { kind: "fade", dur: 800 },
        render: ({ t }) => (
          <Layer style={{ paddingTop: top }}>
            {data.blessing ? (
              <div style={{ fontFamily: "var(--f-devanagari)", color: theme.accent, fontSize: S(50, 46), marginBottom: S(30, 10), ...fade(t, { start: 300, dur: 900 }) }}>{data.blessing}</div>
            ) : null}
            <Kalash t={t} size={S(420, 330)} start={500} />
            {data.localTitle ? (
              <Headline t={t} theme={theme} v={v} start={1700} size={S(96, 84)} font="var(--f-rozha)" color={theme.accent}>
                {data.localTitle}
              </Headline>
            ) : null}
            <Kicker t={t} theme={theme} v={v} start={2200} size={36} color={theme.ink} font={theme.fontDisplay} spacing="0.4em" style={{ marginTop: 14 }}>
              Wedding Festivities
            </Kicker>
          </Layer>
        ),
      },
      {
        id: "hosts",
        label: "With blessings",
        duration: 4800,
        in: { kind: "fade", dur: 800 },
        out: { kind: "wipe-up", dur: 800 },
        render: ({ t }) => (
          <Layer style={{ paddingTop: top }}>
            <div style={{ textAlign: "center", maxWidth: S(900, 1300) }}>
              <Kicker t={t} theme={theme} v={v} start={200} size={30}>
                With the blessings of
              </Kicker>
              <div style={{ marginTop: S(40, 30) }}>
                {lines(data.hosts).map((l, i) => (
                  <Headline key={i} t={t} theme={theme} v={v} start={500 + i * 220} size={S(50, 54)} lineHeight={1.5}>
                    {l}
                  </Headline>
                ))}
              </div>
              <div style={{ display: "grid", placeItems: "center", margin: S("46px 0", "34px 0") }}>
                <DiamondRule t={t} start={1300} width={S(320, 360)} color={theme.line} />
              </div>
              <div style={{ fontFamily: theme.fontBody, color: theme.soft, fontStyle: "italic", fontSize: S(44, 46), ...rise(t, { start: 1700, dur: 1000, dist: 18 }) }}>
                request the pleasure of your company at the wedding festivities of their children
              </div>
            </div>
          </Layer>
        ),
      },
      {
        id: "couple",
        label: "The couple",
        duration: 5600,
        in: { kind: "fade", dur: 800 },
        out: { kind: "fade", dur: 800 },
        render: ({ t, d }) => (
          <Layer style={{ paddingTop: top, flexDirection: v ? "column" : "row", gap: S(40, 110) }}>
            <PhotoCircle t={t} d={d} theme={theme} src={data.photo?.src} size={S(520, 560)} start={0} ringWidth={12} />
            <div style={{ textAlign: "center" }}>
              <Headline t={t} theme={theme} v={v} start={500} size={S(120, 120)} font={theme.fontScript}>
                {data.groomName}
              </Headline>
              <div style={{ fontFamily: theme.fontBody, color: theme.soft, fontSize: S(32, 34), fontStyle: "italic", ...fade(t, { start: 900, dur: 800 }) }}>{data.groomParents}</div>
              <div style={{ fontFamily: theme.fontDisplay, color: theme.accent, fontSize: S(40, 42), letterSpacing: "0.3em", margin: S("22px 0", "16px 0"), ...fade(t, { start: 1200, dur: 800 }) }}>WEDS</div>
              <Headline t={t} theme={theme} v={v} start={1400} size={S(120, 120)} font={theme.fontScript}>
                {data.brideName}
              </Headline>
              <div style={{ fontFamily: theme.fontBody, color: theme.soft, fontSize: S(32, 34), fontStyle: "italic", ...fade(t, { start: 1800, dur: 800 }) }}>{data.brideParents}</div>
            </div>
          </Layer>
        ),
      },
    ];

    events.forEach((ev, i) => {
      scenes.push({
        id: "event-" + i,
        label: ev.name,
        duration: 4800,
        in: { kind: i % 2 ? "slide-left" : "slide-up", dur: 800 },
        out: { kind: "fade", dur: 700 },
        render: ({ t }) => (
          <Layer style={{ paddingTop: top }}>
            <EventCard t={t} theme={theme} v={v} ev={ev} index={i} total={events.length} icon={<EventIcon name={ev.name} t={t} theme={theme} v={v} />} />
          </Layer>
        ),
      });
    });

    if (events.length > 1) {
      scenes.push({
        id: "overview",
        label: "At a glance",
        duration: 5200 + events.length * 300,
        in: { kind: "fade", dur: 800 },
        out: { kind: "fade", dur: 800 },
        render: ({ t }) => (
          <Layer style={{ paddingTop: top }}>
            <Kicker t={t} theme={theme} v={v} start={100} size={30}>
              Celebrations at a glance
            </Kicker>
            <Headline t={t} theme={theme} v={v} start={300} size={S(100, 96)} font={theme.fontScript} color={theme.accent} style={{ marginBottom: S(30, 16) }}>
              {data.groomName} &amp; {data.brideName}
            </Headline>
            <EventsOverview t={t} theme={theme} v={v} start={700} events={events} />
          </Layer>
        ),
      });
    }

    scenes.push({
      id: "close",
      label: "Closing",
      duration: 5200,
      in: { kind: "iris", dur: 1000 },
      render: ({ t }) => (
        <>
          <Layer style={{ paddingTop: top }}>
            <div style={{ textAlign: "center", maxWidth: S(920, 1400) }}>
              <Headline t={t} theme={theme} v={v} start={300} size={S(112, 110)} font={theme.fontScript} color={theme.ink} lineHeight={1.3}>
                {data.closingLine}
              </Headline>
              {lines(data.rsvp).length ? (
                <div style={{ marginTop: S(50, 34) }}>
                  <Kicker t={t} theme={theme} v={v} start={1200} size={28} color={theme.accent}>
                    RSVP
                  </Kicker>
                  {lines(data.rsvp).map((l, i) => (
                    <div key={i} style={{ fontFamily: theme.fontBody, color: theme.ink, fontSize: S(40, 42), marginTop: 10, ...rise(t, { start: 1400 + i * 180, dur: 900, dist: 16 }) }}>
                      {l}
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
            <div style={{ position: "absolute", bottom: S(150, 60), display: "flex", gap: S(60, 110) }}>
              {[0, 1, 2, 3, 4].map((i) => (
                <Diya key={i} t={t} size={S(150, 140)} seed={i + 3} start={900 + Math.abs(i - 2) * 200} />
              ))}
            </div>
          </Layer>
        </>
      ),
    });

    return scenes;
  },
};
