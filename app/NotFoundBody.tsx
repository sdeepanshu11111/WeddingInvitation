"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

/** What the 404 says: an invite link (/e/<name>) that doesn't exist gets advice for a guest; anything else a way back. */
export function NotFoundBody() {
  const path = usePathname() ?? "";
  const invite = /^\/(e|v)\//.test(path);
  return (
    <main className="nf">
      <span className="kicker">{invite ? "Invitation not found" : "Page not found"}</span>
      <h1>
        {invite ? (
          <>
            This invite link <em>doesn&apos;t open.</em>
          </>
        ) : (
          <>
            We couldn&apos;t find <em>that page.</em>
          </>
        )}
      </h1>
      <p className="lead">
        {invite
          ? "Check the link in your message: every letter and number counts, and WhatsApp sometimes cuts a link at the end of a line. If it still doesn't open, ask the family to send it again."
          : "The address may be mistyped, or the page has moved. Here are the places people usually look for."}
      </p>
      <div className="nf-ctas">
        <a href="/" className="cta-btn">
          {invite ? "Make your own invitation" : "Go to the home page"}
        </a>
        <Link href="/templates" className="ghost-btn">
          See the designs
        </Link>
      </div>
    </main>
  );
}
