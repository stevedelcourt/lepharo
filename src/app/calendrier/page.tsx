import { getDb } from "@/lib/db";
import { events, alerts } from "@/lib/schema";
import { desc, eq } from "drizzle-orm";
import CalendrierClient from "./calendrier-client";
import { fallbackEvents, fallbackAlerts } from "@/lib/fallback-data";

export const dynamic = "force-dynamic";

export default async function CalendrierPage() {
  const db = getDb();
  let allEvents = fallbackEvents;
  let activeAlerts = fallbackAlerts.filter((a) => a.active);
  if (db) {
    try { allEvents = await db.select().from(events).orderBy(desc(events.date)).all(); } catch {}
    try { activeAlerts = await db.select().from(alerts).where(eq(alerts.active, true)).orderBy(desc(alerts.createdAt)).all(); } catch {}
  }

  return <CalendrierClient events={allEvents} alerts={activeAlerts} />;
}
