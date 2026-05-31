import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { users } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { sendVerificationEmail } from "@/lib/email";
import crypto from "crypto";

export async function POST() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Non connecté" }, { status: 401 });

    const db = getDb();
    if (!db) return NextResponse.json({ error: "Indisponible" }, { status: 503 });

    const user = await db.select({
      id: users.id, email: users.email, firstName: users.firstName, verified: users.verified,
    }).from(users).where(eq(users.id, session.id)).get();

    if (!user) return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
    if (user.verified) return NextResponse.json({ error: "Déjà vérifié" }, { status: 400 });
    if (!user.email || user.email.startsWith("tel-")) return NextResponse.json({ error: "Pas d'email" }, { status: 400 });

    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    await db.update(users).set({ verificationToken, verificationTokenExpires }).where(eq(users.id, user.id)).run();

    sendVerificationEmail({ to: user.email, firstName: user.firstName, token: verificationToken }).catch(() => {});

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}
