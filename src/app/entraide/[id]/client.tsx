"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { IconChevronLeft, IconTag } from "@/components/icons";
import ReportButton from "@/components/report-button";

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
  images: string;
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
  courses: "Courses et déplacements",
  numerique: "Aide numérique",
  bricolage: "Bricolage et petits travaux",
  vente: "Vente d'objets",
  pret: "Prêt d'objets",
  transport: "Transport et mobilité",
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
  const [selectedImage, setSelectedImage] = useState<number | null>(null);

  let images: string[] = [];
  try {
    images = JSON.parse(listing.images || "[]");
  } catch { /* empty */ }

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

  useEffect(() => {
    if (isOwner) {
      fetch("/api/messages/read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "listing", listingId: listing.id }),
      }).catch(() => {});
    }
  }, []);

  return (
    <div className="container" style={{ padding: "40px 24px", maxWidth: 760, margin: "0 auto" }}>
      <a
        href="/entraide"
        style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: "0.875rem", color: "var(--color-text-secondary)", marginBottom: 24, textDecoration: "none" }}
      >
        <IconChevronLeft size={16} />
        Retour à l&apos;entraide
      </a>

      <div className="card" style={{ padding: "24px 28px", marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span className={`tag ${listing.type === "propose" ? "tag-propose" : listing.type === "vente" ? "tag-vente" : "tag-cherche"}`}>
              {listing.type === "propose" ? "Propose" : listing.type === "vente" ? "Vente" : "Cherche"}
            </span>
            <span className="tag" style={{ fontSize: "0.8125rem", display: "inline-flex", alignItems: "center", gap: 4 }}>
              {listing.category === "vente" && <IconTag size={14} />}
              {categoryLabels[listing.category] || listing.category}
            </span>
            <ReportButton targetType="listing" targetId={listing.id} />
            {listing.status === "closed" && (
              <span className="tag tag-closed">Fermée</span>
            )}
          </div>
        </div>

        <h2 style={{ fontSize: "1.25rem", marginBottom: 8 }}>{listing.title}</h2>

        <p style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)", marginBottom: 16 }}>
          {listing.authorName}{listing.authorFloor ? `, ${listing.authorFloor}e étage` : ""}
        </p>

        <p style={{ fontSize: "0.9375rem", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
          {listing.description}
        </p>

        {images.length > 0 && (
          <div style={{ marginTop: 20 }}>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {images.map((url, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSelectedImage(selectedImage === i ? null : i)}
                  style={{
                    width: 120,
                    height: 120,
                    borderRadius: 8,
                    overflow: "hidden",
                    border: selectedImage === i ? "2px solid var(--color-primary)" : "1px solid var(--color-border)",
                    cursor: "pointer",
                    padding: 0,
                    background: "var(--color-bg)",
                    transition: "border-color 0.15s",
                  }}
                >
                  <img src={url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </button>
              ))}
            </div>
            {selectedImage !== null && (
              <div style={{ marginTop: 12 }}>
                <img
                  src={images[selectedImage]}
                  alt=""
                  style={{ width: "100%", maxHeight: 480, borderRadius: 8, objectFit: "contain", background: "var(--color-bg-alt)" }}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="card" style={{ padding: "24px 28px" }}>
        <h3 style={{ fontSize: "1.0625rem", marginBottom: 20 }}>
          Messages ({messages.length})
        </h3>

        {messages.length === 0 && (
          <p style={{ color: "var(--color-text-secondary)", fontSize: "0.9375rem", marginBottom: 24 }}>
            Aucun message pour le moment. Soyez le premier à répondre.
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
                <span style={{ fontSize: "0.8125rem", color: "var(--color-text)" }}>
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
              placeholder={isOwner ? "Répondez à un message..." : "Envoyer un message..."}
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
