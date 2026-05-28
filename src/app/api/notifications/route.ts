import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { privateMessages, listingMessages, entraideListings, users } from "@/lib/schema";
import { eq, and, desc, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ items: [], nextCursor: null });

  const url = new URL(req.url);
  const cursor = url.searchParams.get("cursor");
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "10", 10), 50);
  const uid = session.id;
  const db = getDb();
  if (!db) return NextResponse.json({ items: [], nextCursor: null });

  const offset = cursor ? parseInt(cursor, 10) : 0;

  // Private messages where user is receiver
  const pmRows = await db.select({
    type: sql<string>`'private'`.as("type"),
    id: privateMessages.id,
    content: privateMessages.content,
    createdAt: privateMessages.createdAt,
    read: privateMessages.read,
    authorName: users.firstName,
    otherId: privateMessages.senderId,
    listingTitle: sql<string | null>`NULL`.as("listingTitle"),
    listingId: sql<number | null>`NULL`.as("listingId"),
  }).from(privateMessages)
    .innerJoin(users, eq(privateMessages.senderId, users.id))
    .where(eq(privateMessages.receiverId, uid))
    .orderBy(desc(privateMessages.createdAt))
    .all();

  // Listing messages where user owns the listing
  const lmRows = await db.select({
    type: sql<string>`'listing'`.as("type"),
    id: listingMessages.id,
    content: listingMessages.content,
    createdAt: listingMessages.createdAt,
    read: listingMessages.read,
    authorName: users.firstName,
    otherId: users.id,
    listingTitle: entraideListings.title,
    listingId: entraideListings.id,
  }).from(listingMessages)
    .innerJoin(users, eq(listingMessages.authorId, users.id))
    .innerJoin(entraideListings, eq(listingMessages.listingId, entraideListings.id))
    .where(and(eq(entraideListings.authorId, uid), sql`${listingMessages.authorId} != ${uid}`))
    .orderBy(desc(listingMessages.createdAt))
    .all();

  const combined = [...pmRows, ...lmRows]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const page = combined.slice(offset, offset + limit);

  return NextResponse.json({
    items: page.map((item) => ({
      type: item.type,
      id: item.id,
      content: item.content,
      createdAt: item.createdAt,
      read: item.read,
      authorName: item.authorName,
      listingTitle: item.listingTitle,
      listingId: item.listingId,
      otherId: item.otherId,
    })),
    nextCursor: offset + limit < combined.length ? String(offset + limit) : null,
  });
}
