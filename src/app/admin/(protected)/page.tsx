import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getDb } from "@/lib/db";
import { users, forumTopics, entraideListings, documents, events, alerts, reports, moderationFlags } from "@/lib/schema";
import { count, eq, desc } from "drizzle-orm";
import { IconUsers, IconForum, IconHandshake, IconFolder, IconCalendar, IconBell, IconHome, IconWarning } from "@/components/icons";
import { formatDate } from "@/lib/utils";

export default async function AdminDashboard() {
  const session = await getSession();
  if (!session || session.role !== "admin") redirect("/admin/login");

  const db = getDb();

  let statCards: { label: string; value: number; icon: React.ComponentType<{ size?: number }>; href: string }[];
  let unresolvedFlags: { id: number; targetType: string; targetId: number; reason: string; score: number | null; categories: string | null; createdAt: string }[] = [];

  if (db) {
    const u = (await db.select({ value: count() }).from(users).get())!;
    const t = (await db.select({ value: count() }).from(forumTopics).get())!;
    const l = (await db.select({ value: count() }).from(entraideListings).get())!;
    const d = (await db.select({ value: count() }).from(documents).get())!;
    const e = (await db.select({ value: count() }).from(events).get())!;
    const a = (await db.select({ value: count() }).from(alerts).get())!;
    let rVal = 0;
    try {
      const r = await db.select({ value: count() }).from(reports).where(eq(reports.resolved, false)).get();
      rVal = r?.value || 0;
    } catch {}

    let autoFlags: any[] = [];
    try {
      autoFlags = await db.select({
        id: moderationFlags.id,
        targetType: moderationFlags.targetType,
        targetId: moderationFlags.targetId,
        reason: moderationFlags.reason,
        score: moderationFlags.score,
        categories: moderationFlags.categories,
        createdAt: moderationFlags.createdAt,
      }).from(moderationFlags).where(eq(moderationFlags.resolved, false)).orderBy(desc(moderationFlags.createdAt)).limit(10).all();
    } catch {}
    unresolvedFlags = autoFlags;

    statCards = [
      { label: "Utilisateurs", value: u.value, icon: IconUsers, href: "/admin/utilisateurs" },
      { label: "Sujets du forum", value: t.value, icon: IconForum, href: "/admin/forum" },
      { label: "Annonces d'entraide", value: l.value, icon: IconHandshake, href: "/admin/entraide" },
      { label: "Documents", value: d.value, icon: IconFolder, href: "/admin/documents" },
      { label: "Événements", value: e.value, icon: IconCalendar, href: "/admin/evenements" },
      { label: "Alertes", value: a.value, icon: IconBell, href: "/admin/alertes" },
      { label: "Signalements", value: rVal + unresolvedFlags.length, icon: IconWarning, href: "/admin/signalements" },
    ];
  } else {
    statCards = [
      { label: "Utilisateurs", value: 11, icon: IconUsers, href: "/admin/utilisateurs" },
      { label: "Sujets du forum", value: 5, icon: IconForum, href: "/admin/forum" },
      { label: "Annonces d'entraide", value: 6, icon: IconHandshake, href: "/admin/entraide" },
      { label: "Documents", value: 8, icon: IconFolder, href: "/admin/documents" },
      { label: "Événements", value: 4, icon: IconCalendar, href: "/admin/evenements" },
      { label: "Alertes", value: 2, icon: IconBell, href: "/admin/alertes" },
      { label: "Signalements", value: 0, icon: IconWarning, href: "/admin/signalements" },
    ];
  }

  const typeLabels: Record<string, string> = {
    listing: "Annonce", forum_topic: "Sujet forum", forum_reply: "Réponse forum",
    listing_message: "Message annonce", private_message: "Message privé",
  };

  return (
    <>
      <h1><IconHome size={24} /> Tableau de bord</h1>
      <p style={{ fontSize: "0.85rem", color: "var(--color-text-tertiary)", marginBottom: "2rem" }}>
        Bienvenue, {session.firstName}. Voici un aperçu de votre site.
      </p>

      <div className="admin-grid">
        {statCards.map((s) => {
          const Icon = s.icon;
          return (
            <Link href={s.href} key={s.label} className="admin-card" style={{ textDecoration: "none", color: "inherit", display: "flex", alignItems: "center", gap: 16, padding: "1.25rem" }}>
              <div className="admin-card-icon"><Icon size={24} /></div>
              <div className="admin-card-body" style={{ flex: 1 }}>
                <h3>{s.label}</h3>
                <p className="number">{s.value}</p>
              </div>
            </Link>
          );
        })}
      </div>

      <h2 style={{ fontSize: "1.125rem", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
        <IconWarning size={20} /> Signalements en attente ({unresolvedFlags.length})
      </h2>

      {unresolvedFlags.length === 0 ? (
        <div className="card" style={{ padding: 24, textAlign: "center" }}>
          <p style={{ color: "var(--color-text-secondary)", margin: 0 }}>Aucun signalement en attente.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {unresolvedFlags.map((f) => {
            const cats: string[] = (() => { try { return JSON.parse(f.categories || "[]"); } catch { return []; } })();
            return (
              <div key={f.id} className="card" style={{ padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, borderLeft: "3px solid var(--color-error)" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2, flexWrap: "wrap" }}>
                    <span className="tag" style={{ fontSize: "0.7rem" }}>{typeLabels[f.targetType] || f.targetType}</span>
                    <span className="tag" style={{ background: (f.score || 0) >= 50 ? "var(--color-error-light)" : "var(--color-warning-light)", color: (f.score || 0) >= 50 ? "var(--color-error)" : "var(--color-warning)", fontSize: "0.7rem", fontWeight: 700 }}>{f.score || 0}/100</span>
                    {cats.slice(0, 3).map((c: string) => (
                      <span key={c} className="tag" style={{ fontSize: "0.65rem", background: "var(--color-bg-alt)" }}>{c}</span>
                    ))}
                  </div>
                  <p style={{ fontSize: "0.875rem", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.reason}</p>
                </div>
                <Link href="/admin/signalements" className="btn-ghost btn-sm" style={{ fontSize: "0.8125rem", flexShrink: 0, textDecoration: "none" }}>
                  Voir tout
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
