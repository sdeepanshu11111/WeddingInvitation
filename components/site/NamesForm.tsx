"use client";
import { useEffect, useState } from "react";
import type { StartNames } from "@/lib/project";
import { NAME_MAX, peekStart, saveStart } from "@/lib/start";

/** The couple's names before the studio: filled from what they typed earlier this visit, saved as they type
    (sessionStorage, see lib/start.ts), so the studio opens with them whichever page they continue from. */
export function useStartNames() {
  const [names, setNames] = useState<StartNames>({ bride: "", groom: "" });
  const [edited, setEdited] = useState(0); // performance.now() of the last keystroke: previews hold on the names scene
  useEffect(() => {
    const n = peekStart();
    if (n) setNames(n);
  }, []);
  const set = (patch: Partial<StartNames>) => {
    setNames((x) => {
      const n = { ...x, ...patch };
      saveStart(n);
      return n;
    });
    setEdited(performance.now());
  };
  return { names, set, edited };
}

/** Two boxes, bride and groom. Placeholders are the demo couple, so an empty form still reads as an example. */
export function NamesForm({ names, set, id = "n" }: { names: StartNames; set: (p: Partial<StartNames>) => void; id?: string }) {
  return (
    <div className="names-form">
      <label htmlFor={id + "-bride"}>
        <span>Bride&apos;s name</span>
        <input
          id={id + "-bride"}
          className="names-input"
          placeholder="Ananya"
          autoComplete="off"
          autoCapitalize="words"
          maxLength={NAME_MAX}
          value={names.bride}
          onChange={(e) => set({ bride: e.target.value })}
        />
      </label>
      <span className="names-amp" aria-hidden>
        &amp;
      </span>
      <label htmlFor={id + "-groom"}>
        <span>Groom&apos;s name</span>
        <input
          id={id + "-groom"}
          className="names-input"
          placeholder="Aarav"
          autoComplete="off"
          autoCapitalize="words"
          maxLength={NAME_MAX}
          value={names.groom}
          onChange={(e) => set({ groom: e.target.value })}
        />
      </label>
    </div>
  );
}
