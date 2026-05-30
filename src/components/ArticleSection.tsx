import { getDb } from "@/lib/db";
import { articles as articlesTable } from "@/lib/schema";
import { eq, asc } from "drizzle-orm";
import { ArticleCard } from "./ArticleCard";
import { ArticleSmallCard } from "./ArticleSmallCard";
import type { ArticleData } from "./ArticleCard";

export async function ArticleSection({ page }: { page: string }) {
  const db = getDb();
  let items: ArticleData[] = [];

  if (db) {
    try {
      const rows = await db.select().from(articlesTable)
        .where(eq(articlesTable.page, page))
        .orderBy(asc(articlesTable.sortOrder))
        .all();
      items = rows.map((r: any) => ({
        id: r.id,
        title: r.title,
        slug: r.slug,
        subtitle: r.subtitle,
        content: r.content,
        imageUrl: r.imageUrl,
        page: r.page,
        sortOrder: r.sortOrder,
        published: r.published,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
      })).filter((a: ArticleData) => a.published);
    } catch {}
  }

  if (items.length === 0) return null;

  const featured = items[0];
  const cards = items.slice(1, 4);

  return (
    <section className="articles-section">
      <div className="container">
        <div className="articles-layout">
          <div className="articles-featured">
            <ArticleCard article={featured} />
          </div>
          {cards.length > 0 && (
            <div className="articles-grid">
              {cards.map((article) => (
                <ArticleSmallCard key={article.id} article={article} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
