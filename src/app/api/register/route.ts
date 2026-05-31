import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { users } from "@/lib/schema";
import { createSession } from "@/lib/auth";
import { hashSync } from "bcryptjs";
import { eq, or } from "drizzle-orm";
import { normalizePhone } from "@/lib/phone";
import { sendVerificationEmail } from "@/lib/email";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const { firstName, lastName, email, phone: rawPhone, floor, password } = await request.json();

    if (!firstName || !lastName || !password) {
      return NextResponse.json({ error: "Champs obligatoires manquants" }, { status: 400 });
    }

    if (!email && !rawPhone) {
      return NextResponse.json({ error: "Email ou numéro de téléphone requis" }, { status: 400 });
    }

    const phone = rawPhone ? normalizePhone(rawPhone) : null;

    const db = getDb();
    if (!db) {
      return NextResponse.json({ error: "Base de donnees non disponible" }, { status: 503 });
    }

    const conditions = [];
    if (email) conditions.push(eq(users.email, email));
    if (phone) conditions.push(eq(users.phone, phone));

    if (conditions.length > 0) {
      const existing = await db.select({ id: users.id }).from(users).where(or(...conditions)).get();
      if (existing) {
        return NextResponse.json({ error: "Un compte existe déjà avec cet email ou ce numéro" }, { status: 409 });
      }
    }

    const passwordHash = hashSync(password, 10);

    const finalEmail = email || (phone ? `tel-${phone}@lepharo.local` : "");
    const phoneForDb = phone || null;

    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    try {
      await db.insert(users).values({
        firstName,
        lastName,
        email: finalEmail,
        phone: phoneForDb,
        floor: floor ? Number(floor) : null,
        passwordHash,
        role: "resident",
        verified: false,
        verificationToken,
        verificationTokenExpires,
      }).run();
    } catch (insertErr: any) {
      // If columns missing, add them and retry once
      if (insertErr?.message?.includes("no such column") && insertErr?.message?.includes("verification")) {
        const { createClient } = require("@libsql/client/web");
        const client = createClient({
          url: process.env.TURSO_DB_URL!,
          authToken: process.env.TURSO_DB_TOKEN!,
        });
        await client.execute({ sql: `ALTER TABLE users ADD COLUMN verification_token text DEFAULT NULL` }).catch(() => {});
        await client.execute({ sql: `ALTER TABLE users ADD COLUMN verification_token_expires text DEFAULT NULL` }).catch(() => {});
        await db.insert(users).values({
          firstName, lastName, email: finalEmail, phone: phoneForDb,
          floor: floor ? Number(floor) : null, passwordHash,
          role: "resident", verified: false,
          verificationToken, verificationTokenExpires,
        }).run();
      } else {
        throw insertErr;
      }
    }

    const newUser = await db.select({
      id: users.id, firstName: users.firstName, lastName: users.lastName,
      email: users.email, role: users.role,
    }).from(users).where(eq(users.email, finalEmail)).get();

    if (!newUser) {
      return NextResponse.json({ error: "Erreur lors de la création du compte" }, { status: 500 });
    }

    // Send verification email (fire-and-forget)
    if (email) {
      sendVerificationEmail({ to: email, firstName, token: verificationToken })
        .then(() => console.log("Verification email sent to", email))
        .catch((e) => console.error("Failed to send verification email:", e));
    }

    await createSession({
      id: newUser.id,
      email: newUser.email,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      role: newUser.role,
      adminRole: null,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Registration error:", err);
    return NextResponse.json({ error: "Erreur lors de l'inscription" }, { status: 500 });
  }
}
