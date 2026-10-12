"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { LeadAction } from "@/lib/server/leads";

/** WhatsApp / Email (opens the chat or a draft with a ready message and notes the time), Replied STOP, Delete. */
export function LeadActions({ link, whatsapp, mailto, optedOut }: { link: string; whatsapp: string | null; mailto: string | null; optedOut: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const act = async (action: LeadAction, question?: string) => {
    if (question && !confirm(question)) return;
    setBusy(true);
    await fetch("/api/admin/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ link, action }),
      keepalive: true, // the WhatsApp tab may take over the screen on a phone
    }).catch(() => {});
    setBusy(false);
    router.refresh();
  };
  return (
    <div className="lead-actions">
      {whatsapp ? (
        <a className="btn primary sm" href={whatsapp} target="_blank" rel="noopener" onClick={() => act("contacted")}>
          WhatsApp
        </a>
      ) : null}
      {mailto ? (
        <a className={"btn sm" + (whatsapp ? "" : " primary")} href={mailto} onClick={() => act("contacted")}>
          Email
        </a>
      ) : null}
      {optedOut ? null : (
        <button className="btn sm" disabled={busy} onClick={() => act("optout", "Mark as replied STOP? Their WhatsApp and Email buttons go away for good.")}>
          Replied STOP
        </button>
      )}
      <button className="btn ghost sm" disabled={busy} onClick={() => act("delete", "Delete this lead's contact details? The invite link keeps working.")}>
        Delete
      </button>
    </div>
  );
}
