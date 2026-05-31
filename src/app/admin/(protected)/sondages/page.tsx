import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import { polls, users } from "@/lib/schema";
import { desc, eq } from "drizzle-orm";
import { IconPoll } from "@/components/icons";
import { DeleteButton, EditButton } from "../admin-actions";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminSondagesPage() {
  const session = await getSession();
  if (!session || session.role !== "admin") redirect("/admin/login");

  const db = getDb();

  const allPolls = db ? await db.select({
    id: polls.id,
    question: polls.question,
    createdAt: polls.createdAt,
    authorName: users.firstName,
    authorFloor: users.floor,
  }).from(polls).innerJoin(users, eq(polls.authorId, users.id))
    .orderBy(desc(polls.createdAt)).all() : [];

  return (
    <>
      <h1><IconPoll size={24} /> Sondages ({allPolls.length})</h1>
      <table className="admin-table">
        <thead>
          <tr>
            <th>Question</th>
            <th>Auteur</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {allPolls.map((p) => (
            <tr key={p.id}>
              <td style={{ fontWeight: 600 }}>{p.question}</td>
              <td>{p.authorName}{p.authorFloor ? ` (${p.authorFloor}e)` : ""}</td>
              <td>{formatDate(p.createdAt)}</td>
              <td>
                <div className="input-group" style={{ gap: 4 }}>
                  <EditButton table="polls" id={p.id} fields={[
                    { label: "Question", key: "question", type: "text", default: p.question },
                  ]} />
                  <DeleteButton table="polls" id={p.id} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {allPolls.length === 0 && (
        <p style={{ color: "var(--color-text-tertiary)", textAlign: "center", padding: 40 }}>Aucun sondage.</p>
      )}
    </>
  );
}
