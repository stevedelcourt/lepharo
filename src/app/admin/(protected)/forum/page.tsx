import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import { forumTopics, users } from "@/lib/schema";
import { desc, eq } from "drizzle-orm";
import { fallbackAdminForumTopics } from "@/lib/fallback-data";
import { IconForum, IconPin } from "@/components/icons";
import { DeleteButton, EditButton, ModerateButton } from "../admin-actions";

export default async function AdminForumPage() {
  const session = await getSession();
  if (!session || session.role !== "admin") redirect("/admin/login");

  const db = getDb();
  const topics = db ? await db.select({
    id: forumTopics.id,
    title: forumTopics.title,
    content: forumTopics.content,
    rubrique: forumTopics.rubrique,
    authorName: users.firstName,
    authorFloor: users.floor,
    pinned: forumTopics.pinned,
    locked: forumTopics.locked,
    createdAt: forumTopics.createdAt,
  }).from(forumTopics).innerJoin(users, eq(forumTopics.authorId, users.id))
    .orderBy(desc(forumTopics.createdAt)).all() : fallbackAdminForumTopics;

  return (
    <>
      <h1><IconForum size={24} /> Forum ({topics.length} sujets)</h1>
      <table className="admin-table">
        <thead>
          <tr>
            <th>Titre</th>
            <th>Rubrique</th>
            <th>Auteur</th>
            <th>Date</th>
            <th>Statut</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {topics.map((t) => (
            <tr key={t.id}>
              <td style={{ fontWeight: 600 }}>
                {t.title}
                {t.pinned && <IconPin size={14} style={{ marginLeft: 6, verticalAlign: "middle", color: "var(--color-primary)" }} />}
              </td>
              <td><span className="tag">{t.rubrique}</span></td>
              <td>{t.authorName} ({t.authorFloor}e)</td>
              <td>{t.createdAt}</td>
              <td>
                {t.locked ? <span className="tag tag-closed">Verrouillé</span> : <span className="tag">Ouvert</span>}
              </td>
              <td>
                <div className="input-group" style={{ gap: 4 }}>
                  <EditButton table="forum_topics" id={t.id} fields={[
                    { label: "Titre", key: "title", type: "text", default: t.title },
                    { label: "Contenu", key: "content", type: "textarea", default: t.content },
                    { label: "Rubrique", key: "rubrique", type: "text", default: t.rubrique },
                  ]} />
                  <ModerateButton table="forum_topics" id={t.id} field="pinned" label={t.pinned ? "Détacher" : "Épingler"} value={t.pinned} />
                  <ModerateButton table="forum_topics" id={t.id} field="locked" label={t.locked ? "Déverrouiller" : "Verrouiller"} value={t.locked} />
                  <DeleteButton table="forum_topics" id={t.id} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
