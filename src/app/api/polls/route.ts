import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { polls, pollOptions, pollVotes, users } from "@/lib/schema";
import { eq, desc, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  const db = getDb();
  if (!db) return NextResponse.json([]);

  const rows = await db.select({
    id: polls.id,
    question: polls.question,
    authorName: users.firstName,
    authorFloor: users.floor,
    createdAt: polls.createdAt,
    voteCount: sql<number>`(SELECT COUNT(*) FROM poll_votes WHERE poll_votes.poll_id = polls.id)`.as("voteCount"),
    optionCount: sql<number>`(SELECT COUNT(*) FROM poll_options WHERE poll_options.poll_id = polls.id)`.as("optionCount"),
  }).from(polls).innerJoin(users, eq(polls.authorId, users.id))
    .orderBy(desc(polls.createdAt)).all();

  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Non connecté" }, { status: 401 });

  const { question, options } = await req.json();
  if (!question || !options || !Array.isArray(options) || options.length < 2) {
    return NextResponse.json({ error: "Question et au moins 2 options requises" }, { status: 400 });
  }

  const db = getDb();
  if (!db) return NextResponse.json({ error: "Indisponible" }, { status: 503 });

  const result = await db.insert(polls).values({
    question,
    authorId: session.id,
    createdAt: sql`(datetime('now'))`,
  }).returning({ id: polls.id });

  const pollId = result[0].id;

  for (const label of options) {
    if (label.trim()) {
      await db.insert(pollOptions).values({ pollId, label: label.trim() }).run();
    }
  }

  return NextResponse.json({ id: pollId });
}
