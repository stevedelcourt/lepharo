"use client";

import { useState } from "react";
import { IconForum, IconSearch, IconStar, IconChevronRight, IconSort } from "@/components/icons";
import { formatDate } from "@/lib/utils";

const rubriquesMeta = [
  { id: "vie-quotidienne", label: "Vie quotidienne", desc: "Bruit, propreté, animaux, tri sélectif, stationnement…" },
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
  const [sortBy, setSortBy] = useState<"date" | "replies" | "rubrique">("date");

  const sorted = [...topics].sort((a, b) => {
    if (sortBy === "replies") return b.replyCount - a.replyCount;
    if (sortBy === "rubrique") return a.rubrique.localeCompare(b.rubrique);
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const rubriques = rubriquesMeta.map((r) => {
    const rubriqueTopics = topics.filter((t) => t.rubrique === r.id);
    const lastTopic = [...rubriqueTopics].sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
    return {
      ...r,
      topics: rubriqueTopics.length,
      last: lastTopic ? lastTopic.createdAt : null,
    };
  });

  const hotTopics = topics
    .filter((t) => !search || t.title.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => b.replyCount - a.replyCount)
    .slice(0, 3);

  return (
    <div className="container" style={{ padding: "40px 24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28, gap: 24, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <IconForum size={28} />
          <div>
            <h1 style={{ margin: 0, marginBottom: 4 }}>Forum</h1>
            <p style={{ color: "var(--color-text-secondary)", fontSize: "1.0625rem", margin: 0 }}>
              Discutez avec vos voisins, posez vos questions, partagez.
            </p>
          </div>
        </div>
        <a href="/forum/nouveau" className="btn btn-primary btn-sm">Nouveau sujet</a>
      </div>

      <div className="input-group" style={{ marginBottom: 24 }}>
        <div style={{ position: "relative", flex: 1, maxWidth: 360 }}>
          <IconSearch size={18} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--color-text-tertiary)" }} />
          <input
            type="search"
            placeholder="Rechercher dans le forum…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input"
            style={{ paddingLeft: 40, width: "100%" }}
          />
        </div>
        <div className="input-group" style={{ gap: 4 }}>
          <IconSort size={18} />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "date" | "replies" | "rubrique")}
            className="input"
            style={{ padding: "6px 10px", fontSize: "0.8125rem", width: "auto" }}
          >
            <option value="date">Plus récent</option>
            <option value="replies">Plus de réponses</option>
            <option value="rubrique">Rubrique</option>
          </select>
        </div>
      </div>

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
                  padding: "16px 20px",
                  textDecoration: "none",
                  color: "var(--color-text)",
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                }}
              >
                <div style={{ flex: 1 }}>
                  <p style={{ marginBottom: 2 }}>{r.label}</p>
                  <p style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>{r.desc}</p>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <p style={{ fontSize: "0.875rem" }}>{r.topics} sujets</p>
                  <p style={{ fontSize: "0.75rem", color: "var(--color-text-tertiary)" }}>
                    {r.last ? formatDate(r.last) : "Aucun sujet"}
                  </p>
                </div>
                <IconChevronRight size={18} />
              </a>
            ))}
          </div>
        </div>

        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <IconStar size={20} />
            <h3 style={{ fontSize: "1.125rem", margin: 0 }}>Sujets chauds</h3>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {hotTopics.map((t) => (
              <a key={t.id} href={`/forum/sujet/${t.id}`} className="card" style={{ padding: "14px 18px", textDecoration: "none", color: "var(--color-text)" }}>
                <p style={{ marginBottom: 6, fontSize: "0.9375rem" }}>{t.title}</p>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8125rem", color: "var(--color-text-tertiary)" }}>
                  <span className="tag" style={{ textTransform: "capitalize" }}>{t.rubrique}</span>
                  <span>{t.replyCount} réponses · {formatDate(t.createdAt)}</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
