import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { privateMessages } from "@/lib/schema";
import { sql } from "drizzle-orm";
import { checkAndFlag } from "@/lib/moderation/flags";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const db = getDb();
  if (!db) return NextResponse.json({ error: "Base de données non disponible" }, { status: 503 });

  const { receiverId, content } = await request.json();

  if (!receiverId || !content?.trim()) {
    return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 });
  }

  if (receiverId === session.id) {
    return NextResponse.json({ error: "Vous ne pouvez pas vous envoyer un message à vous-même" }, { status: 400 });
  }

  const result = await db.insert(privateMessages).values({
    senderId: session.id,
    receiverId,
    content: content.trim(),
    createdAt: sql`(datetime('now'))`,
  }).run();

  const newId = result.lastInsertRowid as number;
  checkAndFlag(content, "private_message", newId, db).catch(() => {});

  return NextResponse.json({ success: true, id: newId });
}
