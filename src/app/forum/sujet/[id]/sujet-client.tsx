"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { IconForum, IconPin, IconLock, IconSend, IconChevronLeft, IconMessage } from "@/components/icons";
import ReportButton from "@/components/report-button";
import { formatDate } from "@/lib/utils";

const rubriqueNames: Record<string, string> = {
  "vie-quotidienne": "Vie quotidienne",
  travaux: "Travaux et entretien",
  nuisibles: "Nuisibles et problèmes sanitaires",
  syndic: "Syndic et gouvernance",
  quartier: "Le quartier du Pharo",
  bistrot: "Le Bistrot",
};

type Topic = {
  id: number;
  title: string;
  content: string;
  rubrique: string;
  authorName: string;
  authorFloor: number | null;
  pinned: boolean;
  locked: boolean;
  createdAt: string;
};

type Reply = {
  id: number;
  content: string;
  authorName: string;
  authorFloor: number | null;
  createdAt: string;
};

export default function SujetClient({ topic, replies, userId }: { topic: Topic; replies: Reply[]; userId: number | null }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  async function handleReply(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim() || sending) return;
    setSending(true);
    try {
      const res = await fetch("/api/forum/replies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topicId: topic.id, content: message.trim() }),
      });
      if (res.ok) {
        setMessage("");
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error);
      }
    } catch {
      alert("Erreur lors de l'envoi");
    } finally {
      setSending(false);
    }
  }

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
        Retour au forum
      </a>

      <div style={{ marginBottom: 32 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
          <span className="tag" style={{ textTransform: "capitalize" }}>{rubriqueNames[topic.rubrique] || topic.rubrique}</span>
          {topic.pinned && (
            <span className="tag" style={{ background: "var(--color-primary)", color: "#fff" }}>
              <IconPin size={14} style={{ marginRight: 4 }} />Épinglé
            </span>
          )}
          {topic.locked && (
            <span className="tag" style={{ background: "var(--color-error)", color: "#fff" }}>
              <IconLock size={14} style={{ marginRight: 4 }} />Verrouillé
            </span>
          )}
        </div>

        <h1 style={{ margin: 0, marginBottom: 8, fontSize: "1.75rem" }}>{topic.title}</h1>

        <p style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)", margin: 0 }}>
          Par {topic.authorName}{topic.authorFloor ? ` (${topic.authorFloor}e étage)` : ""} · {formatDate(topic.createdAt)}
        </p>
      </div>

      <div
        className="card"
        style={{
          padding: "24px 28px",
          marginBottom: 32,
          whiteSpace: "pre-wrap",
          lineHeight: 1.7,
          fontSize: "1rem",
        }}
      >
        {topic.content}
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", marginBottom: 8 }}>
        <ReportButton targetType="forum_topic" targetId={topic.id} />
      </div>
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <IconMessage size={20} />
          <h2 style={{ margin: 0, fontSize: "1.125rem" }}>
            {replies.length === 0 ? "Aucune réponse" : `${replies.length} réponse${replies.length > 1 ? "s" : ""}`}
          </h2>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {replies.map((r) => (
            <div
              key={r.id}
              className="card"
              style={{
                padding: "16px 20px",
                borderLeft: "3px solid var(--color-primary)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: "0.8125rem" }}>
                <span style={{ fontWeight: 600 }}>
                  {r.authorName}{r.authorFloor ? ` (${r.authorFloor}e)` : ""}
                </span>
                <span style={{ color: "var(--color-text-tertiary)" }}>{formatDate(r.createdAt)}</span>
              </div>
              <p style={{ margin: 0, whiteSpace: "pre-wrap", lineHeight: 1.6 }}>{r.content}</p>
            </div>
          ))}
        </div>
      </div>

      {topic.locked ? (
        <div
          className="card"
          style={{
            padding: "16px 20px",
            textAlign: "center",
            color: "var(--color-text-secondary)",
            fontSize: "0.9375rem",
          }}
        >
          <IconLock size={18} style={{ marginRight: 6, verticalAlign: "middle" }} />
          Ce sujet est verrouillé. Il n'est plus possible d'y répondre.
        </div>
      ) : userId ? (
        <form onSubmit={handleReply} style={{ marginTop: 8 }}>
          <h3 style={{ fontSize: "1rem", marginBottom: 12 }}>Votre réponse</h3>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="input"
            placeholder="Écrivez votre réponse…"
            rows={4}
            required
            style={{ width: "100%", resize: "vertical", marginBottom: 12 }}
          />
          <button type="submit" disabled={sending || !message.trim()} className="btn btn-primary btn-sm" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <IconSend size={16} />
            {sending ? "Envoi…" : "Répondre"}
          </button>
        </form>
      ) : (
        <div style={{ textAlign: "center", padding: "24px 0", color: "var(--color-text-secondary)" }}>
          <a href="/connexion" className="btn btn-primary btn-sm">Connectez-vous pour répondre</a>
        </div>
      )}
    </div>
  );
}
