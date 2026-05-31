import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getDb } from "@/lib/db";
import { events, users } from "@/lib/schema";
import { asc, desc, eq } from "drizzle-orm";
import { fallbackAdminEvents } from "@/lib/fallback-data";
import { IconCalendar } from "@/components/icons";
import { DeleteButton, EditButton } from "../admin-actions";

export default async function AdminEventsPage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string; order?: string }>;
}) {
  const session = await getSession();
  if (!session || session.role !== "admin") redirect("/admin/login");

  const params = await searchParams;
  const rawSort = params?.sort;
  const sort = rawSort === "date" ? "date" : "date";
  const order = params?.order === "asc" ? "asc" : "desc";

  const db = getDb();
  const orderBy = order === "asc" ? asc(events.date) : desc(events.date);
  const allEvents = db ? await db.select({
    id: events.id,
    title: events.title,
    type: events.type,
    date: events.date,
    authorName: users.firstName,
  }).from(events).innerJoin(users, eq(events.authorId, users.id))
    .orderBy(orderBy).all() : fallbackAdminEvents;

  function toggle() { return order === "asc" ? "desc" : "asc"; }

  return (
    <>
      <h1><IconCalendar size={24} /> Événements ({allEvents.length})</h1>
      <table className="admin-table">
        <thead>
          <tr>
            <th>Titre</th>
            <th>Type</th>
            <th>
              <Link
                href={`/admin/evenements?sort=date&order=${toggle()}`}
                style={{ display: "inline-flex", alignItems: "center", gap: 4, textDecoration: "none", color: "inherit" }}
              >
                Date
                {order === "asc" ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"/></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                )}
              </Link>
            </th>
            <th>Auteur</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {allEvents.map((e) => (
            <tr key={e.id}>
              <td style={{ fontWeight: 600 }}>{e.title}</td>
              <td><span className="tag">{e.type}</span></td>
              <td>{e.date}</td>
              <td>{e.authorName}</td>
              <td>
                <div className="input-group" style={{ gap: 4 }}>
                  <EditButton table="events" id={e.id} fields={[
                    { label: "Titre", key: "title", type: "text", default: e.title },
                    { label: "Date", key: "date", type: "text", default: e.date },
                    { label: "Type", key: "type", type: "text", default: e.type },
                  ]} />
                  <DeleteButton table="events" id={e.id} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
