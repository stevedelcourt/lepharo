import { getDb } from "@/lib/db";
import { entraideListings, users } from "@/lib/schema";
import { desc, eq } from "drizzle-orm";
import EntraideClient from "./entraide-client";
import { fallbackListings } from "@/lib/fallback-data";

export const dynamic = "force-dynamic";

export default async function EntraidePage() {
  const db = getDb();
  const listings = db ? await db.select({
    id: entraideListings.id,
    type: entraideListings.type,
    title: entraideListings.title,
    category: entraideListings.category,
    authorName: users.firstName,
    authorFloor: users.floor,
    authorAvatar: users.avatarUrl,
    description: entraideListings.description,
    createdAt: entraideListings.createdAt,
    images: entraideListings.images,
  }).from(entraideListings).innerJoin(users, eq(entraideListings.authorId, users.id))
    .orderBy(desc(entraideListings.createdAt)).all() : fallbackListings.map((l) => ({ ...l, authorAvatar: null as string | null, description: l.description || "" }));

  return <EntraideClient listings={listings} />;
}
