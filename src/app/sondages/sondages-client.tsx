"use client";

import { useState, useEffect } from "react";
import { IconPoll, IconPlus, IconStar, IconScale, IconLaurel } from "@/components/icons";
import { formatDate } from "@/lib/utils";
import { UserAvatar } from "@/components/user-avatar";
import ReportButton from "@/components/report-button";

const barColors = ["#22C55E", "#F59E0B", "#6366f1", "#06b6d4", "#d946ef", "#14b8a6", "#f97316", "#8b5cf6"];

type Option = { id: number; label: string; count: number };
type Poll = { id: number; question: string; authorName: string; authorFloor: number | null; authorAvatar: string | null; createdAt: string; totalVotes: number; options: Option[] };

export default function SondagesClient() {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/polls").then((r) => r.json()).then((d) => { setPolls(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  return (
    <div className="container page-padding" style={{ maxWidth: 960, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <IconPoll size={28} />
          <h1 style={{ margin: 0 }}>Sondages participatifs</h1>
        </div>
        <a href="/sondages/nouveau" className="btn btn-primary btn-sm" style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
          <IconPlus size={16} /> Nouveau sondage
        </a>
      </div>
      <p style={{ color: "var(--color-text-secondary)", fontSize: "1.0625rem", marginBottom: 4, lineHeight: 1.5 }}>
        Une idée, une question, une décision à discuter ? Chaque résident peut créer un sondage.
      </p>
      <p style={{ color: "var(--color-text-tertiary)", fontSize: "0.875rem", marginBottom: 32, fontStyle: "italic", display: "flex", alignItems: "center", gap: 6 }}>
        <IconScale size={16} />
        Les propositions qui reçoivent plus de 25 votes seront soumises à la présidente représentante de l&apos;immeuble et/ou au syndic. Démocratie appliquée.
      </p>

      {loading ? (
        <p style={{ color: "var(--color-text-tertiary)", textAlign: "center", padding: 40 }}>Chargement…</p>
      ) : polls.length === 0 ? (
        <div className="card" style={{ padding: 40, textAlign: "center" }}>
          <p style={{ color: "var(--color-text-secondary)", marginBottom: 16 }}>Aucun sondage pour le moment.</p>
          <a href="/sondages/nouveau" className="btn btn-primary">Créer le premier sondage</a>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
          {polls.map((p) => {
            const sorted = [...p.options].sort((a, b) => b.count - a.count);
            const maxCount = Math.max(...p.options.map((o) => o.count), 1);
            const colored = sorted.map((opt, i) => ({ ...opt, color: barColors[i % barColors.length], pct: p.totalVotes > 0 ? Math.round((opt.count / p.totalVotes) * 100) : 0 }));

            return (
              <a key={p.id} href={`/sondages/${p.id}`} className="card" style={{ padding: "18px 22px", textDecoration: "none", color: "var(--color-text)", display: "flex", flexDirection: "column", aspectRatio: "1/1", overflow: "hidden" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <UserAvatar url={(p as any).authorAvatar} name={p.authorName} size={28} />
                      <p style={{ fontSize: "0.8125rem", color: "var(--color-text-tertiary)", margin: 0 }}>
                        {formatDate(p.createdAt)} · Par {p.authorName}{p.authorFloor ? ` (${p.authorFloor}e)` : ""}
                      </p>
                    </div>
                    <p style={{ fontWeight: 700, fontSize: "1.0625rem", margin: 0 }}>{p.question}</p>
                  </div>
                  {p.totalVotes >= 25 && (
                    <span className="tag" style={{ background: "var(--color-accent)", color: "#fff", flexShrink: 0, marginLeft: 12 }}>
                      <IconStar size={12} style={{ marginRight: 4 }} />
                      {p.totalVotes} votes
                    </span>
                  )}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1, justifyContent: "flex-end" }}>
                  {colored.map((opt) => (
                    <div key={opt.id}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
                        <span style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)", display: "flex", alignItems: "center", gap: 4 }}>
                          {opt.label}
                          {opt.count >= 25 && <IconLaurel size={12} style={{ color: "var(--color-accent)", flexShrink: 0 }} />}
                        </span>
                        <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--color-text-tertiary)" }}>{opt.pct}% ({opt.count})</span>
                      </div>
                      <div style={{ height: 6, borderRadius: 3, background: "var(--color-border-light)", overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${opt.pct}%`, background: opt.color, borderRadius: 3, transition: "width 0.3s" }} />
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ fontSize: "0.75rem", color: "var(--color-text-tertiary)", marginTop: 8, textAlign: "right" }}>
                  {p.totalVotes} vote{p.totalVotes > 1 ? "s" : ""}
                </div>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
