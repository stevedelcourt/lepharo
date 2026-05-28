import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { users } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getDb();
  if (!db) return NextResponse.json({ error: "Indisponible" }, { status: 503 });
  const u = await db.select({
    id: users.id, firstName: users.firstName, lastName: users.lastName,
    floor: users.floor, avatarUrl: users.avatarUrl,
  }).from(users).where(eq(users.id, parseInt(id, 10))).get();
  if (!u) return NextResponse.json({ error: "Introuvable" }, { status: 404 });
  return NextResponse.json(u);
}
