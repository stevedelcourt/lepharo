"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { IconFolder, IconPlus, IconUpload } from "@/components/icons";

export default function AdminDocumentsForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !category.trim()) return;
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("category", category.trim());
      formData.append("date", date || new Date().toISOString().split("T")[0]);
      if (file) formData.append("file", file);
      const res = await fetch("/api/documents", { method: "POST", body: formData });
      const data = await res.json();
      if (data.success) {
        setOpen(false);
        setTitle("");
        setCategory("");
        setDate("");
        setFile(null);
        router.refresh();
      }
    } catch {}
    setSaving(false);
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="btn btn-primary btn-sm" style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
        <IconPlus size={16} /> Nouveau document
      </button>
      {open && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }} onClick={() => setOpen(false)}>
          <div style={{ background: "var(--color-bg-card)", borderRadius: 12, padding: "24px 28px", minWidth: 400, maxWidth: 520 }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: 20 }}>Nouveau document</h3>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, marginBottom: 4, color: "var(--color-text-secondary)" }}>Titre</label>
                <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} style={{ width: "100%" }} required />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, marginBottom: 4, color: "var(--color-text-secondary)" }}>Catégorie</label>
                <input className="input" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="assemblees-generales, budgets, reglement..." style={{ width: "100%" }} required />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, marginBottom: 4, color: "var(--color-text-secondary)" }}>Date</label>
                <input className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} style={{ width: "100%" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, marginBottom: 4, color: "var(--color-text-secondary)" }}>Fichier (PDF, image)</label>
                <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" onChange={(e) => setFile(e.target.files?.[0] || null)} style={{ width: "100%", fontSize: "0.875rem" }} />
                {file && <p style={{ fontSize: "0.75rem", color: "var(--color-text-tertiary)", marginTop: 4 }}>{file.name}</p>}
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 8 }}>
                <button type="button" onClick={() => setOpen(false)} className="btn btn-ghost">Annuler</button>
                <button type="submit" className="btn btn-primary" disabled={saving || !title.trim() || !category.trim()}>
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
