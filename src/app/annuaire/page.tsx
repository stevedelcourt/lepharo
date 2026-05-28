import { getDb } from "@/lib/db";
import { users } from "@/lib/schema";
import { asc } from "drizzle-orm";
import AnnuaireClient from "./annuaire-client";
import { fallbackUsers } from "@/lib/fallback-data";

type Resident = { id: number; firstName: string; lastName: string; floor: number | null; email: string; avatarUrl: string | null; phone: string | null; bio: string | null; senior: boolean };

export const dynamic = "force-dynamic";

export default async function AnnuairePage() {
  const db = getDb();
  let residents: Resident[] = [];

  if (db) {
    try {
      residents = (await db.select({
        id: users.id, firstName: users.firstName, lastName: users.lastName,
        floor: users.floor, email: users.email, avatarUrl: users.avatarUrl,
        phone: users.phone, bio: users.bio, senior: users.senior,
      }).from(users).orderBy(asc(users.floor)).all()) as unknown as Resident[];
    } catch {
      const rows = await db.select({
        id: users.id, firstName: users.firstName, lastName: users.lastName,
        floor: users.floor, email: users.email, avatarUrl: users.avatarUrl,
        phone: users.phone, bio: users.bio,
      }).from(users).orderBy(asc(users.floor)).all();
      residents = rows.map((r: any) => ({ ...r, senior: false }));
    }
  } else {
    residents = fallbackUsers as unknown as Resident[];
  }

  return <AnnuaireClient residents={residents} />;
}
