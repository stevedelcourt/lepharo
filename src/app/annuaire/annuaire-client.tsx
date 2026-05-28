"use client";

import { useState } from "react";
import { IconUsers, IconSearch, IconSort } from "@/components/icons";

type Resident = {
  id: number;
  firstName: string;
  lastName: string;
  floor: number | null;
  email: string;
  avatarUrl: string | null;
  phone: string | null;
  bio: string | null;
  senior: boolean;
};

export default function AnnuaireClient({ residents: initialResidents }: { residents: Resident[] }) {
  const [residents] = useState(initialResidents);
  const [search, setSearch] = useState("");
  const [filterFloor, setFilterFloor] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<"floor" | "name" | "name-desc">("floor");

  const sorted = [...residents].sort((a, b) => {
    if (sortBy === "floor") return (a.floor || 0) - (b.floor || 0);
    if (sortBy === "name-desc") return b.firstName.localeCompare(a.firstName);
    return a.firstName.localeCompare(b.firstName);
  });

  const filtered = sorted.filter((r) => {
    if (search) {
      const q = search.toLowerCase();
      if (!r.firstName.toLowerCase().includes(q) && !r.lastName.toLowerCase().includes(q)) return false;
    }
    if (filterFloor !== null && r.floor !== filterFloor) return false;
    return true;
  });

  return (
    <div className="container" style={{ padding: "40px 24px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
        <IconUsers size={28} />
        <h1 style={{ margin: 0 }}>Annuaire des résidents</h1>
      </div>
      <p style={{ color: "var(--color-text-secondary)", fontSize: "1.0625rem", marginBottom: 28 }}>
        Découvrez vos voisins. Chacun choisit ce qu&apos;il partage.
      </p>

      <div className="input-group" style={{ marginBottom: 24 }}>
        <div style={{ position: "relative", flex: 1, maxWidth: 320 }}>
          <IconSearch size={18} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--color-text-tertiary)" }} />
          <input
            type="search"
            autoComplete="off"
            placeholder="Rechercher…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input"
            style={{ paddingLeft: 40, width: "100%" }}
          />
        </div>
        <select
          value={filterFloor ?? ""}
          onChange={(e) => setFilterFloor(e.target.value ? Number(e.target.value) : null)}
          className="input"
          style={{ padding: "8px 12px", width: "auto" }}
        >
          <option value="">Tous les étages</option>
          {Array.from({ length: 19 }, (_, i) => (
            <option key={i} value={i + 1}>{i + 1}e étage</option>
          ))}
        </select>
        <div className="input-group" style={{ gap: 4 }}>
          <IconSort size={18} />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "floor" | "name" | "name-desc")}
            className="input"
            style={{ padding: "6px 10px", fontSize: "0.8125rem", width: "auto" }}
          >
            <option value="floor">Par étage</option>
            <option value="name">Nom (A-Z)</option>
            <option value="name-desc">Nom (Z-A)</option>
          </select>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 10 }}>
        {filtered.map((r) => (
          <div key={r.id} className="card" style={{ padding: "16px 20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  background: "var(--color-border)",
                  overflow: "hidden",
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.875rem",
                  color: "var(--color-text-secondary)",
                }}
              >
                {r.avatarUrl ? (
                  <img src={r.avatarUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <span>{r.firstName[0]}{r.lastName[0]}</span>
                )}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h4 style={{ margin: 0, fontSize: "1rem" }}>{r.firstName} {r.lastName.charAt(0)}.</h4>
                  <div style={{ display: "flex", gap: 4 }}>
                    {r.senior && <span className="tag" style={{ background: "var(--color-accent)", color: "#fff", fontSize: "0.75rem" }}>Senior</span>}
                    <span className="tag">{r.floor ? `${r.floor}e` : "?"}</span>
                  </div>
                </div>
                <p style={{ fontSize: "0.8125rem", color: "var(--color-text-tertiary)", margin: "2px 0 0" }}>
                  {r.floor ? `Résident au ${r.floor}e étage` : "Résident"}
                </p>
              </div>
            </div>
            {r.bio && (
              <p style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)", lineHeight: 1.5 }}>
                {r.bio}
              </p>
            )}
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <p style={{ textAlign: "center", color: "var(--color-text-secondary)", padding: 40 }}>
          Aucun résident ne correspond à vos critères.
        </p>
      )}
    </div>
  );
}
