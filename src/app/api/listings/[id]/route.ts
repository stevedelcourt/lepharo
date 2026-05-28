import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { entraideListings } from "@/lib/schema";
import { eq, and } from "drizzle-orm";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Non connecté" }, { status: 401 });

  const { id } = await params;
  const listingId = parseInt(id, 10);
  if (isNaN(listingId)) return NextResponse.json({ error: "ID invalide" }, { status: 400 });

  const db = getDb();
  if (!db) return NextResponse.json({ error: "Indisponible" }, { status: 503 });

  const { title, description, category } = await req.json();

  const existing = await db.select({ id: entraideListings.id, authorId: entraideListings.authorId })
    .from(entraideListings).where(eq(entraideListings.id, listingId)).get();
  if (!existing) return NextResponse.json({ error: "Introuvable" }, { status: 404 });
  if (existing.authorId !== session.id) return NextResponse.json({ error: "Pas votre annonce" }, { status: 403 });

  const updates: Record<string, string> = {};
  if (title !== undefined) updates.title = title;
  if (description !== undefined) updates.description = description;
  if (category !== undefined) updates.category = category;

  if (Object.keys(updates).length === 0) return NextResponse.json({ error: "Aucune modification" }, { status: 400 });

  await db.update(entraideListings).set(updates).where(eq(entraideListings.id, listingId)).run();
  return NextResponse.json({ success: true });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Non connecté" }, { status: 401 });

  const { id } = await params;
  const listingId = parseInt(id, 10);
  if (isNaN(listingId)) return NextResponse.json({ error: "ID invalide" }, { status: 400 });

  const db = getDb();
  if (!db) return NextResponse.json({ error: "Indisponible" }, { status: 503 });

  const existing = await db.select({ id: entraideListings.id, authorId: entraideListings.authorId })
    .from(entraideListings).where(eq(entraideListings.id, listingId)).get();
  if (!existing) return NextResponse.json({ error: "Introuvable" }, { status: 404 });
  if (existing.authorId !== session.id) return NextResponse.json({ error: "Pas votre annonce" }, { status: 403 });

  await db.delete(entraideListings).where(eq(entraideListings.id, listingId)).run();
  return NextResponse.json({ success: true });
}
