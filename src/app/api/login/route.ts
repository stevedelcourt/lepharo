import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { users } from "@/lib/schema";
import { createSession } from "@/lib/auth";
import { compareSync } from "bcryptjs";
import { eq, or } from "drizzle-orm";
import { normalizePhone } from "@/lib/phone";

export async function POST(request: Request) {
  const { identifier, email, password } = await request.json();
  const id = identifier || email;

  if (!id) {
    return NextResponse.json({ error: "Email ou numéro de téléphone requis" }, { status: 400 });
  }

  const db = getDb();
  if (!db) {
    return NextResponse.json({ error: "Base de donnees non disponible" }, { status: 503 });
  }

  const isEmail = id.includes("@");
  const phone = isEmail ? null : normalizePhone(id);

  const conditions = [eq(users.email, id)];
  if (phone) conditions.push(eq(users.phone, phone));

  let user: any;
  try {
    user = await db.select({
      id: users.id, firstName: users.firstName, lastName: users.lastName,
      email: users.email, role: users.role, adminRole: users.adminRole,
      coproprietaire: users.coproprietaire, passwordHash: users.passwordHash,
    }).from(users).where(or(...conditions)).get();
  } catch {
    user = await db.select({
      id: users.id, firstName: users.firstName, lastName: users.lastName,
      email: users.email, role: users.role, coproprietaire: users.coproprietaire,
      passwordHash: users.passwordHash,
    }).from(users).where(or(...conditions)).get();
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
    coproprietaire: !!(user as any).coproprietaire,
  });

  return NextResponse.json({ success: true, role: user.role });
}
