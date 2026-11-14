import React from "react";
import { fade } from "../anim";
import { Corner, Mandala } from "@/components/primitives";
import { Kalash } from "@/components/indian";
import { makeNativeWedding } from "./native-wedding";

/* North Indian wedding, written in Hindi: a slow-turning mandala, gold corner filigree, a kalash.
   Wording: शुभ विवाह (auspicious wedding), चि. / सौ. कां. before the names, शुभ मुहूर्त (the auspicious time),
   स्थान (venue), and ॥ श्री गणेशाय नमः ॥, the line Hindi invitations open with. Every line is an editable field. */

export const hindiShubhVivah = makeNativeWedding({
  id: "hindi-shubh-vivah",
  name: "Shubh Vivah",
  tagline: "Hindi wedding card in Hindi: श्री गणेशाय नमः, a turning mandala, gold corners, चि. & सौ. कां., शुभ मुहूर्त",
  tags: ["Hindi", "Mandala", "Traditional"],
  communities: ["hindu"],
  font: "var(--f-devanagari)",
  thumbGlyph: "शुभ विवाह",
  palettes: [
    { id: "sindoor", name: "Sindoor & Gold", ink: "#FFF1D6", soft: "#EBC9A0", accent: "#F6C453", bg: "#8E1220", bg2: "#45060D", line: "#E3AE45" },
    { id: "kesar", name: "Kesar Cream", ink: "#5B1A0B", soft: "#8C5A3C", accent: "#C2410C", bg: "#FFF3DC", bg2: "#FBDDA8", line: "#C8862E" },
    { id: "neelam", name: "Royal Blue", ink: "#F6F1E4", soft: "#C9C2AA", accent: "#E8C468", bg: "#14306B", bg2: "#0A1A3D", line: "#D9B35A" },
    { id: "gulabi", name: "Gulabi Pink", ink: "#FFF2F6", soft: "#F5C2D4", accent: "#FFC94A", bg: "#8E1251", bg2: "#4C0629", line: "#F2C14E" },
  ],
  words: {
    title: "शुभ विवाह",
    groomTitle: "चि.",
    brideTitle: "सौ. कां.",
    joiner: "संग",
    muhurtham: "शुभ मुहूर्त",
    venue: "स्थान",
    invite: "आपकी उपस्थिति\nहमारा सौभाग्य होगी",
    closing: "सादर आमंत्रित",
  },
  sample: {
    groom: "आरव",
    groomParents: "सुपुत्र श्री राजेश शर्मा एवं श्रीमती सुनीता शर्मा",
    bride: "अनन्या",
    brideParents: "सुपुत्री श्री विकास वर्मा एवं श्रीमती रेखा वर्मा",
    date: "2026-12-08",
    time: "19:30",
    venueName: "Rambagh Palace",
    venueAddress: "Bhawani Singh Road\nJaipur",
  },
  backdrop: ({ t, theme, S }) => (
    <>
      {[0, 90, 180, 270].map((r, i) => (
        <div key={r} style={{ position: "absolute", top: i < 2 ? S(34, 24) : undefined, bottom: i >= 2 ? S(34, 24) : undefined, left: i === 0 || i === 3 ? S(34, 24) : undefined, right: i === 1 || i === 2 ? S(34, 24) : undefined }}>
          <Corner t={t} color={theme.line} size={S(170, 150)} start={200 + i * 120} rotate={r} />
        </div>
      ))}
    </>
  ),
  centerpiece: ({ t, theme, S }) => (
    <div style={{ position: "relative", display: "grid", placeItems: "center" }}>
      <div style={{ position: "absolute", display: "grid", placeItems: "center" }}>
        <Mandala t={t} color={theme.line} size={S(760, 520)} opacity={0.4} />
      </div>
      <div style={{ fontFamily: "var(--f-devanagari)", color: theme.accent, fontSize: S(46, 42), marginBottom: S(26, 14), ...fade(t, { start: 100, dur: 900 }) }}>॥ श्री गणेशाय नमः ॥</div>
      <Kalash t={t} size={S(300, 210)} start={300} />
    </div>
  ),
  emblem: ({ t, S, k }) => <Kalash t={t} size={S(300, 380) * k} start={200} />,
});
