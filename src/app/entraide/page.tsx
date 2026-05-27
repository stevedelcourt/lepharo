import { getDb } from "@/lib/db";
import { entraideListings, users } from "@/lib/schema";
import { desc, eq } from "drizzle-orm";
import EntraideClient from "./entraide-client";
import { fallbackListings } from "@/lib/fallback-data";

export default async function EntraidePage() {
  const db = getDb();
  const listings = db ? db.select({
    id: entraideListings.id,
    type: entraideListings.type,
    title: entraideListings.title,
    category: entraideListings.category,
    authorName: users.firstName,
    authorFloor: users.floor,
  }).from(entraideListings).innerJoin(users, eq(entraideListings.authorId, users.id))
    .orderBy(desc(entraideListings.createdAt)).all() : fallbackListings;

  return <EntraideClient listings={listings} />;
}
