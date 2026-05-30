"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { IconSend, IconMail, IconChevronLeft } from "@/components/icons";
import { formatDate } from "@/lib/utils";

type Conversation = {
  id: number;
  name: string;
  floor: number | null;
  avatarUrl: string | null;
  lastMessage: string;
  time: string;
  unread: number;
};

type Message = {
  id: number;
  senderId: number;
  content: string;
  createdAt: string;
};

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
  const chatEnd = useRef<HTMLDivElement>(null);

  const toParam = searchParams.get("to");

  useEffect(() => {
    fetch("/api/messagerie/conversations")
      .then((r) => r.json())
      .then((data) => {
        setConversations(data);
        const target = toParam ? parseInt(toParam, 10) : null;
        if (target && data.some((c: Conversation) => c.id === target)) {
          setActiveConv(target);
        } else if (data.length > 0) {
          setActiveConv(data[0].id);
        } else if (target) {
          setActiveConv(target);
        }
        setLoading(false);
      });
    if (toParam) {
      const target = parseInt(toParam, 10);
      if (!isNaN(target)) {
        fetch(`/api/users/${target}`).then((r) => r.json()).then((u) => {
          if (u.firstName && !conversations.some((c) => c.id === target)) {
            setConversations((prev) => [...prev, { id: target, name: `${u.firstName} ${(u.lastName || "").charAt(0)}.`, floor: u.floor ?? null, avatarUrl: u.avatarUrl ?? null, lastMessage: "", time: "", unread: 0 }]);
          }
        }).catch(() => {});
      }
    }
  }, [toParam]);

  useEffect(() => {
    if (!activeConv) return;
    fetch("/api/profile").then((r) => r.json()).then((data) => {
      if (data.id) {
        setCurrentUserId(data.id);
        fetch(`/api/messagerie/messages?with=${activeConv}`).then((r) => r.json()).then(setMessages).catch(() => {});
        fetch("/api/messages/read", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "private", otherId: activeConv }),
        }).catch(() => {});
      }
    }).catch(() => {});
  }, [activeConv]);

  useEffect(() => {
    chatEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage() {
    if (!messageInput.trim() || !activeConv || sending) return;
    setSending(true);
    try {
      const res = await fetch("/api/messagerie/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiverId: activeConv, content: messageInput.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setMessages((prev) => [...prev, { id: data.id, senderId: currentUserId, content: messageInput.trim(), createdAt: new Date().toISOString() }]);
        setMessageInput("");
        // Refresh conversations to update lastMessage
        fetch("/api/messagerie/conversations").then((r) => r.json()).then(setConversations);
      }
    } catch {}
    setSending(false);
  }

  const current = conversations.find((c) => c.id === activeConv) || (activeConv ? { id: activeConv, name: `Résident #${activeConv}`, floor: null, avatarUrl: null, lastMessage: "", time: "", unread: 0 } as Conversation : null);

  return (
    <div className="container page-padding">
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <IconMail size={28} />
        <h1 style={{ margin: 0 }}>Messagerie</h1>
      </div>

      <div className={`card messagerie-layout ${showMobileConvList ? "messagerie-show-list" : "messagerie-show-chat"}`} style={{ display: "flex", overflow: "hidden", minHeight: "60vh" }}>
        <div className="messagerie-panel-left" style={{ width: 320, borderRight: "1px solid var(--color-border-light)", flexShrink: 0 }}>
          <div style={{ padding: 16, borderBottom: "1px solid var(--color-border-light)" }}>
            <input
              type="search"
              autoComplete="off"
              placeholder="Rechercher…"
              className="input"
              style={{ width: "100%" }}
            />
          </div>
          <div style={{ overflow: "auto", maxHeight: "calc(60vh - 60px)" }}>
            {loading && <p style={{ padding: 16, textAlign: "center", color: "var(--color-text-tertiary)", fontSize: "0.875rem" }}>Chargement…</p>}
            {!loading && conversations.length === 0 && (
              <div style={{ padding: 24, textAlign: "center" }}>
                <p style={{ color: "var(--color-text-secondary)", fontSize: "0.875rem", marginBottom: 12 }}>
                  Aucune conversation
                </p>
                <a href="/annuaire" className="btn btn-primary btn-sm">Envoyer un message</a>
              </div>
            )}
            {conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => { setActiveConv(conv.id); setShowMobileConvList(false); }}
                style={{
                  width: "100%", padding: "14px 16px", display: "flex", gap: 12,
                  textAlign: "left", border: "none", borderBottom: "1px solid var(--color-border-light)",
                  cursor: "pointer", background: activeConv === conv.id ? "var(--color-primary-light)" : "transparent",
                  transition: "background 0.1s",
                }}
              >
                <div style={{
                  width: 40, height: 40, borderRadius: 999, background: "var(--color-bg-alt)",
                  overflow: "hidden", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "0.875rem", color: "var(--color-text-secondary)",
                }}>
                  {conv.avatarUrl ? <img src={conv.avatarUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : conv.name.charAt(0)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                    <span style={{ fontSize: "0.875rem" }}>{conv.name}</span>
                    <span style={{ fontSize: "0.75rem", color: "var(--color-text-tertiary)" }}>{formatDate(conv.time)}</span>
                  </div>
                  <p style={{
                    fontSize: "0.8125rem", color: "var(--color-text-secondary)",
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

        <div className="messagerie-panel-right" style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          {current ? (
            <>
              <div style={{ padding: "16px 24px", borderBottom: "1px solid var(--color-border-light)", display: "flex", alignItems: "center", gap: 12 }}>
                <button
                  className="messagerie-back"
                  onClick={() => setShowMobileConvList(true)}
                  type="button"
                  style={{ display: "none", background: "none", border: "none", cursor: "pointer", padding: 4, color: "var(--color-text-secondary)" }}
                >
                  <IconChevronLeft size={20} />
                </button>
                <div style={{
                  width: 44, height: 44, borderRadius: 999, background: "var(--color-bg-alt)",
                  overflow: "hidden", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "1rem", color: "var(--color-text-secondary)",
                }}>
                  {current.avatarUrl ? <img src={current.avatarUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : current.name.charAt(0)}
                </div>
                <div>
                  <p style={{ fontSize: "0.9375rem", marginBottom: 2 }}>{current.name}</p>
                  <p style={{ fontSize: "0.75rem", color: "var(--color-text-tertiary)" }}>
                    {current.floor ? `${current.floor}e étage` : "Résident"}
                  </p>
                </div>
              </div>

              <div style={{ flex: 1, padding: "16px 24px", overflow: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
                {messages.length === 0 && (
                  <p style={{ textAlign: "center", color: "var(--color-text-tertiary)", fontSize: "0.875rem", padding: 40 }}>
                    Aucun message. Écrivez à {current.name}
                  </p>
                )}
                {messages.map((msg) => (
                  <div key={msg.id} style={{ display: "flex", justifyContent: msg.senderId === currentUserId ? "flex-end" : "flex-start" }}>
                    <div style={{
                      maxWidth: "70%", padding: "10px 16px",
                      borderRadius: msg.senderId === currentUserId ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                      background: msg.senderId === currentUserId ? "var(--color-primary)" : "var(--color-bg-alt)",
                      color: msg.senderId === currentUserId ? "#fff" : "var(--color-text)",
                    }}>
                      <p style={{ fontSize: "0.9375rem", margin: 0, whiteSpace: "pre-wrap" }}>{msg.content}</p>
                    </div>
                  </div>
                ))}
                <div ref={chatEnd} />
              </div>

              <div style={{ padding: "16px 24px", borderTop: "1px solid var(--color-border-light)", display: "flex", gap: 12 }}>
                <input
                  type="text"
                  placeholder="Écrivez votre message…"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") sendMessage(); }}
                  className="input"
                  style={{ flex: 1 }}
                />
                <button className="btn btn-primary" onClick={sendMessage} disabled={sending || !messageInput.trim()}>
                  <IconSend size={18} />
                </button>
              </div>
            </>
          ) : (
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-text-tertiary)", fontSize: "0.9375rem" }}>
              Sélectionnez une conversation
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
