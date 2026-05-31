import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { forumTopics } from "@/lib/schema";
import { getSession } from "@/lib/auth";
import { sql } from "drizzle-orm";
import { checkAndFlag } from "@/lib/moderation/flags";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Non connecté" }, { status: 401 });
    }

    const { title, content, rubrique, images } = await req.json();
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
      images: JSON.stringify(images || []),
      createdAt: sql`(datetime('now'))`,
    }).run();

    const newId = Number(result.lastInsertRowid);
    checkAndFlag(title + " " + content, "forum_topic", newId, db).catch(() => {});

    return NextResponse.json({ id: newId });
  } catch (err: any) {
    console.error("Forum topic error:", err);
    return NextResponse.json({ error: "Erreur: " + (err?.message || String(err)).slice(0, 300) }, { status: 500 });
  }
}
