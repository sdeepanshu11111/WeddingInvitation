"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const post = (body: object) =>
  fetch("/api/admin/reviews", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(async (r) => {
    if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error || "Failed");
  });

/** Approve (puts the words on the home page), Hide, Delete (spam only). */
export function ReviewActions({ id, status, canPublish }: { id: string; status: string; canPublish: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const act = async (action: "approve" | "hide" | "delete", question?: string) => {
    if (question && !confirm(question)) return;
    setBusy(true);
    await post({ id, action }).catch((e) => alert(e.message));
    setBusy(false);
    router.refresh();
  };
  return (
    <div className="lead-actions">
      {canPublish && status !== "approved" ? (
        <button className="btn primary sm" disabled={busy} onClick={() => act("approve")}>
          Show on the site
        </button>
      ) : null}
      {status !== "hidden" ? (
        <button className="btn sm" disabled={busy} onClick={() => act("hide")}>
          Hide
        </button>
      ) : null}
      <button className="btn ghost sm" disabled={busy} onClick={() => act("delete", "Delete this review for good? Only for spam: a real review should be hidden, so its stars still count.")}>
        Delete
      </button>
    </div>
  );
}

/** Feedback a customer sent you (WhatsApp, email), added only with their permission. Words only, no stars. */
export function AddReview() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ text: "", name: "", city: "", template_id: "", permission: false });
  const [state, setState] = useState<"idle" | "saving" | { error: string }>("idle");
  if (!open)
    return (
      <button className="btn sm add-review" onClick={() => setOpen(true)}>
        + Add a review a customer sent you
      </button>
    );
  const save = async () => {
    setState("saving");
    try {
      await post({ action: "add", ...f });
      setF({ text: "", name: "", city: "", template_id: "", permission: false });
      setOpen(false);
      setState("idle");
      router.refresh();
    } catch (e: any) {
      setState({ error: e.message });
    }
  };
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF({ ...f, [k]: k === "permission" ? (e.target as HTMLInputElement).checked : e.target.value });
  return (
    <div className="lead add-review-form">
      <textarea className="input" rows={3} maxLength={300} placeholder="Their words, as they wrote them" value={f.text} onChange={set("text")} />
      <div className="row">
        <input className="input" maxLength={40} placeholder="Name to show (e.g. Priya & Rohan)" value={f.name} onChange={set("name")} />
        <input className="input" maxLength={40} placeholder="City (optional)" value={f.city} onChange={set("city")} />
        <input className="input" maxLength={60} placeholder="Design id (optional)" value={f.template_id} onChange={set("template_id")} />
      </div>
      <label className="check">
        <input type="checkbox" checked={f.permission} onChange={set("permission")} /> They wrote this and agreed to it being shown on the website with this name.
      </label>
      {typeof state === "object" ? <p className="stop">{state.error}</p> : null}
      <div className="lead-actions">
        <button className="btn primary sm" disabled={state === "saving" || !f.permission || !f.text.trim()} onClick={save}>
          Add and show
        </button>
        <button className="btn ghost sm" onClick={() => setOpen(false)}>
          Cancel
        </button>
      </div>
    </div>
  );
}
