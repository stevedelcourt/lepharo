"use client";

import { useState } from "react";

type Props = { userId: number; userName: string; currentRole?: string };

const roles = [
  { value: "", label: "Résident" },
  { value: "moderator", label: "Modérateur" },
  { value: "editor", label: "Éditeur" },
  { value: "superadmin", label: "Super Admin" },
];

export function PromoteAdminButton({ userId, userName, currentRole }: Props) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(currentRole || "");
  const [working, setWorking] = useState(false);

  async function handlePromote() {
    setWorking(true);
    try {
      const res = await fetch("/api/admin/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update",
          table: "users",
          id: userId,
          data: { role: selected ? "admin" : "resident", admin_role: selected || null },
        }),
      });
      if (res.ok) window.location.reload();
      else alert("Erreur");
    } catch { alert("Erreur"); }
    setWorking(false);
  }

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <button onClick={() => setOpen(!open)} className="btn-ghost btn-sm" type="button" style={{ fontSize: "0.8125rem", padding: "4px 8px" }}>
        {currentRole ? "Changer rôle" : "Promouvoir"}
      </button>
      {open && (
        <div style={{
          position: "absolute", top: "100%", left: 0, zIndex: 10, marginTop: 4,
          background: "var(--color-bg-card)", border: "1px solid var(--color-border)",
          borderRadius: 8, padding: 12, minWidth: 200, boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        }}>
          <p style={{ fontSize: "0.8125rem", fontWeight: 600, marginBottom: 8 }}>{userName}</p>
          <select value={selected} onChange={(e) => setSelected(e.target.value)} className="input" style={{ width: "100%", marginBottom: 8, fontSize: "0.8125rem" }}>
            {roles.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
          <div style={{ display: "flex", gap: 4 }}>
            <button onClick={handlePromote} disabled={working} className="btn btn-primary btn-sm" style={{ flex: 1, fontSize: "0.8125rem" }}>
              {working ? "..." : "Appliquer"}
            </button>
            <button onClick={() => setOpen(false)} className="btn btn-ghost btn-sm" style={{ fontSize: "0.8125rem" }}>Annuler</button>
          </div>
        </div>
      )}
    </div>
  );
}
