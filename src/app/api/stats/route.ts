import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { users, forumTopics, entraideListings, documents, events, alerts } from "@/lib/schema";
import { count } from "drizzle-orm";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getDb();
  if (!db) {
    return NextResponse.json({ error: "Database not available" }, { status: 503 });
  }

  const userCount = db.select({ value: count() }).from(users).get()!;
  const topicCount = db.select({ value: count() }).from(forumTopics).get()!;
  const listingCount = db.select({ value: count() }).from(entraideListings).get()!;
  const docCount = db.select({ value: count() }).from(documents).get()!;
  const eventCount = db.select({ value: count() }).from(events).get()!;
  const alertCount = db.select({ value: count() }).from(alerts).get()!;

  return NextResponse.json({
    users: userCount.value,
    topics: topicCount.value,
    listings: listingCount.value,
    documents: docCount.value,
    events: eventCount.value,
    alerts: alertCount.value,
  });
}
