"use client";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { CATEGORIES } from "@/lib/catalog";
import { LINK_PRICE_INR, PAYMENTS } from "@/lib/features";

export function Logo() {
  return (
    <Link href="/" className="logo" aria-label="Home">
      Future<i>Proof</i>
    </Link>
  );
}

/** Promo strip + sticky header for the public pages (home, templates, policies). Phones get a slide-down menu. */
export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <div className="promo">
        <span>
          {PAYMENTS ? (
            <>
              Pehle dekho, phir bhejo: preview free, pay <b>₹{LINK_PRICE_INR}</b> only if you like it.
            </>
          ) : (
            <>Pehle dekho, phir bhejo: see your invite free and share it on WhatsApp.</>
          )}
        </span>
        <Link href="/contact" className="promo-link">
          Contact
        </Link>
      </div>
      <header className={"site-head" + (scrolled ? " scrolled" : "")}>
        <Logo />
        <nav className="site-nav" aria-label="Main">
          <div className="nav-drop">
            <Link href="/templates">
              Templates <Caret />
            </Link>
            <div className="drop-panel">
              <span className="mono-label">Browse by function</span>
              <div className="drop-grid">
                {CATEGORIES.map((c) => (
                  <Link key={c.id} href={"/templates?category=" + c.id}>
                    <b>{c.label}</b>
                    <small lang="hi">{c.local}</small>
                  </Link>
                ))}
              </div>
              <Link href="/templates" className="drop-all">
                All templates →
              </Link>
            </div>
          </div>
          <Link href="/#how">How it works</Link>
          <Link href="/#pricing">Pricing</Link>
          <Link href="/#faq">FAQ</Link>
        </nav>
        <Link href="/create" className="nav-studio desk">
          Open studio
        </Link>
        <Link href="/templates" className="cta-btn sm">
          Start yours →
        </Link>
        <button className="burger" aria-label="Menu" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
          <i />
          <i />
          <i />
        </button>
      </header>
      {open ? (
        <div className="m-menu" onClick={(e) => (e.target as HTMLElement).closest("a") && setOpen(false)}>
          <span className="mono-label">Templates</span>
          {CATEGORIES.map((c) => (
            <Link key={c.id} href={"/templates?category=" + c.id} className="m-cat">
              {c.label} <small lang="hi">{c.local}</small>
            </Link>
          ))}
          <Link href="/templates" className="m-cat">
            All templates →
          </Link>
          <div className="m-sep" />
          <Link href="/#how">How it works</Link>
          <Link href="/#pricing">Pricing</Link>
          <Link href="/#faq">FAQ</Link>
          <Link href="/create">Open studio</Link>
          <Link href="/templates" className="cta-btn block">
            Start yours →
          </Link>
        </div>
      ) : null}
    </>
  );
}

function Caret() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden>
      <path d="M2 3.5 5 6.5 8 3.5" fill="none" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}
