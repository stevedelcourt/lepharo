"use client";

import { useState } from "react";
import { IconUsers, IconSearch, IconSort, IconSend } from "@/components/icons";
import ResidentModal from "@/components/resident-modal";

const PHOTO_SIZE = 80;
const LIST_PHOTO_SIZE = 64;

type Resident = {
  id: number;
  firstName: string;
  lastName: string;
  floor: number | null;
  email: string;
  avatarUrl: string | null;
  phone: string | null;
  bio: string | null;
  tagline: string | null;
  senior: boolean;
  kids: boolean;
  showFullName: boolean;
  verified: boolean;
  coproprietaire: boolean;
};


function Avatar({ r, size }: { r: Resident; size: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: "var(--color-border)",
        overflow: "hidden",
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size > 40 ? "1.75rem" : "0.875rem",
        color: "var(--color-text-secondary)",
      }}
    >
      {r.avatarUrl ? (
        <img src={r.avatarUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      ) : (
        <span>{r.firstName[0]}{r.lastName[0]}</span>
      )}
    </div>
  );
}

export default function AnnuaireClient({ residents: initialResidents }: { residents: Resident[] }) {
  const [residents] = useState(initialResidents);
  const [search, setSearch] = useState("");
  const [filterFloor, setFilterFloor] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<"floor" | "name" | "name-desc">("floor");
  const [viewMode] = useState<"grid" | "list">("list");
  const [modalUserId, setModalUserId] = useState<number | null>(null);

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
    <div className="container page-padding">
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
        <IconUsers size={28} />
        <h1 style={{ margin: 0 }}>Annuaire des résidents</h1>
      </div>
      <p style={{ color: "var(--color-text-secondary)", fontSize: "1.0625rem", marginBottom: 28 }}>
        Découvrez vos voisins. Chacun choisit ce qu&apos;il partage.
      </p>

      <div className="input-group" style={{ marginBottom: 12 }}>
        <div className="annuaire-search" style={{ position: "relative", flex: 1, maxWidth: 320 }}>
          <IconSearch size={18} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--color-text-tertiary)" }} />
          <input type="search" autoComplete="off" placeholder="Rechercher…" value={search} onChange={(e) => setSearch(e.target.value)} className="input" style={{ paddingLeft: 40, width: "100%" }} />
        </div>
        <select value={filterFloor ?? ""} onChange={(e) => setFilterFloor(e.target.value ? Number(e.target.value) : null)} className="input hide-mobile" style={{ padding: "8px 12px", width: "auto" }}>
          <option value="">Tous les étages</option>
          {Array.from({ length: 19 }, (_, i) => (<option key={i} value={i + 1}>{i + 1}e étage</option>))}
        </select>
        <div className="input-group" style={{ gap: 4 }}>
          <IconSort size={18} />
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value as "floor" | "name" | "name-desc")} className="input" style={{ padding: "6px 10px", fontSize: "0.8125rem", width: "auto" }}>
            <option value="floor">Par étage</option>
            <option value="name">Nom (A-Z)</option>
            <option value="name-desc">Nom (Z-A)</option>
          </select>
        </div>

      </div>



      {viewMode === "grid" ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 12 }}>
          {filtered.map((r) => {
            return (
              <div key={r.id} className="card card-hover" style={{ padding: "20px 24px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 12 }}>
                  <Avatar r={r} size={PHOTO_SIZE} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <button onClick={() => setModalUserId(r.id)} style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", padding: 0, fontFamily: "inherit", textAlign: "left", fontSize: "1.0625rem", fontWeight: 700, color: "var(--color-text)" }}>
                        {r.firstName} {r.showFullName ? r.lastName : r.lastName.charAt(0) + '.'}
                        {r.verified && (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
                            <circle cx="12" cy="12" r="10" fill="#8c8c8c"/>
                            <path d="M7.5 12.5l3 3 6-6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </button>
                    </div>
                    <div style={{ display: "flex", gap: 4, marginTop: 6 }}>
                      {r.coproprietaire && <span className="tag" style={{ background: "#fef3c7", color: "#92400e", fontSize: "0.75rem", fontWeight: 600 }}>C</span>}
                      {r.senior && <span className="tag" style={{ background: "var(--color-accent)", color: "#fff", fontSize: "0.75rem" }}>Senior</span>}
                      {r.kids && <span className="tag" style={{ background: "#401f7f", color: "#fff", fontSize: "0.75rem" }}>Kids</span>}
                      <span className="tag">{r.floor ? `${r.floor}e` : "?"}</span>
                    </div>
                    {r.tagline && <p style={{ fontSize: "0.8125rem", color: "var(--color-text)", margin: "2px 0 0", fontWeight: 500 }}>{r.tagline}</p>}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <a
                    href={`/messagerie?to=${r.id}`}
                    style={{
                      display: "inline-flex", alignItems: "center", gap: 4,
                      padding: "6px 16px", borderRadius: 999,
                      background: "var(--color-primary)", color: "#000",
                      fontSize: "0.8125rem", fontWeight: 600, textDecoration: "none", lineHeight: 1,
                    }}
                  >
                    <IconSend size={14} /> Message
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {filtered.map((r) => {
            return (
              <div key={r.id} className="card card-hover" style={{ padding: "10px 16px", display: "flex", alignItems: "center", gap: 10 }}>
                <Avatar r={r} size={LIST_PHOTO_SIZE} />
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 1 }}>
                      <button onClick={() => setModalUserId(r.id)} style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", padding: 0, fontFamily: "inherit", textAlign: "left", fontSize: "0.9375rem", fontWeight: 600, color: "var(--color-text)" }}>
                        {r.firstName} {r.showFullName ? r.lastName : r.lastName.charAt(0) + '.'}
                        {r.verified && (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
                            <circle cx="12" cy="12" r="10" fill="#8c8c8c"/>
                            <path d="M7.5 12.5l3 3 6-6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </button>
                      {r.coproprietaire && <span className="tag" style={{ background: "#fef3c7", color: "#92400e", fontSize: "0.7rem", fontWeight: 600 }}>C</span>}
                      {r.senior && <span className="tag" style={{ background: "var(--color-accent)", color: "#fff", fontSize: "0.7rem" }}>Senior</span>}
                      {r.kids && <span className="tag" style={{ background: "#401f7f", color: "#fff", fontSize: "0.7rem" }}>Kids</span>}
                      <span className="tag" style={{ fontSize: "0.7rem" }}>{r.floor ? `${r.floor}e` : "?"}</span>
                    </div>

                </div>
                <a
                  href={`/messagerie?to=${r.id}`}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 3, flexShrink: 0,
                    padding: "4px 12px", borderRadius: 999,
                    background: "var(--color-primary)", color: "#000",
                    fontSize: "0.75rem", fontWeight: 600, textDecoration: "none", lineHeight: 1,
                  }}
                >
                  <IconSend size={12} /> Message
                </a>
              </div>
            );
          })}
        </div>
      )}

      {filtered.length === 0 && (
        <p style={{ textAlign: "center", color: "var(--color-text-secondary)", padding: 40 }}>
          Aucun résident ne correspond à vos critères.
        </p>
      )}

      {modalUserId !== null && <ResidentModal userId={modalUserId} onClose={() => setModalUserId(null)} />}

      <a
        href="/messagerie"
        style={{
          position: "fixed", bottom: 24, right: 24,
          width: 56, height: 56, borderRadius: "50%",
          background: "var(--color-primary)", color: "#000",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 4px 16px rgba(0,0,0,0.25)",
          textDecoration: "none", zIndex: 100,
        }}
        title="Nouveau message"
      >
        <IconSend size={24} />
      </a>
    </div>
  );
}
