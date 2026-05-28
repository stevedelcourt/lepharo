import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import { users } from "@/lib/schema";
import { asc } from "drizzle-orm";
import DeleteButton from "../delete-button";
import { fallbackAdminUsers } from "@/lib/fallback-data";
import { IconUsers, IconShield } from "@/components/icons";

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
            <th>Action</th>
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
                <DeleteButton table="users" id={user.id} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
