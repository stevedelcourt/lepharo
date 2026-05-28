import { getDb } from "@/lib/db";
import { forumTopics, forumReplies, users } from "@/lib/schema";
import { desc, eq, sql } from "drizzle-orm";
import ForumClient from "./forum-client";
import { fallbackForumTopics } from "@/lib/fallback-data";

export const dynamic = "force-dynamic";

export default async function ForumPage() {
  const db = getDb();
  let topicsWithReplies: (typeof fallbackForumTopics[0])[];

  if (db) {
    const replyCounts = await db.select({
      topicId: forumReplies.topicId,
      count: sql<number>`count(*)`.as("count"),
    }).from(forumReplies).groupBy(forumReplies.topicId).all();

    const replyCountMap = new Map(replyCounts.map((r) => [r.topicId, r.count]));

    const topics = await db.select({
      id: forumTopics.id,
      title: forumTopics.title,
      rubrique: forumTopics.rubrique,
      authorName: users.firstName,
      authorFloor: users.floor,
      createdAt: forumTopics.createdAt,
    }).from(forumTopics).innerJoin(users, eq(forumTopics.authorId, users.id))
      .orderBy(desc(forumTopics.createdAt)).all();

    topicsWithReplies = topics.map((t) => ({
      ...t,
      replyCount: replyCountMap.get(t.id) || 0,
    }));
  } else {
    topicsWithReplies = fallbackForumTopics;
  }

  return <ForumClient topics={topicsWithReplies} />;
}
