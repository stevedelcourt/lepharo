import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { users, entraideListings, forumReplies, polls, forumTopics } from "@/lib/schema";
import { eq, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const userId = parseInt(id, 10);
  const db = getDb();
  if (!db) return NextResponse.json({ error: "Indisponible" }, { status: 503 });

  const u = await db.select({ id: users.id, firstName: users.firstName, lastName: users.lastName, floor: users.floor, avatarUrl: users.avatarUrl, bio: users.bio, tagline: users.tagline, senior: users.senior })
    .from(users).where(eq(users.id, userId)).get();
  if (!u) return NextResponse.json({ error: "Introuvable" }, { status: 404 });

  const lastListing = await db.select({ id: entraideListings.id, title: entraideListings.title, type: entraideListings.type, createdAt: entraideListings.createdAt })
    .from(entraideListings).where(eq(entraideListings.authorId, userId)).orderBy(desc(entraideListings.createdAt)).limit(1).get();

  const lastReply = await db.select({ id: forumReplies.id, content: forumReplies.content, topicId: forumReplies.topicId, createdAt: forumReplies.createdAt })
    .from(forumReplies).where(eq(forumReplies.authorId, userId)).orderBy(desc(forumReplies.createdAt)).limit(1).get();

  let lastReplyTopic = null;
  if (lastReply) {
    lastReplyTopic = await db.select({ id: forumTopics.id, title: forumTopics.title }).from(forumTopics).where(eq(forumTopics.id, lastReply.topicId)).get();
  }

  const lastPoll = await db.select({ id: polls.id, question: polls.question, createdAt: polls.createdAt })
    .from(polls).where(eq(polls.authorId, userId)).orderBy(desc(polls.createdAt)).limit(1).get();

  return NextResponse.json({
    user: u,
    lastListing: lastListing || null,
    lastReply: lastReply ? { ...lastReply, topicTitle: lastReplyTopic?.title || null } : null,
    lastPoll: lastPoll || null,
  });
}
