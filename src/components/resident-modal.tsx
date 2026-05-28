"use client";

import { useState, useEffect } from "react";
import { IconClose, IconSend, IconHandshake, IconForum, IconPoll } from "@/components/icons";
import { formatDate } from "@/lib/utils";

type Activity = {
  user: { id: number; firstName: string; lastName: string; floor: number | null; avatarUrl: string | null; bio: string | null; senior: boolean };
  lastListing: { id: number; title: string; type: string; createdAt: string } | null;
  lastReply: { id: number; content: string; topicId: number; topicTitle: string | null; createdAt: string } | null;
  lastPoll: { id: number; question: string; createdAt: string } | null;
};

export default function ResidentModal({ userId, onClose }: { userId: number; onClose: () => void }) {
  const [data, setData] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/users/${userId}/activity`).then((r) => r.json()).then((d) => { setData(d); setLoading(false); }).catch(() => setLoading(false));
  }, [userId]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div onClick={(e) => e.stopPropagation()} className="card" style={{ maxWidth: 520, width: "100%", padding: "24px 28px", position: "relative", maxHeight: "90vh", overflowY: "auto" }}>
        <button onClick={onClose} style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", cursor: "pointer", color: "var(--color-text-tertiary)", padding: 4 }}>
          <IconClose size={20} />
        </button>

        {loading ? (
          <p style={{ textAlign: "center", color: "var(--color-text-tertiary)", padding: 40 }}>Chargement…</p>
        ) : data ? (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
              <div style={{ width: 64, height: 64, borderRadius: "50%", background: "var(--color-border)", overflow: "hidden", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", color: "var(--color-text-secondary)" }}>
                {data.user.avatarUrl ? <img src={data.user.avatarUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span>{data.user.firstName[0]}{data.user.lastName[0]}</span>}
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: "1.25rem" }}>{data.user.firstName} {data.user.lastName}</h2>
                <p style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)", margin: "2px 0 0", display: "flex", alignItems: "center", gap: 6 }}>
                  {data.user.floor ? `${data.user.floor}e étage` : "Résident"}
                  {data.user.senior && <span className="tag" style={{ background: "var(--color-accent)", color: "#fff", fontSize: "0.6875rem" }}>Senior</span>}
                </p>
              </div>
            </div>

            {data.user.bio && (
              <div style={{ marginBottom: 20, padding: "12px 16px", background: "var(--color-bg-alt)", borderRadius: "var(--radius-sm)", fontSize: "0.9375rem", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                {data.user.bio}
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
              <h3 style={{ fontSize: "0.9375rem", marginBottom: 4 }}>Activité récente</h3>
              {data.lastListing && (
                <a href={`/entraide/${data.lastListing.id}`} className="card" style={{ padding: "10px 14px", textDecoration: "none", color: "var(--color-text)", display: "flex", alignItems: "center", gap: 10, fontSize: "0.875rem" }}>
                  <IconHandshake size={16} style={{ flexShrink: 0, color: "var(--color-text-tertiary)" }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ marginBottom: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{data.lastListing.title}</p>
                    <p style={{ fontSize: "0.75rem", color: "var(--color-text-tertiary)" }}>Dernière annonce · {formatDate(data.lastListing.createdAt)}</p>
                  </div>
                </a>
              )}
              {data.lastReply && (
                <a href={`/forum/sujet/${data.lastReply.topicId}`} className="card" style={{ padding: "10px 14px", textDecoration: "none", color: "var(--color-text)", display: "flex", alignItems: "center", gap: 10, fontSize: "0.875rem" }}>
                  <IconForum size={16} style={{ flexShrink: 0, color: "var(--color-text-tertiary)" }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ marginBottom: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{data.lastReply.topicTitle || "Réponse"}</p>
                    <p style={{ fontSize: "0.75rem", color: "var(--color-text-tertiary)" }}>Dernière contribution · {formatDate(data.lastReply.createdAt)}</p>
                  </div>
                </a>
              )}
              {data.lastPoll && (
                <a href={`/sondages/${data.lastPoll.id}`} className="card" style={{ padding: "10px 14px", textDecoration: "none", color: "var(--color-text)", display: "flex", alignItems: "center", gap: 10, fontSize: "0.875rem" }}>
                  <IconPoll size={16} style={{ flexShrink: 0, color: "var(--color-text-tertiary)" }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ marginBottom: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{data.lastPoll.question}</p>
                    <p style={{ fontSize: "0.75rem", color: "var(--color-text-tertiary)" }}>Dernier sondage · {formatDate(data.lastPoll.createdAt)}</p>
                  </div>
                </a>
              )}
              {!data.lastListing && !data.lastReply && !data.lastPoll && (
                <p style={{ fontSize: "0.8125rem", color: "var(--color-text-tertiary)" }}>Aucune activité publique récente.</p>
              )}
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <a href={`/messagerie?to=${userId}`} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "10px 24px", borderRadius: 999, background: "var(--color-primary)", color: "#000", fontSize: "0.9375rem", fontWeight: 600, textDecoration: "none" }}>
                <IconSend size={16} /> Message
              </a>
            </div>
          </div>
        ) : (
          <p style={{ textAlign: "center", color: "var(--color-text-tertiary)", padding: 40 }}>Erreur de chargement.</p>
        )}
      </div>
    </div>
  );
}
