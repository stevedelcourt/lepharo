"use client";

import { useState, useEffect } from "react";
import { IconWarning, IconCheck, IconTrash, IconMail } from "@/components/icons";
import { formatDate } from "@/lib/utils";

const typeLabels: Record<string, string> = {
  listing: "Annonce",
  forum_topic: "Sujet forum",
  forum_reply: "Réponse forum",
  listing_message: "Message annonce",
  private_message: "Message privé",
};

const severityColors: Record<string, string> = {
  low: "#22C55E",
  medium: "#F59E0B",
  high: "#EF4444",
  critical: "#DC2626",
};

type Report = {
  id: number;
  targetType: string;
  targetId: number;
  reason: string;
  autoFlagged: boolean;
  score: number;
  categories: string;
  matchedRules: string;
  resolved: boolean;
  reporterName: string;
  createdAt: string;
};

export default function AdminReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [filter, setFilter] = useState<"all" | "unresolved" | "auto" | "user">("unresolved");
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState<number | null>(null);

  function load() {
    setLoading(true);
    fetch("/api/reports").then((r) => r.json()).then((d) => { setReports(d); setLoading(false); }).catch(() => setLoading(false));
  }

  useEffect(load, []);

  const filtered = reports.filter((r) => {
    if (filter === "unresolved") return !r.resolved;
    if (filter === "auto") return r.autoFlagged;
    if (filter === "user") return !r.autoFlagged;
    return true;
  });

  async function resolve(reportId: number) {
    setWorking(reportId);
    await fetch("/api/admin/action", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "resolve-report", reportId }),
    });
    setWorking(null);
    load();
  }

  async function deleteContent(targetType: string, targetId: number, reportId: number) {
    if (!confirm("Supprimer ce contenu ? Cette action est irréversible.")) return;
    setWorking(reportId);
    await fetch("/api/admin/action", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete-content", targetType, targetId, reportId }),
    });
    setWorking(null);
    load();
  }

  function getTargetUrl(r: Report): string {
    if (r.targetType === "listing") return `/entraide/${r.targetId}`;
    if (r.targetType === "forum_topic") return `/forum/sujet/${r.targetId}`;
    if (r.targetType === "forum_reply") return `/forum/sujet/${r.targetId}`;
    return "#";
  }

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h1 style={{ margin: 0 }}><IconWarning size={24} /> Modération ({filtered.length})</h1>
        <div className="input-group" style={{ gap: 4 }}>
          {(["unresolved", "all", "auto", "user"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`btn btn-sm ${filter === f ? "btn-primary" : "btn-ghost"}`}
              style={{ padding: "6px 12px", fontSize: "0.8125rem" }}
            >
              {f === "unresolved" ? "Non traités" : f === "all" ? "Tous" : f === "auto" ? "Auto" : "Signalés"}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p style={{ textAlign: "center", color: "var(--color-text-tertiary)", padding: 40 }}>Chargement…</p>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ padding: 40, textAlign: "center" }}>
          <p style={{ color: "var(--color-text-secondary)" }}>Aucun signalement.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {filtered.map((r) => {
            const cats: string[] = (() => { try { return JSON.parse(r.categories || "[]"); } catch { return []; } })();
            const rules: any[] = (() => { try { return JSON.parse(r.matchedRules || "[]"); } catch { return []; } })();
            return (
              <div key={r.id} className="card" style={{
                padding: "16px 20px",
                opacity: r.resolved ? 0.5 : 1,
                borderLeft: r.autoFlagged && !r.resolved ? `4px solid ${cats.length > 0 ? "#EF4444" : "var(--color-primary)"}` : undefined,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <span className="tag">{typeLabels[r.targetType] || r.targetType}</span>
                    {r.autoFlagged ? (
                      <span className="tag" style={{ background: "var(--color-warning-light)", color: "var(--color-warning)" }}>
                        🤖 Auto
                      </span>
                    ) : (
                      <span className="tag" style={{ background: "var(--color-primary-light)", color: "var(--color-primary)" }}>
                        👤 Signalé
                      </span>
                    )}
                    {!r.resolved && (
                      <span className="tag" style={{ background: "var(--color-error-light)", color: "var(--color-error)" }}>
                        À traiter
                      </span>
                    )}
                    {r.score > 0 && (
                      <span
                        className="tag"
                        style={{
                          background: `${severityColors[r.score >= 80 ? "critical" : r.score >= 50 ? "high" : r.score >= 20 ? "medium" : "low"]}20`,
                          color: severityColors[r.score >= 80 ? "critical" : r.score >= 50 ? "high" : r.score >= 20 ? "medium" : "low"],
                          fontWeight: 700,
                        }}
                      >
                        {r.score}/100
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: "0.8125rem", color: "var(--color-text-tertiary)" }}>
                    {formatDate(r.createdAt)} · {r.reporterName}
                  </div>
                </div>

                <p style={{ fontSize: "0.9375rem", margin: "8px 0" }}>{r.reason}</p>

                {cats.length > 0 && (
                  <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 8 }}>
                    {cats.map((c) => (
                      <span key={c} className="tag" style={{ background: "var(--color-bg-alt)", fontSize: "0.7rem" }}>
                        {c}
                      </span>
                    ))}
                  </div>
                )}

                {rules.length > 0 && (
                  <details style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)", marginBottom: 8 }}>
                    <summary style={{ cursor: "pointer" }}>Règles ({rules.length})</summary>
                    <ul style={{ margin: "4px 0 0", paddingLeft: 20 }}>
                      {rules.map((m: any, i: number) => (
                        <li key={i}><strong>{m.category}</strong>: {m.term}</li>
                      ))}
                    </ul>
                  </details>
                )}

                {!r.resolved && (
                  <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                    <a
                      href={getTargetUrl(r)}
                      target="_blank"
                      className="btn-ghost btn-sm"
                      style={{ padding: "4px 10px", fontSize: "0.8125rem", textDecoration: "none" }}
                    >
                      <IconMail size={14} /> Voir
                    </a>
                    <button
                      onClick={() => resolve(r.id)}
                      disabled={working === r.id}
                      className="btn-ghost btn-sm"
                      style={{ padding: "4px 10px", fontSize: "0.8125rem", color: "var(--color-success)" }}
                    >
                      <IconCheck size={14} /> Ignorer
                    </button>
                    <button
                      onClick={() => deleteContent(r.targetType, r.targetId, r.id)}
                      disabled={working === r.id}
                      className="btn-ghost btn-sm"
                      style={{ padding: "4px 10px", fontSize: "0.8125rem", color: "var(--color-error)" }}
                    >
                      <IconTrash size={14} /> Supprimer
                    </button>
                  </div>
                )}

                {r.resolved && (
                  <p style={{ fontSize: "0.8125rem", color: "var(--color-text-tertiary)", margin: "8px 0 0" }}>
                    ✓ Traité
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
