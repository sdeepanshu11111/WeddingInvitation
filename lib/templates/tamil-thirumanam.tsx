import React from "react";
import { fade } from "../anim";
import { Kolam, StandingLamp, Toran } from "@/components/indian";
import { makeNativeWedding } from "./native-wedding";

/* Tamil wedding, written in Tamil: a mango-leaf thoranam across the top, a kolam that draws itself, brass lamps.
   Wording: திருமண அழைப்பிதழ் (wedding invitation), செல்வன் / செல்வி before the names, சுபமுகூர்த்தம் (the auspicious
   time), இடம் (venue). "உ" on the first scene is the pillaiyar suzhi that Tamil invitations open with. Every line
   is an editable field; a Tamil speaker should still read the defaults before changing them. */

export const tamilThirumanam = makeNativeWedding({
  id: "tamil-thirumanam",
  name: "Thirumanam",
  tagline: "Tamil wedding in Tamil: thoranam, a kolam that draws itself, brass lamps, செல்வன் & செல்வி, சுபமுகூர்த்தம்",
  tags: ["Tamil", "Kolam", "Traditional"],
  font: "var(--f-tamil)",
  thumbGlyph: "திருமணம்",
  palettes: [
    { id: "kumkum", name: "Kumkum & Gold", ink: "#FFF3D6", soft: "#EBCB9C", accent: "#F4B81A", bg: "#7A1420", bg2: "#3F0810", line: "#E0A93B" },
    { id: "manjal", name: "Manjal Yellow", ink: "#4A1C0A", soft: "#7A4A1E", accent: "#B3261E", bg: "#FFE082", bg2: "#F9B934", line: "#B3261E" },
    { id: "pachai", name: "Leaf Green", ink: "#FFF8E1", soft: "#D5E6BE", accent: "#FFD54F", bg: "#1F5130", bg2: "#0D2A18", line: "#E2C15A" },
    { id: "vellai", name: "Veshti White", ink: "#3D2A12", soft: "#6F5532", accent: "#9C6B0B", bg: "#FCF7EA", bg2: "#F0E3C2", line: "#B58A2A" },
  ],
  words: {
    title: "திருமண அழைப்பிதழ்",
    groomTitle: "செல்வன்",
    brideTitle: "செல்வி",
    joiner: "&",
    muhurtham: "சுபமுகூர்த்தம்",
    venue: "இடம்",
    invite: "தங்கள் வருகையை\nஅன்புடன் எதிர்பார்க்கிறோம்",
    closing: "நல்வரவு",
  },
  sample: {
    groom: "கார்த்திக்",
    groomParents: "S/o Thiru. R. Venkatesan & Tmt. Meena",
    bride: "லட்சுமி",
    brideParents: "D/o Thiru. S. Raghavan & Tmt. Padma",
    date: "2027-01-22",
    time: "07:30",
    venueName: "Sri Kalyana Mahal",
    venueAddress: "12, North Usman Road, T. Nagar\nChennai",
  },
  backdrop: ({ t, W }) => (
    <div style={{ position: "absolute", top: 0, left: 0 }}>
      <Toran t={t} W={W} start={100} />
    </div>
  ),
  centerpiece: ({ t, theme, S }) => (
    <div style={{ display: "grid", placeItems: "center" }}>
      <div style={{ fontFamily: "var(--f-tamil)", color: theme.accent, fontSize: S(84, 70), lineHeight: 1, marginBottom: S(20, 10), ...fade(t, { start: 100, dur: 900 }) }}>உ</div>
      <Kolam t={t} color={theme.ink} size={S(520, 380)} n={5} start={300} />
    </div>
  ),
  emblem: ({ t, S, k }) => <StandingLamp t={t} size={S(380, 420) * k} start={200} />,
});
