import { getDb } from "@/lib/db";
import { events } from "@/lib/schema";
import { desc } from "drizzle-orm";
import CalendrierClient from "./calendrier-client";
import { fallbackEvents } from "@/lib/fallback-data";

export const dynamic = "force-dynamic";

export default async function CalendrierPage() {
  const db = getDb();
  let allEvents = fallbackEvents;
  if (db) {
    try { allEvents = await db.select().from(events).orderBy(desc(events.date)).all(); } catch {}
  }

  return <CalendrierClient events={allEvents} />;
}
