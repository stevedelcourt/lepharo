import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getDb } from "@/lib/db";
import { entraideListings, users } from "@/lib/schema";
import { asc, desc, eq } from "drizzle-orm";
import { fallbackAdminListings } from "@/lib/fallback-data";
import { IconHandshake } from "@/components/icons";
import { DeleteButton, EditButton, ModerateButton } from "../admin-actions";

const SORTABLE: Record<string, any> = {
  title: entraideListings.title,
  type: entraideListings.type,
  category: entraideListings.category,
  status: entraideListings.status,
  createdAt: entraideListings.createdAt,
};

const LABELS: Record<string, string> = {
  title: "Titre",
  type: "Type",
  category: "Catégorie",
  status: "Statut",
  createdAt: "Date",
};

export default async function AdminEntraidePage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string; order?: string }>;
}) {
  const session = await getSession();
  if (!session || session.role !== "admin") redirect("/admin/login");

  const params = await searchParams;
  const rawSort = params.sort;
  const sort = rawSort && rawSort in SORTABLE ? rawSort : "createdAt";
  const order = params.order === "asc" ? "asc" : "desc";

  const db = getDb();
  const orderBy = order === "asc" ? asc(SORTABLE[sort]) : desc(SORTABLE[sort]);

  const listings = db ? await db.select({
    id: entraideListings.id,
    type: entraideListings.type,
    title: entraideListings.title,
    category: entraideListings.category,
    description: entraideListings.description,
    status: entraideListings.status,
    authorName: users.firstName,
    authorFloor: users.floor,
    createdAt: entraideListings.createdAt,
    images: entraideListings.images,
  }).from(entraideListings).innerJoin(users, eq(entraideListings.authorId, users.id))
    .orderBy(orderBy).all() : fallbackAdminListings;

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
          href={`/admin/entraide?sort=${col}&order=${toggle(col)}`}
          style={{ display: "inline-flex", alignItems: "center", gap: 4, textDecoration: "none", color: "inherit" }}
        >
          {LABELS[col]} <SortIcon col={col} />
        </Link>
      </th>
    );
  }

  return (
    <>
      <h1><IconHandshake size={24} /> Entraide ({listings.length} annonces)</h1>
      <table className="admin-table">
        <thead>
          <tr>
            <Th col="title" />
            <Th col="type" />
            <Th col="category" />
            <Th col="status" />
            <th>Auteur</th>
            <Th col="createdAt" />
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
              <td>{l.status === "open" ? <span className="tag">Ouvert</span> : <span className="tag tag-closed">Fermée</span>}</td>
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
                  <ModerateButton table="entraide_listings" id={l.id} field="status" label={l.status === "open" ? "Fermer l'annonce" : "Rouvrir l'annonce"} value={l.status} />
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
