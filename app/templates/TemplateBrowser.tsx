"use client";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { TemplateCard } from "@/components/site/TemplateCard";
import { CATEGORIES, COMMUNITIES, countIn, filterTemplates, type Filter } from "@/lib/catalog";
import { LINK_PRICE_INR, PAYMENTS } from "@/lib/features";
import { TEMPLATES } from "@/lib/templates";
import type { Orientation } from "@/lib/types";

/** /templates: breadcrumb + title for the chosen function, a "Refine" sidebar (chips on phones), live cards. */
export function TemplateBrowser({ initial }: { initial: Partial<Filter> }) {
  const [f, setF] = useState<Filter>({ category: "all", community: "all", q: "", ...initial });
  const [o, setO] = useState<Orientation>("vertical");
  const list = filterTemplates(TEMPLATES, f);
  const cat = CATEGORIES.find((c) => c.id === f.category);

  // Keep the function in the URL so the page can be shared and Back works as expected.
  useEffect(() => {
    const u = new URL(window.location.href);
    if (f.category === "all") u.searchParams.delete("category");
    else u.searchParams.set("category", f.category);
    window.history.replaceState(null, "", u.pathname + u.search);
  }, [f.category]);

  const set = (patch: Partial<Filter>) => setF((x) => ({ ...x, ...patch }));

  return (
    <main className="browse-page">
      <section className="page-head">
        <nav className="crumbs mono-label" aria-label="Breadcrumb">
          <Link href="/">Home</Link> / <Link href="/templates">Designs</Link>
          {cat ? <> / {cat.label}</> : null}
        </nav>
        <h1>
          {cat ? (
            <>
              {cat.label} <em>invitations</em>
            </>
          ) : (
            <>
              Choose your <em>design</em>
            </>
          )}
        </h1>
        <p className="lead">
          {cat
            ? cat.blurb + ". Tap a design to watch it with your names."
            : "Animated invitations for the wedding and every function around it. Tap a design to watch it with your names."}
        </p>
        <div className="facts">
          <span>✓ Preview free</span>
          <span>✓ Phone and TV</span>
          <span>✓ Ready in minutes</span>
          {PAYMENTS ? <span>₹{LINK_PRICE_INR} one time to remove the watermark</span> : null}
        </div>
      </section>

      <section className="browse-grid">
        <aside className="refine">
          <span className="mono-label">Refine</span>
          <label className="r-search">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
            <input placeholder="Search: haldi, nikah, gold…" value={f.q} onChange={(e) => set({ q: e.target.value })} aria-label="Search designs" />
          </label>

          <span className="mono-label r-title">Function</span>
          <div className="r-list">
            {(["all", ...CATEGORIES.map((c) => c.id)] as Filter["category"][]).map((id) => {
              const c = CATEGORIES.find((x) => x.id === id);
              const n = countIn(TEMPLATES, id);
              return (
                <button key={id} className={"r-item" + (f.category === id ? " on" : "")} onClick={() => set({ category: id })} disabled={!n}>
                  <span>
                    {c ? c.label : "All functions"}
                    {c ? <small lang="hi">{c.local}</small> : null}
                  </span>
                  <em>{n}</em>
                </button>
              );
            })}
          </div>

          <span className="mono-label r-title">Community</span>
          <div className="r-chips">
            {([{ id: "all", label: "All" }, ...COMMUNITIES] as { id: Filter["community"]; label: string }[]).map((c) => (
              <button key={c.id} className={"chip-o" + (f.community === c.id ? " on" : "")} onClick={() => set({ community: c.id })}>
                {c.label}
              </button>
            ))}
          </div>

          <span className="mono-label r-title">Preview format</span>
          <div className="seg-o">
            <button className={o === "vertical" ? "on" : ""} onClick={() => setO("vertical")}>
              9:16 phone
            </button>
            <button className={o === "horizontal" ? "on" : ""} onClick={() => setO("horizontal")}>
              16:9 TV
            </button>
          </div>
        </aside>

        <div className="results">
          <div className="m-filters">
            {(["all", ...CATEGORIES.map((c) => c.id)] as Filter["category"][])
              .filter((id) => countIn(TEMPLATES, id) > 0)
              .map((id) => (
                <button key={id} className={"chip-o" + (f.category === id ? " on" : "")} onClick={() => set({ category: id })}>
                  {id === "all" ? "All" : CATEGORIES.find((c) => c.id === id)!.label}
                </button>
              ))}
          </div>
          <div className="results-bar">
            <span className="mono-label">
              {list.length} {list.length === 1 ? "design" : "designs"}
            </span>
            {f.q || f.community !== "all" ? (
              <button className="text-link" onClick={() => set({ q: "", community: "all" })}>
                Clear filters
              </button>
            ) : null}
          </div>
          <div className={"t-grid" + (o === "horizontal" ? " wide" : "")}>
            {list.map((t) => (
              <TemplateCard key={t.id + o} t={t} orientation={o} />
            ))}
            {!list.length ? <p className="empty">No designs match. Try another function or clear the search.</p> : null}
          </div>
        </div>
      </section>
    </main>
  );
}
