"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { IconPoll, IconCheck, IconChevronLeft } from "@/components/icons";
import { formatDate } from "@/lib/utils";

export default function SondageDetail({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [poll, setPoll] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [id, setId] = useState<number | null>(null);

  useEffect(() => { params.then((p) => setId(parseInt(p.id, 10))); }, [params]);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/polls/${id}`).then((r) => r.json()).then((d) => { setPoll(d); setLoading(false); }).catch(() => setLoading(false));
  }, [id]);

  async function vote(optionId: number) {
    setVoting(true);
    setErr(null);
    try {
      const res = await fetch(`/api/polls/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ optionId }),
      });
      if (res.ok) {
        const d = await fetch(`/api/polls/${id}`).then((r) => r.json());
        setPoll(d);
      } else {
        const d = await res.json();
        setErr(d.error || "Erreur");
      }
    } catch { setErr("Erreur"); }
    setVoting(false);
  }

  if (loading) return <div className="container" style={{ padding: "40px 24px", maxWidth: 640, margin: "0 auto" }}><p style={{ color: "var(--color-text-tertiary)", textAlign: "center" }}>Chargement…</p></div>;
  if (!poll) return <div className="container" style={{ padding: "40px 24px", maxWidth: 640, margin: "0 auto" }}><p style={{ color: "var(--color-text-tertiary)", textAlign: "center" }}>Sondage introuvable.</p></div>;

  const maxCount = Math.max(...poll.options.map((o: any) => o.count), 1);

  return (
    <div className="container" style={{ padding: "40px 24px", maxWidth: 640, margin: "0 auto" }}>
      <a href="/sondages" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: "0.875rem", color: "var(--color-text-secondary)", textDecoration: "none", marginBottom: 24 }}>
        <IconChevronLeft size={16} /> Tous les sondages
      </a>

      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
        <IconPoll size={28} />
        <h1 style={{ margin: 0, fontSize: "1.5rem" }}>{poll.question}</h1>
      </div>
      <p style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)", marginBottom: 32 }}>
        Par {poll.authorName}{poll.authorFloor ? ` (${poll.authorFloor}e)` : ""} · {formatDate(poll.createdAt)} · {poll.totalVotes} vote{poll.totalVotes > 1 ? "s" : ""}
      </p>

      {err && <div style={{ padding: "12px 16px", borderRadius: "var(--radius-md)", fontSize: "0.9375rem", background: "var(--color-error-light)", color: "var(--color-error)", marginBottom: 20 }}>{err}</div>}

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {poll.options.map((opt: any) => {
          const pct = poll.totalVotes > 0 ? Math.round((opt.count / poll.totalVotes) * 100) : 0;
          const isSelected = poll.userVote === opt.id;
          return (
            <div key={opt.id}>
              <button
                onClick={() => vote(opt.id)}
                disabled={voting || poll.userVote !== null}
                className="card"
                style={{
                  width: "100%", padding: "14px 18px", textAlign: "left", cursor: poll.userVote !== null ? "default" : "pointer",
                  border: isSelected ? "2px solid var(--color-primary)" : "1px solid var(--color-border)",
                  background: isSelected ? "var(--color-primary-light)" : "var(--color-bg-card)",
                  display: "flex", alignItems: "center", gap: 12, fontFamily: "inherit", fontSize: "0.9375rem",
                  transition: "border-color 0.15s",
                }}
              >
                <div style={{
                  width: 20, height: 20, borderRadius: "50%", border: `2px solid ${isSelected ? "var(--color-primary)" : "var(--color-border)"}`,
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                  background: isSelected ? "var(--color-primary)" : "transparent",
                }}>
                  {isSelected && <IconCheck size={12} style={{ color: "#fff" }} />}
                </div>
                <div style={{ flex: 1 }}>{opt.label}</div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--color-text)" }}>{pct}%</span>
                  <div style={{ fontSize: "0.75rem", color: "var(--color-text-tertiary)" }}>{opt.count} vote{opt.count > 1 ? "s" : ""}</div>
                </div>
              </button>
              <div style={{ height: 4, borderRadius: 2, background: "var(--color-border-light)", marginTop: -2, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${pct}%`, background: isSelected ? "var(--color-primary)" : "var(--color-border)", borderRadius: 2, transition: "width 0.3s" }} />
              </div>
            </div>
          );
        })}
      </div>

      {poll.userVote === null && (
        <p style={{ fontSize: "0.8125rem", color: "var(--color-text-tertiary)", marginTop: 16, textAlign: "center" }}>
          Cliquez sur une option pour voter.
        </p>
      )}
    </div>
  );
}
