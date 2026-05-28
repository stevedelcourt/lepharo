"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Listing = {
  id: number;
  type: string;
  title: string;
  description: string;
  category: string;
  status: string;
  authorId: number;
  authorName: string;
  authorFloor: number | null;
  createdAt: string;
};

type Message = {
  id: number;
  content: string;
  authorId: number;
  authorName: string;
  createdAt: string;
};

const categoryLabels: Record<string, string> = {
  garde: "Garde d'enfants",
  compagnie: "Compagnie et visite",
  courses: "Courses et deplacements",
  numerique: "Aide numerique",
  bricolage: "Bricolage et petits travaux",
  pret: "Pret d'objets",
  transport: "Transport et mobilite",
  divers: "Divers",
};

export default function ListingDetailClient({
  listing,
  messages: initialMessages,
  currentUserId,
}: {
  listing: Listing;
  messages: Message[];
  currentUserId: number;
}) {
  const router = useRouter();
  const [messages, setMessages] = useState(initialMessages);
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;

    setSending(true);
    try {
      const res = await fetch(`/api/listings/${listing.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      const data = await res.json();
      if (data.success) {
        setMessages((prev) => [
          ...prev,
          {
            id: data.id,
            content,
            authorId: currentUserId,
            authorName: "Vous",
            createdAt: new Date().toISOString(),
          },
        ]);
        setContent("");
      }
    } catch {
      /* ignore */
    }
    setSending(false);
  }

  const isOwner = listing.authorId === currentUserId;

  return (
    <div className="container" style={{ padding: "40px 24px", maxWidth: 720, margin: "0 auto" }}>
      <a
        href="/entraide"
        style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: "0.875rem", color: "var(--color-text-secondary)", marginBottom: 24, textDecoration: "none" }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
        Retour a l entraide
      </a>

      <div className="card" style={{ padding: "24px 28px", marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
          <div>
            <span style={{
              display: "inline-flex",
              width: 28,
              height: 28,
              borderRadius: 999,
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.6875rem",
              textTransform: "uppercase",
              color: "#fff",
              background: listing.type === "propose" ? "var(--color-primary)" : "var(--color-accent)",
              marginRight: 10,
            }}>
              {listing.type === "propose" ? "P" : "C"}
            </span>
            <span className="tag" style={{ fontSize: "0.8125rem" }}>
              {categoryLabels[listing.category] || listing.category}
            </span>
            {listing.status === "closed" && (
              <span className="tag" style={{ background: "var(--color-text-tertiary)", color: "#fff", marginLeft: 8 }}>
                Fermee
              </span>
            )}
          </div>
        </div>

        <h2 style={{ fontSize: "1.25rem", marginBottom: 8 }}>{listing.title}</h2>

        <p style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)", marginBottom: 16 }}>
          {listing.authorName}{listing.authorFloor ? `, ${listing.authorFloor}e etage` : ""}
        </p>

        <p style={{ fontSize: "0.9375rem", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
          {listing.description}
        </p>
      </div>

      {/* Messages */}
      <div className="card" style={{ padding: "24px 28px" }}>
        <h3 style={{ fontSize: "1.0625rem", marginBottom: 20 }}>
          Messages ({messages.length})
        </h3>

        {messages.length === 0 && (
          <p style={{ color: "var(--color-text-secondary)", fontSize: "0.9375rem", marginBottom: 24 }}>
            Aucun message pour le moment. Soyez le premier a repondre.
          </p>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24, maxHeight: 400, overflowY: "auto" }}>
          {messages.map((m) => (
            <div
              key={m.id}
              style={{
                padding: "12px 16px",
                borderRadius: "var(--radius-md)",
                background: m.authorId === currentUserId ? "var(--color-primary-light)" : "var(--color-bg-alt)",
                alignSelf: m.authorId === currentUserId ? "flex-end" : "flex-start",
                maxWidth: "85%",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 4 }}>
                <span style={{ fontSize: "0.8125rem", fontWeight: 300, color: "var(--color-text)" }}>
                  {m.authorName}
                </span>
              </div>
              <p style={{ fontSize: "0.9375rem", margin: 0, whiteSpace: "pre-wrap" }}>
                {m.content}
              </p>
            </div>
          ))}
        </div>

        {listing.status === "open" && (
          <form onSubmit={sendMessage} style={{ display: "flex", gap: 8 }}>
            <input
              className="input"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={isOwner ? "Repondez a un message..." : "Envoyer un message..."}
              required
              style={{ flex: 1 }}
            />
            <button className="btn btn-primary" type="submit" disabled={sending}>
              {sending ? "..." : "Envoyer"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
