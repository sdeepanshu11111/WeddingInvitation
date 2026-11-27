"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

/**
 * Phones only (CSS): the page's main action pinned to the bottom of the screen, in thumb reach. It shows whenever
 * none of the page's own buttons (`watch`, a selector) are on screen, so there is never a second copy right next to one.
 * `spacer` keeps the page's last lines clear of the bar; pass false when the bar is rendered mid-page (e.g. inside
 * the home hero) and put <div className="m-cta-space" /> at the end of the page instead.
 */
export function MobileCta({ href, label, note, watch, spacer = true }: { href: string; label: string; note?: string; watch: string; spacer?: boolean }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const els = Array.from(document.querySelectorAll(watch));
    if (!els.length) return setShow(true);
    const seen = new Set<Element>();
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) e.isIntersecting ? seen.add(e.target) : seen.delete(e.target);
      setShow(seen.size === 0);
    });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [watch]);
  return (
    <>
      {spacer ? <div className="m-cta-space" aria-hidden /> : null}
      <div className={"m-cta" + (show ? " on" : "")} aria-hidden={!show}>
        {note ? <span className="m-cta-note">{note}</span> : null}
        <Link href={href} className="cta-btn" tabIndex={show ? undefined : -1}>
          {label}
        </Link>
      </div>
    </>
  );
}
