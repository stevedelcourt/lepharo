import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { users } from "@/lib/schema";
import { createSession } from "@/lib/auth";
import { compareSync } from "bcryptjs";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
  const { email, password } = await request.json();

  const db = getDb();
  if (!db) {
    return NextResponse.json({ error: "Base de donnees non disponible" }, { status: 503 });
  }
  const user = db.select().from(users).where(eq(users.email, email)).get();

  if (!user || !user.passwordHash || !compareSync(password, user.passwordHash)) {
    return NextResponse.json({ error: "Email ou mot de passe incorrect" }, { status: 401 });
  }

  await createSession({
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
  });

  return NextResponse.json({ success: true, role: user.role });
}
