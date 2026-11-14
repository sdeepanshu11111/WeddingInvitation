"use client";

import { Analytics } from "@vercel/analytics/next";
import { privatePath } from "@/lib/analytics";

/** Vercel Web Analytics (page views in the Vercel dashboard) on the site pages and the editor only. A guest's invite
    address carries the couple's names and /privacy promises those pages are not measured, so events for them, the
    export pages and /admin are dropped before they are sent. A client component because beforeSend is a function. */
export function VercelAnalytics() {
  return (
    <Analytics
      beforeSend={(event) => {
        try {
          return privatePath(new URL(event.url, location.origin).pathname) ? null : event;
        } catch {
          return null;
        }
      }}
    />
  );
}
