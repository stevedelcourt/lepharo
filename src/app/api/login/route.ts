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
  let user: any;
  try {
    user = await db.select({
      id: users.id, firstName: users.firstName, lastName: users.lastName,
      email: users.email, role: users.role, adminRole: users.adminRole,
      passwordHash: users.passwordHash,
    }).from(users).where(eq(users.email, email)).get();
  } catch {
    user = await db.select({
      id: users.id, firstName: users.firstName, lastName: users.lastName,
      email: users.email, role: users.role,
      passwordHash: users.passwordHash,
    }).from(users).where(eq(users.email, email)).get();
  }

  let passwordValid = false;
  try {
    passwordValid = !!user?.passwordHash && compareSync(password, user.passwordHash);
  } catch { passwordValid = false; }
  if (!user || !passwordValid) {
    return NextResponse.json({ error: "Email ou mot de passe incorrect" }, { status: 401 });
  }

  await createSession({
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    adminRole: (user as any).adminRole || null,
  });

  return NextResponse.json({ success: true, role: user.role });
}
