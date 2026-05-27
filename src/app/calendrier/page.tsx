import { getDb } from "@/lib/db";
import { events } from "@/lib/schema";
import { desc } from "drizzle-orm";
import CalendrierClient from "./calendrier-client";

export default async function CalendrierPage() {
  const db = getDb();
  const allEvents = db.select().from(events).orderBy(desc(events.date)).all();

  return <CalendrierClient events={allEvents} />;
}
