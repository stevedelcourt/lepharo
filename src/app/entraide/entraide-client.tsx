"use client";

import { useState } from "react";

const categories = [
  { id: "garde", label: "Garde d'enfants", icon: "O" },
  { id: "compagnie", label: "Compagnie et visite", icon: "O" },
  { id: "courses", label: "Courses et deplacements", icon: "A" },
  { id: "numerique", label: "Aide numerique", icon: "T" },
  { id: "bricolage", label: "Bricolage et petits travaux", icon: "D" },
  { id: "pret", label: "Pret d'objets", icon: "X" },
  { id: "divers", label: "Divers", icon: "E" },
];

type Listing = {
  id: number;
  type: string;
  title: string;
  category: string;
  authorName: string;
  authorFloor: number;
};

export default function EntraideClient({ listings: initialListings }: { listings: Listing[] }) {
  const [listings] = useState(initialListings);
  const [activeTab, setActiveTab] = useState<"all" | "propose" | "cherche">("all");
  const [activeCat, setActiveCat] = useState<string | null>(null);

  const filtered = listings
    .filter((l) => activeTab === "all" || l.type === activeTab)
    .filter((l) => !activeCat || l.category === activeCat);

  return (
    <div className="container" style={{ padding: "40px 24px" }}>
      <h1 style={{ marginBottom: 8 }}>Entraide entre voisins</h1>
      <p style={{ color: "var(--color-text-secondary)", marginBottom: 32, fontSize: "1.0625rem" }}>
        Proposez votre aide ou trouvez ce dont vous avez besoin.
      </p>

      <div style={{ display: "flex", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
        <button
          onClick={() => setActiveTab("all")}
          className={`btn ${activeTab === "all" ? "btn-primary" : "btn-ghost"}`}
          style={{ fontSize: "0.9375rem" }}
        >
          Tout
        </button>
        <button
          onClick={() => setActiveTab("propose")}
          className={`btn ${activeTab === "propose" ? "btn-primary" : "btn-ghost"}`}
          style={{ fontSize: "0.9375rem" }}
        >
          Je propose
        </button>
        <button
          onClick={() => setActiveTab("cherche")}
          className={`btn ${activeTab === "cherche" ? "btn-primary" : "btn-ghost"}`}
          style={{ fontSize: "0.9375rem" }}
        >
          Je cherche
        </button>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 32, flexWrap: "wrap" }}>
        <button
          onClick={() => setActiveCat(null)}
          className="btn btn-ghost"
          style={{ fontSize: "0.8125rem", padding: "4px 12px", fontWeight: !activeCat ? 600 : 400, color: !activeCat ? "var(--color-text)" : undefined }}
        >
          Toutes les categories
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setActiveCat(activeCat === c.id ? null : c.id)}
            className="btn btn-ghost"
            style={{
              fontSize: "0.8125rem",
              padding: "4px 12px",
              fontWeight: activeCat === c.id ? 600 : 400,
              color: activeCat === c.id ? "var(--color-text)" : undefined,
              background: activeCat === c.id ? "var(--color-bg-alt)" : undefined,
            }}
          >
            {c.icon} {c.label}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <p style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>
          {filtered.length} annonce{filtered.length !== 1 ? "s" : ""}
        </p>
        <button className="btn btn-accent">Publier une annonce</button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {filtered.map((item) => (
          <div key={item.id} className="card" style={{ padding: "18px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <span style={{
                display: "inline-flex",
                width: 28,
                height: 28,
                borderRadius: 999,
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.6875rem",
                fontWeight: 300,
                textTransform: "uppercase",
                color: "#fff",
                background: item.type === "propose" ? "var(--color-primary)" : "var(--color-accent)",
                flexShrink: 0,
              }}>
                {item.type === "propose" ? "P" : "C"}
              </span>
              <div>
                <p style={{ fontWeight: 300, marginBottom: 2 }}>{item.title}</p>
                <p style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)" }}>{item.authorName}, {item.authorFloor}e</p>
              </div>
            </div>
            <button className="btn btn-outline" style={{ fontSize: "0.875rem", padding: "8px 16px" }}>
              Contacter
            </button>
          </div>
        ))}
      </div>

      <div className="card" style={{ marginTop: 32, padding: 20, background: "var(--color-warning-light)", borderLeft: "4px solid var(--color-warning)" }}>
        <p style={{ fontSize: "0.875rem", color: "var(--color-text)", margin: 0 }}>
          <span>Rappel :</span> les services proposes ici le sont a titre gracieux et ponctuel.
          Toute remuneration reguliere doit faire l objet d une declaration (CESU, auto-entrepreneur…).
        </p>
      </div>
    </div>
  );
}
