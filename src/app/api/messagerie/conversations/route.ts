import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { privateMessages, users } from "@/lib/schema";
import { eq, or, desc, inArray } from "drizzle-orm";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const db = getDb();
  if (!db) return NextResponse.json({ error: "Base de données non disponible" }, { status: 503 });

  const raw = await db.select({
    id: privateMessages.id,
    senderId: privateMessages.senderId,
    receiverId: privateMessages.receiverId,
    content: privateMessages.content,
    read: privateMessages.read,
    createdAt: privateMessages.createdAt,
  }).from(privateMessages)
    .where(or(eq(privateMessages.senderId, session.id), eq(privateMessages.receiverId, session.id)))
    .orderBy(desc(privateMessages.createdAt)).all();

  const partnerMap = new Map<number, { id: number; name: string; floor: number | null; lastMessage: string; time: string; unread: number }>();
  const partnerIds = new Set<number>();

  for (const msg of raw) {
    const partnerId = msg.senderId === session.id ? msg.receiverId : msg.senderId;
    partnerIds.add(partnerId);
    if (!partnerMap.has(partnerId)) {
      partnerMap.set(partnerId, { id: partnerId, name: "", floor: null, lastMessage: msg.content, time: msg.createdAt, unread: 0 });
    }
    if (msg.receiverId === session.id && !msg.read) {
      const p = partnerMap.get(partnerId)!;
      p.unread++;
    }
  }

  if (partnerIds.size === 0) {
    return NextResponse.json([]);
  }

  const idArr = [...partnerIds];
  const partners = await db.select({ id: users.id, firstName: users.firstName, lastName: users.lastName, floor: users.floor, avatarUrl: users.avatarUrl })
    .from(users).where(inArray(users.id, idArr)).all();

  const partnerNameMap = new Map(partners.map((p) => [p.id, `${p.firstName} ${p.lastName.charAt(0)}.`]));
  const partnerFloorMap = new Map(partners.map((p) => [p.id, p.floor]));
  const partnerAvatarMap = new Map(partners.map((p) => [p.id, p.avatarUrl]));

  const conversations = [...partnerMap.values()].map((c) => ({
    id: c.id,
    name: partnerNameMap.get(c.id) || "Inconnu",
    floor: partnerFloorMap.get(c.id) || null,
    avatarUrl: partnerAvatarMap.get(c.id) || null,
    lastMessage: c.lastMessage,
    time: c.time,
    unread: c.unread,
  }));

  return NextResponse.json(conversations);
}
