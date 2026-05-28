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
      initVals[f.key] = f.default !== undefined && f.default !== null ? String(f.default) : "";
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
        data[f.key] = val === true || val === "1" ? 1 : 0;
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
          <div style={{ background: "#fff", borderRadius: 12, padding: "24px 28px", minWidth: 400, maxWidth: 520, maxHeight: "80vh", overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
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
          <div style={{ background: "#fff", borderRadius: 12, padding: "24px 28px", minWidth: 400, maxWidth: 520 }} onClick={(e) => e.stopPropagation()}>
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
