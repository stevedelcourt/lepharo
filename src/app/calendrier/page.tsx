import { getDb } from "@/lib/db";
import { events, alerts, eventComments, users } from "@/lib/schema";
import { desc, asc, eq, sql } from "drizzle-orm";
import CalendrierClient from "./calendrier-client";
import { fallbackEvents, fallbackAlerts } from "@/lib/fallback-data";

export const dynamic = "force-dynamic";

export default async function CalendrierPage() {
  const db = getDb();
  let allEvents: any[] = fallbackEvents;
  let activeAlerts: any[] = fallbackAlerts.filter((a) => a.active);
  if (db) {
    try {
      const rows = await db.select({
        id: events.id, title: events.title, description: events.description,
        date: events.date, type: events.type, allowComments: events.allowComments,
        authorId: events.authorId,
        authorName: users.firstName,
        authorAvatar: users.avatarUrl,
        commentCount: sql<number>`(SELECT COUNT(*) FROM ${eventComments} WHERE ${eq(eventComments.eventId, events.id)})`.as("commentCount"),
      }).from(events).innerJoin(users, eq(events.authorId, users.id)).orderBy(asc(events.date)).all();
      allEvents = rows;
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
