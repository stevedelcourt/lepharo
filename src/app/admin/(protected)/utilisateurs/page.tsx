import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getDb } from "@/lib/db";
import { users } from "@/lib/schema";
import { asc, desc } from "drizzle-orm";
import { fallbackAdminUsers } from "@/lib/fallback-data";
import { IconUsers, IconShield } from "@/components/icons";
import { DeleteButton, EditButton, WarnButton, ModerateButton } from "../admin-actions";
import { PromoteAdminButton } from "../promote-admin";
import { CreateUserButton } from "../create-user";

const SORTABLE: Record<string, any> = {
  firstName: users.firstName,
  lastName: users.lastName,
  email: users.email,
  floor: users.floor,
  role: users.role,
  verified: users.verified,
};

const LABELS: Record<string, string> = {
  firstName: "Prénom",
  lastName: "Nom",
  email: "Email",
  floor: "Étage",
  role: "Rôle",
  verified: "Vérifié",
};

const roleLabels: Record<string, string> = { superadmin: "Super Admin", moderator: "Modérateur", editor: "Éditeur" };
const roleColors: Record<string, string> = { superadmin: "#dc2626", moderator: "#0891b2", editor: "#7c3aed" };

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string; order?: string }>;
}) {
  const session = await getSession();
  if (!session || session.role !== "admin") redirect("/admin/login");
  const isSuper = (session as any).adminRole === "superadmin" || !(session as any).adminRole;

  const params = await searchParams;
  const rawSort = params.sort;
  const sort = rawSort && rawSort in SORTABLE ? rawSort : "floor";
  const order = params.order === "asc" ? "asc" : "desc";

  const db = getDb();
  const orderBy = order === "asc" ? asc(SORTABLE[sort]) : desc(SORTABLE[sort]);
  const allUsers = db ? await db.select().from(users).orderBy(orderBy).all() : fallbackAdminUsers;

  function toggle(col: string) {
    if (col === sort) return order === "asc" ? "desc" : "asc";
    return "asc";
  }

  function SortIcon({ col }: { col: string }) {
    if (col !== sort) return null;
    return order === "asc" ? (
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"/></svg>
    ) : (
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
    );
  }

  function Th({ col }: { col: string }) {
    return (
      <th>
        <Link
          href={`/admin/utilisateurs?sort=${col}&order=${toggle(col)}`}
          style={{ display: "inline-flex", alignItems: "center", gap: 4, textDecoration: "none", color: "inherit" }}
        >
          {LABELS[col]} <SortIcon col={col} />
        </Link>
      </th>
    );
  }

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h1 style={{ margin: 0 }}><IconUsers size={24} /> Utilisateurs ({allUsers.length})</h1>
        <CreateUserButton />
      </div>
      <table className="admin-table">
        <thead>
          <tr>
            <Th col="firstName" />
            <Th col="lastName" />
            <Th col="email" />
            <Th col="floor" />
            <Th col="role" />
            <Th col="verified" />
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {allUsers.map((user) => {
            const adminRole = (user as any).adminRole;
            return (
              <tr key={user.id}>
                <td style={{ fontWeight: 600 }}>{user.firstName} {user.lastName}</td>
                <td>{user.email}</td>
                <td>{user.floor}e</td>
                <td>
                  {adminRole ? (
                    <span className="tag" style={{ background: `${roleColors[adminRole] || "var(--color-primary)"}20`, color: roleColors[adminRole] || "var(--color-primary)" }}>
                      <IconShield size={14} /> {roleLabels[adminRole] || adminRole}
                    </span>
                  ) : user.role === "admin" ? (
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
                    {isSuper && <PromoteAdminButton userId={user.id} userName={`${user.firstName} ${user.lastName}`} currentRole={adminRole} />}
                    {!adminRole && <WarnButton userId={user.id} userName={`${user.firstName} ${user.lastName}`} />}
                    <ModerateButton table="users" id={user.id} field="verified" label={user.verified ? "Marquer non vérifié" : "Marquer vérifié"} value={user.verified} />
                    <DeleteButton table="users" id={user.id} />
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </>
  );
}
