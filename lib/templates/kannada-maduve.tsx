import React from "react";
import { Bell, Diya, TempleBorder } from "@/components/indian";
import { makeNativeWedding } from "./native-wedding";

/* Kannada wedding, written in Kannada: temple borders top and bottom, a pair of brass bells, a lit diya.
   Wording: ವಿವಾಹ ಮಹೋತ್ಸವದ ಆಮಂತ್ರಣ (invitation to the wedding celebration), ಚಿ. / ಚಿ.ಸೌ. before the names,
   ಶುಭ ಮುಹೂರ್ತ (the auspicious time), ಸ್ಥಳ (venue), ಸುಸ್ವಾಗತ (welcome). Every line is an editable field; a Kannada
   speaker should still read the defaults before changing them. */

export const kannadaMaduve = makeNativeWedding({
  id: "kannada-maduve",
  name: "Maduve",
  tagline: "Kannada wedding in Kannada: temple borders, brass bells, a lit diya, ಚಿ. & ಚಿ.ಸೌ., ಶುಭ ಮುಹೂರ್ತ",
  tags: ["Kannada", "Temple", "Traditional"],
  font: "var(--f-kannada)",
  thumbGlyph: "ಮದುವೆ",
  palettes: [
    { id: "mysore", name: "Mysore Silk", ink: "#FFF4DC", soft: "#EBCDA0", accent: "#F2B705", bg: "#5B1B6B", bg2: "#2A0A36", line: "#E0A93B" },
    { id: "kumkuma", name: "Kumkuma Red", ink: "#FFF3D6", soft: "#EBCB9C", accent: "#F4B81A", bg: "#7A1420", bg2: "#3F0810", line: "#E0A93B" },
    { id: "srigandha", name: "Sandalwood", ink: "#42260E", soft: "#75522C", accent: "#A2460F", bg: "#FBF0D9", bg2: "#EED9AE", line: "#B9832A" },
    { id: "navilu", name: "Peacock", ink: "#F1FBFA", soft: "#A7D8D3", accent: "#F2C14E", bg: "#0D4D57", bg2: "#06262C", line: "#D9B35A" },
  ],
  words: {
    title: "ವಿವಾಹ ಮಹೋತ್ಸವದ ಆಮಂತ್ರಣ",
    groomTitle: "ಚಿ.",
    brideTitle: "ಚಿ.ಸೌ.",
    joiner: "&",
    muhurtham: "ಶುಭ ಮುಹೂರ್ತ",
    venue: "ಸ್ಥಳ",
    invite: "ತಮ್ಮ ಆಗಮನವನ್ನು\nಆದರದಿಂದ ಬಯಸುತ್ತೇವೆ",
    closing: "ಸುಸ್ವಾಗತ",
  },
  sample: {
    groom: "ಅಭಿಷೇಕ್",
    groomParents: "S/o Sri. H. Ramesh Gowda & Smt. Shanthamma",
    bride: "ಅನನ್ಯ",
    brideParents: "D/o Sri. K. Suresh Rao & Smt. Vidya",
    date: "2027-02-07",
    time: "10:45",
    venueName: "Sri Krishna Kalyana Mantapa",
    venueAddress: "5th Block, Jayanagar\nBengaluru",
  },
  backdrop: ({ t, theme, v, W }) => {
    const h = v ? 84 : 66;
    return (
      <>
        <div style={{ position: "absolute", top: 0, left: 0 }}>
          <TempleBorder t={t} W={W} h={h} color={theme.line} color2={theme.bg2} flip start={100} />
        </div>
        <div style={{ position: "absolute", bottom: 0, left: 0 }}>
          <TempleBorder t={t} W={W} h={h} color={theme.line} color2={theme.bg2} start={300} />
        </div>
      </>
    );
  },
  centerpiece: ({ t, S }) => (
    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "center", gap: S(70, 60) }}>
      <Bell t={t} len={S(230, 130)} size={S(78, 60)} seed={1} />
      <div style={{ marginTop: S(170, 90) }}>
        <Diya t={t} size={S(230, 170)} start={300} />
      </div>
      <Bell t={t} len={S(230, 130)} size={S(78, 60)} seed={2} start={250} />
    </div>
  ),
  emblem: ({ t, S, k }) => <Diya t={t} size={S(300, 340) * k} start={200} />,
});
