import React from "react";
import { BananaLeaf, StandingLamp, TempleBorder } from "@/components/indian";
import { makeNativeWedding } from "./native-wedding";

/* Kerala wedding, written in Malayalam: kasavu ivory and gold, a nilavilakku (standing lamp) between banana
   leaves, gold borders top and bottom. Wording: വിവാഹ ക്ഷണക്കത്ത് (wedding invitation), മുഹൂർത്തം (the auspicious
   time), വേദി (venue), സ്വാഗതം (welcome). Every line is an editable field; a Malayalam speaker should still read
   the defaults before changing them. */

export const keralaVivaham = makeNativeWedding({
  id: "kerala-vivaham",
  name: "Vivaham",
  tagline: "Kerala wedding in Malayalam: kasavu ivory and gold, nilavilakku lamp, banana leaves, മുഹൂർത്തം",
  tags: ["Kerala", "Malayalam", "Kasavu"],
  font: "var(--f-malayalam)",
  thumbGlyph: "വിവാഹം",
  palettes: [
    { id: "kasavu", name: "Kasavu Ivory", ink: "#3E2A12", soft: "#6E5230", accent: "#A0740A", bg: "#FBF5E6", bg2: "#F1E4C4", line: "#C39A2E" },
    { id: "ilai", name: "Banana Leaf", ink: "#FFF8E1", soft: "#D7E8C0", accent: "#FFD54F", bg: "#1E4D2B", bg2: "#0E2A17", line: "#E2C15A" },
    { id: "chenthamara", name: "Lotus Red", ink: "#FFF3E0", soft: "#F0C9AE", accent: "#F6C453", bg: "#7E1524", bg2: "#3E0810", line: "#E0A93B" },
    { id: "kayal", name: "Backwater Blue", ink: "#F1FBFA", soft: "#A9D6D2", accent: "#F2C14E", bg: "#0E4A57", bg2: "#06252C", line: "#D9B35A" },
  ],
  words: {
    title: "വിവാഹ ക്ഷണക്കത്ത്",
    groomTitle: "",
    brideTitle: "",
    joiner: "&",
    muhurtham: "മുഹൂർത്തം",
    venue: "വേദി",
    invite: "താങ്കളുടെ സാന്നിധ്യം\nസാദരം പ്രതീക്ഷിക്കുന്നു",
    closing: "സ്വാഗതം",
  },
  sample: {
    groom: "അർജുൻ",
    groomParents: "S/o Sri. K. Madhavan Nair & Smt. Sreedevi",
    bride: "മീര",
    brideParents: "D/o Sri. P. Rajan Menon & Smt. Latha",
    date: "2027-01-28",
    time: "10:15",
    venueName: "Guruvayur Temple Kalyana Mandapam",
    venueAddress: "East Nada, Guruvayur\nThrissur",
  },
  backdrop: ({ t, theme, v, W }) => {
    const h = v ? 80 : 64;
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
    <div style={{ position: "relative", display: "grid", placeItems: "center" }}>
      <div style={{ position: "absolute", left: S(-330, -300), bottom: S(-120, -90), transform: "rotate(-14deg)", transformOrigin: "50% 100%" }}>
        <BananaLeaf t={t} height={S(620, 460)} seed={1} />
      </div>
      <div style={{ position: "absolute", right: S(-330, -300), bottom: S(-120, -90), transform: "rotate(14deg)", transformOrigin: "50% 100%" }}>
        <BananaLeaf t={t} height={S(620, 460)} seed={2} start={150} flip />
      </div>
      <StandingLamp t={t} size={S(420, 300)} start={200} />
    </div>
  ),
  emblem: ({ t, S, k }) => <StandingLamp t={t} size={S(380, 420) * k} start={200} />,
});
