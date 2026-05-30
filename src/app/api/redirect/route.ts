import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { forumReplies } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  let id = Number(searchParams.get("id"));
  if (!type || !id) return NextResponse.redirect(new URL("/admin/signalements", request.url));

  const db = getDb();
  if (!db) return NextResponse.redirect(new URL("/", request.url));

  if (type === "forum_reply") {
    try {
      const reply = await db.select({ topicId: forumReplies.topicId }).from(forumReplies).where(eq(forumReplies.id, id)).get();
      if (reply?.topicId) return NextResponse.redirect(new URL(`/forum/sujet/${reply.topicId}`, request.url));
    } catch {}
  }

  // Default redirects
  const urls: Record<string, string> = {
    listing: `/entraide/${id}`,
    forum_topic: `/forum/sujet/${id}`,
    listing_message: `/entraide/${id}`,
    private_message: "/messagerie",
  };
  return NextResponse.redirect(new URL(urls[type] || "/", request.url));
}
