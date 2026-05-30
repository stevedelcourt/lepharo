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
    authorAvatar: users.avatarUrl,
    createdAt: polls.createdAt,
    totalVotes: sql<number>`(SELECT COUNT(*) FROM poll_votes WHERE poll_votes.poll_id = polls.id)`.as("totalVotes"),
  }).from(polls).innerJoin(users, eq(polls.authorId, users.id))
    .orderBy(desc(polls.createdAt)).all();

  const items = [];
  for (const row of rows) {
    const options = await db.select({
      id: pollOptions.id,
      label: pollOptions.label,
      count: sql<number>`(SELECT COUNT(*) FROM poll_votes WHERE poll_votes.option_id = poll_options.id)`.as("count"),
    }).from(pollOptions).where(eq(pollOptions.pollId, row.id)).all();
    items.push({ ...row, options });
  }

  return NextResponse.json(items);
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
