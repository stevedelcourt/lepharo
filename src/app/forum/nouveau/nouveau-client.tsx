"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { IconForum, IconPlus, IconChevronLeft, IconUpload, IconClose } from "@/components/icons";

export default function NouveauClient({ rubriques }: { rubriques: { id: number; name: string; slug: string }[] }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [rubrique, setRubrique] = useState(rubriques[0]?.slug || "");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    const remaining = 4 - images.length;
    const selected = files.slice(0, remaining);
    setImages((prev) => [...prev, ...selected]);
    setPreviews((prev) => [...prev, ...selected.map((f) => URL.createObjectURL(f))]);
    e.target.value = "";
  }

  function removeImage(index: number) {
    URL.revokeObjectURL(previews[index]);
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !content.trim() || saving) return;
    setSaving(true);
    try {
      let imageUrls: string[] = [];
      if (images.length > 0) {
        const formData = new FormData();
        images.forEach((img) => formData.append("images", img));
        const uploadRes = await fetch("/api/forum/upload", {
          method: "POST",
          body: formData,
        });
        if (!uploadRes.ok) {
          const err = await uploadRes.json();
          alert(err.error);
          setSaving(false);
          return;
        }
        const uploadData = await uploadRes.json();
        imageUrls = uploadData.urls;
      }

      const res = await fetch("/api/forum/topics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), content: content.trim(), rubrique, images: imageUrls }),
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
    <div className="container page-padding" style={{ maxWidth: 700 }}>
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

        <div style={{ marginBottom: 24 }}>
          <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: 6 }}>
            Photos {images.length > 0 && <span style={{ fontWeight: 400, color: "var(--color-text-secondary)" }}>({images.length}/4)</span>}
          </label>
          {previews.length > 0 && (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
              {previews.map((src, i) => (
                <div key={i} style={{ position: "relative", width: 100, height: 100, borderRadius: 8, overflow: "hidden", border: "1px solid var(--color-border-light)" }}>
                  <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  <button type="button" onClick={() => removeImage(i)} style={{ position: "absolute", top: 4, right: 4, width: 22, height: 22, borderRadius: "50%", border: "none", background: "rgba(0,0,0,0.5)", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}>
                    <IconClose size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
          {images.length < 4 && (
            <label style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 8, border: "2px dashed var(--color-border-light)", cursor: "pointer", fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>
              <IconUpload size={18} />
              {images.length === 0 ? "Ajouter des photos (max 4)" : "Ajouter encore"}
              <input type="file" accept="image/*" multiple onChange={handleImageSelect} style={{ display: "none" }} />
            </label>
          )}
          {images.length > 0 && <p style={{ fontSize: "0.75rem", color: "var(--color-text-tertiary)", marginTop: 6, marginBottom: 0 }}>Les photos seront redimensionnées (max 1000px) et converties en WebP</p>}
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
