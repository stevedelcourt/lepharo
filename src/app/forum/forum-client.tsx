"use client";

import { useState } from "react";

const rubriquesMeta = [
  { id: "vie-quotidienne", label: "Vie quotidienne dans l immeuble", desc: "Bruit, propreté, animaux, tri sélectif, stationnement…" },
  { id: "travaux", label: "Travaux et entretien", desc: "Ravalement, ascenseurs, chauffage, isolation, devis…" },
  { id: "nuisibles", label: "Nuisibles et problèmes sanitaires", desc: "Punaises de lit, cafards, rongeurs, signalements…" },
  { id: "syndic", label: "Syndic et gouvernance", desc: "Préparation des AG, PV, comptes, mise en concurrence." },
  { id: "quartier", label: "Le quartier du Pharo", desc: "Actualités, événements, commerces de proximité." },
  { id: "bistrot", label: "Le Bistrot", desc: "Pour parler de tout et de rien. Photos de la vue, recommandations…" },
];

type Topic = {
  id: number;
  title: string;
  rubrique: string;
  authorName: string;
  authorFloor: number | null;
  replyCount: number;
  createdAt: string;
};

export default function ForumClient({ topics }: { topics: Topic[] }) {
  const [search, setSearch] = useState("");

  const rubriques = rubriquesMeta.map((r) => {
    const rubriqueTopics = topics.filter((t) => t.rubrique === r.id);
    const lastTopic = rubriqueTopics.sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
    return {
      ...r,
      topics: rubriqueTopics.length,
      last: lastTopic ? lastTopic.createdAt : "Aucun sujet",
    };
  });

  const hotTopics = topics
    .filter((t) => !search || t.title.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => b.replyCount - a.replyCount)
    .slice(0, 3);

  return (
    <div className="container" style={{ padding: "40px 24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32, gap: 24, flexWrap: "wrap" }}>
        <div>
          <h1 style={{ marginBottom: 8 }}>Forum</h1>
          <p style={{ color: "var(--color-text-secondary)", fontSize: "1.0625rem", margin: 0 }}>
            Discutez avec vos voisins, posez vos questions, partagez.
          </p>
        </div>
        <button className="btn btn-primary">Nouveau sujet</button>
      </div>

      <input
        type="search"
        placeholder="Rechercher dans le forum…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          width: "100%",
          maxWidth: 400,
          padding: "10px 14px",
          border: "1.5px solid var(--color-border)",
          borderRadius: "var(--radius-md)",
          fontSize: "0.9375rem",
          background: "var(--color-bg)",
          outline: "none",
          marginBottom: 32,
        }}
      />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 32, alignItems: "start" }}>
        <div>
          <h3 style={{ fontSize: "1.125rem", marginBottom: 16 }}>Rubriques</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {rubriques.map((r) => (
              <a
                key={r.id}
                href={`/forum/${r.id}`}
                className="card"
                style={{
                  padding: "18px 24px",
                  textDecoration: "none",
                  color: "var(--color-text)",
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                }}
              >
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 300, marginBottom: 4 }}>{r.label}</p>
                  <p style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>{r.desc}</p>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <p style={{ fontSize: "0.875rem", fontWeight: 300 }}>{r.topics} sujets</p>
                  <p style={{ fontSize: "0.75rem", color: "var(--color-text-tertiary)" }}>{r.last}</p>
                </div>
              </a>
            ))}
          </div>
        </div>

        <div>
          <h3 style={{ fontSize: "1.125rem", marginBottom: 16 }}>Sujets chauds</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {hotTopics.map((t) => (
              <div key={t.id} className="card" style={{ padding: "16px 20px" }}>
                <p style={{ fontWeight: 300, marginBottom: 6, fontSize: "0.9375rem" }}>{t.title}</p>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8125rem", color: "var(--color-text-secondary)" }}>
                  <span>{t.rubrique}</span>
                  <span>{t.replyCount} réponses · {t.createdAt}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
