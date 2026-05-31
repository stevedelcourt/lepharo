import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { privateMessages, listingMessages, entraideListings, users } from "@/lib/schema";
import { eq, or, desc, inArray, and, sql } from "drizzle-orm";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const db = getDb();
  if (!db) return NextResponse.json({ error: "Base de données non disponible" }, { status: 503 });

  type ConvEntry = { id: number; name: string; floor: number | null; avatarUrl: string | null; lastMessage: string; time: string; unread: number; type: string };

  const convMap = new Map<number, ConvEntry>();

  // Private messages
  const privMsgs = await db.select({
    id: privateMessages.id,
    senderId: privateMessages.senderId,
    receiverId: privateMessages.receiverId,
    content: privateMessages.content,
    read: privateMessages.read,
    createdAt: privateMessages.createdAt,
  }).from(privateMessages)
    .where(or(eq(privateMessages.senderId, session.id), eq(privateMessages.receiverId, session.id)))
    .orderBy(desc(privateMessages.createdAt)).all();

  const partnerIds = new Set<number>();
  for (const msg of privMsgs) {
    const partnerId = msg.senderId === session.id ? msg.receiverId : msg.senderId;
    partnerIds.add(partnerId);
    const existing = convMap.get(partnerId);
    if (!existing) {
      convMap.set(partnerId, {
        id: partnerId, name: "", floor: null, avatarUrl: null,
        lastMessage: msg.content, time: msg.createdAt, unread: msg.receiverId === session.id && !msg.read ? 1 : 0,
        type: "private",
      });
    } else {
      if (msg.receiverId === session.id && !msg.read) existing.unread++;
    }
  }

  // Listing messages (entraide)
  const listMsgs = await db.select({
    id: listingMessages.id,
    listingId: listingMessages.listingId,
    authorId: listingMessages.authorId,
    content: listingMessages.content,
    createdAt: listingMessages.createdAt,
    read: listingMessages.read,
  }).from(listingMessages)
    .where(or(eq(listingMessages.authorId, session.id), sql`${listingMessages.listingId} IN (SELECT id FROM ${entraideListings} WHERE ${eq(entraideListings.authorId, session.id)})`))
    .orderBy(desc(listingMessages.createdAt)).all();

  const listingAuthorIds = new Set<number>();
  const listingTitles = new Map<number, string>();
  for (const msg of listMsgs) {
    const isOwner = msg.authorId === session.id;
    if (!listingTitles.has(msg.listingId)) {
      try {
        const listing = await db.select({ title: entraideListings.title, authorId: entraideListings.authorId })
          .from(entraideListings).where(eq(entraideListings.id, msg.listingId)).get();
        if (listing) {
          listingTitles.set(msg.listingId, listing.title);
          if (!isOwner) listingAuthorIds.add(listing.authorId);
        }
      } catch {}
    }
    const otherId = isOwner ? 0 : msg.authorId;
    const key = msg.listingId + 100000;
    const existing = convMap.get(key);
    if (!existing) {
      convMap.set(key, {
        id: key, name: listingTitles.get(msg.listingId) || "Annonce", floor: null, avatarUrl: null,
        lastMessage: msg.content, time: msg.createdAt, unread: !isOwner && !msg.read ? 1 : 0,
        type: "listing",
      });
    } else {
      if (!isOwner && !msg.read) existing.unread++;
    }
    if (otherId) partnerIds.add(otherId);
  }

  if (partnerIds.size === 0) {
    return NextResponse.json([...convMap.values()].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()));
  }

  const idArr = [...partnerIds];
  const partners = await db.select({ id: users.id, firstName: users.firstName, lastName: users.lastName, floor: users.floor, avatarUrl: users.avatarUrl })
    .from(users).where(inArray(users.id, idArr)).all();

  const partnerNameMap = new Map(partners.map((p) => [p.id, `${p.firstName} ${p.lastName.charAt(0)}.`]));
  const partnerFloorMap = new Map(partners.map((p) => [p.id, p.floor]));
  const partnerAvatarMap = new Map(partners.map((p) => [p.id, p.avatarUrl]));

  const conversations: ConvEntry[] = [];
  for (const [key, c] of convMap) {
    if (c.type === "private") {
      conversations.push({
        ...c,
        name: partnerNameMap.get(key) || "Inconnu",
        floor: partnerFloorMap.get(key) || null,
        avatarUrl: partnerAvatarMap.get(key) || null,
      });
    } else {
      conversations.push(c);
    }
  }

  return NextResponse.json(conversations.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()));
}
