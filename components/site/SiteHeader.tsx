"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { CATEGORIES } from "@/lib/catalog";
import { LINK_PRICE_INR, PAYMENTS } from "@/lib/features";

/** The Mangalam lockup (public/brand/mangalam-logo.png, 546×290, transparent). Its height comes from CSS. */
export function Logo() {
  return (
    <Link href="/" className="logo-mark">
      <img src="/brand/mangalam-logo.png" width={546} height={290} alt="Mangalam by Futureproof" />
    </Link>
  );
}

/** Promo strip + sticky header for the public pages (home, templates, policies): nav · centred logo · actions.
 *  Phones get burger · logo · Create, and a menu that opens right under the header. */
export function SiteHeader() {
  const pathname = usePathname() || "/";
  const head = useRef<HTMLElement>(null);
  const [open, setOpen] = useState(false);
  const [menuTop, setMenuTop] = useState(64);
  const [scrolled, setScrolled] = useState(false);
  const inTemplates = pathname === "/templates" || pathname.startsWith("/templates/");

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    if (!open) return;
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", esc);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", esc);
    };
  }, [open]);

  // The promo strip scrolls away, so the header's bottom edge moves: measure it when the menu opens.
  const toggle = () => {
    setMenuTop(Math.round(head.current?.getBoundingClientRect().bottom ?? 64));
    setOpen((o) => !o);
  };

  return (
    <>
      <div className="promo">
        <span className="promo-long">
          {PAYMENTS ? (
            <>
              Create your invitation and preview it free. Remove the watermark for <b>₹{LINK_PRICE_INR}</b> when you are ready.
            </>
          ) : (
            <>Create your invitation free and share it on WhatsApp in minutes.</>
          )}
        </span>
        <span className="promo-short">
          {PAYMENTS ? (
            <>
              Preview free · remove the watermark for <b>₹{LINK_PRICE_INR}</b>
            </>
          ) : (
            <>Create free · share on WhatsApp</>
          )}
        </span>
        <Link href="/contact" className="promo-link">
          Contact
        </Link>
      </div>
      <header ref={head} className={"site-head" + (scrolled ? " scrolled" : "") + (open ? " open" : "")}>
        <button className="burger" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} aria-controls="site-menu" onClick={toggle}>
          <i />
          <i />
          <i />
        </button>
        <nav className="site-nav" aria-label="Main">
          <div className="nav-drop">
            <Link href="/templates" className={inTemplates ? "on" : undefined} aria-current={pathname === "/templates" ? "page" : undefined}>
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
        <Logo />
        <div className="head-end">
          <Link href="/create" className="nav-studio">
            Open studio
          </Link>
          <Link href="/templates" className="cta-btn sm">
            <span className="desk-txt">Create invitation →</span>
            <span className="mob-txt">Create →</span>
          </Link>
        </div>
      </header>
      {open ? (
        <div id="site-menu" className="m-menu" style={{ top: menuTop }} onClick={(e) => (e.target as HTMLElement).closest("a") && setOpen(false)}>
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
          <Link href="/contact">Contact</Link>
          <Link href="/templates" className="cta-btn block">
            Create invitation →
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
