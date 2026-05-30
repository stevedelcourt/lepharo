"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

export default function EditArticlePage() {
  const router = useRouter();
  const params = useParams();
  const isNew = params.id === "0";

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [page, setPage] = useState("home");
  const [sortOrder, setSortOrder] = useState(0);
  const [published, setPublished] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (isNew) return;
    fetch(`/api/articles/${params.id}`)
      .then((r) => r.json())
      .then((data) => {
        setTitle(data.title || "");
        setSlug(data.slug || "");
        setSubtitle(data.subtitle || "");
        setContent(data.content || "");
        setImageUrl(data.imageUrl || "");
        setPage(data.page || "home");
        setSortOrder(data.sortOrder || 0);
        setPublished(data.published || false);
      })
      .catch(() => {});
  }, [params.id, isNew]);

  const generateSlug = (t: string) => {
    return t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  };

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (isNew || slug === generateSlug(title)) {
      setSlug(generateSlug(val));
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("image", file);
    try {
      const res = await fetch("/api/upload/image", { method: "POST", body: formData });
      const data = await res.json();
      if (data.url) setImageUrl(data.url);
    } catch {}
    setUploading(false);
  };

  const handleSave = async () => {
    if (!title.trim()) return;
    setSaving(true);
    const body = {
      title,
      slug: slug || generateSlug(title),
      subtitle,
      content,
      imageUrl,
      page,
      sortOrder,
      published,
    };

    try {
      if (isNew) {
        await fetch("/api/articles", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      } else {
        await fetch(`/api/articles/${params.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      }
      router.push("/admin/articles");
      router.refresh();
    } catch {}
    setSaving(false);
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <Link href="/admin/articles" style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>
          ← Retour
        </Link>
        <h1 style={{ fontSize: "1.5rem" }}>{isNew ? "Nouvel article" : "Modifier l'article"}</h1>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 720 }}>
        <div>
          <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: 4 }}>Titre</label>
          <input className="input" style={{ width: "100%" }} value={title} onChange={(e) => handleTitleChange(e.target.value)} placeholder="Titre de l'article" />
        </div>

        <div>
          <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: 4 }}>Slug (URL)</label>
          <input className="input" style={{ width: "100%" }} value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="titre-de-l-article" />
        </div>

        <div>
          <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: 4 }}>Sous-titre</label>
          <input className="input" style={{ width: "100%" }} value={subtitle} onChange={(e) => setSubtitle(e.target.value)} placeholder="Sous-titre (optionnel)" />
        </div>

        <div>
          <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: 4 }}>Image</label>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <input type="file" accept="image/*" onChange={handleImageUpload} />
            {uploading && <span style={{ fontSize: "0.875rem" }}>Upload…</span>}
          </div>
          {imageUrl && (
            <div style={{ marginTop: 8 }}>
              <img src={imageUrl} alt="" style={{ width: 200, height: 200, objectFit: "cover", borderRadius: 8, border: "1px solid var(--color-border-light)" }} />
              <button onClick={() => setImageUrl("")} style={{ display: "block", marginTop: 4, fontSize: "0.8125rem", color: "var(--color-error)", cursor: "pointer", background: "none", border: "none" }}>
                Supprimer l'image
              </button>
            </div>
          )}
        </div>

        <div>
          <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: 4 }}>Contenu (markdown)</label>
          <textarea
            className="input"
            style={{ width: "100%", minHeight: 200, fontFamily: "var(--font-sans)", resize: "vertical" }}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Collez votre contenu markdown ici…"
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div>
            <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: 4 }}>Page</label>
            <select className="input" style={{ width: "100%" }} value={page} onChange={(e) => setPage(e.target.value)}>
              <option value="home">Accueil</option>
              <option value="about">À propos</option>
            </select>
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: 4 }}>Ordre d'affichage</label>
            <input className="input" style={{ width: "100%" }} type="number" value={sortOrder} onChange={(e) => setSortOrder(Number(e.target.value))} />
          </div>
        </div>

        <div>
          <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
            <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} />
            <span style={{ fontSize: "0.875rem", fontWeight: 600 }}>Publié</span>
          </label>
        </div>

        <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
          <button onClick={handleSave} className="btn btn-primary" disabled={saving || !title.trim()}>
            {saving ? "Enregistrement…" : "Enregistrer"}
          </button>
          <Link href="/admin/articles" className="btn btn-outline">Annuler</Link>
        </div>
      </div>
    </div>
  );
}
