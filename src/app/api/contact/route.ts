import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { contactMessages } from "@/lib/schema";
import { getSession } from "@/lib/auth";
import { desc } from "drizzle-orm";

export async function POST(request: Request) {
  const { name, email, subject, message } = await request.json();
  if (!name || !email || !subject || !message) {
    return NextResponse.json({ error: "Champs requis manquants" }, { status: 400 });
  }

  const db = getDb();
  if (!db) {
    return NextResponse.json({ error: "Service indisponible" }, { status: 503 });
  }

  await db.insert(contactMessages).values({ name, email, subject, message }).run();
  return NextResponse.json({ success: true });
}

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const db = getDb();
  if (!db) return NextResponse.json({ error: "Indisponible" }, { status: 503 });

  const messages = await db.select().from(contactMessages).orderBy(desc(contactMessages.createdAt)).all();
  return NextResponse.json(messages);
}
