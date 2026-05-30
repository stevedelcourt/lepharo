import Link from "next/link";
import { getDb } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { alerts, forumTopics, entraideListings, users, events } from "@/lib/schema";
import { desc, eq } from "drizzle-orm";
import { fallbackAlerts, fallbackForumTopics, fallbackListings, fallbackEvents } from "@/lib/fallback-data";
import { IconBell, IconHandshake, IconForum as IconForumIcon, IconCalendar, IconUsers, IconFolder, IconMail, IconDashboard as IconDashboardIcon } from "@/components/icons";
import { formatDate } from "@/lib/utils";
import { redirect } from "next/navigation";
import "./dashboard.css";

export const dynamic = "force-dynamic";

type FeedItem = {
  type: "forum" | "entraide" | "calendrier";
  title: string;
  author: string;
  time: string;
  href: string;
};

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/connexion");
  const db = getDb();

  let activeAlerts: typeof fallbackAlerts = [];
  let feedItems: FeedItem[] = [];

  if (db) {
    activeAlerts = await db.select().from(alerts).where(eq(alerts.active, true)).orderBy(desc(alerts.createdAt)).all();

    const recentForum = await db.select({
      id: forumTopics.id,
      title: forumTopics.title,
      authorName: users.firstName,
      createdAt: forumTopics.createdAt,
    }).from(forumTopics).innerJoin(users, eq(forumTopics.authorId, users.id))
      .orderBy(desc(forumTopics.createdAt)).limit(10).all();

    const recentListings = await db.select({
      id: entraideListings.id,
      title: entraideListings.title,
      type: entraideListings.type,
      authorName: users.firstName,
      createdAt: entraideListings.createdAt,
    }).from(entraideListings).innerJoin(users, eq(entraideListings.authorId, users.id))
      .orderBy(desc(entraideListings.createdAt)).limit(10).all();

    const recentEvents = await db.select({
      id: events.id,
      title: events.title,
      date: events.date,
    }).from(events).orderBy(desc(events.date)).limit(10).all();

    feedItems = [
      ...recentForum.map((t) => ({
        type: "forum" as const, title: t.title,
        author: t.authorName, time: t.createdAt || "",
        href: `/forum/sujet/${t.id}`,
      })),
      ...recentListings.map((l) => ({
        type: "entraide" as const, title: l.title,
        author: l.authorName, time: l.createdAt || "",
        href: `/entraide/${l.id}`,
      })),
      ...recentEvents.map((e) => ({
        type: "calendrier" as const, title: e.title,
        author: "", time: e.date,
        href: `/calendrier`,
      })),
    ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 10);
  } else {
    activeAlerts = fallbackAlerts;
    feedItems = [
      ...fallbackForumTopics.slice(0, 5).map((t) => ({
        type: "forum" as const, title: t.title,
        author: t.authorName, time: t.createdAt,
        href: `/forum/sujet/${t.id}`,
      })),
      ...fallbackListings.slice(0, 5).map((l) => ({
        type: "entraide" as const, title: l.title,
        author: l.authorName, time: l.createdAt,
        href: `/entraide/${l.id}`,
      })),
      ...fallbackEvents.slice(0, 5).map((e) => ({
        type: "calendrier" as const, title: e.title,
        author: "", time: e.date,
        href: `/calendrier`,
      })),
    ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 10);
  }

  const shortcuts = [
    { label: "Entraide", path: "/entraide", icon: IconHandshake },
    { label: "Forum", path: "/forum", icon: IconForumIcon },
    { label: "Documents", path: "/documents", icon: IconFolder },
    { label: "Calendrier", path: "/calendrier", icon: IconCalendar },
    { label: "Annuaire", path: "/annuaire", icon: IconUsers },
    { label: "Messagerie", path: "/messagerie", icon: IconMail },
  ];

  const hasMore = feedItems.length > 5;

  return (
    <div className="container page-padding">
      <div className="dashboard-header">
        <IconDashboardIcon size={32} />
        <h1>À la une</h1>
      </div>

      <p className="dashboard-subtitle">
        Alertes et dernières interactions de toutes les rubriques
      </p>

      {activeAlerts.length > 0 && (
        <div className="dashboard-alerts">
          {activeAlerts.map((alert) => (
            <div
              key={alert.id}
              className="dashboard-alert"
              data-type={alert.type}
            >
              <IconBell size={20} />
              <p>{alert.message}</p>
            </div>
          ))}
        </div>
      )}

      <div className="dashboard-grid">
        <div className="dashboard-feed">
          <h3>Fil d&apos;actualité</h3>
          <div className="dashboard-feed-list">
            {feedItems.slice(0, 5).map((item, i) => (
              <Link key={i} href={item.href} className="dashboard-feed-item">
                <div className="dashboard-feed-item-body">
                  <span className="dashboard-feed-item-title">{item.title}</span>
                  <span className="dashboard-feed-item-meta">
                    {item.author && `${item.author} · `}{formatDate(item.time)}
                  </span>
                </div>
                <span className={`tag tag-${item.type === "forum" ? "info" : item.type === "entraide" ? "propose" : "ag"}`}>
                  {item.type === "forum" ? "Forum" : item.type === "entraide" ? "Entraide" : "Événement"}
                </span>
              </Link>
            ))}
          </div>
          {hasMore && (
            <details className="dashboard-feed-more">
              <summary className="dashboard-feed-more-toggle">Voir plus ({feedItems.length - 5} autres)</summary>
              <div className="dashboard-feed-list" style={{ marginTop: 8 }}>
                {feedItems.slice(5).map((item, i) => (
                  <Link key={i} href={item.href} className="dashboard-feed-item">
                    <div className="dashboard-feed-item-body">
                      <span className="dashboard-feed-item-title">{item.title}</span>
                      <span className="dashboard-feed-item-meta">
                        {item.author && `${item.author} · `}{formatDate(item.time)}
                      </span>
                    </div>
                    <span className={`tag tag-${item.type === "forum" ? "info" : item.type === "entraide" ? "propose" : "ag"}`}>
                      {item.type === "forum" ? "Forum" : item.type === "entraide" ? "Entraide" : "Événement"}
                    </span>
                  </Link>
                ))}
              </div>
            </details>
          )}
        </div>

        <div className="dashboard-shortcuts">
          <h3>Raccourcis</h3>
          <div className="dashboard-shortcuts-list">
            {shortcuts.map((s) => {
              const Icon = s.icon;
              return (
                <a key={s.path} href={s.path} className="dashboard-shortcut">
                  <Icon size={20} />
                  {s.label}
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
