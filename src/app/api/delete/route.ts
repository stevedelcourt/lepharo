import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { eq } from "drizzle-orm";
import {
  users, forumTopics, forumReplies, forumRubriques, entraideListings,
  privateMessages, listingMessages,   polls, pollVotes, pollOptions, adminWarnings, events, alerts, documents,
} from "@/lib/schema";

const tableMap: Record<string, any> = {
  users, forum_topics: forumTopics, forum_replies: forumReplies,
  forum_rubriques: forumRubriques, entraide_listings: entraideListings,
  documents, events, alerts, private_messages: privateMessages,
  listing_messages: listingMessages, polls, poll_votes: pollVotes,
  admin_warnings: adminWarnings,
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
  if (!db) return NextResponse.json({ error: "Database not available" }, { status: 503 });

  if (table === "users") {
    const uid = id;
    await db.delete(forumTopics).where(eq(forumTopics.authorId, uid)).run();
    await db.delete(forumReplies).where(eq(forumReplies.authorId, uid)).run();
    await db.delete(entraideListings).where(eq(entraideListings.authorId, uid)).run();
    await db.delete(listingMessages).where(eq(listingMessages.authorId, uid)).run();
    await db.delete(privateMessages).where(eq(privateMessages.senderId, uid)).run();
    await db.delete(privateMessages).where(eq(privateMessages.receiverId, uid)).run();
    await db.delete(polls).where(eq(polls.authorId, uid)).run();
    await db.delete(pollVotes).where(eq(pollVotes.voterId, uid)).run();
    await db.delete(adminWarnings).where(eq(adminWarnings.userId, uid)).run();
    await db.delete(adminWarnings).where(eq(adminWarnings.createdBy, uid)).run();
    await db.delete(events).where(eq(events.authorId, uid)).run();
    await db.delete(alerts).where(eq(alerts.createdBy, uid)).run();
  }

  if (table === "polls") {
    await db.delete(pollVotes).where(eq(pollVotes.pollId, id)).run();
    await db.delete(pollOptions).where(eq(pollOptions.pollId, id)).run();
  }

  await db.delete(tableMap[table]).where(eq(tableMap[table].id, id)).run();
  return NextResponse.json({ success: true });
}
