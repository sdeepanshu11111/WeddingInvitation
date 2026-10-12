"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { sitePage, startAnalytics } from "@/lib/analytics";

/** Mixpanel on the public site pages (landing, templates, policies), a page view per route. The editor and guest
    pages start their own, with their own super properties; sitePage() skips them, the export pages and /admin. */
export function SiteAnalytics() {
  const path = usePathname();
  useEffect(() => {
    if (sitePage(path)) startAnalytics("site");
  }, [path]);
  return null;
}
