import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { events } from "@/lib/schema";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || !session.id) {
      return NextResponse.json({ error: "Non connecté" }, { status: 401 });
    }

    const { title, date, description, type, allowComments } = await request.json();
    if (!title || !date || !type) {
      return NextResponse.json({ error: "Champs obligatoires manquants" }, { status: 400 });
    }

    const db = getDb();
    if (!db) {
      return NextResponse.json({ error: "Base de données non disponible" }, { status: 503 });
    }

    try {
      await db.insert(events).values({
        title: title.trim(),
        date: date.trim(),
        description: description?.trim() || "",
        type: type.trim(),
        authorId: session.id,
        allowComments: allowComments !== false,
      }).run();
    } catch (e: any) {
      if (e?.message?.includes("no such column") && e?.message?.includes("allow_comments")) {
        const { createClient } = require("@libsql/client/web");
        const c = createClient({ url: process.env.TURSO_DB_URL!, authToken: process.env.TURSO_DB_TOKEN! });
        await c.execute({ sql: `ALTER TABLE events ADD COLUMN allow_comments integer DEFAULT 1 NOT NULL` }).catch(() => {});
        await db.insert(events).values({
          title: title.trim(), date: date.trim(), description: description?.trim() || "",
          type: type.trim(), authorId: session.id, allowComments: allowComments !== false,
        }).run();
      } else {
        throw e;
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Create event error:", err);
    return NextResponse.json({ error: "Erreur lors de la création" }, { status: 500 });
  }
}
