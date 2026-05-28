import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import { alerts, users } from "@/lib/schema";
import { desc, eq } from "drizzle-orm";
import DeleteButton from "../delete-button";
import { fallbackAdminAlerts } from "@/lib/fallback-data";
import { IconBell } from "@/components/icons";

export default async function AdminAlertsPage() {
  const session = await getSession();
  if (!session || session.role !== "admin") redirect("/admin/login");

  const db = getDb();
  const allAlerts = db ? await db.select({
    id: alerts.id,
    message: alerts.message,
    type: alerts.type,
    active: alerts.active,
    authorName: users.firstName,
    createdAt: alerts.createdAt,
  }).from(alerts).innerJoin(users, eq(alerts.createdBy, users.id))
    .orderBy(desc(alerts.createdAt)).all() : fallbackAdminAlerts;

  return (
    <>
      <h1><IconBell size={24} /> Alertes ({allAlerts.length})</h1>
      <table className="admin-table">
        <thead>
          <tr>
            <th>Message</th>
            <th>Type</th>
            <th>Active</th>
            <th>Créé par</th>
            <th>Date</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {allAlerts.map((a) => (
            <tr key={a.id}>
              <td style={{ fontWeight: 600 }}>{a.message}</td>
              <td>
                <span className={`tag ${a.type === "warning" ? "tag-warning" : ""}`}>
                  {a.type}
                </span>
              </td>
              <td>{a.active ? "Oui" : "Non"}</td>
              <td>{a.authorName}</td>
              <td>{a.createdAt}</td>
              <td>
                <DeleteButton table="alerts" id={a.id} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
