import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import { users, forumTopics, entraideListings, documents, events, alerts } from "@/lib/schema";
import { count } from "drizzle-orm";

export default async function AdminDashboard() {
  const session = await getSession();
  if (!session || session.role !== "admin") redirect("/admin/login");

  const db = getDb();
  const u = db.select({ value: count() }).from(users).get()!;
  const t = db.select({ value: count() }).from(forumTopics).get()!;
  const l = db.select({ value: count() }).from(entraideListings).get()!;
  const d = db.select({ value: count() }).from(documents).get()!;
  const e = db.select({ value: count() }).from(events).get()!;
  const a = db.select({ value: count() }).from(alerts).get()!;

  const statCards = [
    { label: "Utilisateurs", value: u.value },
    { label: "Sujets du forum", value: t.value },
    { label: "Annonces d'entraide", value: l.value },
    { label: "Documents", value: d.value },
    { label: "Événements", value: e.value },
    { label: "Alertes", value: a.value },
  ];

  return (
    <>
      <h1>Tableau de bord</h1>
      <p style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", marginBottom: "2rem" }}>
        Bienvenue, {session.firstName}. Voici un aperçu de votre site.
      </p>
      <div className="grid">
        {statCards.map((s) => (
          <div className="card" key={s.label}>
            <h3>{s.label}</h3>
            <p className="number">{s.value}</p>
          </div>
        ))}
      </div>
    </>
  );
}
