"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { IconClipboard, IconEdit, IconTrash, IconChevronRight, IconSort, IconClose } from "@/components/icons";
import { formatDate } from "@/lib/utils";

type Listing = {
  id: number;
  type: string;
  title: string;
  description: string;
  category: string;
  status: string;
  createdAt: string;
  images: string;
};

const categoryLabels: Record<string, string> = {
  garde: "Garde d'enfants",
  compagnie: "Compagnie et visite",
  courses: "Courses et déplacements",
  numerique: "Aide numérique",
  bricolage: "Bricolage et petits travaux",
  vente: "Vente d'objets",
  pret: "Prêt d'objets",
  transport: "Transport et mobilité",
  sport: "Sport",
  divers: "Divers",
};

export default function MesAnnoncesClient({ listings: initial }: { listings: Listing[] }) {
  const router = useRouter();
  const [listings, setListings] = useState(initial);
  const [sortBy, setSortBy] = useState<"date" | "type" | "status">("date");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editCat, setEditCat] = useState("");
  const [saving, setSaving] = useState(false);

  const sorted = [...listings].sort((a, b) => {
    if (sortBy === "date") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    if (sortBy === "status") return a.status.localeCompare(b.status);
    return a.type.localeCompare(b.type);
  });

  function startEdit(l: Listing) {
    setEditingId(l.id);
    setEditTitle(l.title);
    setEditDesc(l.description);
    setEditCat(l.category);
  }

  function cancelEdit() {
    setEditingId(null);
  }

  async function saveEdit() {
    if (!editingId || !editTitle.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/listings/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: editTitle.trim(), description: editDesc.trim(), category: editCat }),
      });
      const data = await res.json();
      if (data.success) {
        setListings((prev) => prev.map((l) => l.id === editingId ? { ...l, title: editTitle.trim(), description: editDesc.trim(), category: editCat } : l));
        setEditingId(null);
      } else {
        alert(data.error);
      }
    } catch {
      alert("Erreur lors de la modification");
    }
    setSaving(false);
  }

  async function deleteListing(id: number) {
    if (!confirm("Supprimer cette annonce ?")) return;
    try {
      const res = await fetch(`/api/listings/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setListings((prev) => prev.filter((l) => l.id !== id));
      } else {
        alert(data.error);
      }
    } catch {
      alert("Erreur lors de la suppression");
    }
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div className="input-group" style={{ gap: 4 }}>
          <IconSort size={18} />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "date" | "type" | "status")}
            className="input"
            style={{ padding: "6px 10px", fontSize: "0.8125rem", width: "auto" }}
          >
            <option value="date">Plus récent</option>
            <option value="type">Type</option>
            <option value="status">Statut</option>
          </select>
        </div>
        <a href="/entraide/nouveau" className="btn btn-accent btn-sm">
          Publier une annonce
        </a>
      </div>

      {sorted.length === 0 && (
        <div className="card" style={{ padding: 40, textAlign: "center" }}>
          <p style={{ color: "var(--color-text-secondary)", marginBottom: 16 }}>
            Vous n&apos;avez pas encore publié d&apos;annonce.
          </p>
          <a href="/entraide/nouveau" className="btn btn-primary">
            Publier votre première annonce
          </a>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {sorted.map((l) => (
          <div key={l.id} className="card" style={{ padding: 0, overflow: "hidden" }}>
            {editingId === l.id ? (
              <div style={{ padding: "16px 20px" }}>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, marginBottom: 4 }}>Titre</label>
                  <input className="input" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} style={{ width: "100%" }} />
                </div>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, marginBottom: 4 }}>Description</label>
                  <textarea className="input" value={editDesc} onChange={(e) => setEditDesc(e.target.value)} rows={3} style={{ width: "100%", resize: "vertical" }} />
                </div>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, marginBottom: 4 }}>Catégorie</label>
                  <select className="input" value={editCat} onChange={(e) => setEditCat(e.target.value)} style={{ width: "100%" }}>
                    {Object.entries(categoryLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="btn btn-primary btn-sm" onClick={saveEdit} disabled={saving}>
                    {saving ? "Enregistrement…" : "Enregistrer"}
                  </button>
                  <button className="btn btn-ghost btn-sm" onClick={cancelEdit}>Annuler</button>
                </div>
              </div>
            ) : (
              <div style={{ padding: "14px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
                <a href={`/entraide/${l.id}`} style={{ textDecoration: "none", color: "var(--color-text)", flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <span className={`tag ${l.type === "propose" ? "tag-propose" : l.type === "vente" ? "tag-vente" : "tag-cherche"}`}>
                      {l.type === "propose" ? "Propose" : l.type === "vente" ? "Vente" : "Cherche"}
                    </span>
                    <div>
                      <p style={{ marginBottom: 2 }}>{l.title}</p>
                      <p style={{ fontSize: "0.8125rem", color: "var(--color-text-tertiary)" }}>
                        {categoryLabels[l.category] || l.category}
                        {l.status === "closed" && " · Fermée"} · {formatDate(l.createdAt)}
                      </p>
                    </div>
                  </div>
                </a>
                <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                  <button onClick={() => startEdit(l)} className="btn-ghost btn-sm" style={{ padding: "6px 8px", lineHeight: 1 }} title="Modifier">
                    <IconEdit size={16} />
                  </button>
                  <button onClick={() => deleteListing(l.id)} className="btn-ghost btn-sm" style={{ padding: "6px 8px", lineHeight: 1, color: "var(--color-error)" }} title="Supprimer">
                    <IconTrash size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
