import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import { users, forumTopics, entraideListings, documents, events, alerts } from "@/lib/schema";
import { count } from "drizzle-orm";
import { IconUsers, IconForum, IconHandshake, IconFolder, IconCalendar, IconBell, IconHome } from "@/components/icons";

export default async function AdminDashboard() {
  const session = await getSession();
  if (!session || session.role !== "admin") redirect("/admin/login");

  const db = getDb();

  let statCards: { label: string; value: number; icon: React.ComponentType<{ size?: number }> }[];
  if (db) {
    const u = (await db.select({ value: count() }).from(users).get())!;
    const t = (await db.select({ value: count() }).from(forumTopics).get())!;
    const l = (await db.select({ value: count() }).from(entraideListings).get())!;
    const d = (await db.select({ value: count() }).from(documents).get())!;
    const e = (await db.select({ value: count() }).from(events).get())!;
    const a = (await db.select({ value: count() }).from(alerts).get())!;
    statCards = [
      { label: "Utilisateurs", value: u.value, icon: IconUsers },
      { label: "Sujets du forum", value: t.value, icon: IconForum },
      { label: "Annonces d'entraide", value: l.value, icon: IconHandshake },
      { label: "Documents", value: d.value, icon: IconFolder },
      { label: "Événements", value: e.value, icon: IconCalendar },
      { label: "Alertes", value: a.value, icon: IconBell },
    ];
  } else {
    statCards = [
      { label: "Utilisateurs", value: 11, icon: IconUsers },
      { label: "Sujets du forum", value: 5, icon: IconForum },
      { label: "Annonces d'entraide", value: 6, icon: IconHandshake },
      { label: "Documents", value: 8, icon: IconFolder },
      { label: "Événements", value: 4, icon: IconCalendar },
      { label: "Alertes", value: 2, icon: IconBell },
    ];
  }

  return (
    <>
      <h1>
        <IconHome size={24} /> Tableau de bord
      </h1>
      <p style={{ fontSize: "0.85rem", color: "var(--color-text-tertiary)", marginBottom: "2rem" }}>
        Bienvenue, {session.firstName}. Voici un aperçu de votre site.
      </p>
      <div className="admin-grid">
        {statCards.map((s) => {
          const Icon = s.icon;
          return (
            <div className="admin-card" key={s.label}>
              <div className="admin-card-icon">
                <Icon size={24} />
              </div>
              <div className="admin-card-body">
                <h3>{s.label}</h3>
                <p className="number">{s.value}</p>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
