"use client";

import { useState, useEffect, useMemo } from "react";
import { IconCalendar, IconBuilding, IconWrench, IconParty, IconInfo, IconPlus, IconBell, IconSend, IconMessage } from "@/components/icons";
import { UserAvatar } from "@/components/user-avatar";
import { formatDate } from "@/lib/utils";

const months = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];

const typeMeta: Record<string, { label: string; icon: React.ComponentType<{ size?: number; className?: string }>; tagClass: string }> = {
  ag: { label: "AG", icon: IconBuilding, tagClass: "tag-ag" },
  travaux: { label: "Travaux", icon: IconWrench, tagClass: "tag-travaux" },
  convivial: { label: "Convivial", icon: IconParty, tagClass: "tag-convivial" },
  info: { label: "Info", icon: IconInfo, tagClass: "tag-info" },
};

type EventItem = { id: number; title: string; description: string; date: string; type: string; allowComments?: boolean; authorName?: string; authorAvatar?: string | null; commentCount?: number };
type AlertItem = { id: number; message: string; type: string; createdAt: string };
type Comment = { id: number; content: string; authorName: string; authorAvatar: string | null; createdAt: string };

function parseDate(dateStr: string): Date | null {
  const parts = dateStr.split(" ");
  const day = parseInt(parts[0]);
  const monthIdx = months.findIndex((m) => m.toLowerCase() === parts[1]?.toLowerCase());
  const year = parseInt(parts[2]) || new Date().getFullYear();
  if (isNaN(day) || monthIdx === -1) return null;
  return new Date(year, monthIdx, day);
}

export default function CalendrierClient({ events: initialEvents, alerts: initialAlerts }: { events: EventItem[]; alerts: AlertItem[] }) {
  const [events] = useState(initialEvents);
  const [alerts] = useState(initialAlerts);
  const [modalEvent, setModalEvent] = useState<EventItem | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentInput, setCommentInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);

  const now = useMemo(() => new Date(), []);

  const upcoming = useMemo(() => {
    const cutoff = new Date(now);
    cutoff.setMonth(cutoff.getMonth() + 2);
    return events
      .map((ev) => ({ ev, date: parseDate(ev.date) }))
      .filter((e) => e.date && e.date >= now && e.date <= cutoff)
      .sort((a, b) => (a.date!.getTime() - b.date!.getTime()))
      .map((e) => e.ev);
  }, [events, now]);

  const grouped = useMemo(() => {
    const groups: { label: string; events: EventItem[] }[] = [];
    for (const ev of upcoming) {
      const d = parseDate(ev.date);
      if (!d) continue;
      const label = months[d.getMonth()] + " " + d.getFullYear();
      const last = groups[groups.length - 1];
      if (last && last.label === label) last.events.push(ev);
      else groups.push({ label, events: [ev] });
    }
    return groups;
  }, [upcoming]);

  const nowFormatted = months[now.getMonth()] + " " + now.getFullYear();
  const cutoffDate = new Date(now);
  cutoffDate.setMonth(cutoffDate.getMonth() + 2);
  const cutoffFormatted = months[cutoffDate.getMonth()] + " " + cutoffDate.getFullYear();

  async function openComments(ev: EventItem) {
    setModalEvent(ev);
    setLoadingComments(true);
    try {
      const res = await fetch(`/api/events/${ev.id}/comments`);
      setComments(await res.json());
    } catch {}
    setLoadingComments(false);
  }

  async function sendComment() {
    if (!commentInput.trim() || !modalEvent || sending) return;
    setSending(true);
    try {
      const res = await fetch(`/api/events/${modalEvent.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: commentInput.trim() }),
      });
      if (res.ok) {
        const res2 = await fetch(`/api/events/${modalEvent.id}/comments`);
        setComments(await res2.json());
        setCommentInput("");
      }
    } catch {}
    setSending(false);
  }

  return (
    <div className="container page-padding">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28, gap: 24, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <IconCalendar size={28} />
          <div>
            <h1 style={{ margin: 0, marginBottom: 4 }}>Calendrier</h1>
            <p style={{ color: "var(--color-text-secondary)", fontSize: "1.0625rem", margin: 0 }}>
              &Agrave; venir - {nowFormatted} &rarr; {cutoffFormatted}
            </p>
          </div>
        </div>
        <a href="/calendrier/nouveau" className="btn btn-primary btn-sm">
          <IconPlus size={18} />
          Proposer un événement
        </a>
      </div>

      {alerts.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <h3 style={{ fontSize: "1.0625rem", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
            <IconBell size={20} /> Alertes actives
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {alerts.map((alert) => (
              <div key={alert.id} className="card" style={{ padding: "12px 20px", display: "flex", gap: 12, alignItems: "center", borderLeft: `4px solid ${alert.type === "warning" ? "var(--color-warning)" : "var(--color-primary)"}` }}>
                <span className="tag" style={{ background: alert.type === "warning" ? "var(--color-warning-light)" : "var(--color-primary-light)", color: alert.type === "warning" ? "var(--color-warning)" : "var(--color-primary)" }}>
                  <IconBell size={14} />
                  {alert.type === "warning" ? "Alerte" : "Info"}
                </span>
                <p style={{ fontSize: "0.9375rem", margin: 0 }}>{alert.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {upcoming.length === 0 ? (
        <div className="card" style={{ padding: 40, textAlign: "center" }}>
          <p style={{ color: "var(--color-text-secondary)", marginBottom: 16 }}>
            Aucun événement prévu dans les 2 prochains mois.
          </p>
          <a href="/calendrier/nouveau" className="btn btn-primary">Proposer un événement</a>
        </div>
      ) : (<>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {grouped.map((g) => (
            <div key={g.label}>
              <h3 style={{ fontSize: "1.125rem", marginBottom: 12 }}>{g.label}</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {g.events.map((ev) => {
                  const meta = typeMeta[ev.type] || { label: ev.type, icon: IconInfo, tagClass: "tag-info" };
                  const TagIcon = meta.icon;
                  return (
                    <div key={ev.id} className="card" style={{ padding: "14px 20px", display: "flex", gap: 16, alignItems: "center", borderLeft: "4px solid var(--color-primary)" }}>
                      <div style={{ minWidth: 100 }}>
                        <p style={{ fontSize: "0.9375rem" }}>{ev.date}</p>
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ marginBottom: 2 }}>{ev.title}</p>
                        <p style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)", margin: 0 }}>{ev.description}</p>
                        {ev.authorName && (
                          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6 }}>
                            <UserAvatar url={ev.authorAvatar} name={ev.authorName} size={22} />
                            <span style={{ fontSize: "0.75rem", color: "var(--color-text-tertiary)" }}>{ev.authorName}</span>
                          </div>
                        )}
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                        <span className={`tag ${meta.tagClass}`}><TagIcon size={14} /> {meta.label}</span>
                        {ev.allowComments !== false && (
                          <button
                            onClick={() => openComments(ev)}
                            style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, color: "var(--color-text-tertiary)", fontSize: "0.8125rem", padding: "4px 8px", borderRadius: 6 }}
                          >
                            <IconMessage size={14} />
                            {ev.commentCount || 0} commentaire{(ev.commentCount || 0) > 1 ? "s" : ""}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 32, textAlign: "center" }}>
          <a href="/calendrier/nouveau" className="btn btn-primary btn-sm" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <IconPlus size={18} />
            Proposer un événement
          </a>
          <p style={{ fontSize: "0.875rem", color: "var(--color-text-tertiary)", marginTop: 8 }}>
            Une idée ? Proposez-la, elle sera visible par tous les résidents.
          </p>
        </div>
      </>)}

      {/* Comment thread slide-out */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 1000, pointerEvents: modalEvent ? "auto" : "none",
        transition: "opacity 0.25s ease", opacity: modalEvent ? 1 : 0,
      }}>
        {/* Overlay */}
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)" }}
          onClick={() => { setModalEvent(null); setComments([]); }} />
        {/* Slide-out panel */}
        <div style={{
          position: "absolute", top: 0, right: 0, bottom: 0,
          width: 420, maxWidth: "100vw",
          background: "var(--color-bg-card)",
          boxShadow: "-4px 0 24px rgba(0,0,0,0.12)",
          display: "flex", flexDirection: "column",
          transform: modalEvent ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
        }}>
          {modalEvent && (
            <>
              <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--color-border-light)", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <h3 style={{ fontSize: "1.125rem", marginBottom: 2 }}>{modalEvent.title}</h3>
                  <p style={{ fontSize: "0.8125rem", color: "var(--color-text-tertiary)", margin: 0 }}>{modalEvent.date} · {modalEvent.type}</p>
                </div>
                <button onClick={() => { setModalEvent(null); setComments([]); }}
                  style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.25rem", color: "var(--color-text-tertiary)", padding: 4, lineHeight: 1 }}>
                  &times;
                </button>
              </div>

              <div style={{ flex: 1, overflow: "auto", padding: "16px 24px", display: "flex", flexDirection: "column", gap: 12 }}>
                {loadingComments ? (
                  <p style={{ textAlign: "center", color: "var(--color-text-tertiary)", fontSize: "0.875rem", padding: 20 }}>Chargement…</p>
                ) : comments.length === 0 ? (
                  <p style={{ textAlign: "center", color: "var(--color-text-tertiary)", fontSize: "0.875rem", padding: 20 }}>Aucun commentaire. Soyez le premier !</p>
                ) : (
                  comments.map((c) => (
                    <div key={c.id} style={{ display: "flex", gap: 10 }}>
                      <UserAvatar url={c.authorAvatar} name={c.authorName} size={32} />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                          <span style={{ fontSize: "0.8125rem", fontWeight: 600 }}>{c.authorName}</span>
                          <span style={{ fontSize: "0.7rem", color: "var(--color-text-tertiary)" }}>{formatDate(c.createdAt)}</span>
                        </div>
                        <p style={{ fontSize: "0.9375rem", margin: 0, whiteSpace: "pre-wrap" }}>{c.content}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div style={{ padding: "16px 24px", borderTop: "1px solid var(--color-border-light)", display: "flex", gap: 8 }}>
                <input
                  type="text"
                  placeholder="Écrire un commentaire…"
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") sendComment(); }}
                  className="input"
                  style={{ flex: 1, fontSize: "0.9375rem" }}
                />
                <button className="btn btn-primary btn-sm" onClick={sendComment} disabled={sending || !commentInput.trim()}>
                  <IconSend size={16} />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
