"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { IconForum, IconPin, IconLock, IconSend, IconChevronLeft, IconMessage, IconUpload, IconClose } from "@/components/icons";
import ReportButton from "@/components/report-button";
import ResidentModal from "@/components/resident-modal";
import { formatDate } from "@/lib/utils";
import { UserAvatar } from "@/components/user-avatar";

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
  images: string[];
  authorId: number;
  authorName: string;
  authorFloor: number | null;
  authorAvatar: string | null;
  authorCopro: boolean;
  pinned: boolean;
  locked: boolean;
  createdAt: string;
};

type Reply = {
  id: number;
  content: string;
  images: string[];
  authorId: number;
  authorName: string;
  authorFloor: number | null;
  authorAvatar: string | null;
  authorCopro: boolean;
  createdAt: string;
};

function ImageGrid({ images }: { images: string[] }) {
  const [lightbox, setLightbox] = useState<string | null>(null);
  if (!images.length) return null;
  return (
    <>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
        {images.map((url, i) => (
          <button key={i} type="button" onClick={() => setLightbox(url)} style={{ display: "block", width: 200, height: 150, borderRadius: 8, overflow: "hidden", border: "1px solid var(--color-border-light)", flexShrink: 0, cursor: "pointer", padding: 0, background: "none" }}>
            <img src={url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} loading="lazy" />
          </button>
        ))}
      </div>
      {lightbox && (
        <div
          onClick={() => setLightbox(null)}
          onKeyDown={(e) => { if (e.key === "Escape") setLightbox(null); }}
          style={{
            position: "fixed", inset: 0, zIndex: 9999,
            background: "rgba(0,0,0,0.85)",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", padding: 24,
          }}
        >
          <button
            type="button"
            onClick={() => setLightbox(null)}
            style={{
              position: "absolute", top: 16, right: 16,
              width: 40, height: 40, borderRadius: "50%",
              border: "none", background: "rgba(255,255,255,0.15)",
              color: "#fff", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <IconClose size={24} />
          </button>
          <img
            src={lightbox}
            alt=""
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: "100%", maxHeight: "100%",
              borderRadius: 8, objectFit: "contain",
              cursor: "default",
            }}
          />
        </div>
      )}
    </>
  );
}

function ImagePicker({ images, previews, onSelect, onRemove }: {
  images: File[];
  previews: string[];
  onSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: (index: number) => void;
}) {
  return (
    <div style={{ marginBottom: 12 }}>
      {previews.length > 0 && (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
          {previews.map((src, i) => (
            <div key={i} style={{ position: "relative", width: 80, height: 80, borderRadius: 6, overflow: "hidden", border: "1px solid var(--color-border-light)" }}>
              <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              <button type="button" onClick={() => onRemove(i)} style={{ position: "absolute", top: 2, right: 2, width: 20, height: 20, borderRadius: "50%", border: "none", background: "rgba(0,0,0,0.5)", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}>
                <IconClose size={12} />
              </button>
            </div>
          ))}
        </div>
      )}
      {images.length < 4 && (
        <label style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "6px 12px", borderRadius: 6, border: "2px dashed var(--color-border-light)", cursor: "pointer", fontSize: "0.8125rem", color: "var(--color-text-secondary)" }}>
          <IconUpload size={16} />
          {images.length === 0 ? "Ajouter des photos (max 4)" : "Ajouter"}
          <input type="file" accept="image/*" multiple onChange={onSelect} style={{ display: "none" }} />
        </label>
      )}
    </div>
  );
}

export default function SujetClient({ topic, replies, userId }: { topic: Topic; replies: Reply[]; userId: number | null }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [replyImages, setReplyImages] = useState<File[]>([]);
  const [replyPreviews, setReplyPreviews] = useState<string[]>([]);
  const [modalUserId, setModalUserId] = useState<number | null>(null);

  function handleReplyImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    const remaining = 4 - replyImages.length;
    const selected = files.slice(0, remaining);
    setReplyImages((prev) => [...prev, ...selected]);
    setReplyPreviews((prev) => [...prev, ...selected.map((f) => URL.createObjectURL(f))]);
    e.target.value = "";
  }

  function removeReplyImage(index: number) {
    URL.revokeObjectURL(replyPreviews[index]);
    setReplyImages((prev) => prev.filter((_, i) => i !== index));
    setReplyPreviews((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleReply(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim() || sending) return;
    setSending(true);
    try {
      let imageUrls: string[] = [];
      if (replyImages.length > 0) {
        const formData = new FormData();
        replyImages.forEach((img) => formData.append("images", img));
        const uploadRes = await fetch("/api/forum/upload", {
          method: "POST",
          body: formData,
        });
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          imageUrls = uploadData.urls;
        } else {
          const err = await uploadRes.json();
          alert(err.error);
          setSending(false);
          return;
        }
      }

      const res = await fetch("/api/forum/replies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topicId: topic.id, content: message.trim(), images: imageUrls }),
      });
      if (res.ok) {
        setMessage("");
        setReplyImages([]);
        setReplyPreviews((prev) => { prev.forEach((p) => URL.revokeObjectURL(p)); return []; });
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
    <div className="container page-padding" style={{ maxWidth: 800 }}>
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

        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 0, fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>
          <button type="button" onClick={() => setModalUserId(topic.authorId)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
            <UserAvatar url={topic.authorAvatar} name={topic.authorName} size={28} />
          </button>
          <button type="button" onClick={() => setModalUserId(topic.authorId)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, fontFamily: "inherit", fontSize: "inherit", color: "inherit" }}>
            Par {topic.authorName}{topic.authorFloor ? ` (${topic.authorFloor}e étage)` : ""}{topic.authorCopro ? <span className="tag" style={{ background: "#fef3c7", color: "#92400e", fontSize: "0.7rem", fontWeight: 600, marginLeft: 6, verticalAlign: "middle" }}>C</span> : ""} · {formatDate(topic.createdAt)}
          </button>
        </div>
      </div>

      <div
        className="card sujet-card"
        style={{
          padding: "24px 28px",
          marginBottom: 32,
          whiteSpace: "pre-wrap",
          lineHeight: 1.7,
          fontSize: "1rem",
        }}
      >
        {topic.content}
        <ImageGrid images={topic.images} />
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
              className="card sujet-reply"
              style={{
                padding: "16px 20px",
                borderLeft: "3px solid var(--color-primary)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, fontSize: "0.8125rem" }}>
                <button type="button" onClick={() => setModalUserId(r.authorId)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                  <UserAvatar url={r.authorAvatar} name={r.authorName} size={26} />
                </button>
                <button type="button" onClick={() => setModalUserId(r.authorId)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, fontFamily: "inherit", fontSize: "inherit", color: "inherit", fontWeight: 600 }}>
                  {r.authorName}{r.authorFloor ? ` (${r.authorFloor}e)` : ""}{r.authorCopro ? <span className="tag" style={{ background: "#fef3c7", color: "#92400e", fontSize: "0.65rem", fontWeight: 600, marginLeft: 4, verticalAlign: "middle" }}>C</span> : ""}
                </button>
                <span style={{ color: "var(--color-text-tertiary)", marginLeft: "auto" }}>{formatDate(r.createdAt)}</span>
                <ReportButton targetType="forum_reply" targetId={r.id} />
              </div>
              <p style={{ margin: 0, whiteSpace: "pre-wrap", lineHeight: 1.6 }}>{r.content}</p>
              <ImageGrid images={r.images} />
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
          <ImagePicker
            images={replyImages}
            previews={replyPreviews}
            onSelect={handleReplyImageSelect}
            onRemove={removeReplyImage}
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

      {modalUserId !== null && <ResidentModal userId={modalUserId} onClose={() => setModalUserId(null)} />}
    </div>
  );
}
