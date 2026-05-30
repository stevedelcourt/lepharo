import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { users } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Non connecté" }, { status: 401 });
  const db = getDb();
  if (!db) return NextResponse.json({ error: "Indisponible" }, { status: 503 });
  const u = await db.select({
    id: users.id, firstName: users.firstName, lastName: users.lastName,
  }).from(users).where(eq(users.id, session.id)).get();
  return NextResponse.json(u || session);
}

export async function PUT(request: Request) {
  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide" }, { status: 400 });
  }

  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Non authentifie" }, { status: 401 });

    const db = getDb();
    if (!db) return NextResponse.json({ error: "Indisponible" }, { status: 503 });

    await doUpdate(db, users, session.id, body);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    const msg = err?.message || String(err);
    console.error("Profile update error:", msg);

    // Missing show_full_name column — add it and retry once
    if (msg.includes("no such column") || msg.includes("show_full_name") || msg.includes("kids")) {
      try {
        const { createClient } = require("@libsql/client/web");
        const client = createClient({
          url: process.env.TURSO_DB_URL!,
          authToken: process.env.TURSO_DB_TOKEN!,
        });
        await client.execute({ sql: `ALTER TABLE users ADD COLUMN show_full_name integer DEFAULT 0 NOT NULL` }).catch(() => {});
        await client.execute({ sql: `ALTER TABLE users ADD COLUMN kids integer DEFAULT 0 NOT NULL` }).catch(() => {});
        const session2 = await getSession();
        const db2 = getDb();
        if (!session2 || !db2) return NextResponse.json({ error: "Erreur" }, { status: 500 });
        await doUpdate(db2, users, session2.id, body);
        return NextResponse.json({ success: true });
      } catch (retryErr: any) {
        return NextResponse.json({ error: "Erreur: " + (retryErr?.message || String(retryErr)).slice(0, 300) }, { status: 500 });
      }
    }

    return NextResponse.json({ error: "Erreur: " + msg.slice(0, 500) }, { status: 500 });
  }
}

async function doUpdate(db: any, tbl: any, userId: number, body: any) {
  const { firstName, lastName, floor, phone, bio, tagline, senior, kids, showFullName } = body;
  const updates: Record<string, unknown> = {};
  if (firstName !== undefined) updates.firstName = firstName;
  if (lastName !== undefined) updates.lastName = lastName;
  if (floor !== undefined) updates.floor = floor;
  if (phone !== undefined) updates.phone = phone || null;
  if (bio !== undefined) updates.bio = bio || null;
  if (tagline !== undefined) updates.tagline = tagline || null;
  if (senior !== undefined) updates.senior = senior === true || senior === 1 || senior === "1" ? 1 : 0;
  if (kids !== undefined) updates.kids = kids === true || kids === 1 || kids === "1" ? 1 : 0;
  if (showFullName !== undefined) updates.showFullName = showFullName === true || showFullName === 1 || showFullName === "1" ? 1 : 0;
  if (Object.keys(updates).length === 0) throw new Error("Aucune modification");
  await db.update(tbl).set(updates).where(eq(tbl.id, userId)).run();
}
