"use client";

import { useState } from "react";
import { IconForum, IconSearch, IconSort, IconChevronLeft, IconMessage } from "@/components/icons";
import { formatDate } from "@/lib/utils";

type Topic = {
  id: number;
  title: string;
  content: string;
  authorName: string;
  authorFloor: number | null;
  replyCount: number;
  createdAt: string;
};

export default function RubriqueClient({ rubrique, rubriqueName, topics }: { rubrique: string; rubriqueName: string; topics: Topic[] }) {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "replies">("date");

  const filtered = topics
    .filter((t) => !search || t.title.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === "replies") return b.replyCount - a.replyCount;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  return (
    <div className="container" style={{ padding: "40px 24px", maxWidth: 800 }}>
      <a
        href="/forum"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          fontSize: "0.875rem",
          color: "var(--color-text-secondary)",
          textDecoration: "none",
          marginBottom: 24,
        }}
      >
        <IconChevronLeft size={16} />
        Toutes les rubriques
      </a>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28, gap: 16, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <IconForum size={28} />
          <div>
            <h1 style={{ margin: 0, marginBottom: 4 }}>{rubriqueName}</h1>
            <p style={{ color: "var(--color-text-secondary)", fontSize: "0.9375rem", margin: 0 }}>
              {topics.length} sujet{topics.length > 1 ? "s" : ""}
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
            placeholder="Rechercher dans cette rubrique…"
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
            onChange={(e) => setSortBy(e.target.value as "date" | "replies")}
            className="input"
            style={{ padding: "6px 10px", fontSize: "0.8125rem", width: "auto" }}
          >
            <option value="date">Plus récent</option>
            <option value="replies">Plus de réponses</option>
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "48px 0", color: "var(--color-text-secondary)" }}>
          {search ? "Aucun sujet ne correspond à votre recherche." : "Aucun sujet dans cette rubrique pour le moment."}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {filtered.map((t) => (
            <a
              key={t.id}
              href={`/forum/sujet/${t.id}`}
              className="card"
              style={{
                padding: "16px 20px",
                textDecoration: "none",
                color: "var(--color-text)",
                display: "flex",
                alignItems: "center",
                gap: 16,
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontWeight: 500, marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.title}</p>
                <p style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)", margin: 0 }}>
                  Par {t.authorName}{t.authorFloor ? ` (${t.authorFloor}e)` : ""} · {formatDate(t.createdAt)}
                </p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "0.8125rem", color: "var(--color-text-tertiary)", flexShrink: 0 }}>
                <IconMessage size={14} />
                {t.replyCount}
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
