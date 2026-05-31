"use client";

import { useState, useEffect } from "react";
import { IconForum, IconMessage, IconPoll, IconTrash, IconEdit, IconCalendar } from "@/components/icons";
import { formatDate } from "@/lib/utils";

type Topic = { id: number; title: string; rubrique: string; createdAt: string; locked: boolean; pinned: boolean };
type Reply = { id: number; content: string; topicId: number; createdAt: string };
type PollItem = { id: number; question: string; createdAt: string };
type EventItem = { id: number; title: string; date: string; type: string; description?: string; createdAt: string };

export default function MesActivitesPage() {
  const [tab, setTab] = useState<"topics" | "replies" | "polls" | "events">("topics");
  const [topics, setTopics] = useState<Topic[]>([]);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [polls, setPolls] = useState<PollItem[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editType, setEditType] = useState<"forum_topic" | "forum_reply" | "poll" | "event">("forum_topic");
  const [saving, setSaving] = useState(false);
  const [showReplies, setShowReplies] = useState<Record<number, boolean>>({});

  function load() {
    setLoading(true);
    fetch("/api/user/content").then((r) => r.json()).then((d) => {
      setTopics(d.topics || []);
      setReplies(d.replies || []);
      setPolls(d.polls || []);
      setEvents(d.events || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }

  useEffect(load, []);

  async function deleteItem(type: string, id: number) {
    if (!confirm("Supprimer définitivement ?")) return;
    const res = await fetch(`/api/user/content?type=${type}&id=${id}`, { method: "DELETE" });
    const data = await res.json();
    if (data.success) {
      if (type === "forum_topic") setTopics((p) => p.filter((t) => t.id !== id));
      else if (type === "forum_reply") setReplies((p) => p.filter((r) => r.id !== id));
      else if (type === "poll") setPolls((p) => p.filter((pl) => pl.id !== id));
      else if (type === "event") setEvents((p) => p.filter((ev) => ev.id !== id));
    } else {
      alert(data.error || "Erreur");
    }
  }

  function startEdit(type: "forum_topic" | "forum_reply" | "poll" | "event", item: any) {
    setEditType(type);
    setEditingId(item.id);
    setEditTitle(item.title || item.question || "");
    setEditContent(item.content || item.description || item.title || "");
    setEditDate(item.date || "");
  }

  function cancelEdit() {
    setEditingId(null);
    setEditTitle("");
    setEditContent("");
  }

  async function saveEdit() {
    if (!editingId) return;
    setSaving(true);
    try {
      const body: Record<string, any> = { type: editType, id: editingId };
      if (editTitle.trim()) body.title = editTitle.trim();
      if (editContent.trim()) body.content = editContent.trim();
      if (editDate.trim()) body.date = editDate.trim();
      if (editType === "poll") { body.question = editTitle.trim(); delete body.title; }
      if (editType === "event") body.description = editContent.trim();
      const res = await fetch("/api/user/content", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) {
        if (editType === "forum_topic") {
          setTopics((prev) => prev.map((t) => t.id === editingId ? { ...t, title: editTitle.trim(), content: editContent.trim() } : t));
        } else if (editType === "forum_reply") {
          setReplies((prev) => prev.map((r) => r.id === editingId ? { ...r, content: editContent.trim() } : r));
        } else if (editType === "poll") {
          setPolls((prev) => prev.map((p) => p.id === editingId ? { ...p, question: editTitle.trim() } : p));
        } else if (editType === "event") {
          setEvents((prev) => prev.map((ev) => ev.id === editingId ? { ...ev, title: editTitle.trim(), description: editContent.trim(), date: editDate.trim() } : ev));
        }
        setEditingId(null);
      } else {
        alert(data.error);
      }
    } catch {
      alert("Erreur lors de la modification");
    }
    setSaving(false);
  }

  return (
    <div className="container page-padding" style={{ maxWidth: 800, margin: "0 auto" }}>
      <h1 style={{ marginBottom: 24 }}>Mes activités</h1>

      <div className="input-group" style={{ gap: 4, marginBottom: 24 }}>
        {([
          { key: "topics", label: "Sujets forum", icon: IconForum },
          { key: "replies", label: "Commentaires", icon: IconMessage },
          { key: "polls", label: "Sondages", icon: IconPoll },
          { key: "events", label: "Événements", icon: IconCalendar },
        ] as const).map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`btn btn-sm ${tab === key ? "btn-primary" : "btn-ghost"}`}
            style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 16px" }}
          >
            <Icon size={16} /> {label}
          </button>
        ))}
      </div>

      {loading ? (
        <p style={{ textAlign: "center", color: "var(--color-text-tertiary)", padding: 40 }}>Chargement…</p>
      ) : tab === "topics" && topics.length === 0 ? (
        <div className="card" style={{ padding: 40, textAlign: "center" }}>
          <p style={{ color: "var(--color-text-secondary)" }}>Vous n&apos;avez pas créé de sujet.</p>
        </div>
      ) : tab === "replies" && replies.length === 0 ? (
        <div className="card" style={{ padding: 40, textAlign: "center" }}>
          <p style={{ color: "var(--color-text-secondary)" }}>Vous n&apos;avez pas encore commenté.</p>
        </div>
      ) : tab === "polls" && polls.length === 0 ? (
        <div className="card" style={{ padding: 40, textAlign: "center" }}>
          <p style={{ color: "var(--color-text-secondary)" }}>Vous n&apos;avez pas créé de sondage.</p>
        </div>
      ) : tab === "events" && events.length === 0 ? (
        <div className="card" style={{ padding: 40, textAlign: "center" }}>
          <p style={{ color: "var(--color-text-secondary)" }}>Vous n&apos;avez pas créé d&apos;événement.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {tab === "topics" && topics.map((t) => (
            <div key={t.id} className="card" style={{ padding: 0, overflow: "hidden" }}>
              {editingId === t.id && editType === "forum_topic" ? (
                <div style={{ padding: "16px 20px" }}>
                  <div style={{ marginBottom: 12 }}>
                    <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, marginBottom: 4 }}>Titre</label>
                    <input className="input" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} style={{ width: "100%" }} />
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, marginBottom: 4 }}>Contenu</label>
                    <textarea className="input" value={editContent} onChange={(e) => setEditContent(e.target.value)} rows={4} style={{ width: "100%", resize: "vertical" }} />
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button className="btn btn-primary btn-sm" onClick={saveEdit} disabled={saving}>Enregistrer</button>
                    <button className="btn btn-ghost btn-sm" onClick={cancelEdit}>Annuler</button>
                  </div>
                </div>
              ) : (
                <div style={{ padding: "14px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
                  <a href={`/forum/sujet/${t.id}`} style={{ textDecoration: "none", color: "var(--color-text)", flex: 1, minWidth: 0 }}>
                    <p style={{ marginBottom: 2, fontWeight: 500 }}>{t.title}</p>
                    <p style={{ fontSize: "0.8125rem", color: "var(--color-text-tertiary)" }}>
                      {(t as any).rubrique} · {formatDate(t.createdAt)}
                      {t.locked && " · Verrouillé"}
                    </p>
                  </a>
                  <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                    <button onClick={() => startEdit("forum_topic", t)} className="btn-ghost btn-sm" style={{ padding: "6px 8px", lineHeight: 1 }} title="Modifier">
                      <IconEdit size={16} />
                    </button>
                    <button onClick={() => deleteItem("forum_topic", t.id)} className="btn-ghost btn-sm" style={{ padding: "6px 8px", lineHeight: 1, color: "var(--color-error)" }} title="Supprimer">
                      <IconTrash size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}

          {tab === "replies" && replies.map((r) => (
            <div key={r.id} className="card" style={{ padding: 0, overflow: "hidden" }}>
              {editingId === r.id && editType === "forum_reply" ? (
                <div style={{ padding: "16px 20px" }}>
                  <div style={{ marginBottom: 12 }}>
                    <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, marginBottom: 4 }}>Commentaire</label>
                    <textarea className="input" value={editContent} onChange={(e) => setEditContent(e.target.value)} rows={4} style={{ width: "100%", resize: "vertical" }} />
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button className="btn btn-primary btn-sm" onClick={saveEdit} disabled={saving}>Enregistrer</button>
                    <button className="btn btn-ghost btn-sm" onClick={cancelEdit}>Annuler</button>
                  </div>
                </div>
              ) : (
                <div style={{ padding: "14px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
                  <a href={`/forum/sujet/${r.topicId}`} style={{ textDecoration: "none", color: "var(--color-text)", flex: 1, minWidth: 0 }}>
                    <p style={{ marginBottom: 2, fontSize: "0.9375rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.content}</p>
                    <p style={{ fontSize: "0.8125rem", color: "var(--color-text-tertiary)" }}>Sujet #{r.topicId} · {formatDate(r.createdAt)}</p>
                  </a>
                  <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                    <button onClick={() => startEdit("forum_reply", r)} className="btn-ghost btn-sm" style={{ padding: "6px 8px", lineHeight: 1 }} title="Modifier">
                      <IconEdit size={16} />
                    </button>
                    <button onClick={() => deleteItem("forum_reply", r.id)} className="btn-ghost btn-sm" style={{ padding: "6px 8px", lineHeight: 1, color: "var(--color-error)" }} title="Supprimer">
                      <IconTrash size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}

          {tab === "polls" && polls.map((p) => (
            <div key={p.id} className="card" style={{ padding: 0, overflow: "hidden" }}>
              {editingId === p.id && editType === "poll" ? (
                <div style={{ padding: "16px 20px" }}>
                  <div style={{ marginBottom: 12 }}>
                    <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, marginBottom: 4 }}>Question</label>
                    <input className="input" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} style={{ width: "100%" }} />
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button className="btn btn-primary btn-sm" onClick={saveEdit} disabled={saving}>Enregistrer</button>
                    <button className="btn btn-ghost btn-sm" onClick={cancelEdit}>Annuler</button>
                  </div>
                </div>
              ) : (
                <div style={{ padding: "14px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
                  <a href={`/sondages/${p.id}`} style={{ textDecoration: "none", color: "var(--color-text)", flex: 1, minWidth: 0 }}>
                    <p style={{ marginBottom: 2, fontWeight: 500 }}>{p.question}</p>
                    <p style={{ fontSize: "0.8125rem", color: "var(--color-text-tertiary)" }}>{formatDate(p.createdAt)}</p>
                  </a>
                  <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                    <button onClick={() => startEdit("poll", p)} className="btn-ghost btn-sm" style={{ padding: "6px 8px", lineHeight: 1 }} title="Modifier">
                      <IconEdit size={16} />
                    </button>
                    <button onClick={() => deleteItem("poll", p.id)} className="btn-ghost btn-sm" style={{ padding: "6px 8px", lineHeight: 1, color: "var(--color-error)" }} title="Supprimer">
                      <IconTrash size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}

          {tab === "events" && events.map((ev) => (
            <div key={ev.id} className="card" style={{ padding: 0, overflow: "hidden" }}>
              {editingId === ev.id && editType === "event" ? (
                <div style={{ padding: "16px 20px" }}>
                  <div style={{ marginBottom: 12 }}>
                    <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, marginBottom: 4 }}>Titre</label>
                    <input className="input" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} style={{ width: "100%" }} />
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, marginBottom: 4 }}>Date</label>
                    <input className="input" value={editDate} onChange={(e) => setEditDate(e.target.value)} placeholder="Ex: 15 Juin 2026" style={{ width: "100%" }} />
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, marginBottom: 4 }}>Description</label>
                    <textarea className="input" value={editContent} onChange={(e) => setEditContent(e.target.value)} rows={3} style={{ width: "100%", resize: "vertical" }} />
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button className="btn btn-primary btn-sm" onClick={saveEdit} disabled={saving}>Enregistrer</button>
                    <button className="btn btn-ghost btn-sm" onClick={cancelEdit}>Annuler</button>
                  </div>
                </div>
              ) : (
                <div style={{ padding: "14px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
                  <a href="/calendrier" style={{ textDecoration: "none", color: "var(--color-text)", flex: 1, minWidth: 0 }}>
                    <p style={{ marginBottom: 2, fontWeight: 500 }}>{ev.title}</p>
                    <p style={{ fontSize: "0.8125rem", color: "var(--color-text-tertiary)" }}>{ev.date} · {ev.type} · {formatDate(ev.createdAt)}</p>
                  </a>
                  <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                    <button onClick={() => startEdit("event", ev)} className="btn-ghost btn-sm" style={{ padding: "6px 8px", lineHeight: 1 }} title="Modifier">
                      <IconEdit size={16} />
                    </button>
                    <button onClick={() => deleteItem("event", ev.id)} className="btn-ghost btn-sm" style={{ padding: "6px 8px", lineHeight: 1, color: "var(--color-error)" }} title="Supprimer">
                      <IconTrash size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
