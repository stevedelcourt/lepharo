import { getDb } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { entraideListings, listingMessages, users } from "@/lib/schema";
import { eq, asc } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import ListingDetailClient from "./client";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function ListingDetailPage({ params }: Props) {
  const session = await getSession();
  if (!session) redirect("/connexion");

  const { id } = await params;
  const listingId = parseInt(id, 10);
  if (isNaN(listingId)) notFound();

  const db = getDb();
  if (!db) notFound();

  const listing = await db.select({
    id: entraideListings.id,
    type: entraideListings.type,
    title: entraideListings.title,
    description: entraideListings.description,
    category: entraideListings.category,
    images: entraideListings.images,
    status: entraideListings.status,
    authorId: entraideListings.authorId,
    authorName: users.firstName,
    authorFloor: users.floor,
    authorAvatar: users.avatarUrl,
    createdAt: entraideListings.createdAt,
  }).from(entraideListings).innerJoin(users, eq(entraideListings.authorId, users.id))
    .where(eq(entraideListings.id, listingId)).get();

  if (!listing) notFound();

  const messages = await db.select({
    id: listingMessages.id,
    content: listingMessages.content,
    authorId: listingMessages.authorId,
    authorName: users.firstName,
    createdAt: listingMessages.createdAt,
  }).from(listingMessages).innerJoin(users, eq(listingMessages.authorId, users.id))
    .where(eq(listingMessages.listingId, listingId))
    .orderBy(asc(listingMessages.createdAt)).all();

  return (
    <ListingDetailClient
      listing={listing}
      messages={messages}
      currentUserId={session.id}
    />
  );
}
