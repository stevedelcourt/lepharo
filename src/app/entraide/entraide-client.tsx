"use client";

import { useState } from "react";
import {
  IconHandshake, IconBaby, IconUsersHeart, IconCart, IconMonitor,
  IconWrench, IconBox, IconCar, IconDots, IconTag,
  IconChevronRight, IconSort,
} from "@/components/icons";
import { formatDate } from "@/lib/utils";

const categories = [
  { id: "garde", label: "Garde d'enfants", icon: IconBaby },
  { id: "compagnie", label: "Compagnie et visite", icon: IconUsersHeart },
  { id: "courses", label: "Courses et déplacements", icon: IconCart },
  { id: "numerique", label: "Aide numérique", icon: IconMonitor },
  { id: "bricolage", label: "Bricolage et petits travaux", icon: IconWrench },
  { id: "vente", label: "Vente d'objets", icon: IconTag },
  { id: "pret", label: "Prêt d'objets", icon: IconBox },
  { id: "transport", label: "Transport et mobilité", icon: IconCar },
  { id: "divers", label: "Divers", icon: IconDots },
];

type Listing = {
  id: number;
  type: string;
  title: string;
  category: string;
  authorName: string;
  authorFloor: number | null;
  createdAt: string;
  images: string;
};

export default function EntraideClient({ listings: initialListings }: { listings: Listing[] }) {
  const [listings] = useState(initialListings);
  const [activeTab, setActiveTab] = useState<"all" | "propose" | "cherche">("all");
  const [activeCat, setActiveCat] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"date" | "category" | "type">("date");

  const sorted = [...listings].sort((a, b) => {
    if (sortBy === "date") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    if (sortBy === "category") return a.category.localeCompare(b.category);
    return a.type.localeCompare(b.type);
  });

  const filtered = sorted
    .filter((l) => activeTab === "all" || l.type === activeTab)
    .filter((l) => !activeCat || l.category === activeCat);

  const getCategoryIcon = (catId: string) => {
    const cat = categories.find((c) => c.id === catId);
    return cat ? cat.icon : IconDots;
  };

  function hasImages(imgs: string): boolean {
    try {
      const arr = JSON.parse(imgs);
      return Array.isArray(arr) && arr.length > 0;
    } catch { return false; }
  }

  return (
    <div className="container" style={{ padding: "40px 24px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
        <IconHandshake size={28} />
        <h1 style={{ margin: 0 }}>Entraide entre voisins</h1>
      </div>
      <p style={{ color: "var(--color-text-secondary)", marginBottom: 28, fontSize: "1.0625rem" }}>
        Proposez votre aide ou trouvez ce dont vous avez besoin.
      </p>

      <div className="input-group" style={{ marginBottom: 12 }}>
        <button onClick={() => setActiveTab("all")} className={`btn btn-sm ${activeTab === "all" ? "btn-primary" : "btn-ghost"}`}>Tout</button>
        <button onClick={() => setActiveTab("propose")} className={`btn btn-sm ${activeTab === "propose" ? "btn-primary" : "btn-ghost"}`}>Je propose</button>
        <button onClick={() => setActiveTab("cherche")} className={`btn btn-sm ${activeTab === "cherche" ? "btn-primary" : "btn-ghost"}`}>Je cherche</button>
        <div style={{ flex: 1 }} />
        <div className="input-group" style={{ gap: 4 }}>
          <IconSort size={18} />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "date" | "category" | "type")}
            className="input"
            style={{ padding: "6px 10px", fontSize: "0.8125rem", width: "auto" }}
          >
            <option value="date">Plus récent</option>
            <option value="category">Catégorie</option>
            <option value="type">Type</option>
          </select>
        </div>
      </div>

      <div style={{ display: "flex", gap: 6, marginBottom: 28, flexWrap: "wrap" }}>
        <button
          onClick={() => setActiveCat(null)}
          className={`btn btn-sm ${!activeCat ? "btn-primary" : "btn-ghost"}`}
        >
          Toutes
        </button>
        {categories.map((c) => {
          const Icon = c.icon;
          return (
            <button
              key={c.id}
              onClick={() => setActiveCat(activeCat === c.id ? null : c.id)}
              className={`btn btn-sm ${activeCat === c.id ? "btn-primary" : "btn-ghost"}`}
            >
              <Icon size={16} />
              {c.label}
            </button>
          );
        })}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <p style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>
          {filtered.length} annonce{filtered.length !== 1 ? "s" : ""}
        </p>
        <a href="/entraide/nouveau" className="btn btn-accent btn-sm">Publier une annonce</a>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {filtered.map((item) => {
          const CatIcon = getCategoryIcon(item.category);
          return (
            <a key={item.id} href={`/entraide/${item.id}`} className="card" style={{ padding: "14px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, textDecoration: "none" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <span className={`tag ${item.type === "propose" ? "tag-propose" : "tag-cherche"}`}>
                  {item.type === "propose" ? "Propose" : "Cherche"}
                </span>
                <CatIcon size={20} />
                <div>
                  <p style={{ marginBottom: 2 }}>
                    {item.title}
                    {hasImages(item.images) && (
                      <span style={{ marginLeft: 8, fontSize: "0.75rem", color: "var(--color-text-tertiary)" }}>
                        +{JSON.parse(item.images).length} photo{JSON.parse(item.images).length > 1 ? "s" : ""}
                      </span>
                    )}
                  </p>
                  <p style={{ fontSize: "0.8125rem", color: "var(--color-text-tertiary)" }}>
                    {item.authorName}{item.authorFloor ? `, ${item.authorFloor}e` : ""} · {formatDate(item.createdAt)}
                  </p>
                </div>
              </div>
              <IconChevronRight size={18} />
            </a>
          );
        })}
      </div>

      <div className="card" style={{ marginTop: 32, padding: 16, background: "var(--color-warning-light)", borderLeft: "4px solid var(--color-warning)" }}>
        <p style={{ fontSize: "0.875rem", color: "var(--color-text)", margin: 0 }}>
          Les services proposés ici le sont à titre gracieux et ponctuel.
          Toute rémunération régulière doit faire l&apos;objet d&apos;une déclaration (CESU, auto-entrepreneur…).
        </p>
      </div>
    </div>
  );
}
