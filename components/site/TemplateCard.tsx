"use client";
import Link from "next/link";
import React, { useState } from "react";
import { LazyPreview } from "@/components/LivePreview";
import { CATEGORIES, COMMUNITIES } from "@/lib/catalog";
import { LINK_PRICE_INR, PAYMENTS } from "@/lib/features";
import type { Orientation, TemplateDef } from "@/lib/types";

/** "Wedding · Hindu / North Indian": the card's subtitle. */
export function templateKind(t: TemplateDef) {
  const cat = CATEGORIES.find((c) => c.id === t.categories[0])?.label;
  const com = t.communities.includes("modern") ? "Any community" : COMMUNITIES.find((c) => c.id === t.communities[0])?.label.split(" /")[0];
  return [cat, com].filter(Boolean).join(" · ");
}

/** Gallery card: the real template playing with demo content while hovered or focused. */
export function TemplateCard({ t, orientation = "vertical" }: { t: TemplateDef; orientation?: Orientation }) {
  const [on, setOn] = useState(false);
  return (
    <Link
      href={"/templates/" + t.id}
      className="t-card"
      onMouseEnter={() => setOn(true)}
      onMouseLeave={() => setOn(false)}
      onFocus={() => setOn(true)}
      onBlur={() => setOn(false)}
    >
      <div className={"t-prev " + orientation}>
        <LazyPreview t={t} orientation={orientation} active={on} />
        <span className="t-pill">
          <PlayGlyph /> {on ? "Playing" : "Preview free"}
        </span>
        {t.isNew ? <span className="t-new">New</span> : null}
      </div>
      <div className="t-meta">
        <div>
          <b>{t.name}</b>
          <span>{templateKind(t)}</span>
        </div>
        <div className="t-price">
          <em>{PAYMENTS ? "Free · Premium ₹" + LINK_PRICE_INR : "Free"}</em>
          <span>View →</span>
        </div>
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
