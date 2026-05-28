"use client";

import { useState, useEffect } from "react";
import { IconPoll, IconPlus } from "@/components/icons";
import { formatDate } from "@/lib/utils";

type Poll = { id: number; question: string; authorName: string; authorFloor: number | null; createdAt: string; voteCount: number; optionCount: number };

export default function SondagesClient() {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/polls").then((r) => r.json()).then((d) => { setPolls(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  return (
    <div className="container" style={{ padding: "40px 24px", maxWidth: 720, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <IconPoll size={28} />
          <h1 style={{ margin: 0 }}>Sondages participatifs</h1>
        </div>
        <a href="/sondages/nouveau" className="btn btn-primary btn-sm" style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
          <IconPlus size={16} /> Nouveau sondage
        </a>
      </div>
      <p style={{ color: "var(--color-text-secondary)", fontSize: "1.0625rem", marginBottom: 32 }}>
        Une idée, une question, une décision à discuter ? Chaque résident peut créer un sondage.
      </p>

      {loading ? (
        <p style={{ color: "var(--color-text-tertiary)", textAlign: "center", padding: 40 }}>Chargement…</p>
      ) : polls.length === 0 ? (
        <div className="card" style={{ padding: 40, textAlign: "center" }}>
          <p style={{ color: "var(--color-text-secondary)", marginBottom: 16 }}>Aucun sondage pour le moment.</p>
          <a href="/sondages/nouveau" className="btn btn-primary">Créer le premier sondage</a>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {polls.map((p) => (
            <a key={p.id} href={`/sondages/${p.id}`} className="card" style={{ padding: "16px 20px", textDecoration: "none", color: "var(--color-text)", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
              <div>
                <p style={{ fontWeight: 600, marginBottom: 4 }}>{p.question}</p>
                <p style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)" }}>
                  Par {p.authorName}{p.authorFloor ? ` (${p.authorFloor}e)` : ""} · {formatDate(p.createdAt)}
                </p>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0, fontSize: "0.8125rem", color: "var(--color-text-tertiary)" }}>
                <p>{p.voteCount} vote{p.voteCount > 1 ? "s" : ""}</p>
                <p>{p.optionCount} option{p.optionCount > 1 ? "s" : ""}</p>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
