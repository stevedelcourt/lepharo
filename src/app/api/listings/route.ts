import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { entraideListings } from "@/lib/schema";
import { sql } from "drizzle-orm";
import { checkAndFlag } from "@/lib/moderation/flags";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
    }

    const db = getDb();
    if (!db) {
      return NextResponse.json({ error: "Base de donnees non disponible" }, { status: 503 });
    }

    const { type, title, description, category, images } = await request.json();

    if (!type || !title || !description || !category) {
      return NextResponse.json({ error: "Tous les champs sont requis" }, { status: 400 });
    }

    if (type !== "propose" && type !== "cherche") {
      return NextResponse.json({ error: "Type invalide" }, { status: 400 });
    }

    const imagesJson = Array.isArray(images) ? JSON.stringify(images) : "[]";

    const result = await db.insert(entraideListings).values({
      type,
      title,
      description,
      category,
      images: imagesJson,
      authorId: session.id,
      status: "open",
      createdAt: sql`(datetime('now'))`,
    }).run();

    const newId = result.lastInsertRowid as number;
    checkAndFlag(title + " " + description, "listing", newId, db).catch(() => {});

    return NextResponse.json({ success: true, id: newId });
  } catch (err: any) {
    console.error("Create listing error:", err);
    return NextResponse.json({ error: "Erreur: " + (err?.message || String(err)).slice(0, 400) }, { status: 500 });
  }
}
