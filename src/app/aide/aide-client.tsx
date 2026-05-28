"use client";

import { useState } from "react";
import { IconHelp, IconSearch, IconChevronRight } from "@/components/icons";

const categories: Record<string, { label: string; color: string }> = {
  entraide: { label: "Entraide", color: "var(--color-primary)" },
  messagerie: { label: "Messagerie", color: "#6366f1" },
  forum: { label: "Forum", color: "#0891b2" },
  compte: { label: "Compte", color: "#7c3aed" },
  calendrier: { label: "Calendrier", color: "#d97706" },
  documents: { label: "Documents", color: "#059669" },
};

export default function AideClient({ faqs }: { faqs: { q: string; a: string; category: string }[] }) {
  const [search, setSearch] = useState("");
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  const filtered = faqs.filter(
    (f) =>
      f.q.toLowerCase().includes(search.toLowerCase()) ||
      f.a.toLowerCase().includes(search.toLowerCase()) ||
      f.category.includes(search.toLowerCase())
  );

  return (
    <div className="container" style={{ padding: "40px 24px", maxWidth: 780, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
        <IconHelp size={28} />
        <h1 style={{ margin: 0 }}>Aide</h1>
      </div>
      <p style={{ color: "var(--color-text-secondary)", fontSize: "1.0625rem", marginBottom: 28 }}>
        Trouvez rapidement une réponse à vos questions.
      </p>

      <div style={{ position: "relative", marginBottom: 32 }}>
        <IconSearch size={18} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--color-text-tertiary)" }} />
        <input
          type="search"
          autoComplete="off"
          placeholder="Rechercher dans l'aide…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setOpenIdx(null); }}
          className="input"
          style={{ paddingLeft: 42, width: "100%", fontSize: "1rem", paddingTop: 12, paddingBottom: 12 }}
        />
      </div>

      <div style={{ display: "flex", gap: 6, marginBottom: 24, flexWrap: "wrap" }}>
        <button
          onClick={() => { setSearch(""); setOpenIdx(null); }}
          className={`btn btn-sm ${!search ? "btn-primary" : "btn-ghost"}`}
        >
          Toutes
        </button>
        {Object.entries(categories).map(([key, cat]) => (
          <button
            key={key}
            onClick={() => { setSearch(key); setOpenIdx(null); }}
            className={`btn btn-sm ${search === key ? "btn-primary" : "btn-ghost"}`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "48px 0", color: "var(--color-text-secondary)" }}>
          Aucun résultat pour "{search}". Essayez un autre mot-clé.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {filtered.map((faq, i) => {
            const cat = categories[faq.category];
            const isOpen = openIdx === i;
            return (
              <div key={i} className="card" style={{ padding: 0, overflow: "hidden" }}>
                <button
                  onClick={() => setOpenIdx(isOpen ? null : i)}
                  style={{
                    width: "100%", padding: "14px 20px", display: "flex", alignItems: "center", gap: 12,
                    border: "none", background: "transparent", cursor: "pointer", textAlign: "left",
                    fontSize: "0.9375rem", color: "var(--color-text)", fontFamily: "inherit",
                  }}
                >
                  <IconChevronRight size={16} style={{ flexShrink: 0, transform: isOpen ? "rotate(90deg)" : "none", transition: "transform 0.15s" }} />
                  <div style={{ flex: 1 }}>{faq.q}</div>
                  {cat && <span className="tag" style={{ background: cat.color, color: "#fff", flexShrink: 0 }}>{cat.label}</span>}
                </button>
                {isOpen && (
                  <div style={{ padding: "0 20px 14px 48px", fontSize: "0.9375rem", color: "var(--color-text-secondary)", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
