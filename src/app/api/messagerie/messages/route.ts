import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { privateMessages, listingMessages, entraideListings } from "@/lib/schema";
import { eq, or, and, asc } from "drizzle-orm";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const db = getDb();
  if (!db) return NextResponse.json({ error: "Base de données non disponible" }, { status: 503 });

  const { searchParams } = new URL(request.url);
  const withId = Number(searchParams.get("with"));
  const listingId = Number(searchParams.get("listing"));

  if (listingId) {
    // Listing messages — return all messages for this listing
    const msgs = await db.select({
      id: listingMessages.id,
      senderId: listingMessages.authorId,
      content: listingMessages.content,
      createdAt: listingMessages.createdAt,
    }).from(listingMessages)
      .where(eq(listingMessages.listingId, listingId))
      .orderBy(asc(listingMessages.createdAt)).all();

    // Mark unread for the listing author
    try {
      const listing = await db.select({ authorId: entraideListings.authorId }).from(entraideListings).where(eq(entraideListings.id, listingId)).get();
      if (listing && listing.authorId === session.id) {
        for (const msg of msgs) {
          if (msg.senderId !== session.id) {
            await db.update(listingMessages).set({ read: true }).where(eq(listingMessages.id, msg.id)).run();
          }
        }
      }
    } catch {}

    return NextResponse.json(msgs);
  }

  if (!withId) return NextResponse.json({ error: "Paramètre requis" }, { status: 400 });

  // Private messages
  const messages = await db.select({
    id: privateMessages.id,
    senderId: privateMessages.senderId,
    content: privateMessages.content,
    read: privateMessages.read,
    createdAt: privateMessages.createdAt,
  }).from(privateMessages)
    .where(or(
      and(eq(privateMessages.senderId, session.id), eq(privateMessages.receiverId, withId)),
      and(eq(privateMessages.senderId, withId), eq(privateMessages.receiverId, session.id)),
    ))
    .orderBy(asc(privateMessages.createdAt)).all();

  const unreadIds = messages.filter((m) => m.senderId === withId && !m.read).map((m) => m.id);
  if (unreadIds.length > 0) {
    for (const id of unreadIds) {
      await db.update(privateMessages).set({ read: true }).where(eq(privateMessages.id, id)).run();
    }
  }

  return NextResponse.json(messages);
}

export async function DELETE(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const db = getDb();
  if (!db) return NextResponse.json({ error: "Base de données non disponible" }, { status: 503 });

  const { messageId, conversationWith, listingId } = await request.json();

  if (messageId) {
    // Try private first, then listing
    const privMsg = await db.select({ id: privateMessages.id, senderId: privateMessages.senderId })
      .from(privateMessages).where(eq(privateMessages.id, messageId)).get();
    if (privMsg) {
      if (privMsg.senderId !== session.id) return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
      await db.delete(privateMessages).where(eq(privateMessages.id, messageId)).run();
      return NextResponse.json({ success: true });
    }
    const listMsg = await db.select({ id: listingMessages.id, authorId: listingMessages.authorId })
      .from(listingMessages).where(eq(listingMessages.id, messageId)).get();
    if (listMsg) {
      if (listMsg.authorId !== session.id) return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
      await db.delete(listingMessages).where(eq(listingMessages.id, messageId)).run();
      return NextResponse.json({ success: true });
    }
    return NextResponse.json({ error: "Message introuvable" }, { status: 404 });
  }

  if (conversationWith) {
    await db.delete(privateMessages).where(or(
      and(eq(privateMessages.senderId, session.id), eq(privateMessages.receiverId, conversationWith)),
      and(eq(privateMessages.senderId, conversationWith), eq(privateMessages.receiverId, session.id)),
    )).run();
    return NextResponse.json({ success: true });
  }

  if (listingId) {
    await db.delete(listingMessages).where(eq(listingMessages.listingId, listingId)).run();
  }

  return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 });
}
