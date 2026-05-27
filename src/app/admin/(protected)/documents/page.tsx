import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import { documents } from "@/lib/schema";
import { desc } from "drizzle-orm";
import DeleteButton from "../delete-button";
import { fallbackDocuments } from "@/lib/fallback-data";

export default async function AdminDocumentsPage() {
  const session = await getSession();
  if (!session || session.role !== "admin") redirect("/admin/login");

  const db = getDb();
  const docs = db ? db.select().from(documents).orderBy(desc(documents.date)).all() : fallbackDocuments;

  return (
    <>
      <h1>Documents ({docs.length})</h1>
      <table className="table">
        <thead>
          <tr>
            <th>Titre</th>
            <th>Categorie</th>
            <th>Pages</th>
            <th>Date</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {docs.map((d) => (
            <tr key={d.id}>
              <td>{d.title}</td>
              <td><span className="badge">{d.category}</span></td>
              <td>{d.pages}</td>
              <td>{d.date}</td>
              <td>
                <DeleteButton table="documents" id={d.id} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
