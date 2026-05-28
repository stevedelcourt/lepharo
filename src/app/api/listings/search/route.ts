import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { entraideListings, users } from "@/lib/schema";
import { eq, like, or, and, desc, type SQL } from "drizzle-orm";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
  }

  const db = getDb();
  if (!db) {
    return NextResponse.json({ error: "Base de donnees non disponible" }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "";
  const category = searchParams.get("category") || "";
  const type = searchParams.get("type") || "";
  const status = searchParams.get("status") || "open";

  const conditions = [eq(entraideListings.status, status)];

  if (category) {
    conditions.push(eq(entraideListings.category, category));
  }

  if (type) {
    conditions.push(eq(entraideListings.type, type));
  }

  if (q) {
    conditions.push(
      or(
        like(entraideListings.title, `%${q}%`),
        like(entraideListings.description, `%${q}%`)
      ) as SQL<unknown>
    );
  }

  const listings = await db.select({
    id: entraideListings.id,
    type: entraideListings.type,
    title: entraideListings.title,
    description: entraideListings.description,
    category: entraideListings.category,
    status: entraideListings.status,
    authorName: users.firstName,
    authorFloor: users.floor,
    createdAt: entraideListings.createdAt,
    images: entraideListings.images,
  }).from(entraideListings).innerJoin(users, eq(entraideListings.authorId, users.id))
    .where(and(...conditions))
    .orderBy(desc(entraideListings.createdAt)).all();

  return NextResponse.json(listings);
}
