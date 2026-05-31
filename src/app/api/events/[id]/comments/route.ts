import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { eventComments, events, privateMessages, users } from "@/lib/schema";
import { eq, asc } from "drizzle-orm";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const eventId = parseInt(id, 10);
  if (isNaN(eventId)) return NextResponse.json({ error: "ID invalide" }, { status: 400 });

  const db = getDb();
  if (!db) return NextResponse.json({ error: "Indisponible" }, { status: 503 });

  const comments = await db.select({
    id: eventComments.id,
    content: eventComments.content,
    authorId: eventComments.authorId,
    authorName: users.firstName,
    authorAvatar: users.avatarUrl,
    createdAt: eventComments.createdAt,
  }).from(eventComments).innerJoin(users, eq(eventComments.authorId, users.id))
    .where(eq(eventComments.eventId, eventId)).orderBy(asc(eventComments.createdAt)).all();

  return NextResponse.json(comments);
}

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Non connecté" }, { status: 401 });

  const { id } = await params;
  const eventId = parseInt(id, 10);
  if (isNaN(eventId)) return NextResponse.json({ error: "ID invalide" }, { status: 400 });

  const db = getDb();
  if (!db) return NextResponse.json({ error: "Indisponible" }, { status: 503 });

  const { content } = await _req.json();
  if (!content?.trim()) return NextResponse.json({ error: "Contenu requis" }, { status: 400 });

  await db.insert(eventComments).values({
    eventId,
    authorId: session.id,
    content: content.trim(),
  }).run();

  // Notify event author (fire-and-forget)
  try {
    const event = await db.select({ authorId: events.authorId }).from(events).where(eq(events.id, eventId)).get();
    if (event && event.authorId !== session.id) {
      await db.insert(privateMessages).values({
        senderId: session.id,
        receiverId: event.authorId,
        content: `Nouveau commentaire sur votre événement`,
      }).run();
    }
  } catch {}

  return NextResponse.json({ success: true });
}
