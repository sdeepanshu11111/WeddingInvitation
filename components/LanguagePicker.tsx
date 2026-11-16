"use client";
import { useEffect, useRef } from "react";
import { REGIONS } from "@/lib/regions";
import { baseOf, languageOf, versionsOf } from "@/lib/variants";

/** The language versions of this template's design (lib/variants.ts): English (the design itself) and each state
    language, named in its own script. Empty for a design without versions. */
export function languageOptions(templateId: string) {
  const base = baseOf(templateId);
  const versions = versionsOf(base);
  if (!versions.length) return [];
  return [
    { id: base, label: "English", lang: "en" },
    ...versions.map((id) => {
      const r = REGIONS.find((x) => x.language.toLowerCase() === languageOf(id))!;
      return { id, label: r.native, lang: r.lang };
    }),
  ];
}

/** Scrolls a sideways row so its chosen chip (.on) is in view: on a phone the ninth language starts off-screen. */
export function useChosenInView(dep: unknown) {
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const row = ref.current;
    const on = row?.querySelector<HTMLElement>(".on");
    if (row && on) row.scrollLeft += on.getBoundingClientRect().left - row.getBoundingClientRect().left - 16;
  }, [dep]);
  return ref;
}

/** Language of the design, in the studio: switching keeps the couple's names, date, venue and photos (defaultProject
    carries them) and puts that language's words in. The names are drawn in the device's own fonts (no download). */
export function LanguagePicker({ templateId, onChange }: { templateId: string; onChange: (id: string) => void }) {
  const opts = languageOptions(templateId);
  const ref = useChosenInView(templateId);
  if (!opts.length) return null;
  return (
    <div className="lang-opts" role="radiogroup" aria-label="Language" ref={ref}>
      {opts.map((o) => (
        <button key={o.id} role="radio" aria-checked={o.id === templateId} lang={o.lang} className={"lang-opt" + (o.id === templateId ? " on" : "")} onClick={() => onChange(o.id)}>
          {o.label}
        </button>
      ))}
    </div>
  );
}
