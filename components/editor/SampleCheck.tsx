"use client";
import { dateParts, prettyTime } from "@/components/primitives";
import type { TemplateDef } from "@/lib/types";

/* Before Get link: the date and venue still hold the template's example (owner, 2026-11-18: /admin/links flagged real
   invites shared with a made-up date and venue). Guests would read them as the real thing, and they get no calendar or
   directions button for them. The couple chooses: change them (the studio opens the first one) or get the link anyway. */

/** "Date: Monday 7 December 2026", "Venue: Sharma Residence": what each sample field shows, by its form label. */
export function sampleLines(t: TemplateDef, data: Record<string, any>, keys: string[]) {
  const fields = t.groups.flatMap((g) => g.fields);
  return keys.map((k) => {
    const f = fields.find((x) => x.key === k);
    const v = data[k];
    const shown =
      f?.type === "date" && typeof v === "string"
        ? (() => {
            const d = dateParts(v);
            return [d.weekday, d.day, d.month, d.year].filter(Boolean).join(" ");
          })()
        : f?.type === "time" && typeof v === "string"
          ? prettyTime(v)
          : Array.isArray(v)
            ? v.length + " sample functions"
            : String(v ?? "").split("\n")[0];
    return { key: k, label: f?.label ?? k, value: shown };
  });
}

export function SampleCheck({ lines, onFix, onAnyway }: { lines: { key: string; label: string; value: string }[]; onFix: () => void; onAnyway: () => void }) {
  return (
    <div className="backdrop-m" onClick={(e) => e.target === e.currentTarget && onFix()}>
      <div className="modal sample-check" role="dialog" aria-label="Example details still in your invite">
        <h3>Is this your real date and venue?</h3>
        <p className="sc-lead">These are still the design&apos;s example. Your guests would read them as yours.</p>
        <ul className="sc-list">
          {lines.map((l) => (
            <li key={l.key}>
              <span>{l.label}</span>
              <b>{l.value}</b>
            </li>
          ))}
        </ul>
        <button className="btn primary sc-fix" onClick={onFix}>
          Change them
        </button>
        <button className="btn ghost sc-anyway" onClick={onAnyway}>
          Get link anyway, I&apos;ll change them later
        </button>
      </div>
    </div>
  );
}
