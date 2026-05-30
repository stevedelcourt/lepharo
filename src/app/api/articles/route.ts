import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { articles } from "@/lib/schema";
import { eq, asc } from "drizzle-orm";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = searchParams.get("page");

  const db = getDb();
  if (!db) return NextResponse.json({ error: "DB unavailable" }, { status: 503 });

  try {
    let query = db.select().from(articles).orderBy(asc(articles.sortOrder));
    if (page) query = query.where(eq(articles.page, page)) as any;
    const result = await query.all();
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Query failed" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const body = await request.json();
  const db = getDb();
  if (!db) return NextResponse.json({ error: "DB unavailable" }, { status: 503 });

  try {
    const result = await db.insert(articles).values({
      title: body.title,
      slug: body.slug || body.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
      subtitle: body.subtitle || null,
      content: body.content || null,
      imageUrl: body.imageUrl || null,
      page: body.page || "home",
      sortOrder: body.sortOrder || 0,
      published: body.published || false,
    }).run();
    return NextResponse.json({ success: true, id: result.lastInsertRowid });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Insert failed" }, { status: 500 });
  }
}
