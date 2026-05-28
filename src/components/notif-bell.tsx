"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { IconBell, IconCheck } from "@/components/icons";

function DismissBtn({ id, onDone }: { id: number; onDone: () => void }) {
  const [working, setWorking] = useState(false);
  async function dismiss() {
    setWorking(true);
    await fetch("/api/warnings/dismiss", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    onDone();
  }
  return (
    <button onClick={dismiss} disabled={working} className="btn-ghost btn-sm" type="button" style={{ fontSize: "0.75rem", padding: "2px 10px", display: "inline-flex", alignItems: "center", gap: 4 }}>
      <IconCheck size={12} /> {working ? "..." : "OK"}
    </button>
  );
}
import { formatDate } from "@/lib/utils";

type NotifItem = {
  type: "private" | "listing" | "warning";
  id: number;
  content: string;
  createdAt: string;
  read: boolean;
  authorName: string;
  listingTitle: string | null;
  listingId: number | null;
  otherId: number;
};

export default function NotifBell() {
  const [open, setOpen] = useState(false);
  const [count, setCount] = useState(0);
  const [items, setItems] = useState<NotifItem[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  const refreshCount = useCallback(() => {
    fetch("/api/notifications/count").then((r) => r.json()).then((d) => setCount(d.count)).catch(() => {});
  }, []);

  useEffect(() => { refreshCount(); const id = setInterval(refreshCount, 30000); return () => clearInterval(id); }, [refreshCount]);

  useEffect(() => {
    const onFocus = () => refreshCount();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [refreshCount]);

  useEffect(() => {
    if (!open) return;
    fetch("/api/notifications?limit=5").then((r) => r.json()).then((d) => {
      setItems(d.items);
      setNextCursor(d.nextCursor);
    }).catch(() => {});
  }, [open]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function loadMore() {
    if (!nextCursor) return;
    const res = await fetch(`/api/notifications?limit=5&cursor=${nextCursor}`);
    const d = await res.json();
    setItems((prev) => [...prev, ...d.items]);
    setNextCursor(d.nextCursor);
  }

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(!open)}
        className="btn-ghost btn-sm"
        type="button"
        style={{ position: "relative", padding: 6, lineHeight: 1 }}
      >
        <IconBell size={20} />
        {count > 0 && (
          <span style={{
            position: "absolute",
            top: 0,
            right: 0,
            background: "var(--color-error)",
            color: "#fff",
            fontSize: "0.625rem",
            fontWeight: 700,
            minWidth: 16,
            height: 16,
            borderRadius: 8,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 4px",
            transform: "translate(25%, -25%)",
          }}>
            {count > 99 ? "99+" : count}
          </span>
        )}
      </button>

      {open && (
        <div style={{
          position: "absolute",
          top: "100%",
          right: 0,
          width: 360,
          maxHeight: 480,
          overflowY: "auto",
          background: "var(--color-bg-card)",
          border: "1px solid var(--color-border)",
          borderRadius: 8,
          boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
          zIndex: 1000,
          marginTop: 4,
        }}>
          <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--color-border)", fontWeight: 600, fontSize: "0.875rem" }}>
            Notifications
          </div>

          {items.length === 0 ? (
            <div style={{ padding: "24px 16px", textAlign: "center", color: "var(--color-text-tertiary)", fontSize: "0.875rem" }}>
              Aucune notification
            </div>
          ) : (
            <>
              {items.map((item) => (
                <a
                  key={`${item.type}-${item.id}`}
                  href={item.type === "private" ? "/messagerie" : item.type === "warning" ? "/dashboard" : "/entraide/" + item.listingId}
                  style={{
                    display: "block",
                    padding: "10px 16px",
                    textDecoration: "none",
                    color: "var(--color-text)",
                    borderBottom: "1px solid var(--color-border)",
                    background: item.read ? "transparent" : "var(--color-warning-light)",
                  }}
                  onClick={() => setOpen(false)}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2, fontSize: "0.8125rem" }}>
                    <span style={{ fontWeight: 600 }}>
                      {item.type === "private" ? item.authorName : item.listingTitle}
                    </span>
                    <span style={{ color: "var(--color-text-tertiary)", fontSize: "0.75rem" }}>
                      {formatDate(item.createdAt)}
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: "0.8125rem", color: "var(--color-text-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {item.type === "listing" && <>{item.authorName}: </>}
                    {item.content}
                  </p>
                  {item.type === "warning" && (
                    <div style={{ marginTop: 6, display: "flex", justifyContent: "flex-end" }}>
                      <DismissBtn id={item.id} onDone={() => { refreshCount(); setItems((prev) => prev.filter((i) => i.id !== item.id)); }} />
                    </div>
                  )}
                </a>
              ))}
              {nextCursor && (
                <button
                  onClick={loadMore}
                  className="btn-ghost btn-sm"
                  type="button"
                  style={{ width: "100%", padding: "10px 16px", fontSize: "0.8125rem", borderRadius: 0 }}
                >
                  Voir plus
                </button>
              )}
            </>
          )}

          <a
            href="/messagerie"
            style={{
              display: "block",
              padding: "10px 16px",
              textAlign: "center",
              fontSize: "0.8125rem",
              color: "var(--color-primary)",
              textDecoration: "none",
              borderTop: "1px solid var(--color-border)",
            }}
            onClick={() => setOpen(false)}
          >
            Toutes les conversations
          </a>
        </div>
      )}
    </div>
  );
}
