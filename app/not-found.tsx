import type { Metadata } from "next";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { BRAND } from "@/lib/brand";
import { NotFoundBody } from "./NotFoundBody";

/* Every missing page (a mistyped address, an invite link that was never made). It used to be Next's plain black
   "404": no brand and no way on. A mistyped invite link from WhatsApp lands here too, so the body says which it is
   (NotFoundBody reads the address in the browser: this page is shared by every route). No analytics or ads beyond
   what the root layout already filters by path. */
export const metadata: Metadata = { title: "Page not found · " + BRAND, robots: { index: false } };

export default function NotFound() {
  return (
    <div className="site">
      <SiteHeader />
      <NotFoundBody />
      <SiteFooter />
    </div>
  );
}
