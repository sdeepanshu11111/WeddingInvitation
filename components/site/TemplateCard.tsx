"use client";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";
import { LazyPreview } from "@/components/LivePreview";
import { CATEGORIES, COMMUNITIES } from "@/lib/catalog";
import type { Orientation, TemplateDef } from "@/lib/types";

/** "Wedding · Hindu / North Indian": the card's subtitle. */
export function templateKind(t: TemplateDef) {
  const cat = CATEGORIES.find((c) => c.id === t.categories[0])?.label;
  const com = t.communities.includes("modern") ? "Any community" : COMMUNITIES.find((c) => c.id === t.communities[0])?.label.split(" /")[0];
  return [cat, com].filter(Boolean).join(" · ");
}

/** True while the element sits in the middle band of a touch screen, where there is no hover to start a preview.
    Only the row in the middle plays, so a phone never runs a whole grid of animations at once. */
function useCentred<T extends Element>() {
  const ref = useRef<T | null>(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || !window.matchMedia("(hover: none)").matches) return;
    const io = new IntersectionObserver(([e]) => setOn(e.isIntersecting), { rootMargin: "-38% 0px -38% 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return [ref, on] as const;
}

/** Gallery card: the real template playing with demo content while hovered or focused (on phones: while centred). */
export function TemplateCard({ t, orientation = "vertical" }: { t: TemplateDef; orientation?: Orientation }) {
  const [hover, setHover] = useState(false);
  const [ref, centred] = useCentred<HTMLAnchorElement>();
  const on = hover || centred;
  return (
    <Link
      ref={ref}
      href={"/templates/" + t.id}
      className={"t-card" + (on ? " playing" : "")}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocus={() => setHover(true)}
      onBlur={() => setHover(false)}
    >
      <div className={"t-prev " + orientation}>
        <LazyPreview t={t} orientation={orientation} active={on} />
        {t.isNew ? <span className="t-new">New</span> : null}
        <span className="t-use">
          Use this design
        </span>
      </div>
      <div className="t-meta">
        <b>{t.name}</b>
        <span>{templateKind(t)}</span>
      </div>
    </Link>
  );
}

export function PlayGlyph({ size = 9 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 10 10" aria-hidden>
      <path d="M2 1 9 5 2 9Z" fill="currentColor" />
    </svg>
  );
}
