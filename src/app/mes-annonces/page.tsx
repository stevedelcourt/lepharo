import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import { entraideListings, users } from "@/lib/schema";
import { eq, desc } from "drizzle-orm";
import MesAnnoncesClient from "./client";

export const dynamic = "force-dynamic";

export default async function MesAnnoncesPage() {
  const session = await getSession();
  if (!session) redirect("/connexion");

  const db = getDb();
  let listings: {
    id: number; type: string; title: string; category: string; status: string; createdAt: string; images: string;
  }[] = [];

  if (db) {
    listings = await db.select({
      id: entraideListings.id,
      type: entraideListings.type,
      title: entraideListings.title,
      category: entraideListings.category,
      status: entraideListings.status,
      createdAt: entraideListings.createdAt,
      images: entraideListings.images,
    }).from(entraideListings)
      .where(eq(entraideListings.authorId, session.id))
      .orderBy(desc(entraideListings.createdAt)).all();
  }

  return (
    <div className="container" style={{ padding: "40px 24px", maxWidth: 720, margin: "0 auto" }}>
      <h1 style={{ marginBottom: 32 }}>Mes annonces</h1>
      <MesAnnoncesClient listings={listings} />
    </div>
  );
}
