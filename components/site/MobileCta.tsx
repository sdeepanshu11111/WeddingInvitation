"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

/**
 * Phones only (CSS): the page's main action pinned to the bottom of the screen, in thumb reach. It shows whenever
 * none of the page's own buttons (`watch`, a selector) are on screen, so there is never a second copy right next to one.
 */
export function MobileCta({ href, label, note, watch }: { href: string; label: string; note?: string; watch: string }) {
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
      <div className="m-cta-space" aria-hidden />
      <div className={"m-cta" + (show ? " on" : "")} aria-hidden={!show}>
        {note ? <span className="m-cta-note">{note}</span> : null}
        <Link href={href} className="cta-btn" tabIndex={show ? undefined : -1}>
          {label}
        </Link>
      </div>
    </>
  );
}
