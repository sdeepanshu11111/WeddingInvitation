"use client";
import React, { useEffect, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { clamp, transitionStyle } from "@/lib/anim";
import type { Slot } from "@/lib/anim";
import type { Project, Scene, TemplateDef, Theme } from "@/lib/types";
import { SIZES } from "@/lib/project";

/**
 * Draws ONE frame of the invitation at internal time T.
 * Same component powers the editor preview and the headless MP4 renderer.
 */
export function Frame({
  project,
  template,
  theme,
  scenes,
  slots,
  total,
  T,
  deterministic = false,
  playing = false,
}: {
  project: Project;
  template: TemplateDef;
  theme: Theme;
  scenes: Scene[];
  slots: Slot[];
  total: number;
  T: number;
  deterministic?: boolean;
  playing?: boolean;
}) {
  const { W, H } = SIZES[project.orientation];
  const vertical = project.orientation === "vertical";
  const base = { W, H, vertical, data: project.data, theme, deterministic, playing };

  return (
    <div
      style={{
        position: "relative",
        width: W,
        height: H,
        overflow: "hidden",
        background: theme.bg,
        color: theme.ink,
        fontFamily: theme.fontBody,
        // Text never wraps mid-glyph in the exported video
        WebkitFontSmoothing: "antialiased",
        textRendering: "geometricPrecision",
      }}
    >
      {template.backdrop ? template.backdrop({ ...base, T, total }) : null}

      {slots.map((slot) => {
        const s = scenes[slot.index];
        // Last scene holds its final frame instead of disappearing.
        const isLast = slot.index === scenes.length - 1;
        if (T < slot.start || (T >= slot.end && !isLast)) return null;
        const t = Math.min(T - slot.start, s.duration);

        let wrap: CSSProperties = {};
        if (s.in && t < s.in.dur) wrap = transitionStyle(s.in, clamp(t / s.in.dur), "in");
        const outStart = s.duration - (s.out?.dur ?? 0);
        if (s.out && t > outStart && !isLast) {
          wrap = { ...wrap, ...transitionStyle(s.out, clamp(1 - (t - outStart) / s.out.dur), "out") };
        }

        return (
          <div
            key={s.id}
            data-scene={s.id}
            style={{ position: "absolute", inset: 0, zIndex: slot.index + 1, willChange: "transform, opacity", ...wrap }}
          >
            {s.render({ ...base, t, d: s.duration, p: clamp(t / s.duration) })}
          </div>
        );
      })}
    </div>
  );
}

/** Scales a W×H design surface to fit whatever box it is placed in. */
export function Stage({ W, H, children, pad = 0 }: { W: number; H: number; children: ReactNode; pad?: number }) {
  const box = useRef<HTMLDivElement | null>(null);
  const [k, setK] = useState(0.3);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const r = el.getBoundingClientRect();
      setK(Math.max(0.05, Math.min((r.width - pad * 2) / W, (r.height - pad * 2) / H)));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [W, H, pad]);

  return (
    <div ref={box} style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", overflow: "hidden" }}>
      <div style={{ width: W * k, height: H * k, position: "relative" }}>
        <div
          className="stage-surface"
          style={{
            width: W,
            height: H,
            transform: "scale(" + k + ")",
            transformOrigin: "0 0",
            position: "absolute",
            left: 0,
            top: 0,
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
