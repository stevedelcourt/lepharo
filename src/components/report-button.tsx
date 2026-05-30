"use client";

import { useState } from "react";
import { IconFlag } from "@/components/icons";

export default function ReportButton({ targetType, targetId }: { targetType: string; targetId: number }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!reason.trim()) return;
    setSending(true);
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetType, targetId, reason: reason.trim() }),
      });
      if (res.ok) setDone(true);
    } catch {}
    setSending(false);
  }

  return (
    <div style={{ position: "relative", display: "inline-flex", lineHeight: 0 }}>
      <button
        onClick={() => setOpen(!open)}
        className="btn-ghost btn-sm"
        type="button"
        title="Signaler"
        style={{ padding: 2, lineHeight: 1, color: "var(--color-text-tertiary)", opacity: 0.4, border: "none", background: "none", cursor: "pointer" }}
      >
        <IconFlag size={14} />
      </button>
      {open && (
        <div
          style={{ position: "absolute", bottom: "100%", right: 0, marginBottom: 6, width: 280, zIndex: 50 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="card" style={{ padding: "10px 14px", boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}>
            {done ? (
              <p style={{ fontSize: "0.8125rem", color: "var(--color-success)", textAlign: "center", margin: 0 }}>Signalement envoyé</p>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <p style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)", margin: 0 }}>Pourquoi ?</p>
                <textarea
                  className="input"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Contenu inapproprié, spam…"
                  rows={2}
                  style={{ width: "100%", resize: "vertical", fontSize: "0.75rem", padding: "6px 10px" }}
                  required
                />
                <div style={{ display: "flex", gap: 4, justifyContent: "flex-end" }}>
                  <button type="button" onClick={() => setOpen(false)} className="btn-ghost btn-sm" style={{ fontSize: "0.75rem", padding: "4px 8px" }}>Annuler</button>
                  <button type="submit" className="btn btn-primary btn-sm" disabled={sending || !reason.trim()} style={{ fontSize: "0.75rem", padding: "4px 10px" }}>
                    {sending ? "…" : "Signaler"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
