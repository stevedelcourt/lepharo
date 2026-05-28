import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { users } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { hashSync } from "bcryptjs";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || session.role !== "admin") return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const db = getDb();
  if (!db) return NextResponse.json({ error: "Indisponible" }, { status: 503 });

  const { firstName, lastName, email, password } = await req.json();
  if (!firstName || !lastName || !email) return NextResponse.json({ error: "Champs requis" }, { status: 400 });

  const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).get();
  if (existing) return NextResponse.json({ error: "Email déjà utilisé" }, { status: 409 });

  const result = await db.insert(users).values({
    firstName,
    lastName,
    email,
    passwordHash: password ? hashSync(password, 10) : null,
    role: "resident",
    verified: true,
  }).returning({ id: users.id });

  return NextResponse.json({ success: true, id: result[0].id });
}
