import { getDb } from "@/lib/db";
import { users } from "@/lib/schema";
import { asc } from "drizzle-orm";
import AnnuaireClient from "./annuaire-client";
import { fallbackUsers } from "@/lib/fallback-data";

export const dynamic = "force-dynamic";

export default async function AnnuairePage() {
  const db = getDb();
  const residents = db ? await db.select({
    id: users.id,
    firstName: users.firstName,
    lastName: users.lastName,
    floor: users.floor,
    email: users.email,
    avatarUrl: users.avatarUrl,
    phone: users.phone,
    bio: users.bio,
    senior: users.senior,
  }).from(users).orderBy(asc(users.floor)).all() : fallbackUsers;

  return <AnnuaireClient residents={residents} />;
}
