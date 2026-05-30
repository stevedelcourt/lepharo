import { getDb } from "@/lib/db";
import { articles } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import "./article.css";

export const dynamic = "force-dynamic";

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const db = getDb();

  let article: any = null;
  if (db) {
    try {
      const rows = await db.select().from(articles).where(eq(articles.slug, slug)).limit(1).execute();
      article = rows[0] || null;
    } catch {}
  }

  if (!article) notFound();

  return (
    <article className="article-detail">
      <div className="container">
        <div className="article-detail-header">
          <Link href="/" className="article-detail-back">← Retour à l'accueil</Link>
          <h1>{article.title}</h1>
          {article.subtitle && <p className="article-detail-subtitle">{article.subtitle}</p>}
        </div>

        {article.imageUrl && (
          <div className="article-detail-image">
            <img src={article.imageUrl} alt={article.title} />
          </div>
        )}

        {article.content && (
          <div className="article-detail-content">
            {article.content.split("\n").map((line: string, i: number) => {
              if (line.startsWith("## ")) return <h2 key={i}>{line.slice(3)}</h2>;
              if (line.startsWith("# ")) return <h1 key={i}>{line.slice(2)}</h1>;
              if (line.startsWith("### ")) return <h3 key={i}>{line.slice(4)}</h3>;
              if (line.startsWith("- ")) return <li key={i}>{line.slice(2)}</li>;
              if (line.startsWith("**") && line.endsWith("**")) return <strong key={i}>{line.slice(2, -2)}</strong>;
              if (line.trim() === "") return <br key={i} />;
              return <p key={i}>{line}</p>;
            })}
          </div>
        )}
      </div>
    </article>
  );
}
