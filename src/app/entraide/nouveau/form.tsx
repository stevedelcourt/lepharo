"use client";

import { useRouter } from "next/navigation";
import { useState, useRef } from "react";
import { IconPlus } from "@/components/icons";

const categories = [
  { id: "garde", label: "Garde d'enfants" },
  { id: "compagnie", label: "Compagnie et visite" },
  { id: "courses", label: "Courses et déplacements" },
  { id: "numerique", label: "Aide numérique" },
  { id: "bricolage", label: "Bricolage et petits travaux" },
  { id: "vente", label: "Vente d'objets" },
  { id: "pret", label: "Prêt d'objets" },
  { id: "transport", label: "Transport et mobilité" },
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
  const [publishedId, setPublishedId] = useState<number | null>(null);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    const remaining = 5 - imageFiles.length;
    const allowed = files.slice(0, remaining);
    setImageFiles((prev) => [...prev, ...allowed]);
    e.target.value = "";
  }

  function removeFile(idx: number) {
    setImageFiles((prev) => prev.filter((_, i) => i !== idx));
  }

  async function uploadImages(): Promise<string[]> {
    if (imageFiles.length === 0) return [];
    setUploading(true);
    const formData = new FormData();
    imageFiles.forEach((f) => formData.append("images", f));
    const res = await fetch("/api/listings/upload", { method: "POST", body: formData });
    const data = await res.json();
    setUploading(false);
    if (data.urls) return data.urls;
    throw new Error(data.error || "Échec du téléchargement");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!category) {
      setError("Veuillez choisir une catégorie");
      return;
    }
    setSaving(true);
    setError(null);

    try {
      let urls: string[] = [];
      if (imageFiles.length > 0) {
        try { urls = await uploadImages(); } catch {}
      }

      const res = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, title, description, category, images: urls }),
      });
      const body = await res.text();
      let data: any;
      try { data = JSON.parse(body); } catch { data = {}; }
      if (data?.success && data?.id) {
        setPublishedId(data.id);
      } else {
        setError(data?.error || "Erreur lors de la publication");
      }
    } catch {
      setError("Erreur lors de la publication");
    }
    setSaving(false);
  }

  if (publishedId) {
    return (
      <div className="card" style={{ padding: "32px 24px", textAlign: "center" }}>
        <p style={{ fontSize: "1.125rem", fontWeight: 700, marginBottom: 12 }}>Annonce publiée avec succès !</p>
        <p style={{ color: "var(--color-text-secondary)", marginBottom: 24, fontSize: "0.9375rem" }}>
          Votre annonce est désormais visible par tous les résidents.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          <a href={`/entraide/${publishedId}`} className="btn btn-primary">Voir mon annonce</a>
          <a href="/entraide/nouveau" className="btn btn-ghost">Publier une autre</a>
        </div>
      </div>
    );
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
          Type d&apos;annonce
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
          Catégorie
        </label>
        <select
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="input"
          style={{ width: "100%" }}
        >
          <option value="">Choisir une catégorie…</option>
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
          placeholder="Décrivez ce que vous proposez ou ce que vous cherchez..."
          style={{ width: "100%", resize: "vertical", fontFamily: "inherit" }}
        />
      </div>

      <div>
        <label style={{ display: "block", marginBottom: 8, fontSize: "0.9375rem" }}>
          Photos <span style={{ fontSize: "0.8125rem", color: "var(--color-text-tertiary)" }}>(optionnel, jusqu&apos;à 5)</span>
        </label>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          style={{ display: "none" }}
        />
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
          {imageFiles.map((f, i) => (
            <div key={i} style={{ position: "relative", width: 80, height: 80, borderRadius: 8, overflow: "hidden", border: "1px solid var(--color-border)" }}>
              <img
                src={URL.createObjectURL(f)}
                alt=""
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
              <button
                type="button"
                onClick={() => removeFile(i)}
                style={{ position: "absolute", top: 2, right: 2, width: 20, height: 20, borderRadius: "50%", background: "rgba(0,0,0,0.6)", color: "#fff", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0, fontSize: 10 }}
              >
                &times;
              </button>
            </div>
          ))}
          {imageFiles.length < 5 && (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              style={{ width: 80, height: 80, borderRadius: 8, border: "2px dashed var(--color-border)", background: "transparent", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4, color: "var(--color-text-tertiary)", fontSize: "0.75rem" }}
            >
              <IconPlus size={20} />
              Ajouter
            </button>
          )}
        </div>
      </div>

      <div>
        <button className="btn btn-primary" type="submit" disabled={saving || uploading}>
          {saving || uploading ? "Publication..." : "Publier l'annonce"}
        </button>
      </div>
    </form>
  );
}
