import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { forumTopics } from "@/lib/schema";
import { getSession } from "@/lib/auth";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Non connecté" }, { status: 401 });
  }

  const { title, content, rubrique } = await req.json();
  if (!title || !content || !rubrique) {
    return NextResponse.json({ error: "Champs requis manquants" }, { status: 400 });
  }

  const db = getDb();
  if (!db) {
    return NextResponse.json({ error: "Base de données indisponible" }, { status: 500 });
  }

  const result = await db.insert(forumTopics).values({
    title,
    content,
    rubrique,
    authorId: session.id,
  }).returning({ id: forumTopics.id });

  return NextResponse.json({ id: result[0].id });
}
