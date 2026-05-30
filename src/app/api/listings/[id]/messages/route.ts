import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { listingMessages } from "@/lib/schema";
import { checkAndFlag } from "@/lib/moderation/flags";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
  }

  const db = getDb();
  if (!db) {
    return NextResponse.json({ error: "Base de donnees non disponible" }, { status: 503 });
  }

  const { id } = await params;
  const listingId = parseInt(id, 10);
  if (isNaN(listingId)) {
    return NextResponse.json({ error: "ID invalide" }, { status: 400 });
  }

  const { content } = await request.json();
  if (!content || !content.trim()) {
    return NextResponse.json({ error: "Le message ne peut pas etre vide" }, { status: 400 });
  }

  const result = await db.insert(listingMessages).values({
    listingId,
    authorId: session.id,
    content,
  }).run();

  const newId = Number(result.lastInsertRowid);
  checkAndFlag(content, "listing_message", newId, db).catch(() => {});

  return NextResponse.json({ success: true, id: newId });
}
