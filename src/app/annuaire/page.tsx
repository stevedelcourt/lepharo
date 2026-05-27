import { getDb } from "@/lib/db";
import { users } from "@/lib/schema";
import { asc } from "drizzle-orm";
import AnnuaireClient from "./annuaire-client";

export default async function AnnuairePage() {
  const db = getDb();
  const residents = db.select({
    id: users.id,
    firstName: users.firstName,
    lastName: users.lastName,
    floor: users.floor,
    email: users.email,
  }).from(users).orderBy(asc(users.floor)).all();

  return <AnnuaireClient residents={residents} />;
}
