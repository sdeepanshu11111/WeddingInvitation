"use client";
import React, { useEffect, useState } from "react";
import type { ReviewSummary } from "@/lib/server/reviews";
import { TEMPLATES } from "@/lib/templates";

/** Below this many rated reviews the average is not shown (one 5★ review is not "a 5.0 rating"). */
export const SHOW_AVERAGE_FROM = 5;

/**
 * Real reviews in the home hero (lib/server/reviews.ts): only ones the couple allowed and the owner approved, one
 * at a time, changing every few seconds. Nothing at all until there is one: never fill this with sample text.
 * The average counts every allowed rating, including hidden ones, and shows from 5 reviews.
 */
export function HeroReviews({ data }: { data: ReviewSummary }) {
  const list = data.reviews;
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (list.length < 2 || paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setI((n) => (n + 1) % list.length), 6500);
    return () => clearInterval(id);
  }, [list.length, paused]);
  if (!list.length) return null;

  const r = list[i % list.length];
  const design = TEMPLATES.find((t) => t.id === r.template_id);
  return (
    <figure className="hero-review" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      {data.average && data.count >= SHOW_AVERAGE_FROM ? (
        <div className="hr-score">
          <Stars n={Math.round(data.average)} /> <b>{data.average.toFixed(1)}</b> from {data.count} couples
        </div>
      ) : null}
      <blockquote key={r.id} aria-live="polite">
        &ldquo;{r.text}&rdquo;
      </blockquote>
      <figcaption>
        {r.rating ? <Stars n={r.rating} /> : null}
        <b>{r.name || "A couple"}</b>
        {r.city ? <span>{r.city}</span> : null}
        {design ? <span>{design.name}</span> : null}
        <span className="hr-tag">{r.source === "invite" ? (r.paid ? "✓ Paid customer" : "✓ Made their invite here") : "Sent to us on WhatsApp"}</span>
      </figcaption>
      {list.length > 1 ? (
        <div className="hr-dots" role="tablist" aria-label="Reviews">
          {list.map((x, n) => (
            <button key={x.id} role="tab" aria-selected={n === i % list.length} aria-label={"Review " + (n + 1)} className={n === i % list.length ? "on" : ""} onClick={() => setI(n)} />
          ))}
        </div>
      ) : null}
    </figure>
  );
}

function Stars({ n }: { n: number }) {
  return (
    <span className="hr-stars" aria-label={n + " out of 5"}>
      {"★".repeat(n)}
      <i>{"★".repeat(5 - n)}</i>
    </span>
  );
}
