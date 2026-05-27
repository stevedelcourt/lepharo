"use client";

import { useState } from "react";

type Conversation = {
  id: number;
  name: string;
  floor: number;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
};

const conversations: Conversation[] = [
  { id: 1, name: "Marie L.", floor: 7, lastMessage: "Avec plaisir ! On s'organise pour samedi ?", time: "Il y a 2h", unread: 2, online: true },
  { id: 2, name: "Jean-Pierre D.", floor: 12, lastMessage: "Merci pour le coup de main avec l'escabeau !", time: "Hier", unread: 0, online: false },
  { id: 3, name: "Sophie K.", floor: 4, lastMessage: "Oui, je peux garder les enfants mercredi après-midi", time: "Hier", unread: 1, online: true },
  { id: 4, name: "Lucas M.", floor: 3, lastMessage: "Je passe te voir demain pour l'imprimante", time: "Il y a 2j", unread: 0, online: false },
  { id: 5, name: "Marguerite B.", floor: 9, lastMessage: "Merci pour les courses, tu es bien aimable", time: "Il y a 3j", unread: 0, online: false },
];

export default function MessageriePage() {
  const [activeConv, setActiveConv] = useState<number>(conversations[0].id);
  const [messageInput, setMessageInput] = useState("");

  const current = conversations.find((c) => c.id === activeConv);

  const messages = [
    { from: "them", text: "Bonjour ! Je peux vous aider ce week-end si vous voulez.", time: "10:32" },
    { from: "me", text: "Ce serait super ! Samedi matin ça vous va ?", time: "10:45" },
    { from: "them", text: "Parfait pour moi. On se retrouve au hall d'entrée ?", time: "10:46" },
    { from: "me", text: "Entendu, à samedi 10h. Merci beaucoup !", time: "10:48" },
    { from: "them", text: current?.lastMessage || "", time: "Il y a 2h" },
  ];

  return (
    <div className="container" style={{ padding: "40px 24px" }}>
      <h1 style={{ marginBottom: 32 }}>Messagerie</h1>

      <div className="card" style={{ display: "flex", overflow: "hidden", minHeight: "60vh" }}>
        <div style={{ width: 320, borderRight: "1px solid var(--color-border-light)", flexShrink: 0 }}>
          <div style={{ padding: 16, borderBottom: "1px solid var(--color-border-light)" }}>
            <input
              type="search"
              placeholder="Rechercher…"
              style={{
                width: "100%",
                padding: "8px 12px",
                border: "1.5px solid var(--color-border)",
                borderRadius: "var(--radius-md)",
                fontSize: "0.875rem",
                background: "var(--color-bg)",
                outline: "none",
              }}
            />
          </div>
          <div style={{ overflow: "auto", maxHeight: "calc(60vh - 60px)" }}>
            {conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setActiveConv(conv.id)}
                style={{
                  width: "100%",
                  padding: "14px 16px",
                  display: "flex",
                  gap: 12,
                  textAlign: "left",
                  border: "none",
                  borderBottom: "1px solid var(--color-border-light)",
                  cursor: "pointer",
                  background: activeConv === conv.id ? "var(--color-primary-light)" : "transparent",
                  transition: "background 0.1s",
                }}
              >
                <div style={{
                  width: 40, height: 40, borderRadius: 999, background: "var(--color-bg-alt)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontWeight: 300, fontSize: "0.875rem",
                  position: "relative", flexShrink: 0,
                }}>
                  {conv.name.charAt(0)}.{conv.name.split(" ")[1]?.charAt(0) || ""}
                  {conv.online && (
                    <span style={{
                      width: 10, height: 10, borderRadius: 999, background: "var(--color-success)",
                      position: "absolute", bottom: 0, right: 0, border: "2px solid var(--color-bg)",
                    }} />
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                    <span style={{ fontWeight: 300, fontSize: "0.875rem" }}>{conv.name}</span>
                    <span style={{ fontSize: "0.75rem", color: "var(--color-text-tertiary)" }}>{conv.time}</span>
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
                    padding: "2px 8px", fontSize: "0.75rem", fontWeight: 300,
                    display: "flex", alignItems: "center", alignSelf: "center",
                  }}>
                    {conv.unread}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          {current && (
            <>
              <div style={{ padding: "16px 24px", borderBottom: "1px solid var(--color-border-light)", display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 999, background: "var(--color-bg-alt)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontWeight: 300, fontSize: "0.8125rem", flexShrink: 0,
                }}>
                  {current.name.charAt(0)}.{current.name.split(" ")[1]?.charAt(0) || ""}
                </div>
                <div>
                  <p style={{ fontWeight: 300, fontSize: "0.9375rem", marginBottom: 2 }}>{current.name}</p>
                  <p style={{ fontSize: "0.75rem", color: current.online ? "var(--color-success)" : "var(--color-text-tertiary)" }}>
                    {current.online ? "En ligne" : "Hors ligne"}
                  </p>
                </div>
              </div>

              <div style={{ flex: 1, padding: "16px 24px", overflow: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
                {messages.map((msg, i) => (
                  <div key={i} style={{
                    display: "flex",
                    justifyContent: msg.from === "me" ? "flex-end" : "flex-start",
                  }}>
                    <div style={{
                      maxWidth: "70%",
                      padding: "10px 16px",
                      borderRadius: msg.from === "me" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                      background: msg.from === "me" ? "var(--color-primary)" : "var(--color-bg-alt)",
                      color: msg.from === "me" ? "#fff" : "var(--color-text)",
                    }}>
                      <p style={{ fontSize: "0.9375rem", margin: 0 }}>{msg.text}</p>
                      <p style={{
                        fontSize: "0.6875rem",
                        marginTop: 4,
                        opacity: 0.7,
                        textAlign: "right",
                      }}>
                        {msg.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ padding: "16px 24px", borderTop: "1px solid var(--color-border-light)", display: "flex", gap: 12 }}>
                <input
                  type="text"
                  placeholder="Écrivez votre message…"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && messageInput.trim()) {
                      setMessageInput("");
                    }
                  }}
                  style={{
                    flex: 1,
                    padding: "10px 14px",
                    border: "1.5px solid var(--color-border)",
                    borderRadius: "var(--radius-md)",
                    fontSize: "0.9375rem",
                    background: "var(--color-bg)",
                    outline: "none",
                  }}
                />
                <button
                  className="btn btn-primary"
                  style={{ padding: "10px 20px" }}
                  onClick={() => setMessageInput("")}
                >
                  Envoyer
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
