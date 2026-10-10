import type { Metadata } from "next";
import {
  Amiri,
  Kalam,
  Noto_Serif_Gurmukhi,
  Noto_Serif_Kannada,
  Noto_Serif_Malayalam,
  Noto_Serif_Tamil,
  Noto_Serif_Telugu,
  Rozha_One,
  Yatra_One,
  Bodoni_Moda,
  Caveat,
  Cinzel,
  Cormorant_Garamond,
  Great_Vibes,
  Inter,
  Marcellus,
  Playfair_Display,
  Tiro_Devanagari_Hindi,
} from "next/font/google";
import "./globals.css";

// Self-hosted at build time, so the headless renderer never waits on Google.
const cinzel = Cinzel({ subsets: ["latin"], weight: ["400", "600"], variable: "--f-cinzel" });
const cormorant = Cormorant_Garamond({ subsets: ["latin"], weight: ["400", "500", "600"], style: ["normal", "italic"], variable: "--f-cormorant" });
const vibes = Great_Vibes({ subsets: ["latin"], weight: "400", variable: "--f-vibes" });
const playfair = Playfair_Display({ subsets: ["latin"], weight: ["400", "600"], style: ["normal", "italic"], variable: "--f-playfair" });
const marcellus = Marcellus({ subsets: ["latin"], weight: "400", variable: "--f-marcellus" });
const inter = Inter({ subsets: ["latin"], weight: ["300", "400", "500", "600"], variable: "--f-inter" });
const deva = Tiro_Devanagari_Hindi({ subsets: ["devanagari", "latin"], weight: "400", variable: "--f-devanagari" });
const caveat = Caveat({ subsets: ["latin"], weight: ["400", "600"], variable: "--f-caveat" });
const bodoni = Bodoni_Moda({ subsets: ["latin"], weight: ["400", "600"], style: ["normal", "italic"], variable: "--f-bodoni", adjustFontFallback: false });
// Indian-market scripts & display faces. Loaded with unicode-range, so a browser
// only downloads a script when that script actually appears on screen.
const arabic = Amiri({ subsets: ["arabic", "latin"], weight: ["400", "700"], variable: "--f-arabic" });
const gurmukhi = Noto_Serif_Gurmukhi({ subsets: ["gurmukhi", "latin"], weight: ["400", "700"], variable: "--f-gurmukhi" });
const tamil = Noto_Serif_Tamil({ subsets: ["tamil"], weight: ["400", "600"], variable: "--f-tamil", adjustFontFallback: false });
const telugu = Noto_Serif_Telugu({ subsets: ["telugu"], weight: ["400", "600"], variable: "--f-telugu", adjustFontFallback: false });
const malayalam = Noto_Serif_Malayalam({ subsets: ["malayalam"], weight: ["400", "600"], variable: "--f-malayalam", adjustFontFallback: false });
const kannada = Noto_Serif_Kannada({ subsets: ["kannada"], weight: ["400", "600"], variable: "--f-kannada", adjustFontFallback: false });
const rozha = Rozha_One({ subsets: ["devanagari", "latin"], weight: "400", variable: "--f-rozha" });
const kalam = Kalam({ subsets: ["devanagari", "latin"], weight: ["400", "700"], variable: "--f-kalam" });
const yatra = Yatra_One({ subsets: ["devanagari", "latin"], weight: "400", variable: "--f-yatra" });

export const metadata: Metadata = {
  title: "Invite Studio — wedding video invitations",
  description: "Animated wedding invitation videos in 9:16 and 16:9.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const vars = [cinzel, cormorant, vibes, playfair, marcellus, inter, deva, caveat, bodoni, arabic, gurmukhi, tamil, telugu, malayalam, kannada, rozha, kalam, yatra].map((f) => f.variable).join(" ");
  return (
    <html lang="en" className={vars}>
      <body>{children}</body>
    </html>
  );
}
