import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { users } from "@/lib/schema";
import { eq, or } from "drizzle-orm";
import { hashSync } from "bcryptjs";
import { normalizePhone } from "@/lib/phone";

function generatePassword(): string {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let pwd = "";
  for (let i = 0; i < 12; i++) pwd += chars.charAt(Math.floor(Math.random() * chars.length));
  return pwd;
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    const db = getDb();
    if (!db) return NextResponse.json({ error: "Indisponible" }, { status: 503 });

    const { firstName, lastName, email, phone: rawPhone, password } = await req.json();
    if (!firstName || !lastName) return NextResponse.json({ error: "Prénom et nom requis" }, { status: 400 });
    if (!email && !rawPhone) return NextResponse.json({ error: "Email ou téléphone requis" }, { status: 400 });

    const phone = rawPhone ? normalizePhone(rawPhone) : null;

    const conditions = [];
    if (email) conditions.push(eq(users.email, email));
    if (phone) conditions.push(eq(users.phone, phone));
    if (conditions.length > 0) {
      const existing = await db.select({ id: users.id }).from(users).where(or(...conditions)).get();
      if (existing) return NextResponse.json({ error: "Un compte existe déjà avec cet email ou ce numéro" }, { status: 409 });
    }

    const finalPassword = password || generatePassword();
    const finalEmail = email || (phone ? `tel-${phone}@lepharo.local` : "");

    await db.insert(users).values({
      firstName,
      lastName,
      email: finalEmail,
      phone,
      passwordHash: hashSync(finalPassword, 10),
      role: "resident",
      verified: true,
    }).run();

    const newUser = await db.select({ id: users.id }).from(users)
      .where(eq(users.email, finalEmail)).get();
    if (!newUser) return NextResponse.json({ error: "Erreur après création" }, { status: 500 });

    const response: any = { success: true, id: newUser.id };
    if (!password) response.generatedPassword = finalPassword;

    return NextResponse.json(response);
  } catch (err: any) {
    console.error("Admin create user error:", err);
    return NextResponse.json({ error: "Erreur serveur: " + (err?.message || String(err)) }, { status: 500 });
  }
}
