import Link from "next/link";
import "./article-card.css";

export type ArticleData = {
  id: number;
  title: string;
  slug: string;
  subtitle: string | null;
  content: string | null;
  imageUrl: string | null;
  page: string;
  sortOrder: number;
  published: boolean;
  createdAt: string;
  updatedAt: string | null;
};

export function ArticleCard({ article }: { article: ArticleData }) {
  return (
    <div className="article-card">
      <div className="article-card-image">
        {article.imageUrl ? (
          <img src={article.imageUrl} alt={article.title} />
        ) : (
          <div className="article-card-image-placeholder">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
          </div>
        )}
      </div>
      <div className="article-card-body">
        <h3 className="article-card-title">{article.title}</h3>
        {article.subtitle && <p className="article-card-subtitle">{article.subtitle}</p>}
        <Link href={`/articles/${article.slug}`} className="article-card-link">
          Lire la suite
        </Link>
      </div>
    </div>
  );
}
