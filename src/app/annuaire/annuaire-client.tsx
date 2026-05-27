"use client";

import { useState } from "react";

type Resident = {
  id: number;
  firstName: string;
  lastName: string;
  floor: number | null;
  email: string;
};

export default function AnnuaireClient({ residents: initialResidents }: { residents: Resident[] }) {
  const [residents] = useState(initialResidents);
  const [search, setSearch] = useState("");
  const [filterFloor, setFilterFloor] = useState<number | null>(null);

  const filtered = residents.filter((r) => {
    if (search) {
      const q = search.toLowerCase();
      if (!r.firstName.toLowerCase().includes(q) && !r.lastName.toLowerCase().includes(q)) return false;
    }
    if (filterFloor !== null && r.floor !== filterFloor) return false;
    return true;
  });

  return (
    <div className="container" style={{ padding: "40px 24px" }}>
      <h1 style={{ marginBottom: 8 }}>Annuaire des residents</h1>
      <p style={{ color: "var(--color-text-secondary)", fontSize: "1.0625rem", marginBottom: 32 }}>
        Decouvrez vos voisins. Chacun choisit ce qu il partage.
      </p>

      <div style={{ display: "flex", gap: 12, marginBottom: 32, flexWrap: "wrap", alignItems: "center" }}>
        <input
          type="search"
          placeholder="Rechercher…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            padding: "10px 14px",
            border: "1.5px solid var(--color-border)",
            borderRadius: "var(--radius-md)",
            fontSize: "0.9375rem",
            background: "var(--color-bg)",
            outline: "none",
            flex: 1,
            minWidth: 200,
            maxWidth: 320,
          }}
        />
        <select
          value={filterFloor ?? ""}
          onChange={(e) => setFilterFloor(e.target.value ? Number(e.target.value) : null)}
          style={{
            padding: "10px 14px",
            border: "1.5px solid var(--color-border)",
            borderRadius: "var(--radius-md)",
            fontSize: "0.9375rem",
            background: "var(--color-bg)",
            outline: "none",
          }}
        >
          <option value="">Tous les etages</option>
          {Array.from({ length: 19 }, (_, i) => (
            <option key={i} value={i + 1}>{i + 1}e etage</option>
          ))}
        </select>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
        {filtered.map((r) => (
          <div key={r.id} className="card" style={{ padding: "20px 24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
              <h4 style={{ margin: 0, fontSize: "1.0625rem" }}>{r.firstName} {r.lastName.charAt(0)}.</h4>
              <span className="tag">{r.floor ? `${r.floor}e` : "?"}</span>
            </div>
            <p style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)", marginBottom: 12 }}>
              {r.floor ? `Resident au ${r.floor}e etage` : "Resident"}
            </p>
            <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--color-border-light)" }}>
              <button className="btn btn-outline" style={{ fontSize: "0.8125rem", padding: "6px 14px", width: "100%" }}>
                Envoyer un message
              </button>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <p style={{ textAlign: "center", color: "var(--color-text-secondary)", padding: 40 }}>
          Aucun resident ne correspond a vos criteres.
        </p>
      )}
    </div>
  );
}
