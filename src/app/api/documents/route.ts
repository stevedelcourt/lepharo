import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { documents } from "@/lib/schema";
import { eq, sql } from "drizzle-orm";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || session.role !== "admin") return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const db = getDb();
  if (!db) return NextResponse.json({ error: "Indisponible" }, { status: 503 });

  const form = await req.formData();
  const title = form.get("title") as string;
  const category = form.get("category") as string;
  const date = form.get("date") as string;
  const file = form.get("file") as File | null;

  if (!title || !category) return NextResponse.json({ error: "Champs requis manquants" }, { status: 400 });

  let fileUrl = null;
  if (file && file.size > 0) {
    try {
      const { put } = await import("@vercel/blob");
      const ext = file.name.split(".").pop() || "pdf";
      const blob = await put(`documents/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`, file, {
        access: "public",
      });
      fileUrl = blob.url;
    } catch {}
  }

  const result = await db.insert(documents).values({
    title,
    category,
    pages: file ? 1 : 0,
    date: date || new Date().toISOString().split("T")[0],
    fileUrl,
    uploadedBy: session.id,
  }).returning({ id: documents.id });

  return NextResponse.json({ success: true, id: result[0].id });
}
