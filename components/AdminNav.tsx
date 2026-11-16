"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { markInternal } from "@/lib/analytics";

/** The admin lists (links, leads, reviews), and the mark that makes this device "internal": whoever can open /admin is the owner or
    a tester, so from now on its analytics events carry is_internal and its links are flagged as tests
    (lib/analytics.ts, isInternal). Open /admin once on every phone and browser you test with. */
export function AdminNav() {
  const path = usePathname();
  useEffect(() => markInternal(), []);
  const tab = (href: string, label: string) => (
    <Link href={href} className={path.startsWith(href) ? "on" : ""}>
      {label}
    </Link>
  );
  return (
    <nav className="admin-nav">
      {tab("/admin/links", "Links")}
      {tab("/admin/leads", "Leads")}
      {tab("/admin/reviews", "Reviews")}
      <span>This device is now marked as yours: its visits and links count as tests.</span>
    </nav>
  );
}
