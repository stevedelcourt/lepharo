"use client";

import { useState } from "react";
import { IconClipboard, IconChevronRight, IconSort } from "@/components/icons";
import { formatDate } from "@/lib/utils";

type Listing = {
  id: number;
  type: string;
  title: string;
  category: string;
  status: string;
  createdAt: string;
};

const categoryLabels: Record<string, string> = {
  garde: "Garde d'enfants",
  compagnie: "Compagnie et visite",
  courses: "Courses et déplacements",
  numerique: "Aide numérique",
  bricolage: "Bricolage et petits travaux",
  pret: "Prêt d'objets",
  transport: "Transport et mobilité",
  divers: "Divers",
};

export default function MesAnnoncesClient({ listings: initial }: { listings: Listing[] }) {
  const [listings] = useState(initial);
  const [sortBy, setSortBy] = useState<"date" | "type" | "status">("date");

  const sorted = [...listings].sort((a, b) => {
    if (sortBy === "date") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    if (sortBy === "status") return a.status.localeCompare(b.status);
    return a.type.localeCompare(b.type);
  });

  return (
    <div className="container" style={{ padding: "40px 24px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
        <IconClipboard size={28} />
        <h1 style={{ margin: 0 }}>Mes annonces</h1>
      </div>
      <p style={{ color: "var(--color-text-secondary)", fontSize: "1.0625rem", marginBottom: 28 }}>
        Gérez vos annonces d&apos;entraide.
      </p>

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
          <a
            key={l.id}
            href={`/entraide/${l.id}`}
            className="card"
            style={{ padding: "14px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, textDecoration: "none" }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <span className={`tag ${l.type === "propose" ? "tag-propose" : "tag-cherche"}`}>
                {l.type === "propose" ? "Propose" : "Cherche"}
              </span>
              <div>
                <p style={{ marginBottom: 2 }}>{l.title}</p>
                <p style={{ fontSize: "0.8125rem", color: "var(--color-text-tertiary)" }}>
                  {categoryLabels[l.category] || l.category}
                  {l.status === "closed" && " · Fermée"} · {formatDate(l.createdAt)}
                </p>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {l.status === "closed" && <span className="tag tag-closed">Fermée</span>}
              <IconChevronRight size={18} />
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
