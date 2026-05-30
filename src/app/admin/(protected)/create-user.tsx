"use client";

import { useState } from "react";
import { IconPlus } from "@/components/icons";

function generatePassword(): string {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let pwd = "";
  for (let i = 0; i < 12; i++) pwd += chars.charAt(Math.floor(Math.random() * chars.length));
  return pwd;
}

export function CreateUserButton() {
  const [open, setOpen] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ pwd?: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) return;
    if (!email.trim() && !phone.trim()) {
      setError("Email ou téléphone requis");
      return;
    }
    setSaving(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim() || undefined,
          phone: phone.trim() || undefined,
          password: password || undefined,
        }),
      });
      let data: any;
      try {
        data = await res.json();
      } catch {
        setError("Erreur " + res.status + ": réponse invalide");
        setSaving(false);
        return;
      }
      if (data.success) {
        if (data.generatedPassword) {
          setResult({ pwd: data.generatedPassword });
        } else {
          setOpen(false);
          setFirstName(""); setLastName(""); setEmail(""); setPhone(""); setPassword("");
          window.location.reload();
        }
      } else {
        setError(data.error || "Erreur " + res.status);
      }
    } catch (e: any) { setError("Erreur réseau: " + (e?.message || "")); }
    setSaving(false);
  }

  const canSubmit = firstName.trim() && lastName.trim() && (email.trim() || phone.trim());

  return (
    <>
      <button onClick={() => setOpen(true)} className="btn btn-primary btn-sm" style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
        <IconPlus size={16} /> Nouvel utilisateur
      </button>
      {open && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }} onClick={() => setOpen(false)}>
          <div style={{ background: "var(--color-bg-card)", borderRadius: 12, padding: "24px 28px", minWidth: 400, maxWidth: 520 }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: 20 }}>Nouvel utilisateur</h3>

            {result ? (
              <div>
                <p style={{ color: "var(--color-success)", fontWeight: 600, marginBottom: 12 }}>
                  Utilisateur créé avec succès !
                </p>
                <p style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)", marginBottom: 8 }}>
                  Mot de passe généré :
                </p>
                <div style={{ padding: "10px 14px", background: "var(--color-bg-alt)", borderRadius: 8, fontFamily: "monospace", fontSize: "1rem", marginBottom: 16, userSelect: "all" }}>
                  {result.pwd}
                </div>
                <p style={{ fontSize: "0.8125rem", color: "var(--color-text-tertiary)", marginBottom: 16 }}>
                  Copiez ce mot de passe et transmettez-le au résident. Vous ne pourrez plus le récupérer.
                </p>
                <button onClick={() => { setOpen(false); setResult(null); setFirstName(""); setLastName(""); setEmail(""); setPhone(""); setPassword(""); window.location.reload(); }} className="btn btn-primary">
                  Terminé
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {error && <div style={{ padding: "8px 12px", borderRadius: 8, fontSize: "0.875rem", background: "var(--color-error-light)", color: "var(--color-error)", marginBottom: 12 }}>{error}</div>}

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
                  <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, marginBottom: 4, color: "var(--color-text-secondary)" }}>
                    Email <span style={{ fontWeight: 400, color: "var(--color-text-tertiary)" }}>(optionnel si téléphone)</span>
                  </label>
                  <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: "100%" }} />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, marginBottom: 4, color: "var(--color-text-secondary)" }}>
                    Téléphone <span style={{ fontWeight: 400, color: "var(--color-text-tertiary)" }}>(optionnel si email)</span>
                  </label>
                  <div style={{ display: "flex", gap: 6, alignItems: "stretch" }}>
                    <span style={{ display: "flex", alignItems: "center", padding: "0 10px", background: "var(--color-bg-alt)", borderRadius: "8px 0 0 8px", fontSize: "0.875rem", color: "var(--color-text-secondary)", border: "1px solid var(--color-border)", borderRight: "none" }}>
                      +33
                    </span>
                    <input
                      className="input"
                      type="tel"
                      value={phone}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9]/g, "");
                        setPhone(val);
                      }}
                      placeholder="6 12 34 56 78"
                      style={{ width: "100%", borderRadius: "0 8px 8px 0" }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, marginBottom: 4, color: "var(--color-text-secondary)" }}>
                    Mot de passe <span style={{ fontWeight: 400, color: "var(--color-text-tertiary)" }}>(laissez vide pour générer)</span>
                  </label>
                  <div style={{ display: "flex", gap: 6 }}>
                    <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ flex: 1 }} placeholder="Généré automatiquement si vide" />
                    <button type="button" onClick={() => setPassword(generatePassword())} className="btn btn-ghost btn-sm" style={{ whiteSpace: "nowrap", padding: "8px 12px" }}>
                      Générer
                    </button>
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 8 }}>
                  <button type="button" onClick={() => setOpen(false)} className="btn btn-ghost">Annuler</button>
                  <button type="submit" className="btn btn-primary" disabled={saving || !canSubmit}>
                    {saving ? "..." : "Créer"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
