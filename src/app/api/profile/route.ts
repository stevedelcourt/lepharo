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
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
  }

  const db = getDb();
  if (!db) {
    return NextResponse.json({ error: "Base de donnees non disponible" }, { status: 503 });
  }

  const { firstName, lastName, floor, phone, bio, senior } = await request.json();

  const updates: Record<string, unknown> = {};
  if (firstName !== undefined) updates.firstName = firstName;
  if (lastName !== undefined) updates.lastName = lastName;
  if (floor !== undefined) updates.floor = floor;
  if (phone !== undefined) updates.phone = phone;
  if (bio !== undefined) updates.bio = bio;
  if (senior !== undefined) updates.senior = senior;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "Aucune modification" }, { status: 400 });
  }

  await db.update(users).set(updates).where(eq(users.id, session.id)).run();

  return NextResponse.json({ success: true });
}
