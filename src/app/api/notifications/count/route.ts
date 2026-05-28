import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { privateMessages, listingMessages, entraideListings, adminWarnings } from "@/lib/schema";
import { eq, and, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ count: 0 });

  const db = getDb();
  if (!db) return NextResponse.json({ count: 0 });

  const uid = session.id;
  const pmCount = await db.select({ count: sql<number>`count(*)` }).from(privateMessages)
    .where(and(eq(privateMessages.receiverId, uid), eq(privateMessages.read, false))).get();

  const lmCount = await db.select({ count: sql<number>`count(*)` }).from(listingMessages)
    .innerJoin(entraideListings, eq(listingMessages.listingId, entraideListings.id))
    .where(and(eq(entraideListings.authorId, uid), eq(listingMessages.read, false), sql`${listingMessages.authorId} != ${uid}`)).get();

  const wCount = await db.select({ count: sql<number>`count(*)` }).from(adminWarnings)
    .where(and(eq(adminWarnings.userId, uid), eq(adminWarnings.dismissed, false))).get();

  return NextResponse.json({ count: (pmCount?.count ?? 0) + (lmCount?.count ?? 0) + (wCount?.count ?? 0) });
}
