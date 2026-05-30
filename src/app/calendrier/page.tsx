import { getDb } from "@/lib/db";
import { events, alerts } from "@/lib/schema";
import { desc, asc, eq } from "drizzle-orm";
import CalendrierClient from "./calendrier-client";
import { fallbackEvents, fallbackAlerts } from "@/lib/fallback-data";

export const dynamic = "force-dynamic";

export default async function CalendrierPage() {
  const db = getDb();
  let allEvents: any[] = fallbackEvents;
  let activeAlerts: any[] = fallbackAlerts.filter((a) => a.active);
  if (db) {
    try {
      allEvents = await db.select({
        id: events.id, title: events.title, description: events.description,
        date: events.date, type: events.type,
      }).from(events).orderBy(asc(events.date)).all();
    } catch {}
    try {
      activeAlerts = await db.select({
        id: alerts.id, message: alerts.message, type: alerts.type,
        createdAt: alerts.createdAt, active: alerts.active,
      }).from(alerts).where(eq(alerts.active, true)).orderBy(desc(alerts.createdAt)).all();
    } catch {}
  }

  return <CalendrierClient events={allEvents} alerts={activeAlerts} />;
}
