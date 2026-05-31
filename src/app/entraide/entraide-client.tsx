"use client";

import { useState, useEffect } from "react";
import {
  IconHandshake, IconBaby, IconUsersHeart, IconCart, IconMonitor,
  IconWrench, IconBox, IconCar, IconDots, IconTag,
  IconChevronRight, IconSort, IconStar, IconGrid, IconList, IconSearch,
} from "@/components/icons";
import { formatDate } from "@/lib/utils";
import { UserAvatar } from "@/components/user-avatar";
import ReportButton from "@/components/report-button";

const categories = [
  { id: "garde", label: "Garde d'enfants", icon: IconBaby },
  { id: "compagnie", label: "Compagnie et visite", icon: IconUsersHeart },
  { id: "courses", label: "Courses et déplacements", icon: IconCart },
  { id: "numerique", label: "Aide numérique", icon: IconMonitor },
  { id: "bricolage", label: "Bricolage et petits travaux", icon: IconWrench },
  { id: "vente", label: "Vente d'objets", icon: IconTag },
  { id: "pret", label: "Prêt d'objets", icon: IconBox },
  { id: "transport", label: "Transport et mobilité", icon: IconCar },
  { id: "sport", label: "Sport", icon: IconStar },
  { id: "divers", label: "Divers", icon: IconDots },
];

type Listing = {
  id: number;
  type: string;
  title: string;
  category: string;
  description: string;
  authorName: string;
  authorFloor: number | null;
  authorAvatar: string | null;
  createdAt: string;
  images: string;
};

const PAGE_SIZE = 10;

export default function EntraideClient({ listings: initialListings }: { listings: Listing[] }) {
  const [listings] = useState(initialListings);
  const [activeTab, setActiveTab] = useState<"all" | "propose" | "cherche">("all");
  const [activeCat, setActiveCat] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"date" | "category" | "type">("date");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [search, setSearch] = useState("");

  useEffect(() => { setVisibleCount(PAGE_SIZE); }, [activeTab, activeCat, sortBy]);

  const sorted = [...listings].sort((a, b) => {
    if (sortBy === "date") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    if (sortBy === "category") return a.category.localeCompare(b.category);
    return a.type.localeCompare(b.type);
  });

  const filtered = sorted
    .filter((l) => activeTab === "all" || l.type === activeTab)
    .filter((l) => !activeCat || l.category === activeCat)
    .filter((l) => !search || l.title.toLowerCase().includes(search.toLowerCase()) || l.description?.toLowerCase().includes(search.toLowerCase()));

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  const getCategoryIcon = (catId: string) => {
    const cat = categories.find((c) => c.id === catId);
    return cat ? cat.icon : IconDots;
  };

  function getFirstImage(imgs: string): string | null {
    try {
      const arr = JSON.parse(imgs);
      return Array.isArray(arr) && arr.length > 0 ? arr[0] : null;
    } catch { return null; }
  }

  return (
    <div className="container page-padding">
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
        <div className="input-group hide-mobile" style={{ gap: 2, marginLeft: 4 }}>
          <button onClick={() => setViewMode("grid")} className={`btn btn-sm ${viewMode === "grid" ? "btn-primary" : "btn-ghost"}`} style={{ padding: "6px 8px" }} title="Vue grille"><IconGrid size={18} /></button>
          <button onClick={() => setViewMode("list")} className={`btn btn-sm ${viewMode === "list" ? "btn-primary" : "btn-ghost"}`} style={{ padding: "6px 8px" }} title="Vue liste"><IconList size={18} /></button>
        </div>
        <div style={{ position: "relative" }}>
          <IconSearch size={16} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--color-text-tertiary)", pointerEvents: "none" }} />
          <input type="search" autoComplete="off" placeholder="Rechercher…" value={search} onChange={(e) => setSearch(e.target.value)} className="input" style={{ padding: "6px 10px 6px 32px", fontSize: "0.8125rem", width: 180 }} />
        </div>
      </div>

      <div style={{ display: "flex", gap: 6, marginBottom: 28, flexWrap: "wrap" }}>
        <button onClick={() => setActiveCat(null)} className={`btn btn-sm ${!activeCat ? "btn-primary" : "btn-ghost"}`}>Toutes</button>
        {categories.map((c) => {
          const Icon = c.icon;
          return (
            <button key={c.id} onClick={() => setActiveCat(activeCat === c.id ? null : c.id)} className={`btn btn-sm ${activeCat === c.id ? "btn-primary" : "btn-ghost"}`}>
              <Icon size={16} /> {c.label}
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

      {viewMode === "grid" ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 12 }}>
          {visible.map((item) => {
            const CatIcon = getCategoryIcon(item.category);
            const firstImage = getFirstImage(item.images);
            return (
              <a key={item.id} href={`/entraide/${item.id}`} className="card" style={{ display: "flex", flexDirection: "column", textDecoration: "none", overflow: "hidden", aspectRatio: "1/1" }}>
                <div style={{ flex: 2, overflow: "hidden", background: firstImage ? "transparent" : "var(--color-bg-alt)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {firstImage ? (
                    <img src={firstImage} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <CatIcon size={48} style={{ color: "var(--color-text-tertiary)", opacity: 0.3 }} />
                  )}
                </div>
                <div style={{ flex: 1, padding: "10px 14px", display: "flex", flexDirection: "column", minHeight: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                    <span className={`tag ${item.type === "propose" ? "tag-propose" : item.type === "vente" ? "tag-vente" : "tag-cherche"}`} style={{ minWidth: 68, textAlign: "center", fontSize: "0.65rem", flexShrink: 0 }}>
                      {item.type === "propose" ? "Propose" : item.type === "vente" ? "Vente" : "Cherche"}
                    </span>
                    <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--color-text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {item.title}
                    </span>
                  </div>
                  <p style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)", margin: "0 0 4px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {item.description?.slice(0, 80)}{item.description?.length > 80 ? "…" : ""}
                  </p>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: "auto" }}>
                    <UserAvatar url={item.authorAvatar} name={item.authorName} size={22} />
                    <span style={{ fontSize: "0.7rem", color: "var(--color-text-tertiary)" }}>
                      {item.authorName}{item.authorFloor ? `, ${item.authorFloor}e` : ""}
                    </span>
                    <ReportButton targetType="listing" targetId={item.id} />
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {visible.map((item) => {
            const CatIcon = getCategoryIcon(item.category);
            const firstImage = getFirstImage(item.images);
            return (
              <a key={item.id} href={`/entraide/${item.id}`} className="card" style={{ display: "flex", gap: 0, textDecoration: "none", overflow: "hidden" }}>
                {firstImage && (
                  <div style={{ width: 120, minHeight: 100, flexShrink: 0, overflow: "hidden" }}>
                    <img src={firstImage} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                )}
                <div style={{ flex: 1, padding: "12px 16px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                    <span className={`tag ${item.type === "propose" ? "tag-propose" : item.type === "vente" ? "tag-vente" : "tag-cherche"}`} style={{ minWidth: 72, textAlign: "center", fontSize: "0.7rem", flexShrink: 0 }}>
                      {item.type === "propose" ? "Propose" : item.type === "vente" ? "Vente" : "Cherche"}
                    </span>
                    <span style={{ fontWeight: 600, fontSize: "0.9375rem", color: "var(--color-text)" }}>
                      {item.title}
                    </span>
                  </div>
                  <p style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)", margin: "0 0 4px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {item.description?.slice(0, 120)}{item.description?.length > 120 ? "…" : ""}
                  </p>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <UserAvatar url={item.authorAvatar} name={item.authorName} size={22} />
                    <span style={{ fontSize: "0.75rem", color: "var(--color-text-tertiary)" }}>
                      {item.authorName}{item.authorFloor ? `, ${item.authorFloor}e` : ""} · {formatDate(item.createdAt)}
                    </span>
                    <ReportButton targetType="listing" targetId={item.id} />
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", paddingRight: 12, flexShrink: 0 }}>
                  <IconChevronRight size={18} />
                </div>
              </a>
            );
          })}
        </div>
      )}

      {hasMore && (
        <div style={{ textAlign: "center", marginTop: 20 }}>
          <button onClick={() => setVisibleCount((c) => c + PAGE_SIZE)} className="btn btn-ghost btn-sm">
            Voir plus ({filtered.length - visibleCount} restantes)
          </button>
        </div>
      )}

    </div>
  );
}
