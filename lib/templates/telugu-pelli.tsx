import React from "react";
import { Garlands, Kalash, Sunburst } from "@/components/indian";
import { makeNativeWedding } from "./native-wedding";

/* Telugu wedding, written in Telugu: marigold garlands along the top, a kalash on a sunburst.
   Wording: వివాహ మహోత్సవ ఆహ్వానం (invitation to the wedding celebration), చి. / చి.ల.సౌ. before the names,
   సుముహూర్తం (the auspicious time), వేదిక (venue), శుభమస్తు (may it be auspicious). Every line is an editable
   field; a Telugu speaker should still read the defaults before changing them. */

export const teluguPelli = makeNativeWedding({
  id: "telugu-pelli",
  name: "Pelli",
  tagline: "Telugu wedding in Telugu: marigold garlands, kalash on a sunburst, చి. & చి.ల.సౌ., సుముహూర్తం",
  tags: ["Telugu", "Marigold", "Traditional"],
  font: "var(--f-telugu)",
  thumbGlyph: "పెళ్లి",
  palettes: [
    { id: "pasupu", name: "Pasupu & Kumkuma", ink: "#4A1206", soft: "#7C3B14", accent: "#B71C1C", bg: "#FFD54F", bg2: "#FFA000", line: "#B71C1C" },
    { id: "kumkuma", name: "Kumkuma Red", ink: "#FFF4DC", soft: "#F2CFA4", accent: "#FFC947", bg: "#8C1420", bg2: "#45070E", line: "#E8B04A" },
    { id: "pattu", name: "Pattu Purple", ink: "#FBF1FF", soft: "#D8BEE6", accent: "#F2C46D", bg: "#4B1E6B", bg2: "#230B36", line: "#E1B45A" },
    { id: "mamidi", name: "Mango Leaf", ink: "#FFF8E1", soft: "#D7E8C0", accent: "#FFD54F", bg: "#215A2E", bg2: "#0E2D17", line: "#E2C15A" },
  ],
  words: {
    title: "వివాహ మహోత్సవ ఆహ్వానం",
    groomTitle: "చి.",
    brideTitle: "చి.ల.సౌ.",
    joiner: "&",
    muhurtham: "సుముహూర్తం",
    venue: "వేదిక",
    invite: "మీ రాక\nమాకు ఎంతో ఆనందదాయకం",
    closing: "శుభమస్తు",
  },
  sample: {
    groom: "అర్జున్",
    groomParents: "S/o Sri. K. Ramana Rao & Smt. Lalitha",
    bride: "శ్రావ్య",
    brideParents: "D/o Sri. P. Srinivas & Smt. Madhavi",
    date: "2027-02-14",
    time: "09:12",
    venueName: "Sri Venkateswara Kalyana Mandapam",
    venueAddress: "Road No. 12, Banjara Hills\nHyderabad",
  },
  backdrop: ({ t, W, H }) => <Garlands t={t} W={W} H={H} strands={9} maxLen={0.1} flower={20} start={100} />,
  centerpiece: ({ t, theme, S }) => (
    <div style={{ position: "relative", display: "grid", placeItems: "center", marginTop: S(120, 60) }}>
      <div style={{ position: "absolute", display: "grid", placeItems: "center" }}>
        <Sunburst t={t} color={theme.accent} size={S(820, 560)} rays={32} opacity={0.22} />
      </div>
      <Kalash t={t} size={S(340, 250)} start={200} />
    </div>
  ),
  emblem: ({ t, S, k }) => <Kalash t={t} size={S(300, 380) * k} start={200} />,
});
