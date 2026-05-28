"use client";

import { useState } from "react";
import { IconWarning } from "@/components/icons";

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
    <div style={{ position: "relative", display: "inline-flex" }}>
      <button
        onClick={() => setOpen(!open)}
        className="btn-ghost btn-sm"
        type="button"
        title="Signaler"
        style={{ padding: 4, lineHeight: 1, color: "var(--color-text-tertiary)", opacity: 0.5 }}
        onMouseEnter={(e) => { e.currentTarget.style.opacity = "1"; }}
        onMouseLeave={(e) => { e.currentTarget.style.opacity = "0.5"; }}
      >
        <IconWarning size={14} />
        <span style={{ fontSize: "0.6875rem", marginLeft: 3 }}>Signaler</span>
      </button>
      {open && (
        <div
          style={{ position: "absolute", bottom: "100%", right: 0, marginBottom: 6, width: 300, zIndex: 50 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="card" style={{ padding: "12px 16px", boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}>
            {done ? (
              <p style={{ fontSize: "0.875rem", color: "var(--color-success)", textAlign: "center" }}>Signalement envoyé</p>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <p style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)" }}>Pourquoi signalez-vous ce contenu ?</p>
                <textarea
                  className="input"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Contenu inapproprié, spam, etc."
                  rows={3}
                  style={{ width: "100%", resize: "vertical", fontSize: "0.8125rem" }}
                  required
                />
                <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                  <button type="button" onClick={() => setOpen(false)} className="btn-ghost btn-sm" style={{ fontSize: "0.8125rem" }}>Annuler</button>
                  <button type="submit" className="btn btn-primary btn-sm" disabled={sending || !reason.trim()} style={{ fontSize: "0.8125rem" }}>
                    {sending ? "..." : "Envoyer"}
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
