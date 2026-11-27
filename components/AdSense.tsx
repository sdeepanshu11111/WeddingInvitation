import { ADSENSE_CLIENT } from "@/lib/features";

/** Google AdSense loader, exactly the tag AdSense hands out. A server component, so the tag is in the page
    source (Google's site check reads the HTML); React moves an async script to <head> and loads it once.

    Rendered by the public site pages only: /, /templates, /templates/<id> and the policy pages. Never the
    root layout: that would put ads on a guest's invite (/e/<name>, which /privacy promises carries no ad
    tools and whose URL has the couple's names), in the headless export pages, in /admin and in the editor.
    Off unless ADSENSE_CLIENT is set (production). public/ads.txt carries the same publisher ID. */
export function AdSense() {
  if (!ADSENSE_CLIENT) return null;
  return <script async src={"https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=" + ADSENSE_CLIENT} crossOrigin="anonymous" />;
}
