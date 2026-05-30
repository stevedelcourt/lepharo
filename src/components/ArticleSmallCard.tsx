import Link from "next/link";
import type { ArticleData } from "./ArticleCard";

export function ArticleSmallCard({ article }: { article: ArticleData }) {
  return (
    <div className="article-small-card">
      <div className="article-small-card-image">
        {article.imageUrl ? (
          <img src={article.imageUrl} alt={article.title} />
        ) : (
          <div className="article-small-card-image-placeholder">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
          </div>
        )}
      </div>
      <div className="article-small-card-body">
        <h4 className="article-small-card-title">{article.title}</h4>
        <Link href={`/articles/${article.slug}`} className="article-small-card-link">
          Lire la suite
        </Link>
      </div>
    </div>
  );
}
