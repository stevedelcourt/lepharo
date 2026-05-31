"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { IconSend, IconMail, IconChevronLeft, IconTrash } from "@/components/icons";
import { formatDate } from "@/lib/utils";
import ResidentModal from "@/components/resident-modal";

const EMOJIS = ["😀","😃","😄","😁","😊","😍","🥰","😘","😎","🤗","🤩","🙂","😉","😛","😜","😂","🤣","😅","🥲","😢","😭","😤","😠","🤬","🥺","😱","🤔","🤷","🙄","😴","🥱","😈","👋","✋","💪","👍","👎","👏","🙏","🤝","❤️","💔","🔥","⭐","💯","🎉","🎊","✅","❌","👀","💀","☕","🍕","🍻","🎂","🚀","🏠","📍","📌","💡","🎯","🏆","💪","🤞","🫶","✨","🌈","🌊","☀️","🌙"];



type Conversation = {
  id: number;
  name: string;
  floor: number | null;
  avatarUrl: string | null;
  lastMessage: string;
  time: string;
  unread: number;
  type: string;
};

type Message = {
  id: number;
  senderId: number;
  content: string;
  createdAt: string;
};

function timeAgo(dateStr: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "à l'instant";
  if (mins < 60) return `il y a ${mins}min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `il y a ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `il y a ${days}j`;
  return formatDate(dateStr);
}

export default function MessageriePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConv, setActiveConv] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<number>(0);
  const [sending, setSending] = useState(false);
  const [showMobileConvList, setShowMobileConvList] = useState(true);
  const [deleting, setDeleting] = useState<{ msgId?: number; convId?: number } | null>(null);
  const [search, setSearch] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [profileUserId, setProfileUserId] = useState<number | null>(null);
  const chatEnd = useRef<HTMLDivElement>(null);
  const emojiRef = useRef<HTMLDivElement>(null);

  const toParam = searchParams.get("to");

  useEffect(() => {
    setIsMobile(window.innerWidth <= 768);
    const handler = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  useEffect(() => {
    if (toParam) setShowMobileConvList(false);
    const target = toParam ? parseInt(toParam, 10) : null;

    const loadConvs = fetch("/api/messagerie/conversations").then((r) => r.json());
    const loadUser = target && !isNaN(target)
      ? fetch(`/api/users/${target}`).then((r) => r.json()).catch(() => null)
      : Promise.resolve(null);

    Promise.all([loadConvs, loadUser]).then(([data, user]) => {
      setConversations(data);

      if (target && data.some((c: Conversation) => c.id === target)) {
        setActiveConv(target);
      } else if (target && user?.firstName) {
        const name = `${user.firstName} ${(user.lastName || "").charAt(0)}.`;
        setConversations((prev) => [...prev, {
          id: target, name, floor: user.floor ?? null,
          avatarUrl: user.avatarUrl ?? null,
          lastMessage: "", time: "", unread: 0, type: "private",
        }]);
        setActiveConv(target);
      } else if (target) {
        setActiveConv(target);
      } else if (data.length > 0) {
        setActiveConv(data[0].id);
      }

      setLoading(false);
    });
  }, [toParam]);

  useEffect(() => {
    if (!activeConv) return;
    fetch("/api/profile").then((r) => r.json()).then((data) => {
      if (data.id) {
        setCurrentUserId(data.id);
        const current = conversations.find((c) => c.id === activeConv);
        const isListing = current?.type === "listing";
        const params = isListing ? `listing=${activeConv - 100000}` : `with=${activeConv}`;
        fetch(`/api/messagerie/messages?${params}`).then((r) => r.json()).then(setMessages).catch(() => {});
      }
    }).catch(() => {});
  }, [activeConv, conversations]);

  useEffect(() => {
    chatEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (emojiRef.current && !emojiRef.current.contains(e.target as Node)) setShowEmoji(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  async function sendMessage() {
    if (!messageInput.trim() || !activeConv || sending) return;
    setSending(true);
    try {
      const current = conversations.find((c) => c.id === activeConv);
      const isListing = current?.type === "listing";
      const url = isListing ? `/api/listings/${activeConv - 100000}/messages` : "/api/messagerie/send";
      const body = isListing
        ? { content: messageInput.trim() }
        : { receiverId: activeConv, content: messageInput.trim() };
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success || data.id) {
        setMessages((prev) => [...prev, { id: data.id || data.id, senderId: currentUserId, content: messageInput.trim(), createdAt: new Date().toISOString() }]);
        setMessageInput("");
        fetch("/api/messagerie/conversations").then((r) => r.json()).then(setConversations);
      }
    } catch {}
    setSending(false);
  }

  async function deleteMessage(msgId: number) {
    if (!confirm("Supprimer ce message ?")) return;
    setDeleting({ msgId });
    try {
      await fetch(`/api/messagerie/messages`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageId: msgId }),
      });
      setMessages((prev) => prev.filter((m) => m.id !== msgId));
    } catch {}
    setDeleting(null);
  }

  async function deleteConversation(convId: number) {
    if (!confirm("Supprimer toute la conversation ? Cette action est irréversible.")) return;
    setDeleting({ convId });
    const current = conversations.find((c) => c.id === convId);
    const isListing = current?.type === "listing";
    try {
      const body = isListing ? { listingId: convId - 100000 } : { conversationWith: convId };
      await fetch(`/api/messagerie/messages`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      setConversations((prev) => prev.filter((c) => c.id !== convId));
      setActiveConv(null);
      setMessages([]);
    } catch {}
    setDeleting(null);
  }

  const current = conversations.find((c) => c.id === activeConv) || (activeConv ? { id: activeConv, name: `Résident #${activeConv}`, floor: null, avatarUrl: null, lastMessage: "", time: "", unread: 0, type: "private" } as Conversation : null);
  const filteredConvs = conversations.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container page-padding messagerie-page">
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <IconMail size={28} />
        <h1 style={{ margin: 0 }}>Messagerie</h1>
      </div>

      <div className="card messagerie-layout" style={{ display: "flex", overflow: "hidden", minHeight: "65vh" }}>
        {/* Contact list */}
        <div className={`messagerie-panel-left${showMobileConvList ? ' messagerie-panel-show' : ''}`} style={{ width: "340px", borderRight: "1px solid var(--color-border-light)", flexShrink: 0 }}>
          <div style={{ padding: 16, borderBottom: "1px solid var(--color-border-light)" }}>
            <input type="search" autoComplete="off" placeholder="Rechercher…" className="input" value={search} onChange={(e) => setSearch(e.target.value)} style={{ width: "100%" }} />
          </div>
          <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--color-text-tertiary)", textTransform: "uppercase", letterSpacing: "0.05em", padding: "12px 18px 4px", margin: 0 }}>
            Mes conversations
          </p>
          <div style={{ overflow: "auto", maxHeight: "calc(65vh - 60px)" }}>
            {loading && <p style={{ padding: 16, textAlign: "center", color: "var(--color-text-tertiary)", fontSize: "0.9375rem" }}>Chargement…</p>}
            {!loading && filteredConvs.length === 0 && (
              <div style={{ padding: 24, textAlign: "center" }}>
                <p style={{ color: "var(--color-text-secondary)", fontSize: "0.9375rem", marginBottom: 12 }}>
                  {search ? "Aucun résultat" : "Aucune conversation"}
                </p>
                {!search && <a href="/annuaire" className="btn btn-primary btn-sm">Envoyer un message</a>}
              </div>
            )}
            {filteredConvs.map((conv) => (
              <button
                key={conv.id}
                onClick={() => { setActiveConv(conv.id); setShowMobileConvList(false); }}
                style={{
                  width: "100%", padding: "16px 18px", display: "flex", gap: 12,
                  textAlign: "left", border: "none", borderBottom: "1px solid var(--color-border-light)",
                  cursor: "pointer", background: activeConv === conv.id ? "var(--color-primary-light)" : "transparent",
                  transition: "background 0.15s",
                  fontFamily: "inherit", fontSize: "inherit",
                }}
              >
                <div style={{
                  width: 44, height: 44, borderRadius: 999, background: "var(--color-bg-alt)",
                  overflow: "hidden", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "1rem", fontWeight: 600, color: "var(--color-text-secondary)",
                }}>
                  {conv.avatarUrl ? <img src={conv.avatarUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : conv.name.charAt(0)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                    <span style={{ fontSize: "0.9375rem", fontWeight: 600, color: "var(--color-text)" }}>
                      {conv.name}
                      {conv.type === "listing" && <span style={{ fontSize: "0.65rem", color: "var(--color-primary)", marginLeft: 6, fontWeight: 400 }}>Annonce</span>}
                    </span>
                    <span style={{ fontSize: "0.75rem", color: "var(--color-text-tertiary)" }}>{timeAgo(conv.time)}</span>
                  </div>
                  <p style={{
                    fontSize: "0.875rem", color: "var(--color-text-secondary)",
                    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", margin: 0,
                  }}>
                    {conv.lastMessage}
                  </p>
                </div>
                {conv.unread > 0 && (
                  <span style={{
                    background: "var(--color-accent)", color: "#fff", borderRadius: 999,
                    padding: "2px 8px", fontSize: "0.75rem", display: "flex", alignItems: "center", alignSelf: "center",
                  }}>
                    {conv.unread}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Chat panel */}
        <div className={`messagerie-panel-right${!showMobileConvList ? ' messagerie-panel-show' : ''}`} style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          {current ? (
            <>
              <div style={{ padding: "14px 24px", borderBottom: "1px solid var(--color-border-light)", display: "flex", alignItems: "center", gap: 12 }}>
                <button
                  className="messagerie-back"
                  onClick={() => setShowMobileConvList(true)}
                  type="button"
                  style={{ background: "none", border: "none", cursor: "pointer", padding: 8, color: "var(--color-text-secondary)" }}
                >
                  <IconChevronLeft size={20} />
                </button>
                {current.type === "private" ? (
                  <button type="button" onClick={() => setProfileUserId(current.id)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", alignItems: "center", gap: 12, flex: 1, minWidth: 0 }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: 999, background: "var(--color-bg-alt)",
                      overflow: "hidden", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "1rem", fontWeight: 600, color: "var(--color-text-secondary)",
                    }}>
                      {current.avatarUrl ? <img src={current.avatarUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : current.name.charAt(0)}
                    </div>
                    <div style={{ flex: 1, textAlign: "left" }}>
                      <p style={{ fontSize: "1rem", fontWeight: 600, marginBottom: 1, color: "var(--color-text)" }}>{current.name}</p>
                      <p style={{ fontSize: "0.8125rem", color: "var(--color-text-tertiary)", margin: 0 }}>
                        {current.floor ? `${current.floor}e étage` : "Résident"}
                      </p>
                    </div>
                  </button>
                ) : (
                  <>
                    <div style={{
                      width: 44, height: 44, borderRadius: 999, background: "var(--color-bg-alt)",
                      overflow: "hidden", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "1rem", fontWeight: 600, color: "var(--color-text-secondary)",
                    }}>
                      {current.avatarUrl ? <img src={current.avatarUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : current.name.charAt(0)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: "1rem", fontWeight: 600, marginBottom: 1, color: "var(--color-text)" }}>{current.name}</p>
                      <p style={{ fontSize: "0.8125rem", color: "var(--color-text-tertiary)", margin: 0 }}>
                        {current.floor ? `${current.floor}e étage` : "Résident"}
                      </p>
                    </div>
                  </>
                )}
                <button
                  onClick={() => deleteConversation(current.id)}
                  disabled={deleting?.convId === current.id}
                  style={{ background: "none", border: "none", cursor: "pointer", padding: 8, color: "var(--color-text-tertiary)", opacity: 0.5 }}
                  title="Supprimer la conversation"
                >
                  <IconTrash size={18} />
                </button>
              </div>

              <div className="messagerie-messages" style={{ flex: 1, padding: "20px 24px", overflow: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
                {messages.length === 0 && (
                  <p style={{ textAlign: "center", color: "var(--color-text-tertiary)", fontSize: "0.9375rem", padding: 40 }}>
                    Aucun message. Écrivez à {current.name}
                  </p>
                )}
                {messages.map((msg) => (
                  <div key={msg.id} style={{ position: "relative" }}>
                    <div style={{ display: "flex", justifyContent: "center", marginBottom: 4 }}>
                      <span style={{ fontSize: "0.75rem", color: "var(--color-text-tertiary)" }}>
                        {timeAgo(msg.createdAt)}
                      </span>
                    </div>
                    <div style={{ display: "flex", justifyContent: msg.senderId === currentUserId ? "flex-end" : "flex-start", alignItems: "flex-end", gap: 6 }}>
                      <div className="messagerie-bubble" style={{
                        maxWidth: "72%", padding: "12px 18px",
                        borderRadius: msg.senderId === currentUserId ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                        background: msg.senderId === currentUserId ? "var(--color-primary)" : "var(--color-bg-alt)",
                        color: msg.senderId === currentUserId ? "#fff" : "var(--color-text)",
                        fontSize: "0.9375rem", lineHeight: 1.5,
                      }}>
                        <p style={{ fontSize: "1.0625rem", margin: 0, whiteSpace: "pre-wrap", lineHeight: 1.5 }}>{msg.content}</p>
                      </div>
                      {msg.senderId === currentUserId && (
                        <button
                          onClick={() => deleteMessage(msg.id)}
                          disabled={deleting?.msgId === msg.id}
                          style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: "var(--color-text-tertiary)", opacity: 0.3, flexShrink: 0 }}
                          title="Supprimer ce message"
                        >
                          <IconTrash size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={chatEnd} />
              </div>

              <div className="messagerie-input-area" style={{ padding: "16px 24px", borderTop: "1px solid var(--color-border-light)" }}>
                <div style={{ position: "relative", display: "flex", gap: 12, alignItems: "flex-end" }}>
                  <div style={{ flex: 1, position: "relative" }}>
                    <input
                      type="text"
                      placeholder="Écrivez votre message…"
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") sendMessage(); }}
                      className="input"
                      style={{ width: "100%", fontSize: "1rem", padding: "12px 44px 12px 16px" }}
                    />
                    <button
                      onClick={() => setShowEmoji((v) => !v)}
                      type="button"
                      style={{ position: "absolute", right: 8, bottom: 8, background: "none", border: "none", cursor: "pointer", fontSize: "1.25rem", padding: 4, lineHeight: 1, opacity: 0.5 }}
                      title="Emojis"
                    >
                      😊
                    </button>
                    {showEmoji && (
                      <div
                        ref={emojiRef}
                        className="messagerie-emoji-picker"
                        style={{ position: "absolute", bottom: "100%", left: 0, marginBottom: 8, background: "var(--color-bg-card)", border: "1px solid var(--color-border)", borderRadius: 12, padding: 10, boxShadow: "var(--shadow-lg)", zIndex: 50, width: 320, maxHeight: 200, overflow: "auto" }}
                      >
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(8, 1fr)", gap: 4 }}>
                          {EMOJIS.map((e) => (
                            <button
                              key={e}
                              onClick={() => { setMessageInput((p) => p + e); setShowEmoji(false); }}
                              type="button"
                              style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.375rem", padding: 4, borderRadius: 6, lineHeight: 1 }}
                            >
                              {e}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <button className="btn btn-primary messagerie-send-btn" onClick={sendMessage} disabled={sending || !messageInput.trim()} style={{ padding: "12px 20px", flexShrink: 0 }}>
                    <IconSend size={20} />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-text-tertiary)", fontSize: "1rem" }}>
              Sélectionnez une conversation
            </div>
          )}
        </div>
      </div>

      {profileUserId !== null && <ResidentModal userId={profileUserId} onClose={() => setProfileUserId(null)} />}
    </div>
  );
}
