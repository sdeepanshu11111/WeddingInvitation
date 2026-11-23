"use client";
import Link from "next/link";
import { track } from "@/lib/analytics";

/** The "Browse designs" button at the end of a wedding guide: tells Mixpanel which guide sent the visitor. */
export function GuideCta({ slug }: { slug: string }) {
  return (
    <Link href="/templates" className="cta-btn" onClick={() => track("guide_cta_clicked", { slug })}>
      Browse designs →
    </Link>
  );
}
