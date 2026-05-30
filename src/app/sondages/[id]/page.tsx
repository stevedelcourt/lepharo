"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { IconPoll, IconCheck, IconChevronLeft, IconScale, IconLaurel } from "@/components/icons";
import ReportButton from "@/components/report-button";
import { formatDate } from "@/lib/utils";

const barColors = ["#22C55E", "#F59E0B", "#6366f1", "#06b6d4", "#d946ef", "#14b8a6", "#f97316", "#8b5cf6"];

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = (angleDeg - 90) * (Math.PI / 180);
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  if (endAngle - startAngle >= 360) {
    const mid = polarToCartesian(cx, cy, r, startAngle + 180);
    const end = polarToCartesian(cx, cy, r, endAngle);
    return `M ${cx} ${cy - r} A ${r} ${r} 0 1 1 ${mid.x} ${mid.y} A ${r} ${r} 0 1 1 ${end.x} ${end.y} Z`;
  }
  const start = polarToCartesian(cx, cy, r, startAngle);
  const end = polarToCartesian(cx, cy, r, endAngle);
  const large = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${large} 1 ${end.x} ${end.y} Z`;
}

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

  const sorted = [...poll.options].sort((a: any, b: any) => b.count - a.count);
  const eligible = poll.options.some((o: any) => o.count >= 25);
  let angle = 0;

  return (
    <div className="container page-padding" style={{ maxWidth: 640, margin: "0 auto" }}>
      <a href="/sondages" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: "0.875rem", color: "var(--color-text-secondary)", textDecoration: "none", marginBottom: 24 }}>
        <IconChevronLeft size={16} /> Tous les sondages
      </a>

      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
        <IconPoll size={28} />
        <h1 style={{ margin: 0, fontSize: "1.5rem" }}>{poll.question}</h1>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <ReportButton targetType="poll" targetId={poll.id} />
      </div>
      <p style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)", marginBottom: 24 }}>
        Par {poll.authorName}{poll.authorFloor ? ` (${poll.authorFloor}e)` : ""} · {formatDate(poll.createdAt)} · {poll.totalVotes} vote{poll.totalVotes > 1 ? "s" : ""}
      </p>

      {eligible && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 16px", borderRadius: "var(--radius-md)", background: "var(--color-accent-light)", color: "var(--color-accent)", marginBottom: 20, fontSize: "0.875rem" }}>
          <IconScale size={20} />
          Une option a atteint 25 votes. Cette proposition peut être soumise à la présidente représentante de l&apos;immeuble et/ou au syndic.
        </div>
      )}

      {err && <div style={{ padding: "12px 16px", borderRadius: "var(--radius-md)", fontSize: "0.9375rem", background: "var(--color-error-light)", color: "var(--color-error)", marginBottom: 20 }}>{err}</div>}

      {poll.totalVotes > 0 && (
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <svg width="240" height="240" viewBox="0 0 180 180">
            {sorted.map((opt: any, i: number) => {
              const pct = opt.count / poll.totalVotes;
              const sliceAngle = pct * 360;
              const path = sliceAngle > 0 ? describeArc(90, 90, 80, angle, angle + sliceAngle) : "";
              const color = barColors[i % barColors.length];
              const midAngle = angle + sliceAngle / 2;
              const labelPos = polarToCartesian(90, 90, 55, midAngle);
              angle += sliceAngle;
              return (
                <g key={opt.id}>
                  <path d={path} fill={color} stroke="var(--color-bg)" strokeWidth="2" />
                  {pct >= 0.05 && (
                    <text x={labelPos.x} y={labelPos.y} textAnchor="middle" dominantBaseline="central" fill="#fff" fontSize="11" fontWeight="700">
                      {Math.round(pct * 100)}%
                    </text>
                  )}
                </g>
              );
            })}
            <circle cx="90" cy="90" r="38" fill="var(--color-bg)" stroke="var(--color-border-light)" strokeWidth="1" />
            <text x="90" y="84" textAnchor="middle" dominantBaseline="central" fill="var(--color-text)" fontSize="18" fontWeight="700">{poll.totalVotes}</text>
            <text x="90" y="102" textAnchor="middle" dominantBaseline="central" fill="var(--color-text-tertiary)" fontSize="11">vote{poll.totalVotes > 1 ? "s" : ""}</text>
          </svg>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {poll.options.map((opt: any, i: number) => {
          const pct = poll.totalVotes > 0 ? Math.round((opt.count / poll.totalVotes) * 100) : 0;
          const isSelected = poll.userVote === opt.id;
          const isEligible = opt.count >= 25;
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
                <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontWeight: 700, color: "var(--color-text)" }}>{opt.label}</span>
                  {isEligible && (
                    <span className="tag" style={{ background: "var(--color-accent)", color: "#fff", fontSize: "0.7rem", display: "inline-flex", alignItems: "center", gap: 3, flexShrink: 0 }}>
                      <IconLaurel size={12} /> Éligible
                    </span>
                  )}
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <span style={{ fontSize: "0.9375rem", fontWeight: 800, color: "var(--color-text)" }}>{pct}%</span>
                  <div style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)", fontWeight: 600 }}>{opt.count} vote{opt.count > 1 ? "s" : ""}</div>
                </div>
              </button>
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
