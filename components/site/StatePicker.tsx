"use client";
import React, { useEffect, useState } from "react";
import { track } from "@/lib/analytics";
import { REGIONS, guessRegion, rememberRegion, type Region, type RegionChoice } from "@/lib/regions";

/**
 * Which state's designs to show (lib/regions.ts). `initial` is the state in the server-rendered address
 * (/templates?state=), so the first paint already matches it. After mounting: the address, this device's earlier pick,
 * the phone's language or the connection's approximate state. `lead` is the state known at mount: the picker puts it
 * first and keeps that order, so chips never jump under a finger.
 */
export function useRegion(initial: Region | null = null) {
  const [c, setC] = useState<RegionChoice & { lead: Region | null }>({ region: initial, picked: !!initial, lead: initial });
  useEffect(() => {
    const g = guessRegion();
    if (g) setC({ ...g, lead: g.region });
  }, []);
  const pick = (region: Region | null) => {
    rememberRegion(region);
    setC((x) => ({ ...x, region, picked: true }));
  };
  return { ...c, pick };
}

/** "Wedding in which state?": All India, then one chip per state with its language in its own script. A guessed
    state is not marked as chosen (All India stays on); it only comes first. */
export function StatePicker({ region, picked, lead, onPick }: { region: Region | null; picked: boolean; lead: Region | null; onPick: (r: Region | null) => void }) {
  const list = lead ? [lead, ...REGIONS.filter((r) => r.id !== lead.id)] : REGIONS;
  const all = !picked || !region;
  const choose = (r: Region | null) => {
    onPick(r);
    track("state_selected", { state: r ? r.id : "all" });
  };
  return (
    <div className="state-pick">
      <span className="mono-label">Wedding in which state?</span>
      <div className="state-row" role="radiogroup" aria-label="State">
        <button role="radio" aria-checked={all} className={"chip-o" + (all ? " on" : "")} onClick={() => choose(null)}>
          All India
        </button>
        {list.map((r) => {
          const on = picked && region?.id === r.id;
          return (
            <button key={r.id} role="radio" aria-checked={on} className={"chip-o" + (on ? " on" : "")} onClick={() => choose(r)}>
              {r.label}
              <small lang={r.lang}>{r.native}</small>
            </button>
          );
        })}
      </div>
    </div>
  );
}
