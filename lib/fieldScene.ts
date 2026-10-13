/* Which scene of a template shows a form field, so the studio can jump there when the field is tapped and the
   couple watches their own names, date and venue go in as they type. Scene ids and labels are consistent across
   the templates (names/couple, hosts/blessing, date, venue, photo, close...), so the field key decides the topic
   and the topic picks the first scene whose id or label matches. -1 = no clear scene: the preview stays put. */

type SceneLike = { id: string; label: string };

export function sceneForField(key: string, scenes: SceneLike[]): number {
  const k = key.toLowerCase();
  const first = (...patterns: RegExp[]) => {
    for (const re of patterns) {
      const i = scenes.findIndex((s) => re.test(s.id + " " + s.label.toLowerCase()));
      if (i >= 0) return i;
    }
    return -1;
  };
  const last = scenes.length - 1;
  if (k.startsWith("reception")) return first(/reception/);
  if (k.startsWith("walima")) return first(/walima/);
  if (/event/.test(k)) return first(/^event-0/, /event/);
  if (/caption/.test(k)) return first(/spread|photo/);
  // Before names: "venueName" and "weddingDate" are about the place and day, not the couple.
  // ^nikah: the scene id "nikah" (Nikah details), not the photo scene labelled "Nikah Mubarak".
  if (/venue|address|city|dress|map/.test(k)) return first(/venue|details|muhurtham|^nikah\b|ceremony/);
  if (/date|time|muhurtham/.test(k)) return first(/\bdate\b|muhurtham|^nikah\b|ceremony|portrait|details/);
  if (/parents/.test(k)) return first(/\bnames?\b|couple/, /hosts|blessing/);
  if (/name|groom|bride|joiner/.test(k)) return first(/\bnames?\b|couple/);
  if (/host|blessing|famil|compliment/.test(k)) return k.includes("compliment") ? first(/close|fateh/) : first(/hosts|blessing|famil/);
  if (/closing|rsvp|hashtag|endcard|smallprint/.test(k)) {
    const i = first(/close|fateh|\bend\b/);
    return i >= 0 ? i : last;
  }
  if (/photo|image|portrait|hero|gallery|montage|clip|video/.test(k)) return first(/photo|hero|portrait|spread|montage|clip|henna/);
  if (/tagline/.test(k)) return first(/tagline/);
  if (/lineup|programme|program|performer/.test(k)) return first(/lineup|programme|evening/);
  if (/header|kicker|title|studio|opening|local|statement|hook|bismillah|translation/.test(k)) return 0;
  return -1;
}
