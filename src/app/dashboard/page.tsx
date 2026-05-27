import { getDb } from "@/lib/db";
import { alerts, forumTopics, entraideListings, users, events } from "@/lib/schema";
import { desc, eq } from "drizzle-orm";
import { fallbackAlerts, fallbackForumTopics, fallbackListings, fallbackEvents } from "@/lib/fallback-data";

export default async function DashboardPage() {
  const db = getDb();

  let activeAlerts: typeof fallbackAlerts = [];
  let activityFeed: { type: "forum" | "entraide" | "calendrier"; title: string; author: string; time: string }[] = [];

  if (db) {
    activeAlerts = db.select().from(alerts).where(eq(alerts.active, true)).orderBy(desc(alerts.createdAt)).all();

    const recentForum = db.select({
      id: forumTopics.id,
      title: forumTopics.title,
      authorName: users.firstName,
      authorFloor: users.floor,
      createdAt: forumTopics.createdAt,
    }).from(forumTopics).innerJoin(users, eq(forumTopics.authorId, users.id))
      .orderBy(desc(forumTopics.createdAt)).limit(3).all();

    const recentListings = db.select({
      id: entraideListings.id,
      title: entraideListings.title,
      type: entraideListings.type,
      authorName: users.firstName,
      authorFloor: users.floor,
      createdAt: entraideListings.createdAt,
    }).from(entraideListings).innerJoin(users, eq(entraideListings.authorId, users.id))
      .orderBy(desc(entraideListings.createdAt)).limit(3).all();

    const recentEvents = db.select({
      id: events.id,
      title: events.title,
      date: events.date,
    }).from(events).orderBy(desc(events.date)).limit(3).all();

    activityFeed = [
      ...recentForum.map((t) => ({
        type: "forum" as const, title: t.title,
        author: `${t.authorName}, ${t.authorFloor}e`, time: t.createdAt || "",
      })),
      ...recentListings.map((l) => ({
        type: "entraide" as const, title: l.title,
        author: `${l.authorName}, ${l.authorFloor}e`, time: l.createdAt || "",
      })),
      ...recentEvents.map((e) => ({
        type: "calendrier" as const, title: e.title,
        author: e.date, time: "",
      })),
    ].sort(() => Math.random() - 0.5).slice(0, 5);
  } else {
    activeAlerts = fallbackAlerts;
    activityFeed = [
      ...fallbackForumTopics.slice(0, 3).map((t) => ({
        type: "forum" as const, title: t.title,
        author: `${t.authorName}, ${t.authorFloor}e`, time: t.createdAt,
      })),
      ...fallbackListings.slice(0, 3).map((l) => ({
        type: "entraide" as const, title: l.title,
        author: `${l.authorName}, ${l.authorFloor}e`, time: l.createdAt,
      })),
      ...fallbackEvents.slice(0, 3).map((e) => ({
        type: "calendrier" as const, title: e.title,
        author: e.date, time: "",
      })),
    ].sort(() => Math.random() - 0.5).slice(0, 5);
  }

  const shortcuts = [
    { label: "Entraide", path: "/entraide" },
    { label: "Forum", path: "/forum" },
    { label: "Documents", path: "/documents" },
    { label: "Calendrier", path: "/calendrier" },
    { label: "Annuaire", path: "/annuaire" },
    { label: "Messagerie", path: "/messagerie" },
  ];

  return (
    <div className="container" style={{ padding: "40px 24px" }}>
      <h1 style={{ marginBottom: 32 }}>Bonjour</h1>

      {activeAlerts.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 40 }}>
          {activeAlerts.map((alert) => (
            <div
              key={alert.id}
              className="card"
              style={{
                padding: "14px 20px",
                display: "flex",
                alignItems: "center",
                gap: 12,
                borderLeft: `4px solid ${alert.type === "warning" ? "var(--color-warning)" : "var(--color-primary)"}`,
                background: alert.type === "warning" ? "var(--color-warning-light)" : "var(--color-primary-light)",
              }}
            >
              <span style={{ fontSize: "1.25rem" }}>{alert.type === "warning" ? "!" : "i"}</span>
              <p style={{ fontSize: "0.9375rem", margin: 0 }}>{alert.message}</p>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 32, alignItems: "start" }}>
        <div>
          <h3 style={{ marginBottom: 16, fontSize: "1.125rem" }}>Fil d actualite</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {activityFeed.map((item, i) => (
              <div key={i} className="card" style={{ padding: "16px 20px", display: "flex", justifyContent: "space-between", gap: 16, alignItems: "center" }}>
                <div>
                  <p style={{ fontWeight: 300, marginBottom: 4 }}>{item.title}</p>
                  <p style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)" }}>
                    {item.author}{item.time ? ` \u00b7 ${item.time}` : ""}
                  </p>
                </div>
                <span className="tag" style={{ whiteSpace: "nowrap" }}>{item.type}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 style={{ marginBottom: 16, fontSize: "1.125rem" }}>Raccourcis</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {shortcuts.map((s) => (
              <a
                key={s.path}
                href={s.path}
                className="card"
                style={{
                  padding: "14px 20px",
                  fontWeight: 300,
                  fontSize: "0.9375rem",
                  textDecoration: "none",
                  color: "var(--color-text)",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  transition: "border-color 0.15s",
                }}
              >
                <span style={{ color: "var(--color-primary)" }}>→</span>
                {s.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
