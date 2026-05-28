import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { polls, pollOptions, pollVotes, users } from "@/lib/schema";
import { eq, and, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  const { id } = await params;
  const pollId = parseInt(id, 10);
  const db = getDb();
  if (!db) return NextResponse.json({ error: "Indisponible" }, { status: 503 });

  const poll = await db.select({
    id: polls.id,
    question: polls.question,
    authorName: users.firstName,
    authorFloor: users.floor,
    createdAt: polls.createdAt,
  }).from(polls).innerJoin(users, eq(polls.authorId, users.id))
    .where(eq(polls.id, pollId)).get();

  if (!poll) return NextResponse.json({ error: "Introuvable" }, { status: 404 });

  const options = await db.select({
    id: pollOptions.id,
    label: pollOptions.label,
    count: sql<number>`(SELECT COUNT(*) FROM poll_votes WHERE poll_votes.option_id = poll_options.id)`.as("count"),
  }).from(pollOptions).where(eq(pollOptions.pollId, pollId)).all();

  const totalVotes = options.reduce((s, o) => s + o.count, 0);
  const userVote = session ? await db.select({ optionId: pollVotes.optionId }).from(pollVotes)
    .where(and(eq(pollVotes.pollId, pollId), eq(pollVotes.voterId, session.id))).get() : null;

  return NextResponse.json({ ...poll, options, totalVotes, userVote: userVote?.optionId ?? null });
}

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Non connecté" }, { status: 401 });

  const { id } = await params;
  const pollId = parseInt(id, 10);
  const db = getDb();
  if (!db) return NextResponse.json({ error: "Indisponible" }, { status: 503 });

  const { optionId } = await _req.json();
  if (!optionId) return NextResponse.json({ error: "Option requise" }, { status: 400 });

  const existing = await db.select({ id: pollVotes.id }).from(pollVotes)
    .where(and(eq(pollVotes.pollId, pollId), eq(pollVotes.voterId, session.id))).get();
  if (existing) return NextResponse.json({ error: "Vous avez déjà voté" }, { status: 409 });

  await db.insert(pollVotes).values({ pollId, optionId, voterId: session.id }).run();
  return NextResponse.json({ success: true });
}
