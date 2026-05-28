"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { IconForum, IconPlus, IconChevronLeft } from "@/components/icons";

export default function NouveauClient({ rubriques }: { rubriques: { id: number; name: string; slug: string }[] }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [rubrique, setRubrique] = useState(rubriques[0]?.slug || "");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !content.trim() || saving) return;
    setSaving(true);
    try {
      const res = await fetch("/api/forum/topics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), content: content.trim(), rubrique }),
      });
      if (res.ok) {
        const data = await res.json();
        router.push(`/forum/sujet/${data.id}`);
      } else {
        const data = await res.json();
        alert(data.error);
      }
    } catch {
      alert("Erreur lors de la création du sujet");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="container" style={{ padding: "40px 24px", maxWidth: 700 }}>
      <a
        href="/forum"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          fontSize: "0.875rem",
          color: "var(--color-text-secondary)",
          textDecoration: "none",
          marginBottom: 24,
        }}
      >
        <IconChevronLeft size={16} />
        Retour au forum
      </a>

      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32 }}>
        <IconPlus size={28} />
        <h1 style={{ margin: 0 }}>Nouveau sujet</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: 6 }}>Rubrique</label>
          <select
            value={rubrique}
            onChange={(e) => setRubrique(e.target.value)}
            className="input"
            style={{ width: "100%" }}
            required
          >
            {rubriques.map((r) => (
              <option key={r.id} value={r.slug}>{r.name}</option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: 6 }}>Titre</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input"
            placeholder="Titre de votre sujet"
            style={{ width: "100%" }}
            required
            maxLength={200}
          />
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: 6 }}>Contenu</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="input"
            placeholder="Écrivez votre message…"
            rows={8}
            required
            style={{ width: "100%", resize: "vertical" }}
          />
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <button type="submit" disabled={saving || !title.trim() || !content.trim()} className="btn btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <IconPlus size={18} />
            {saving ? "Publication…" : "Publier le sujet"}
          </button>
          <a href="/forum" className="btn btn-ghost">Annuler</a>
        </div>
      </form>
    </div>
  );
}
