"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { pixelPageView } from "@/lib/analytics";

/** Meta Pixel PageView on every route, client-side navigations included. pixelPageView() skips guest
    invites and the export pages, and does nothing unless META_PIXEL_ID is set (production). */
export function MetaPixel() {
  const path = usePathname();
  useEffect(() => pixelPageView(), [path]);
  return null;
}
