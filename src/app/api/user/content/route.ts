import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { forumTopics, forumReplies, polls, pollOptions, users, events } from "@/lib/schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Non connecté" }, { status: 401 });

  const db = getDb();
  if (!db) return NextResponse.json({ error: "Indisponible" }, { status: 503 });

  const [topics, replies, userPolls, userEvents] = await Promise.all([
    db.select({
      id: forumTopics.id, title: forumTopics.title, rubrique: forumTopics.rubrique,
      createdAt: forumTopics.createdAt, locked: forumTopics.locked, pinned: forumTopics.pinned,
    }).from(forumTopics).where(eq(forumTopics.authorId, session.id)).orderBy(desc(forumTopics.createdAt)).all(),
    db.select({
      id: forumReplies.id, content: forumReplies.content, topicId: forumReplies.topicId,
      createdAt: forumReplies.createdAt,
    }).from(forumReplies).where(eq(forumReplies.authorId, session.id)).orderBy(desc(forumReplies.createdAt)).all(),
    db.select({
      id: polls.id, question: polls.question, createdAt: polls.createdAt,
    }).from(polls).where(eq(polls.authorId, session.id)).orderBy(desc(polls.createdAt)).all(),
    db.select({
      id: events.id, title: events.title, date: events.date, type: events.type,
      createdAt: events.createdAt,
    }).from(events).where(eq(events.authorId, session.id)).orderBy(desc(events.createdAt)).all(),
  ]);

  return NextResponse.json({ topics, replies, polls: userPolls, events: userEvents });
}

export async function DELETE(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Non connecté" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const id = Number(searchParams.get("id"));
  if (!type || !id) return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 });

  const db = getDb();
  if (!db) return NextResponse.json({ error: "Indisponible" }, { status: 503 });

  try {
    if (type === "forum_topic") {
      const topic = await db.select({ authorId: forumTopics.authorId }).from(forumTopics).where(eq(forumTopics.id, id)).get();
      if (!topic || topic.authorId !== session.id) return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
      await db.delete(forumReplies).where(eq(forumReplies.topicId, id)).run();
      await db.delete(forumTopics).where(eq(forumTopics.id, id)).run();
    } else if (type === "forum_reply") {
      const reply = await db.select({ authorId: forumReplies.authorId }).from(forumReplies).where(eq(forumReplies.id, id)).get();
      if (!reply || reply.authorId !== session.id) return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
      await db.delete(forumReplies).where(eq(forumReplies.id, id)).run();
    } else if (type === "poll") {
      const poll = await db.select({ authorId: polls.authorId }).from(polls).where(eq(polls.id, id)).get();
      if (!poll || poll.authorId !== session.id) return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
      await db.delete(pollOptions).where(eq(pollOptions.pollId, id)).run();
      await db.delete(polls).where(eq(polls.id, id)).run();
    } else {
      return NextResponse.json({ error: "Type invalide" }, { status: 400 });
    }
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: "Erreur: " + (err?.message || String(err)).slice(0, 300) }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Non connecté" }, { status: 401 });

  const db = getDb();
  if (!db) return NextResponse.json({ error: "Indisponible" }, { status: 503 });

  try {
    const { type, id, title, content } = await request.json();
    if (!type || !id) return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 });

    if (type === "forum_topic") {
      const topic = await db.select({ authorId: forumTopics.authorId }).from(forumTopics).where(eq(forumTopics.id, id)).get();
      if (!topic || topic.authorId !== session.id) return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
      const updates: Record<string, any> = {};
      if (title !== undefined) updates.title = title;
      if (content !== undefined) updates.content = content;
      await db.update(forumTopics).set(updates).where(eq(forumTopics.id, id)).run();
    } else if (type === "forum_reply") {
      const reply = await db.select({ authorId: forumReplies.authorId }).from(forumReplies).where(eq(forumReplies.id, id)).get();
      if (!reply || reply.authorId !== session.id) return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
      await db.update(forumReplies).set({ content }).where(eq(forumReplies.id, id)).run();
    } else {
      return NextResponse.json({ error: "Type invalide" }, { status: 400 });
    }
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: "Erreur: " + (err?.message || String(err)).slice(0, 300) }, { status: 500 });
  }
}
