"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const categories = [
  { id: "garde", label: "Garde d'enfants" },
  { id: "compagnie", label: "Compagnie et visite" },
  { id: "courses", label: "Courses et deplacements" },
  { id: "numerique", label: "Aide numerique" },
  { id: "bricolage", label: "Bricolage et petits travaux" },
  { id: "pret", label: "Pret d'objets" },
  { id: "transport", label: "Transport et mobilite" },
  { id: "divers", label: "Divers" },
];

export default function NouveauListingForm() {
  const router = useRouter();
  const [type, setType] = useState<"propose" | "cherche">("propose");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!category) {
      setError("Veuillez choisir une categorie");
      return;
    }
    setSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, title, description, category }),
      });
      const data = await res.json();
      if (data.success) {
        router.push(`/entraide/${data.id}`);
      } else {
        setError(data.error || "Erreur lors de la publication");
      }
    } catch {
      setError("Erreur lors de la publication");
    }
    setSaving(false);
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {error && (
        <div style={{ padding: "12px 16px", borderRadius: "var(--radius-md)", fontSize: "0.9375rem", background: "#fce4ec", color: "#c62828" }}>
          {error}
        </div>
      )}

      <div>
        <label className="label" style={{ display: "block", marginBottom: 8, fontSize: "0.9375rem" }}>
          Type d annonce
        </label>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            type="button"
            onClick={() => setType("propose")}
            className={`btn ${type === "propose" ? "btn-primary" : "btn-ghost"}`}
            style={{ flex: 1 }}
          >
            Je propose
          </button>
          <button
            type="button"
            onClick={() => setType("cherche")}
            className={`btn ${type === "cherche" ? "btn-primary" : "btn-ghost"}`}
            style={{ flex: 1 }}
          >
            Je cherche
          </button>
        </div>
      </div>

      <div>
        <label className="label" htmlFor="category" style={{ display: "block", marginBottom: 4, fontSize: "0.9375rem" }}>
          Categorie
        </label>
        <select
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="input"
          style={{ width: "100%" }}
        >
          <option value="">Choisir une categorie…</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="label" htmlFor="title" style={{ display: "block", marginBottom: 4, fontSize: "0.9375rem" }}>
          Titre
        </label>
        <input
          id="title"
          className="input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          placeholder="ex: Baby-sitting samedi soir"
          style={{ width: "100%" }}
        />
      </div>

      <div>
        <label className="label" htmlFor="description" style={{ display: "block", marginBottom: 4, fontSize: "0.9375rem" }}>
          Description
        </label>
        <textarea
          id="description"
          className="input"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          rows={6}
          placeholder="Decrivez ce que vous proposez ou ce que vous cherchez..."
          style={{ width: "100%", resize: "vertical", fontFamily: "inherit" }}
        />
      </div>

      <div>
        <button className="btn btn-primary" type="submit" disabled={saving}>
          {saving ? "Publication..." : "Publier l annonce"}
        </button>
      </div>
    </form>
  );
}
