import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { reports } from "@/lib/schema";
import { desc } from "drizzle-orm";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Non connecté" }, { status: 401 });

  const { targetType, targetId, reason } = await req.json();
  if (!targetType || !targetId || !reason) return NextResponse.json({ error: "Champs requis" }, { status: 400 });

  const db = getDb();
  if (!db) return NextResponse.json({ error: "Indisponible" }, { status: 503 });

  await db.insert(reports).values({ targetType, targetId, reason, reporterId: session.id }).run();
  return NextResponse.json({ success: true });
}

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "admin") return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const db = getDb();
  if (!db) return NextResponse.json({ error: "Indisponible" }, { status: 503 });

  const all = await db.select().from(reports).orderBy(desc(reports.createdAt)).all();
  return NextResponse.json(all);
}
