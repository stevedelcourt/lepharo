"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { IconCalendar, IconChevronLeft, IconSend } from "@/components/icons";

export default function NewEventPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [type, setType] = useState("convivial");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !date.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), date: date.trim(), type, description: description.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        router.push("/calendrier");
      } else {
        setError(data.error || "Erreur");
      }
    } catch {
      setError("Erreur réseau");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="container page-padding" style={{ maxWidth: 560, margin: "0 auto" }}>
      <a href="/calendrier" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: "0.875rem", color: "var(--color-text-secondary)", textDecoration: "none", marginBottom: 24 }}>
        <IconChevronLeft size={16} /> Retour au calendrier
      </a>

      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
        <IconCalendar size={28} />
        <h1 style={{ margin: 0 }}>Proposer un événement</h1>
      </div>

      {error && <div style={{ padding: "12px 16px", borderRadius: "var(--radius-md)", fontSize: "0.9375rem", background: "var(--color-error-light)", color: "var(--color-error)", marginBottom: 20 }}>{error}</div>}

      <form onSubmit={handleSubmit} className="card" style={{ padding: "24px 28px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: 6, color: "var(--color-text-secondary)" }}>Titre *</label>
            <input className="input" type="text" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="Ex: Apéro de printemps" style={{ width: "100%" }} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: 6, color: "var(--color-text-secondary)" }}>Date *</label>
            <input className="input" type="text" value={date} onChange={(e) => setDate(e.target.value)} required placeholder="Ex: 15 Juin 2026" style={{ width: "100%" }} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: 6, color: "var(--color-text-secondary)" }}>Type</label>
            <select className="input" value={type} onChange={(e) => setType(e.target.value)} style={{ width: "100%" }}>
              <option value="convivial">Convivial</option>
              <option value="ag">Assemblée Générale</option>
              <option value="travaux">Travaux</option>
              <option value="info">Info</option>
            </select>
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: 6, color: "var(--color-text-secondary)" }}>Description</label>
            <textarea className="input" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Détails de l'événement…" style={{ width: "100%", resize: "vertical" }} />
          </div>
          <button type="submit" disabled={saving || !title.trim() || !date.trim()} className="btn btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: 6, alignSelf: "flex-start" }}>
            <IconSend size={16} />
            {saving ? "Envoi…" : "Proposer l'événement"}
          </button>
        </div>
      </form>
    </div>
  );
}
