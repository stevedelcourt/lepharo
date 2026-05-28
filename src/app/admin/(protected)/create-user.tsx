"use client";

import { useState } from "react";
import { IconPlus } from "@/components/icons";

export function CreateUserButton() {
  const [open, setOpen] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !email.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName: firstName.trim(), lastName: lastName.trim(), email: email.trim(), password: password || undefined }),
      });
      const data = await res.json();
      if (data.success) {
        setOpen(false);
        setFirstName(""); setLastName(""); setEmail(""); setPassword("");
        window.location.reload();
      } else {
        setError(data.error || "Erreur");
      }
    } catch { setError("Erreur réseau"); }
    setSaving(false);
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="btn btn-primary btn-sm" style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
        <IconPlus size={16} /> Nouvel utilisateur
      </button>
      {open && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }} onClick={() => setOpen(false)}>
          <div style={{ background: "var(--color-bg-card)", borderRadius: 12, padding: "24px 28px", minWidth: 400, maxWidth: 520 }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: 20 }}>Nouvel utilisateur</h3>
            {error && <div style={{ padding: "8px 12px", borderRadius: 8, fontSize: "0.875rem", background: "var(--color-error-light)", color: "var(--color-error)", marginBottom: 12 }}>{error}</div>}
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, marginBottom: 4, color: "var(--color-text-secondary)" }}>Prénom</label>
                  <input className="input" value={firstName} onChange={(e) => setFirstName(e.target.value)} style={{ width: "100%" }} required />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, marginBottom: 4, color: "var(--color-text-secondary)" }}>Nom</label>
                  <input className="input" value={lastName} onChange={(e) => setLastName(e.target.value)} style={{ width: "100%" }} required />
                </div>
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, marginBottom: 4, color: "var(--color-text-secondary)" }}>Email</label>
                <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: "100%" }} required />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, marginBottom: 4, color: "var(--color-text-secondary)" }}>Mot de passe (optionnel)</label>
                <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: "100%" }} placeholder="Laissez vide pour connexion Google uniquement" />
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 8 }}>
                <button type="button" onClick={() => setOpen(false)} className="btn btn-ghost">Annuler</button>
                <button type="submit" className="btn btn-primary" disabled={saving || !firstName.trim() || !lastName.trim() || !email.trim()}>
                  {saving ? "..." : "Créer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
