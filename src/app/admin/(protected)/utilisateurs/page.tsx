import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import { users } from "@/lib/schema";
import { asc } from "drizzle-orm";
import DeleteButton from "../delete-button";

export default async function AdminUsersPage() {
  const session = await getSession();
  if (!session || session.role !== "admin") redirect("/admin/login");

  const db = getDb();
  const allUsers = db.select().from(users).orderBy(asc(users.floor)).all();

  return (
    <>
      <h1>Utilisateurs ({allUsers.length})</h1>
      <table className="table">
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
              <td>{user.firstName} {user.lastName}</td>
              <td>{user.email}</td>
              <td>{user.floor}e</td>
              <td>
                <span className={`badge ${user.role === "admin" ? "badgeAdmin" : ""}`}>
                  {user.role === "admin" ? "Admin" : "Résident"}
                </span>
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
