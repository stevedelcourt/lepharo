import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { reports, moderationFlags } from "@/lib/schema";
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

  // User reports
  let userReports: any[] = [];
  try {
    userReports = await db.select({
      id: reports.id,
      targetType: reports.targetType,
      targetId: reports.targetId,
      reason: reports.reason,
      score: reports.score,
      categories: reports.categories,
      matchedRules: reports.matchedRules,
      resolved: reports.resolved,
      createdAt: reports.createdAt,
    }).from(reports).orderBy(desc(reports.createdAt)).all();
  } catch {}

  // Auto-flagged from moderation_flags
  let autoFlags: any[] = [];
  try {
    const flags = await db.select({
      id: moderationFlags.id,
      targetType: moderationFlags.targetType,
      targetId: moderationFlags.targetId,
      reason: moderationFlags.reason,
      score: moderationFlags.score,
      categories: moderationFlags.categories,
      matchedRules: moderationFlags.matchedRules,
      resolved: moderationFlags.resolved,
      createdAt: moderationFlags.createdAt,
    }).from(moderationFlags).orderBy(desc(moderationFlags.createdAt)).all();

    autoFlags = flags.map((f: any) => ({
      ...f,
      autoFlagged: true,
      entityType: "flag",
      reporterName: "🤖 Auto",
    }));
  } catch {}

  const mapped = userReports.map((r: any) => ({
    ...r,
    autoFlagged: r.autoFlagged || false,
    entityType: "report",
    reporterName: "👤 Signalé",
  }));

  const combined = [...autoFlags, ...mapped].sort((a, b) => {
    return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
  });

  return NextResponse.json(combined);
}
