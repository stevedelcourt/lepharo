import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { adminWarnings } from "@/lib/schema";
import { eq, and } from "drizzle-orm";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Non connecté" }, { status: 401 });

  const { id } = await req.json();
  const db = getDb();
  if (!db) return NextResponse.json({ error: "Indisponible" }, { status: 503 });

  await db.update(adminWarnings).set({ dismissed: true })
    .where(and(eq(adminWarnings.id, id), eq(adminWarnings.userId, session.id))).run();

  return NextResponse.json({ success: true });
}
