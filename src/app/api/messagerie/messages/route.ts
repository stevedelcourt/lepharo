import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { privateMessages, users } from "@/lib/schema";
import { eq, or, and, asc } from "drizzle-orm";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const db = getDb();
  if (!db) return NextResponse.json({ error: "Base de données non disponible" }, { status: 503 });

  const { searchParams } = new URL(request.url);
  const withId = Number(searchParams.get("with"));
  if (!withId) return NextResponse.json({ error: "Paramètre 'with' requis" }, { status: 400 });

  const messages = await db.select({
    id: privateMessages.id,
    senderId: privateMessages.senderId,
    content: privateMessages.content,
    read: privateMessages.read,
    createdAt: privateMessages.createdAt,
  }).from(privateMessages)
    .where(or(
      and(eq(privateMessages.senderId, session.id), eq(privateMessages.receiverId, withId)),
      and(eq(privateMessages.senderId, withId), eq(privateMessages.receiverId, session.id)),
    ))
    .orderBy(asc(privateMessages.createdAt)).all();

  // Mark unread messages as read
  const unreadIds = messages
    .filter((m) => m.senderId === withId && !m.read)
    .map((m) => m.id);

  if (unreadIds.length > 0) {
    for (const id of unreadIds) {
      await db.update(privateMessages).set({ read: true }).where(eq(privateMessages.id, id)).run();
    }
  }

  return NextResponse.json(messages);
}
