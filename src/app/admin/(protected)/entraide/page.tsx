import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import { entraideListings, users } from "@/lib/schema";
import { desc, eq } from "drizzle-orm";
import DeleteButton from "../delete-button";

export default async function AdminEntraidePage() {
  const session = await getSession();
  if (!session || session.role !== "admin") redirect("/admin/login");

  const db = getDb()!;
  const listings = db.select({
    id: entraideListings.id,
    type: entraideListings.type,
    title: entraideListings.title,
    category: entraideListings.category,
    authorName: users.firstName,
    authorFloor: users.floor,
    createdAt: entraideListings.createdAt,
  }).from(entraideListings).innerJoin(users, eq(entraideListings.authorId, users.id))
    .orderBy(desc(entraideListings.createdAt)).all();

  return (
    <>
      <h1>Entraide ({listings.length} annonces)</h1>
      <table className="table">
        <thead>
          <tr>
            <th>Titre</th>
            <th>Type</th>
            <th>Catégorie</th>
            <th>Auteur</th>
            <th>Date</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {listings.map((l) => (
            <tr key={l.id}>
              <td>{l.title}</td>
              <td>
                <span className={`badge ${l.type === "propose" ? "badgeInfo" : "badgeWarning"}`}>
                  {l.type === "propose" ? "Propose" : "Cherche"}
                </span>
              </td>
              <td>{l.category}</td>
              <td>{l.authorName} ({l.authorFloor}e)</td>
              <td>{l.createdAt}</td>
              <td>
                <DeleteButton table="entraide_listings" id={l.id} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
