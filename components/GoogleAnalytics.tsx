"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { gaPageView } from "@/lib/analytics";

/** Google Analytics (GA4) on the site pages and the editor. gaPageView() loads gtag once, skips guest invites,
    the export pages and /admin, and does nothing unless GA_ID is set (production). */
export function GoogleAnalytics() {
  const path = usePathname();
  useEffect(() => gaPageView(), [path]);
  return null;
}
