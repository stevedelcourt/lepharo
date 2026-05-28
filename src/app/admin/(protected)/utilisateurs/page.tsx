import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import { users } from "@/lib/schema";
import { asc } from "drizzle-orm";
import { fallbackAdminUsers } from "@/lib/fallback-data";
import { IconUsers, IconShield } from "@/components/icons";
import { DeleteButton, EditButton, WarnButton, ModerateButton } from "../admin-actions";

export default async function AdminUsersPage() {
  const session = await getSession();
  if (!session || session.role !== "admin") redirect("/admin/login");

  const db = getDb();
  const allUsers = db ? await db.select().from(users).orderBy(asc(users.floor)).all() : fallbackAdminUsers;

  return (
    <>
      <h1><IconUsers size={24} /> Utilisateurs ({allUsers.length})</h1>
      <table className="admin-table">
        <thead>
          <tr>
            <th>Nom</th>
            <th>Email</th>
            <th>Étage</th>
            <th>Rôle</th>
            <th>Vérifié</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {allUsers.map((user) => (
            <tr key={user.id}>
              <td style={{ fontWeight: 600 }}>{user.firstName} {user.lastName}</td>
              <td>{user.email}</td>
              <td>{user.floor}e</td>
              <td>
                {user.role === "admin" ? (
                  <span className="tag" style={{ background: "var(--color-primary-light)", color: "var(--color-primary)" }}>
                    <IconShield size={14} /> Admin
                  </span>
                ) : (
                  <span className="tag">Résident</span>
                )}
              </td>
              <td>{user.verified ? "Oui" : "Non"}</td>
              <td>
                <div className="input-group" style={{ gap: 4 }}>
                  <EditButton table="users" id={user.id} fields={[
                    { label: "Prénom", key: "first_name", type: "text", default: user.firstName },
                    { label: "Nom", key: "last_name", type: "text", default: user.lastName },
                    { label: "Email", key: "email", type: "text", default: user.email },
                    { label: "Étage", key: "floor", type: "number", default: user.floor },
                    { label: "Rôle", key: "role", type: "select", options: [{ value: "resident", label: "Résident" }, { value: "admin", label: "Admin" }], default: user.role },
                    { label: "Vérifié", key: "verified", type: "boolean", default: user.verified },
                  ]} />
                  {user.role !== "admin" && <WarnButton userId={user.id} userName={`${user.firstName} ${user.lastName}`} />}
                  <ModerateButton table="users" id={user.id} field="verified" label={user.verified ? "Marquer comme non vérifié" : "Marquer comme vérifié"} value={user.verified} />
                  <DeleteButton table="users" id={user.id} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
