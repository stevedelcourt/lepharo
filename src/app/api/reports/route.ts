import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { reports, users } from "@/lib/schema";
import { desc, eq } from "drizzle-orm";

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

  const rows = await db.select({
    id: reports.id,
    targetType: reports.targetType,
    targetId: reports.targetId,
    reason: reports.reason,
    autoFlagged: reports.autoFlagged,
    score: reports.score,
    categories: reports.categories,
    matchedRules: reports.matchedRules,
    resolved: reports.resolved,
    createdAt: reports.createdAt,
  }).from(reports).orderBy(desc(reports.createdAt)).all();

  const mapped = rows.map((r: any) => ({
    ...r,
    reporterName: r.autoFlagged ? "🤖 Auto" : "Utilisateur",
  }));

  return NextResponse.json(mapped);
}
