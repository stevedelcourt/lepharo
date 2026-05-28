import { getDb } from "@/lib/db";
import { forumTopics, forumReplies, users } from "@/lib/schema";
import { eq, desc, sql } from "drizzle-orm";
import { fallbackForumTopics } from "@/lib/fallback-data";
import { notFound } from "next/navigation";
import RubriqueClient from "./rubrique-client";

export const dynamic = "force-dynamic";

const rubriqueNames: Record<string, string> = {
  "vie-quotidienne": "Vie quotidienne",
  travaux: "Travaux et entretien",
  nuisibles: "Nuisibles et problèmes sanitaires",
  syndic: "Syndic et gouvernance",
  quartier: "Le quartier du Pharo",
  bistrot: "Le Bistrot",
};

export default async function RubriquePage({ params }: { params: Promise<{ rubrique: string }> }) {
  const { rubrique } = await params;

  if (!rubriqueNames[rubrique]) notFound();

  const db = getDb();
  let topics: { id: number; title: string; content: string; authorName: string; authorFloor: number | null; replyCount: number; createdAt: string }[] = [];

  if (db) {
    const replyCounts = await db.select({
      topicId: forumReplies.topicId,
      count: sql<number>`count(*)`.as("count"),
    }).from(forumReplies).groupBy(forumReplies.topicId).all();

    const replyCountMap = new Map(replyCounts.map((r) => [r.topicId, r.count]));

    const rows = await db.select({
      id: forumTopics.id,
      title: forumTopics.title,
      content: forumTopics.content,
      authorName: users.firstName,
      authorFloor: users.floor,
      createdAt: forumTopics.createdAt,
    }).from(forumTopics).innerJoin(users, eq(forumTopics.authorId, users.id))
      .where(eq(forumTopics.rubrique, rubrique))
      .orderBy(desc(forumTopics.createdAt)).all();

    topics = rows.map((t) => ({
      ...t,
      replyCount: replyCountMap.get(t.id) || 0,
    }));
  } else {
    topics = fallbackForumTopics
      .filter((t) => t.rubrique === rubrique)
      .map((t) => ({ id: t.id, title: t.title, content: t.content, authorName: t.authorName, authorFloor: t.authorFloor, replyCount: t.replyCount, createdAt: t.createdAt }));
  }

  return <RubriqueClient rubrique={rubrique} rubriqueName={rubriqueNames[rubrique]} topics={topics} />;
}
