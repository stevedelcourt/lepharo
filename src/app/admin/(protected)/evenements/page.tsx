import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import { events, users } from "@/lib/schema";
import { desc, eq } from "drizzle-orm";
import { fallbackAdminEvents } from "@/lib/fallback-data";
import { IconCalendar } from "@/components/icons";
import { DeleteButton, EditButton } from "../admin-actions";

export default async function AdminEventsPage() {
  const session = await getSession();
  if (!session || session.role !== "admin") redirect("/admin/login");

  const db = getDb();
  const allEvents = db ? await db.select({
    id: events.id,
    title: events.title,
    type: events.type,
    date: events.date,
    authorName: users.firstName,
  }).from(events).innerJoin(users, eq(events.authorId, users.id))
    .orderBy(desc(events.date)).all() : fallbackAdminEvents;

  return (
    <>
      <h1><IconCalendar size={24} /> Événements ({allEvents.length})</h1>
      <table className="admin-table">
        <thead>
          <tr>
            <th>Titre</th>
            <th>Type</th>
            <th>Date</th>
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
