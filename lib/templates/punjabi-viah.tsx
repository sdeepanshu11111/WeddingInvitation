import React from "react";
import { Diya, PhulkariBand, Sunburst } from "@/components/indian";
import { makeNativeWedding } from "./native-wedding";

/* Punjabi wedding, written in Punjabi (Gurmukhi): phulkari embroidery bands top and bottom, a sunburst, a diya.
   For any Punjabi family; the Sikh ceremony itself (Ik Onkar, Milni, Laavan) is the Anand Karaj design.
   Wording: ਸ਼ੁਭ ਵਿਆਹ (auspicious wedding), ਮਿਤੀ ਤੇ ਸਮਾਂ (date and time), ਸਥਾਨ (venue), ਜੀ ਆਇਆਂ ਨੂੰ (welcome).
   Every line is an editable field; a Punjabi speaker should still read the defaults before changing them. */

export const punjabiViah = makeNativeWedding({
  id: "punjabi-viah",
  name: "Punjabi Viah",
  tagline: "Punjabi wedding in Gurmukhi: phulkari embroidery bands, a sunburst, a lit diya, ਜੀ ਆਇਆਂ ਨੂੰ",
  tags: ["Punjabi", "Phulkari", "Gurmukhi"],
  communities: ["sikh", "hindu"],
  font: "var(--f-gurmukhi)",
  thumbGlyph: "ਵਿਆਹ",
  palettes: [
    { id: "phulkari", name: "Phulkari Red", ink: "#FFF4E0", soft: "#F2CDA8", accent: "#FFC947", bg: "#9B1B1B", bg2: "#4A0808", line: "#F2B33D" },
    { id: "sarson", name: "Sarson Yellow", ink: "#4A2304", soft: "#7A4A12", accent: "#B3261E", bg: "#FFD54F", bg2: "#FFB300", line: "#B3261E" },
    { id: "kesri", name: "Kesri & Navy", ink: "#FFF7EC", soft: "#F0CFA6", accent: "#FF9933", bg: "#0E1F4D", bg2: "#06102B", line: "#F4B860" },
    { id: "rani", name: "Rani Pink", ink: "#FFF2F6", soft: "#F5C2D4", accent: "#FFC94A", bg: "#8E1251", bg2: "#4C0629", line: "#FFC94A" },
  ],
  words: {
    title: "ਸ਼ੁਭ ਵਿਆਹ",
    groomTitle: "",
    brideTitle: "",
    joiner: "ਅਤੇ",
    muhurtham: "ਮਿਤੀ ਤੇ ਸਮਾਂ",
    venue: "ਸਥਾਨ",
    invite: "ਆਪ ਜੀ ਦੀ ਹਾਜ਼ਰੀ\nਸਾਡੇ ਲਈ ਮਾਣ ਵਾਲੀ ਗੱਲ ਹੋਵੇਗੀ",
    closing: "ਜੀ ਆਇਆਂ ਨੂੰ",
  },
  sample: {
    groom: "ਹਰਪ੍ਰੀਤ",
    groomParents: "S/o S. Gurdev Singh & Sdn. Manjit Kaur",
    bride: "ਸਿਮਰਨ",
    brideParents: "D/o S. Balwinder Singh & Sdn. Jasleen Kaur",
    date: "2026-12-13",
    time: "11:00",
    venueName: "Grand Palace Banquets",
    venueAddress: "Ferozepur Road\nLudhiana",
  },
  backdrop: ({ t, theme, v, W }) => {
    const h = v ? 84 : 66;
    return (
      <>
        <div style={{ position: "absolute", top: 0, left: 0 }}>
          <PhulkariBand t={t} W={W} h={h} base={theme.bg2} start={100} />
        </div>
        <div style={{ position: "absolute", bottom: 0, left: 0 }}>
          <PhulkariBand t={t} W={W} h={h} base={theme.bg2} start={300} />
        </div>
      </>
    );
  },
  centerpiece: ({ t, theme, S }) => (
    <div style={{ position: "relative", display: "grid", placeItems: "center" }}>
      <div style={{ position: "absolute", display: "grid", placeItems: "center" }}>
        <Sunburst t={t} color={theme.accent} size={S(820, 560)} rays={36} opacity={0.22} />
      </div>
      <Diya t={t} size={S(300, 220)} start={200} />
    </div>
  ),
  emblem: ({ t, S, k }) => <Diya t={t} size={S(300, 340) * k} start={200} />,
});
