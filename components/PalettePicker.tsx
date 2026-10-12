import type { Palette } from "@/lib/types";

/** Colour choice for a design, on the template page and in the studio: each palette's real colours (background,
    second background, accent, text) and its name, a tick on the chosen one. Layout comes from the parent's class. */
export function PalettePicker({ palettes, value, onChange }: { palettes: Palette[]; value: string; onChange: (id: string) => void }) {
  return (
    <div className="pal-opts" role="radiogroup" aria-label="Colours">
      {palettes.map((x) => (
        <button key={x.id} role="radio" aria-checked={x.id === value} className={"pal-opt" + (x.id === value ? " on" : "")} onClick={() => onChange(x.id)}>
          <span className="pal-strip" aria-hidden>
            {[x.bg, x.bg2, x.accent, x.ink].map((c, i) => (
              <i key={i} style={{ background: c }} />
            ))}
          </span>
          <span className="pal-name">{x.name}</span>
        </button>
      ))}
    </div>
  );
}
