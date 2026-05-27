import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import { forumTopics, users } from "@/lib/schema";
import { desc, eq } from "drizzle-orm";
import DeleteButton from "../delete-button";

export default async function AdminForumPage() {
  const session = await getSession();
  if (!session || session.role !== "admin") redirect("/admin/login");

  const db = getDb()!;
  const topics = db.select({
    id: forumTopics.id,
    title: forumTopics.title,
    rubrique: forumTopics.rubrique,
    authorName: users.firstName,
    authorFloor: users.floor,
    pinned: forumTopics.pinned,
    createdAt: forumTopics.createdAt,
  }).from(forumTopics).innerJoin(users, eq(forumTopics.authorId, users.id))
    .orderBy(desc(forumTopics.createdAt)).all();

  return (
    <>
      <h1>Forum ({topics.length} sujets)</h1>
      <table className="table">
        <thead>
          <tr>
            <th>Titre</th>
            <th>Rubrique</th>
            <th>Auteur</th>
            <th>Date</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {topics.map((t) => (
            <tr key={t.id}>
              <td>{t.title}{t.pinned ? " 📌" : ""}</td>
              <td><span className="badge">{t.rubrique}</span></td>
              <td>{t.authorName} ({t.authorFloor}e)</td>
              <td>{t.createdAt}</td>
              <td>
                <DeleteButton table="forum_topics" id={t.id} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
