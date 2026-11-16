"use client";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { StatePicker, useRegion } from "@/components/site/StatePicker";
import { TemplateCard } from "@/components/site/TemplateCard";
import { CATEGORIES, COMMUNITIES, countIn, filterTemplates, type Filter } from "@/lib/catalog";
import { PAYMENTS } from "@/lib/features";
import { FREE_COUNT, PRICE_MIN } from "@/lib/pricing";
import { forRegion, regionById } from "@/lib/regions";
import { DESIGNS, TEMPLATES } from "@/lib/templates";
import type { Orientation } from "@/lib/types";

/** /templates: breadcrumb + title for the chosen function or state, the state picker, a "Refine" sidebar (chips on
    phones), live cards. A picked state lists its own designs first under their language, then the rest. */
export function TemplateBrowser({ initial, initialState = null }: { initial: Partial<Filter>; initialState?: string | null }) {
  const [f, setF] = useState<Filter>({ category: "all", community: "all", q: "", ...initial });
  const [o, setO] = useState<Orientation>("vertical");
  const st = useRegion(regionById(initialState));
  const { own, rest } = forRegion(filterTemplates(TEMPLATES, f), st.region, st.picked, !!f.q.trim());
  const count = own.length + rest.length;
  const cat = CATEGORIES.find((c) => c.id === f.category);
  const state = st.picked ? st.region : null; // a guessed state only reorders: no title, no headings

  // Keep the function and a picked state in the URL so the page can be shared and Back works as expected.
  useEffect(() => {
    const u = new URL(window.location.href);
    if (f.category === "all") u.searchParams.delete("category");
    else u.searchParams.set("category", f.category);
    if (state) u.searchParams.set("state", state.id);
    else u.searchParams.delete("state");
    window.history.replaceState(null, "", u.pathname + u.search);
  }, [f.category, state]);

  const set = (patch: Partial<Filter>) => setF((x) => ({ ...x, ...patch }));
  const cards = (list: typeof rest) => (
    <div className={"t-grid" + (o === "horizontal" ? " wide" : "")}>
      {list.map((t) => (
        <TemplateCard key={t.id + o} t={t} orientation={o} />
      ))}
    </div>
  );

  return (
    <main className="browse-page">
      <section className="page-head">
        <nav className="crumbs mono-label" aria-label="Breadcrumb">
          <Link href="/">Home</Link> / <Link href="/templates">Designs</Link>
          {cat ? <> / {cat.label}</> : state ? <> / {state.label}</> : null}
        </nav>
        <h1>
          {cat ? (
            <>
              {cat.label} <em>invitations</em>
            </>
          ) : state ? (
            <>
              {state.language} <em>wedding invitations</em>
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
            : state
              ? "Designs written in " + state.language + " for weddings in " + state.label + ", then designs for every function. Tap a design to watch it with your names."
              : "Animated invitations for the wedding and every function around it. Tap a design to watch it with your names."}
        </p>
        <div className="facts">
          <span>✓ Preview free</span>
          <span>✓ Phone and TV</span>
          <span>✓ Ready in minutes</span>
          {PAYMENTS ? <span>{FREE_COUNT ? FREE_COUNT + " free designs · others " : ""}from ₹{PRICE_MIN}, one time, to remove the watermark</span> : null}
        </div>
        <StatePicker region={st.region} picked={st.picked} lead={st.lead} onPick={st.pick} />
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
              const n = countIn(DESIGNS, id);
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
              .filter((id) => countIn(DESIGNS, id) > 0)
              .map((id) => (
                <button key={id} className={"chip-o" + (f.category === id ? " on" : "")} onClick={() => set({ category: id })}>
                  {id === "all" ? "All" : CATEGORIES.find((c) => c.id === id)!.label}
                </button>
              ))}
          </div>
          <div className="results-bar">
            <span className="mono-label">
              {count} {count === 1 ? "design" : "designs"}
            </span>
            {f.q || f.community !== "all" ? (
              <button className="text-link" onClick={() => set({ q: "", community: "all" })}>
                Clear filters
              </button>
            ) : null}
          </div>
          {state && own.length ? (
            <>
              <h2 className="group-h mono-label">In {state.language}</h2>
              {cards(own)}
              {rest.length ? <h2 className="group-h mono-label">More designs</h2> : null}
              {cards(rest)}
            </>
          ) : (
            cards([...own, ...rest])
          )}
          {!count ? (
            <div className="t-grid">
              <p className="empty">No designs match. Try another function or state, or clear the search.</p>
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}
