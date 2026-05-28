import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { users } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { hashSync, compareSync } from "bcryptjs";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
  }

  const db = getDb();
  if (!db) {
    return NextResponse.json({ error: "Base de donnees non disponible" }, { status: 503 });
  }

  const { currentPassword, newPassword } = await request.json();

  if (!currentPassword || !newPassword) {
    return NextResponse.json({ error: "Tous les champs sont requis" }, { status: 400 });
  }

  if (newPassword.length < 6) {
    return NextResponse.json({ error: "Le mot de passe doit faire au moins 6 caracteres" }, { status: 400 });
  }

  const user = await db.select().from(users).where(eq(users.id, session.id)).get();

  if (!user || !user.passwordHash) {
    return NextResponse.json({ error: "Ce compte utilise la connexion Google" }, { status: 400 });
  }

  if (!compareSync(currentPassword, user.passwordHash)) {
    return NextResponse.json({ error: "Mot de passe actuel incorrect" }, { status: 401 });
  }

  const passwordHash = hashSync(newPassword, 10);
  await db.update(users).set({ passwordHash }).where(eq(users.id, session.id)).run();

  return NextResponse.json({ success: true });
}
