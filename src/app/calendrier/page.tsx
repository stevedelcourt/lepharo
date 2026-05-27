import { getDb } from "@/lib/db";
import { events } from "@/lib/schema";
import { desc } from "drizzle-orm";
import CalendrierClient from "./calendrier-client";
import { fallbackEvents } from "@/lib/fallback-data";

export default async function CalendrierPage() {
  const db = getDb();
  const allEvents = db ? db.select().from(events).orderBy(desc(events.date)).all() : fallbackEvents;

  return <CalendrierClient events={allEvents} />;
}
