"use client";

import { useState } from "react";
import { IconBell, IconPlus } from "@/components/icons";

export default function AdminAlertsClient({ children, count }: { children: React.ReactNode; count: number }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [type, setType] = useState("info");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create-alert", message: message.trim(), type }),
      });
      const data = await res.json();
      if (data.success) {
        setOpen(false);
        setMessage("");
        setType("info");
        window.location.reload();
      } else {
        setError(data.error || "Erreur");
      }
    } catch {
      setError("Erreur réseau");
    }
    setSaving(false);
  }

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h1 style={{ margin: 0 }}><IconBell size={24} /> Alertes ({count})</h1>
        <button onClick={() => setOpen(true)} className="btn btn-primary btn-sm" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <IconPlus size={16} /> Nouvelle alerte
        </button>
      </div>

      {children}

      {open && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}
          onClick={() => setOpen(false)}>
          <div style={{ background: "var(--color-bg-card)", borderRadius: 12, padding: "24px 28px", minWidth: 420, maxWidth: 500 }}
            onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: 16 }}>Nouvelle alerte</h3>
            {error && <div style={{ padding: "10px 14px", borderRadius: "var(--radius-md)", fontSize: "0.875rem", background: "var(--color-error-light)", color: "var(--color-error)", marginBottom: 16 }}>{error}</div>}
            <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, marginBottom: 4, color: "var(--color-text-secondary)" }}>Message</label>
                <textarea className="input" value={message} onChange={(e) => setMessage(e.target.value)} rows={3} required placeholder="Contenu de l'alerte…" style={{ width: "100%", resize: "vertical" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, marginBottom: 4, color: "var(--color-text-secondary)" }}>Type</label>
                <select className="input" value={type} onChange={(e) => setType(e.target.value)} style={{ width: "100%" }}>
                  <option value="info">Info</option>
                  <option value="warning">Alerte</option>
                </select>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 8 }}>
                <button type="button" onClick={() => setOpen(false)} className="btn btn-ghost">Annuler</button>
                <button type="submit" className="btn btn-primary" disabled={saving || !message.trim()}>
                  {saving ? "Création…" : "Créer l'alerte"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
