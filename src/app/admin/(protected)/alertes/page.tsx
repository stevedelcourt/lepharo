import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import { alerts, users } from "@/lib/schema";
import { desc, eq } from "drizzle-orm";
import { fallbackAdminAlerts } from "@/lib/fallback-data";
import { IconBell } from "@/components/icons";
import { DeleteButton, EditButton, ModerateButton } from "../admin-actions";

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
            <th>Actions</th>
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
                <div className="input-group" style={{ gap: 4 }}>
                  <EditButton table="alerts" id={a.id} fields={[
                    { label: "Message", key: "message", type: "text", default: a.message },
                    { label: "Type", key: "type", type: "select", options: [{ value: "info", label: "Info" }, { value: "warning", label: "Warning" }], default: a.type },
                    { label: "Active", key: "active", type: "boolean", default: a.active },
                  ]} />
                  <ModerateButton table="alerts" id={a.id} field="active" label={a.active ? "Désactiver" : "Activer"} value={a.active} />
                  <DeleteButton table="alerts" id={a.id} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
