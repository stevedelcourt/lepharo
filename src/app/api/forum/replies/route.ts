import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { forumReplies, forumTopics } from "@/lib/schema";
import { getSession } from "@/lib/auth";
import { eq, sql } from "drizzle-orm";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Non connecté" }, { status: 401 });
  }

  const { topicId, content } = await req.json();
  if (!topicId || !content) {
    return NextResponse.json({ error: "Champs requis manquants" }, { status: 400 });
  }

  const db = getDb();
  if (!db) {
    return NextResponse.json({ error: "Base de données indisponible" }, { status: 500 });
  }

  const topic = await db.select({ locked: forumTopics.locked }).from(forumTopics).where(eq(forumTopics.id, topicId)).get();
  if (!topic) {
    return NextResponse.json({ error: "Sujet introuvable" }, { status: 404 });
  }
  if (topic.locked) {
    return NextResponse.json({ error: "Ce sujet est verrouillé" }, { status: 403 });
  }

  const result = await db.insert(forumReplies).values({
    topicId,
    content,
    authorId: session.id,
    createdAt: sql`(datetime('now'))`,
  }).returning({ id: forumReplies.id });

  return NextResponse.json({ id: result[0].id });
}
