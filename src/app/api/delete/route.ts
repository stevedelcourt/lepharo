import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getDb } from "@/lib/db";
import {
  users, forumTopics, forumReplies, entraideListings, documents, events, alerts,
} from "@/lib/schema";
import { eq } from "drizzle-orm";

const tableMap: Record<string, any> = {
  users,
  forum_topics: forumTopics,
  forum_replies: forumReplies,
  entraide_listings: entraideListings,
  documents,
  events,
  alerts,
};

export async function DELETE(request: Request) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const table = searchParams.get("table");
  const id = Number(searchParams.get("id"));

  if (!table || !id || !tableMap[table]) {
    return NextResponse.json({ error: "Invalid params" }, { status: 400 });
  }

  const db = getDb();
  if (!db) {
    return NextResponse.json({ error: "Database not available" }, { status: 503 });
  }
  await db.delete(tableMap[table]).where(eq(tableMap[table].id, id)).run();

  return NextResponse.json({ success: true });
}
