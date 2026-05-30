import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import { forumRubriques } from "@/lib/schema";
import { asc } from "drizzle-orm";
import { IconBook } from "@/components/icons";
import { DeleteButton, EditButton } from "../admin-actions";

export default async function AdminRubriquesPage() {
  const session = await getSession();
  if (!session || session.role !== "admin") redirect("/admin/login");

  const db = getDb();
  const rubriques = db ? await db.select().from(forumRubriques).orderBy(asc(forumRubriques.name)).all() : [];

  return (
    <>
      <h1><IconBook size={24} /> Rubriques du forum ({rubriques.length})</h1>
      <table className="admin-table">
        <thead>
          <tr>
            <th>Nom</th>
            <th>Slug</th>
            <th>Description</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rubriques.map((r) => (
            <tr key={r.id}>
              <td style={{ fontWeight: 600 }}>{r.name}</td>
              <td><code>{r.slug}</code></td>
              <td style={{ color: "var(--color-text-secondary)", fontSize: "0.875rem" }}>{r.description || "-"}</td>
              <td>
                <div className="input-group" style={{ gap: 4 }}>
                  <EditButton table="forum_rubriques" id={r.id} fields={[
                    { label: "Nom", key: "name", type: "text", default: r.name },
                    { label: "Slug", key: "slug", type: "text", default: r.slug },
                    { label: "Description", key: "description", type: "text", default: r.description },
                  ]} />
                  <DeleteButton table="forum_rubriques" id={r.id} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
