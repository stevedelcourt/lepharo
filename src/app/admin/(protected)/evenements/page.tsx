import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import { events, users } from "@/lib/schema";
import { desc, eq } from "drizzle-orm";
import DeleteButton from "../delete-button";
import { fallbackAdminEvents } from "@/lib/fallback-data";

export default async function AdminEventsPage() {
  const session = await getSession();
  if (!session || session.role !== "admin") redirect("/admin/login");

  const db = getDb();
  const allEvents = db ? db.select({
    id: events.id,
    title: events.title,
    type: events.type,
    date: events.date,
    authorName: users.firstName,
  }).from(events).innerJoin(users, eq(events.authorId, users.id))
    .orderBy(desc(events.date)).all() : fallbackAdminEvents;

  return (
    <>
      <h1>Evenements ({allEvents.length})</h1>
      <table className="table">
        <thead>
          <tr>
            <th>Titre</th>
            <th>Type</th>
            <th>Date</th>
            <th>Auteur</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {allEvents.map((e) => (
            <tr key={e.id}>
              <td>{e.title}</td>
              <td><span className="badge">{e.type}</span></td>
              <td>{e.date}</td>
              <td>{e.authorName}</td>
              <td>
                <DeleteButton table="events" id={e.id} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
