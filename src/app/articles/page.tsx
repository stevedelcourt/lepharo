import { getDb } from "@/lib/db";
import { articles } from "@/lib/schema";
import { desc } from "drizzle-orm";
import Link from "next/link";
import { IconBook } from "@/components/icons";
import { formatDate } from "@/lib/utils";
import "./articles.css";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 24;

type ArticleRow = {
  id: number;
  title: string;
  slug: string;
  subtitle: string | null;
  content: string | null;
  imageUrl: string | null;
  page: string;
  sortOrder: number;
  published: boolean | number;
  createdAt: string;
  updatedAt: string | null;
};

export default async function ArticlesPage() {
  const db = getDb();

  let allArticles: ArticleRow[] = [];
  if (db) {
    try {
      const rows = await db.select().from(articles)
        .orderBy(desc(articles.createdAt))
        .all() as ArticleRow[];
      allArticles = rows.filter((a) => a.published);
    } catch {}
  }

  return (
    <div className="container page-padding">
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
        <IconBook size={28} />
        <h1 style={{ margin: 0 }}>Articles</h1>
      </div>
      <p style={{ color: "var(--color-text-secondary)", marginBottom: 28, fontSize: "1.0625rem" }}>
        Actualités, guides et informations de la résidence.
      </p>

      {allArticles.length === 0 && (
        <p style={{ color: "var(--color-text-tertiary)", padding: 40, textAlign: "center" }}>
          Aucun article pour le moment.
        </p>
      )}

      <div className="articles-grid">
        {allArticles.slice(0, PAGE_SIZE).map((article) => (
          <Link key={article.id} href={`/articles/${article.slug}`} className="article-listing-card">
            <div className="article-listing-card-image">
              {article.imageUrl ? (
                <img src={article.imageUrl} alt={article.title} />
              ) : (
                <div className="article-listing-card-image-placeholder">
                  <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                </div>
              )}
            </div>
            <div className="article-listing-card-body">
              <h3 className="article-listing-card-title">{article.title}</h3>
              {article.subtitle && <p className="article-listing-card-subtitle">{article.subtitle}</p>}
              <div className="article-listing-card-footer">
                <span className="article-listing-card-date">{formatDate(article.createdAt)}</span>
                <span className="article-listing-card-link">Lire</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
