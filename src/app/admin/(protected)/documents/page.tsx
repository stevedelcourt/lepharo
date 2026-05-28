import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import { documents } from "@/lib/schema";
import { desc } from "drizzle-orm";
import { fallbackDocuments } from "@/lib/fallback-data";
import { IconFolder } from "@/components/icons";
import { DeleteButton, EditButton } from "../admin-actions";
import AdminDocumentsForm from "./form";

export default async function AdminDocumentsPage() {
  const session = await getSession();
  if (!session || session.role !== "admin") redirect("/admin/login");

  const db = getDb();
  const docs = db ? await db.select().from(documents).orderBy(desc(documents.date)).all() : fallbackDocuments;

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h1 style={{ margin: 0 }}><IconFolder size={24} /> Documents ({docs.length})</h1>
        <AdminDocumentsForm />
      </div>
      <table className="admin-table">
        <thead>
          <tr>
            <th>Titre</th>
            <th>Catégorie</th>
            <th>Pages</th>
            <th>Date</th>
            <th>Fichier</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {docs.map((d: any) => (
            <tr key={d.id}>
              <td style={{ fontWeight: 600 }}>{d.title}</td>
              <td><span className="tag">{d.category}</span></td>
              <td>{d.pages}</td>
              <td>{d.date}</td>
              <td>{d.fileUrl ? <a href={d.fileUrl} target="_blank" className="btn btn-ghost btn-sm" style={{ fontSize: "0.8125rem" }}>Télécharger</a> : "—"}</td>
              <td>
                <div className="input-group" style={{ gap: 4 }}>
                  <EditButton table="documents" id={d.id} fields={[
                    { label: "Titre", key: "title", type: "text", default: d.title },
                    { label: "Catégorie", key: "category", type: "text", default: d.category },
                    { label: "Pages", key: "pages", type: "number", default: d.pages },
                    { label: "Date", key: "date", type: "text", default: d.date },
                  ]} />
                  <DeleteButton table="documents" id={d.id} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
