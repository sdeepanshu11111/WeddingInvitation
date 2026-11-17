import type { TemplateDef } from "../types";
import { royalMandala } from "./royal-mandala";
import { shaadiUtsav } from "./shaadi-utsav";
import { southKalyanam } from "./south-kalyanam";
import { tamilThirumanam } from "./tamil-thirumanam";
import { teluguPelli } from "./telugu-pelli";
import { keralaVivaham } from "./kerala-vivaham";
import { kannadaMaduve } from "./kannada-maduve";
import { hindiShubhVivah } from "./hindi-shubh-vivah";
import { punjabiViah } from "./punjabi-viah";
import { nikahMubarak } from "./nikah-mubarak";
import { anandKaraj } from "./anand-karaj";
import { sagaiRings } from "./sagai-rings";
import { haldiMarigold } from "./haldi-marigold";
import { mehendiPaisley } from "./mehendi-paisley";
import { sangeetNight } from "./sangeet-night";
import { receptionGala } from "./reception-gala";
import { blushBotanical } from "./blush-botanical";
import { cinematicReel } from "./cinematic-reel";
import { polaroidMemories } from "./polaroid-memories";
import { holyMatrimony } from "./holy-matrimony";
import { shubhMangal } from "./shubh-mangal";
import { shubhoBibaho } from "./shubho-bibaho";
import { auroraModern } from "./aurora-modern";
import { rajwadaPalace } from "./rajwada-palace";
import { floralRangoli } from "./floral-rangoli";
import { lavenderGarden } from "./lavender-garden";
import { LANGUAGE_VERSIONS } from "./languages";

/**
 * Add a template: write one file exporting a TemplateDef, list it here.
 * Order = order in the picker (traditional weddings first, then functions in
 * the order they happen, then modern / global styles).
 * DESIGNS: the designs themselves, for every list and count ("23 designs").
 */
export const DESIGNS: TemplateDef[] = [
  royalMandala,
  rajwadaPalace,
  hindiShubhVivah,
  shaadiUtsav,
  southKalyanam,
  tamilThirumanam,
  teluguPelli,
  keralaVivaham,
  kannadaMaduve,
  shubhMangal,
  shubhoBibaho,
  nikahMubarak,
  anandKaraj,
  punjabiViah,
  holyMatrimony,
  sagaiRings,
  haldiMarigold,
  mehendiPaisley,
  sangeetNight,
  receptionGala,
  floralRangoli,
  blushBotanical,
  lavenderGarden,
  cinematicReel,
  polaroidMemories,
  auroraModern,
];

/** Every template that can be opened: the designs, then their language versions (languages.tsx), which are listed
    only on their state's page (lib/regions.ts) and in the studio's language switch. Look ids up here; list DESIGNS. */
export const TEMPLATES: TemplateDef[] = [...DESIGNS, ...LANGUAGE_VERSIONS];

export const getTemplate = (id: string): TemplateDef => TEMPLATES.find((t) => t.id === id) ?? TEMPLATES[0];
