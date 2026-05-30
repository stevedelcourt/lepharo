import { getDb } from "@/lib/db";
import { forumTopics, forumReplies, users } from "@/lib/schema";
import { eq, asc } from "drizzle-orm";
import { fallbackForumTopics, fallbackForumReplies } from "@/lib/fallback-data";
import { getSession } from "@/lib/auth";
import { notFound } from "next/navigation";
import SujetClient from "./sujet-client";

export const dynamic = "force-dynamic";

type Reply = { id: number; content: string; authorName: string; authorFloor: number | null; authorAvatar: string | null; createdAt: string };

export default async function SujetPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const topicId = parseInt(id, 10);
  const session = await getSession();
  const db = getDb();
  let topic: { id: number; title: string; content: string; rubrique: string; authorName: string; authorFloor: number | null; authorAvatar: string | null; pinned: boolean; locked: boolean; createdAt: string } | null = null;
  let replies: Reply[] = [];

  if (db) {
    const row = await db.select({
      id: forumTopics.id,
      title: forumTopics.title,
      content: forumTopics.content,
      rubrique: forumTopics.rubrique,
      authorName: users.firstName,
      authorFloor: users.floor,
      authorAvatar: users.avatarUrl,
      pinned: forumTopics.pinned,
      locked: forumTopics.locked,
      createdAt: forumTopics.createdAt,
    }).from(forumTopics).innerJoin(users, eq(forumTopics.authorId, users.id))
      .where(eq(forumTopics.id, topicId)).get();

    if (row) {
      topic = row;
      replies = await db.select({
        id: forumReplies.id,
        content: forumReplies.content,
        authorName: users.firstName,
        authorFloor: users.floor,
        authorAvatar: users.avatarUrl,
        createdAt: forumReplies.createdAt,
      }).from(forumReplies).innerJoin(users, eq(forumReplies.authorId, users.id))
        .where(eq(forumReplies.topicId, topicId)).orderBy(asc(forumReplies.createdAt)).all();
    }
  } else {
    const ft = fallbackForumTopics.find((t) => t.id === topicId);
    if (ft) {
      topic = { ...ft, pinned: false, locked: false, authorAvatar: null };
    }
    replies = fallbackForumReplies.filter((r) => r.topicId === topicId).map((r) => ({ ...r, authorAvatar: null as string | null }));
  }

  if (!topic) notFound();

  return <SujetClient topic={topic} replies={replies} userId={session?.id ?? null} />;
}
