import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { proofRequests, users } from "@/lib/schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const db = getDb();
  if (!db) return NextResponse.json({ error: "Indisponible" }, { status: 503 });

  const rows = await db.select({
    id: proofRequests.id,
    fileUrl: proofRequests.fileUrl,
    message: proofRequests.message,
    status: proofRequests.status,
    createdAt: proofRequests.createdAt,
    userId: users.id,
    firstName: users.firstName,
    lastName: users.lastName,
    email: users.email,
    floor: users.floor,
  }).from(proofRequests).innerJoin(users, eq(proofRequests.userId, users.id))
    .orderBy(desc(proofRequests.createdAt)).all();

  return NextResponse.json(rows);
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Non connecté" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File;
  const message = (formData.get("message") as string) || "";

  if (!file) {
    return NextResponse.json({ error: "Aucun fichier fourni" }, { status: 400 });
  }

  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: "Le fichier ne doit pas dépasser 10 Mo" }, { status: 400 });
  }

  const { put } = await import("@vercel/blob");
  const ext = file.name.split(".").pop() || "pdf";
  const blob = await put(`proofs/${session.id}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`, file, {
    access: "public",
  });

  const db = getDb();
  if (!db) {
    return NextResponse.json({ error: "Base de données indisponible" }, { status: 500 });
  }

  await db.insert(proofRequests).values({
    userId: session.id,
    fileUrl: blob.url,
    message: message || null,
  }).run();

  return NextResponse.json({ success: true });
}
