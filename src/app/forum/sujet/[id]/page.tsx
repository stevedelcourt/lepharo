import { getDb } from "@/lib/db";
import { forumTopics, forumReplies, users } from "@/lib/schema";
import { eq, asc } from "drizzle-orm";
import { fallbackForumTopics, fallbackForumReplies } from "@/lib/fallback-data";
import { getSession } from "@/lib/auth";
import { notFound } from "next/navigation";
import SujetClient from "./sujet-client";

export const dynamic = "force-dynamic";

type Reply = { id: number; content: string; images: string[]; authorId: number; authorName: string; authorFloor: number | null; authorAvatar: string | null; authorCopro: boolean; createdAt: string };

export default async function SujetPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const topicId = parseInt(id, 10);
  const session = await getSession();
  const db = getDb();
  let topic: { id: number; title: string; content: string; rubrique: string; images: string[]; authorId: number; authorName: string; authorFloor: number | null; authorAvatar: string | null; authorCopro: boolean; pinned: boolean; locked: boolean; createdAt: string } | null = null;
  let replies: Reply[] = [];

  if (db) {
    const row = await db.select({
      id: forumTopics.id,
      title: forumTopics.title,
      content: forumTopics.content,
      rubrique: forumTopics.rubrique,
      images: forumTopics.images,
      authorId: forumTopics.authorId,
      authorName: users.firstName,
      authorFloor: users.floor,
      authorAvatar: users.avatarUrl,
      authorCopro: users.coproprietaire,
      pinned: forumTopics.pinned,
      locked: forumTopics.locked,
      createdAt: forumTopics.createdAt,
    }).from(forumTopics).innerJoin(users, eq(forumTopics.authorId, users.id))
      .where(eq(forumTopics.id, topicId)).get();

    if (row) {
      topic = { ...row, images: parseImages(row.images) };
      const rows = await db.select({
        id: forumReplies.id,
        content: forumReplies.content,
        images: forumReplies.images,
        authorId: forumReplies.authorId,
        authorName: users.firstName,
        authorFloor: users.floor,
        authorAvatar: users.avatarUrl,
        authorCopro: users.coproprietaire,
        createdAt: forumReplies.createdAt,
      }).from(forumReplies).innerJoin(users, eq(forumReplies.authorId, users.id))
        .where(eq(forumReplies.topicId, topicId)).orderBy(asc(forumReplies.createdAt)).all();
      replies = rows.map((r) => ({ ...r, images: parseImages(r.images) }));
    }
  } else {
    const ft = fallbackForumTopics.find((t) => t.id === topicId);
    if (ft) {
      topic = { ...ft, authorId: 0, pinned: false, locked: false, images: [], authorAvatar: null, authorCopro: false };
    }
    replies = fallbackForumReplies.filter((r) => r.topicId === topicId).map((r) => ({ ...r, authorId: 0, images: [], authorAvatar: null as string | null, authorCopro: false }));
  }

  if (!topic) notFound();

  return <SujetClient topic={topic} replies={replies} userId={session?.id ?? null} />;
}

function parseImages(val: unknown): string[] {
  if (Array.isArray(val)) return val;
  if (typeof val === "string") {
    try { return JSON.parse(val); } catch { return []; }
  }
  return [];
}
