import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { privateMessages, listingMessages, entraideListings } from "@/lib/schema";
import { eq, and, sql } from "drizzle-orm";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Non connecté" }, { status: 401 });

  const { type, otherId, listingId } = await req.json();
  const db = getDb();
  if (!db) return NextResponse.json({ error: "Base de données indisponible" }, { status: 500 });

  if (type === "private" && otherId) {
    await db.update(privateMessages)
      .set({ read: true })
      .where(and(
        eq(privateMessages.senderId, otherId),
        eq(privateMessages.receiverId, session.id),
        eq(privateMessages.read, false)
      ))
      .run();
    return NextResponse.json({ ok: true });
  }

  if (type === "listing" && listingId) {
    await db.update(listingMessages)
      .set({ read: true })
      .where(and(
        eq(listingMessages.listingId, listingId),
        sql`${listingMessages.authorId} != ${session.id}`,
        eq(listingMessages.read, false)
      ))
      .run();
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Paramètres invalides" }, { status: 400 });
}
