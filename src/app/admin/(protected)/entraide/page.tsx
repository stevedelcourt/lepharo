import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import { entraideListings, users } from "@/lib/schema";
import { desc, eq } from "drizzle-orm";
import { fallbackAdminListings } from "@/lib/fallback-data";
import { IconHandshake } from "@/components/icons";
import { DeleteButton, EditButton, ModerateButton } from "../admin-actions";

export default async function AdminEntraidePage() {
  const session = await getSession();
  if (!session || session.role !== "admin") redirect("/admin/login");

  const db = getDb();
  const listings = db ? await db.select({
    id: entraideListings.id,
    type: entraideListings.type,
    title: entraideListings.title,
    category: entraideListings.category,
    description: entraideListings.description,
    authorName: users.firstName,
    authorFloor: users.floor,
    createdAt: entraideListings.createdAt,
    images: entraideListings.images,
  }).from(entraideListings).innerJoin(users, eq(entraideListings.authorId, users.id))
    .orderBy(desc(entraideListings.createdAt)).all() : fallbackAdminListings;

  return (
    <>
      <h1><IconHandshake size={24} /> Entraide ({listings.length} annonces)</h1>
      <table className="admin-table">
        <thead>
          <tr>
            <th>Titre</th>
            <th>Type</th>
            <th>Catégorie</th>
            <th>Auteur</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {listings.map((l) => (
            <tr key={l.id}>
              <td style={{ fontWeight: 600 }}>{l.title}</td>
              <td>
                <span className={`tag ${l.type === "propose" ? "tag-propose" : "tag-cherche"}`}>
                  {l.type === "propose" ? "Propose" : "Cherche"}
                </span>
              </td>
              <td>{l.category}</td>
              <td>{l.authorName} ({l.authorFloor}e)</td>
              <td>{l.createdAt}</td>
              <td>
                <div className="input-group" style={{ gap: 4 }}>
                  <EditButton table="entraide_listings" id={l.id} fields={[
                    { label: "Titre", key: "title", type: "text", default: l.title },
                    { label: "Description", key: "description", type: "textarea", default: l.description },
                    { label: "Type", key: "type", type: "select", options: [{ value: "propose", label: "Propose" }, { value: "cherche", label: "Cherche" }], default: l.type },
                    { label: "Catégorie", key: "category", type: "text", default: l.category },
                  ]} />
                  <ModerateButton table="entraide_listings" id={l.id} field="status" label="Fermer/Rouvrir" value={l.createdAt} />
                  <DeleteButton table="entraide_listings" id={l.id} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
