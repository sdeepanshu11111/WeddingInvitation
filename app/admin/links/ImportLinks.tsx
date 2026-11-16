"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

/** "Import existing links": links made before link records existed are read back from storage, a batch per
    request (POST /api/admin/links), until none remain. Safe to press again: records that exist are never changed. */
export function ImportLinks() {
  const router = useRouter();
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const run = async () => {
    setBusy(true);
    let total = 0;
    try {
      for (let i = 0; i < 400; i++) {
        const res = await fetch("/api/admin/links", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "import" }) });
        const r = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(r.error || "Import failed");
        total += r.imported;
        setMsg("Imported " + total + (r.remaining ? " · " + r.remaining + " to go…" : ""));
        if (!r.remaining) break;
        // A batch that brought nothing in while links remain: storage is not answering for those. Stop and say so.
        if (!r.imported && r.failed) {
          setMsg("Imported " + total + ". " + r.remaining + " could not be read right now; press again later.");
          break;
        }
      }
    } catch (e: any) {
      setMsg(e?.message || String(e));
    }
    setBusy(false);
    router.refresh();
  };
  return (
    <span className="admin-import">
      <button type="button" className="btn sm" onClick={run} disabled={busy}>
        {busy ? "Importing…" : "Import existing links"}
      </button>
      {msg ? <em>{msg}</em> : null}
    </span>
  );
}
