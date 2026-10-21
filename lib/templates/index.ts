import type { TemplateDef } from "../types";
import { royalMandala } from "./royal-mandala";
import { shaadiUtsav } from "./shaadi-utsav";
import { southKalyanam } from "./south-kalyanam";
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

/**
 * Add a template: write one file exporting a TemplateDef, list it here.
 * Order = order in the picker (traditional weddings first, then functions in
 * the order they happen, then modern / global styles).
 */
export const TEMPLATES: TemplateDef[] = [
  royalMandala,
  shaadiUtsav,
  southKalyanam,
  shubhMangal,
  shubhoBibaho,
  nikahMubarak,
  anandKaraj,
  holyMatrimony,
  sagaiRings,
  haldiMarigold,
  mehendiPaisley,
  sangeetNight,
  receptionGala,
  blushBotanical,
  cinematicReel,
  polaroidMemories,
  auroraModern,
];

export const getTemplate = (id: string): TemplateDef => TEMPLATES.find((t) => t.id === id) ?? TEMPLATES[0];
