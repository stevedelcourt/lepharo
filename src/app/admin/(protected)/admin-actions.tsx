"use client";

import { useState } from "react";
import { IconTrash, IconEdit, IconWarning } from "@/components/icons";

/* ───── Delete ───── */
export function DeleteButton({ table, id }: { table: string; id: number }) {
  async function handleDelete() {
    if (!confirm("Supprimer cet élément ? Cette action est irréversible.")) return;
    await fetch(`/api/delete?table=${table}&id=${id}`, { method: "DELETE" });
    window.location.reload();
  }

  return (
    <button onClick={handleDelete} className="btn-danger" type="button">
      <IconTrash size={14} /> Supprimer
    </button>
  );
}

/* ───── Edit Modal ───── */
export function EditButton({ table, id, fields }: { table: string; id: number; fields: { label: string; key: string; type: "text" | "textarea" | "select" | "number" | "boolean"; options?: { value: string; label: string }[]; default?: any }[] }) {
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);

  function init() {
    const initVals: Record<string, any> = {};
    fields.forEach((f) => {
      initVals[f.key] = f.default !== undefined && f.default !== null ? (f.type === "boolean" ? f.default : String(f.default)) : "";
    });
    setValues(initVals);
    setOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    const data: Record<string, any> = {};
    fields.forEach((f) => {
      const val = values[f.key];
      if (f.type === "boolean") {
        data[f.key] = val === true || val === "1" || val === "true" ? 1 : 0;
      } else if (f.type === "number") {
        data[f.key] = val === "" || val === null || val === undefined ? null : Number(val);
      } else {
        data[f.key] = val;
      }
    });
    try {
      const res = await fetch("/api/admin/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update", table, id, data }),
      });
      const text = await res.text();
      let result;
      try { result = JSON.parse(text); } catch { result = {}; }
      if (res.ok && result.success) {
        setOpen(false);
        window.location.reload();
      } else {
        alert("Erreur " + res.status + ": " + (result.error || text.slice(0, 200)));
        setSaving(false);
      }
    } catch (e) {
      alert("Erreur: " + (e instanceof Error ? e.message : "inconnue"));
      setSaving(false);
    }
  }

  return (
    <>
      <button onClick={init} className="btn-ghost btn-sm" type="button" style={{ padding: "4px 8px", fontSize: "0.8125rem" }}>
        <IconEdit size={14} /> Modifier
      </button>
      {open && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }} onClick={() => setOpen(false)}>
          <div style={{ background: "var(--color-bg-card)", borderRadius: 12, padding: "24px 28px", minWidth: 400, maxWidth: 520, maxHeight: "80vh", overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: 20 }}>Modifier</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {fields.map((f) => (
                <div key={f.key}>
                  <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, marginBottom: 4, color: "var(--color-text-secondary)" }}>{f.label}</label>
                  {f.type === "textarea" ? (
                    <textarea className="input" style={{ width: "100%", resize: "vertical" }} value={values[f.key] ?? ""} onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))} />
                  ) : f.type === "select" && f.options ? (
                    <select className="input" style={{ width: "100%" }} value={values[f.key] ?? ""} onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}>
                      {f.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  ) : f.type === "boolean" ? (
                    <select className="input" style={{ width: "100%" }} value={values[f.key] ? "1" : "0"} onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value === "1" }))}>
                      <option value="1">Oui</option>
                      <option value="0">Non</option>
                    </select>
                  ) : f.type === "number" ? (
                    <input className="input" type="number" style={{ width: "100%" }} value={values[f.key] ?? ""} onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))} />
                  ) : (
                    <input className="input" style={{ width: "100%" }} value={values[f.key] ?? ""} onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))} />
                  )}
                </div>
              ))}
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 20 }}>
              <button onClick={() => setOpen(false)} className="btn btn-ghost" type="button">Annuler</button>
              <button onClick={handleSave} className="btn btn-primary" disabled={saving} type="button">{saving ? "..." : "Enregistrer"}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ───── Warn Modal ───── */
export function WarnButton({ userId, userName }: { userId: number; userName: string }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSend() {
    if (!message.trim()) return;
    setSaving(true);
    await fetch("/api/admin/action", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "warn", userId, message }),
    });
    setSaving(false);
    setOpen(false);
    setMessage("");
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="btn-ghost btn-sm" type="button" style={{ padding: "4px 8px", fontSize: "0.8125rem", color: "var(--color-warning)" }}>
        <IconWarning size={14} /> Avertir
      </button>
      {open && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }} onClick={() => setOpen(false)}>
          <div style={{ background: "var(--color-bg-card)", borderRadius: 12, padding: "24px 28px", minWidth: 400, maxWidth: 520 }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: 8 }}>Avertir {userName}</h3>
            <p style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)", marginBottom: 16 }}>
              L&apos;utilisateur recevra cette notification.
            </p>
            <textarea
              className="input"
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Motif de l'avertissement…"
              style={{ width: "100%", resize: "vertical" }}
            />
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 16 }}>
              <button onClick={() => setOpen(false)} className="btn btn-ghost" type="button">Annuler</button>
              <button onClick={handleSend} className="btn btn-primary" disabled={saving || !message.trim()} type="button">
                {saving ? "..." : "Envoyer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ───── VerifiedBadge (clickable toggle) ───── */
export function VerifiedBadge({ id, verified }: { id: number; verified: boolean }) {
  const [working, setWorking] = useState(false);

  async function toggle() {
    if (!confirm(verified ? "Marquer comme non vérifié ?" : "Marquer comme vérifié ?")) return;
    setWorking(true);
    await fetch("/api/admin/action", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "moderate", table: "users", id, field: "verified", value: verified ? 0 : 1 }),
    });
    setWorking(false);
    window.location.reload();
  }

  return (
    <button
      onClick={toggle}
      disabled={working}
      type="button"
      className="tag"
      style={{
        cursor: "pointer",
        border: "none",
        background: verified ? "var(--color-success-light)" : "var(--color-error-light)",
        color: verified ? "var(--color-success)" : "var(--color-error)",
      }}
    >
      {verified ? "Vérifié" : "Non vérifié"}
    </button>
  );
}

/* ───── CoproprietaireBadge (clickable toggle) ───── */
export function CoproprietaireBadge({ id, coproprietaire }: { id: number; coproprietaire: boolean }) {
  const [working, setWorking] = useState(false);

  async function toggle() {
    if (!confirm(coproprietaire ? "Retirer le statut copropriétaire ?" : "Marquer comme copropriétaire ?")) return;
    setWorking(true);
    await fetch("/api/admin/action", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "moderate", table: "users", id, field: "coproprietaire", value: coproprietaire ? 0 : 1 }),
    });
    setWorking(false);
    window.location.reload();
  }

  return (
    <button
      onClick={toggle}
      disabled={working}
      type="button"
      className="tag"
      style={{
        cursor: "pointer",
        border: "none",
        background: coproprietaire ? "#fef3c7" : "var(--color-border)",
        color: coproprietaire ? "#92400e" : "var(--color-text-tertiary)",
        fontWeight: 600,
      }}
    >
      {coproprietaire ? "C" : "—"}
    </button>
  );
}

/* ───── ResetPassword ───── */
export function ResetPasswordButton({ userId }: { userId: number }) {
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  async function handleReset() {
    if (!password.trim() || password.length < 6) {
      alert("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }
    setSaving(true);
    await fetch("/api/admin/action", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "reset-password", userId, password }),
    });
    setSaving(false);
    setDone(true);
  }

  return (
    <>
      <button onClick={() => { setOpen(true); setDone(false); setPassword(""); }} className="btn-ghost btn-sm" type="button" style={{ padding: "4px 8px", fontSize: "0.8125rem" }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        Mot de passe
      </button>
      {open && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }} onClick={() => setOpen(false)}>
          <div style={{ background: "var(--color-bg-card)", borderRadius: 12, padding: "24px 28px", minWidth: 360 }} onClick={(e) => e.stopPropagation()}>
            {done ? (
              <>
                <h3 style={{ marginBottom: 8 }}>Mot de passe réinitialisé</h3>
                <p style={{ color: "var(--color-text-secondary)", marginBottom: 16 }}>
                  Le nouveau mot de passe a été enregistré.
                </p>
                <button onClick={() => { setOpen(false); window.location.reload(); }} className="btn btn-primary" type="button">Fermer</button>
              </>
            ) : (
              <>
                <h3 style={{ marginBottom: 16 }}>Nouveau mot de passe</h3>
                <input className="input" type="text" autoComplete="off" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Minimum 6 caractères" style={{ width: "100%" }} />
                <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 16 }}>
                  <button onClick={() => setOpen(false)} className="btn btn-ghost" type="button">Annuler</button>
                  <button onClick={handleReset} className="btn btn-primary" disabled={saving || password.length < 6} type="button">
                    {saving ? "..." : "Enregistrer"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

/* ───── EditUserModal (profile-style) ───── */
export function EditUserModal({ user: u }: { user: { id: number; firstName: string; lastName: string; email: string; floor: number | null; role: string; verified: boolean; phone: string | null; bio: string | null; tagline: string | null; senior: boolean; kids: boolean; showFullName: boolean; coproprietaire?: boolean } }) {
  const [open, setOpen] = useState(false);
  const [firstName, setFirstName] = useState(u.firstName);
  const [lastName, setLastName] = useState(u.lastName);
  const [email, setEmail] = useState(u.email);
  const [floor, setFloor] = useState(u.floor?.toString() || "");
  const [phone, setPhone] = useState(u.phone || "");
  const [role, setRole] = useState(u.role);
  const [tagline, setTagline] = useState(u.tagline || "");
  const [bio, setBio] = useState(u.bio || "");
  const [senior, setSenior] = useState(u.senior);
  const [kids, setKids] = useState(u.kids);
  const [verified, setVerified] = useState(u.verified);
  const [showFullName, setShowFullName] = useState(u.showFullName);
  const [coproprietaire, setCoproprietaire] = useState(u.coproprietaire || false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const data: Record<string, any> = {
        first_name: firstName, last_name: lastName, email,
        floor: floor ? parseInt(floor, 10) : null, phone, role,
        tagline, bio, senior: senior ? 1 : 0, verified: verified ? 1 : 0,
        show_full_name: showFullName ? 1 : 0, kids: kids ? 1 : 0,
        coproprietaire: coproprietaire ? 1 : 0,
      };
      const res = await fetch("/api/admin/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update", table: "users", id: u.id, data }),
      });
      const text = await res.text();
      let result;
      try { result = JSON.parse(text); } catch { result = {}; }
      if (res.ok && result.success) {
        setOpen(false);
        window.location.reload();
      } else {
        setError(result.error || "Erreur " + res.status);
        setSaving(false);
      }
    } catch (e) {
      setError("Erreur: " + (e instanceof Error ? e.message : "inconnue"));
      setSaving(false);
    }
  }

  function Toggle({ value, onChange, label, desc, activeColor }: { value: boolean; onChange: (v: boolean) => void; label: string; desc?: string; activeColor?: string }) {
    return (
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 0" }}>
        <button type="button" onClick={() => onChange(!value)}
          style={{ width: 40, height: 22, borderRadius: 11, border: "none", cursor: "pointer", background: value ? (activeColor || "var(--color-primary)") : "var(--color-border)", position: "relative", transition: "background 0.2s", flexShrink: 0, marginTop: 1 }}>
          <span style={{ position: "absolute", top: 2, width: 18, height: 18, borderRadius: "50%", background: "#fff", transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)", left: value ? 20 : 2 }} />
        </button>
        <div>
          <p style={{ fontWeight: 600, fontSize: "0.875rem", margin: 0 }}>{label}</p>
          {desc && <p style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)", margin: "2px 0 0" }}>{desc}</p>}
        </div>
      </div>
    );
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="btn-ghost btn-sm" type="button" style={{ padding: "4px 8px", fontSize: "0.8125rem" }}>
        <IconEdit size={14} /> Modifier
      </button>
      {open && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }} onClick={() => setOpen(false)}>
          <div style={{ background: "var(--color-bg-card)", borderRadius: 12, padding: "24px 28px", minWidth: 500, maxWidth: 560, maxHeight: "85vh", overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: 20 }}>Modifier l&apos;utilisateur</h3>

            {error && <div style={{ padding: "10px 14px", borderRadius: "var(--radius-md)", fontSize: "0.875rem", background: "var(--color-error-light)", color: "var(--color-error)", marginBottom: 16 }}>{error}</div>}

            <section style={{ marginBottom: 20 }}>
              <h4 style={{ fontSize: "0.9375rem", marginBottom: 12, color: "var(--color-text-secondary)" }}>Informations</h4>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, marginBottom: 4, color: "var(--color-text-secondary)" }}>Prénom</label>
                  <input className="input" value={firstName} onChange={(e) => setFirstName(e.target.value)} style={{ width: "100%" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, marginBottom: 4, color: "var(--color-text-secondary)" }}>Nom</label>
                  <input className="input" value={lastName} onChange={(e) => setLastName(e.target.value)} style={{ width: "100%" }} />
                </div>
              </div>
              <div style={{ marginTop: 12 }}>
                <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, marginBottom: 4, color: "var(--color-text-secondary)" }}>Email</label>
                <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: "100%" }} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 12 }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, marginBottom: 4, color: "var(--color-text-secondary)" }}>Étage</label>
                  <input className="input" type="number" value={floor} onChange={(e) => setFloor(e.target.value)} style={{ width: "100%" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, marginBottom: 4, color: "var(--color-text-secondary)" }}>Téléphone</label>
                  <input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} style={{ width: "100%" }} />
                </div>
              </div>
              <div style={{ marginTop: 12 }}>
                <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, marginBottom: 4, color: "var(--color-text-secondary)" }}>Rôle</label>
                <select className="input" value={role} onChange={(e) => setRole(e.target.value)} style={{ width: "100%" }}>
                  <option value="resident">Résident</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </section>

            <section style={{ marginBottom: 20, paddingTop: 16, borderTop: "1px solid var(--color-border-light)" }}>
              <h4 style={{ fontSize: "0.9375rem", marginBottom: 4, color: "var(--color-text-secondary)" }}>Préférences</h4>
              <Toggle value={verified} onChange={setVerified} label="Vérifié" desc="Compte vérifié par l'administration" />
              <Toggle value={coproprietaire} onChange={setCoproprietaire} label="Copropriétaire" desc="Accès à l'espace documents" activeColor="#92400e" />
              <Toggle value={senior} onChange={setSenior} label="Senior" />
              <Toggle value={kids} onChange={setKids} label="Kids" activeColor="#401f7f" />
              <Toggle value={showFullName} onChange={setShowFullName} label="Afficher le nom complet" desc="Le nom complet apparaît dans l'annuaire" />
            </section>

            <section style={{ paddingTop: 16, borderTop: "1px solid var(--color-border-light)" }}>
              <h4 style={{ fontSize: "0.9375rem", marginBottom: 12, color: "var(--color-text-secondary)" }}>Bio</h4>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, marginBottom: 4, color: "var(--color-text-secondary)" }}>Tagline</label>
                <input className="input" value={tagline} onChange={(e) => { const v = e.target.value; if (v.length <= 110) setTagline(v); }} maxLength={110} style={{ width: "100%" }} />
                <p style={{ fontSize: "0.75rem", color: "var(--color-text-tertiary)", marginTop: 2, textAlign: "right" }}>{tagline.length}/110</p>
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, marginBottom: 4, color: "var(--color-text-secondary)" }}>Bio</label>
                <textarea className="input" rows={4} value={bio} onChange={(e) => { const v = e.target.value; if (v.length <= 1000) setBio(v); }} maxLength={1000} style={{ width: "100%", resize: "vertical", fontFamily: "inherit" }} />
                <p style={{ fontSize: "0.75rem", color: "var(--color-text-tertiary)", marginTop: 2, textAlign: "right" }}>{bio.length}/1000</p>
              </div>
            </section>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 24, paddingTop: 16, borderTop: "1px solid var(--color-border-light)" }}>
              <button onClick={() => setOpen(false)} className="btn btn-ghost" type="button">Annuler</button>
              <button onClick={handleSave} className="btn btn-primary" disabled={saving} type="button">{saving ? "Enregistrement..." : "Enregistrer"}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ───── Moderate (toggle boolean) ───── */
export function ModerateButton({ table, id, field, label, icon, value: initialValue }: { table: string; id: number; field: string; label: string; icon?: React.ReactNode; value: boolean | string | number }) {
  const [working, setWorking] = useState(false);

  async function toggle() {
    if (!confirm(`${label} ?`)) return;
    setWorking(true);
    const newValue = typeof initialValue === "boolean" ? !initialValue : (initialValue === "open" ? "closed" : "open");
    await fetch("/api/admin/action", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "moderate", table, id, field, value: newValue }),
    });
    setWorking(false);
    window.location.reload();
  }

  const btnLabel = label.split(" ")[0];

  return (
    <button onClick={toggle} disabled={working} className="btn-ghost btn-sm" type="button" style={{ padding: "4px 8px", fontSize: "0.8125rem" }}>
      {icon}
      {btnLabel}
    </button>
  );
}
