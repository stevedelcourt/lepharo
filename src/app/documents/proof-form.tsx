"use client";

import { useState } from "react";
import { IconUpload, IconCheck } from "@/components/icons";

export default function ProofForm() {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file || sending) return;
    setSending(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("message", message);
      const res = await fetch("/api/documents/proof", { method: "POST", body: formData });
      if (res.ok) {
        setSent(true);
      } else {
        const data = await res.json();
        alert(data.error || "Erreur lors de l'envoi");
      }
    } catch {
      alert("Erreur lors de l'envoi");
    } finally {
      setSending(false);
    }
  }

  if (sent) {
    return (
      <div className="card" style={{ padding: "32px 24px", textAlign: "center", maxWidth: 500, margin: "0 auto" }}>
        <IconCheck size={40} style={{ color: "var(--color-success)", marginBottom: 12 }} />
        <h3 style={{ marginBottom: 8 }}>Document envoyé</h3>
        <p style={{ color: "var(--color-text-secondary)", fontSize: "0.9375rem" }}>
          Votre justificatif a bien été transmis à l&apos;administration. Vous serez notifié une fois votre statut vérifié.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ marginBottom: 20 }}>
        <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: 6 }}>Justificatif de propriété</label>
        <div style={{ border: "2px dashed var(--color-border-light)", borderRadius: 8, padding: "24px 16px", textAlign: "center" }}>
          {file ? (
            <div>
              <p style={{ fontSize: "0.875rem", marginBottom: 4 }}>{file.name}</p>
              <p style={{ fontSize: "0.75rem", color: "var(--color-text-tertiary)", marginBottom: 8 }}>{(file.size / 1024 / 1024).toFixed(1)} Mo</p>
              <button type="button" onClick={() => setFile(null)} className="btn btn-ghost btn-sm">Changer de fichier</button>
            </div>
          ) : (
            <label style={{ cursor: "pointer", display: "block" }}>
              <IconUpload size={32} style={{ color: "var(--color-text-tertiary)", marginBottom: 8 }} />
              <p style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)", marginBottom: 4 }}>Cliquez pour sélectionner un fichier</p>
              <p style={{ fontSize: "0.75rem", color: "var(--color-text-tertiary)" }}>PDF, image (max 10 Mo)</p>
              <input type="file" accept=".pdf,image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} style={{ display: "none" }} />
            </label>
          )}
        </div>
      </div>

      <div style={{ marginBottom: 24 }}>
        <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: 6 }}>Message (optionnel)</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="input"
          placeholder="Ajoutez un message pour l'administration…"
          rows={3}
          style={{ width: "100%", resize: "vertical" }}
        />
      </div>

      <button type="submit" disabled={!file || sending} className="btn btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
        <IconUpload size={18} />
        {sending ? "Envoi…" : "Envoyer le justificatif"}
      </button>
    </form>
  );
}
