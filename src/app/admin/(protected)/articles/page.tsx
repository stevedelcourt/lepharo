"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { IconBook } from "@/components/icons";

type Article = {
  id: number;
  title: string;
  slug: string;
  page: string;
  sortOrder: number;
  published: boolean;
  createdAt: string;
};

export default function AdminArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/articles")
      .then((r) => r.json())
      .then((data) => setArticles(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const togglePublish = async (id: number, published: boolean) => {
    await fetch(`/api/articles/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: !published }),
    });
    setArticles((prev) => prev.map((a) => (a.id === id ? { ...a, published: !published } : a)));
  };

  const deleteArticle = async (id: number) => {
    if (!confirm("Supprimer cet article ?")) return;
    await fetch(`/api/articles/${id}`, { method: "DELETE" });
    setArticles((prev) => prev.filter((a) => a.id !== id));
  };

  if (loading) return <p>Chargement…</p>;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h1 style={{ fontSize: "1.5rem" }}>Articles</h1>
        <Link href="/admin/articles/editer/0" className="btn btn-primary btn-sm">
          Nouvel article
        </Link>
      </div>

      {articles.length === 0 ? (
        <p style={{ color: "var(--color-text-secondary)" }}>Aucun article pour le moment.</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Ordre</th>
              <th>Titre</th>
              <th>Page</th>
              <th>Publié</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {articles.map((article) => (
              <tr key={article.id}>
                <td>{article.sortOrder}</td>
                <td>
                  <Link href={`/admin/articles/editer/${article.id}`} style={{ fontWeight: 600 }}>
                    {article.title}
                  </Link>
                </td>
                <td>{article.page}</td>
                <td>
                  <button
                    onClick={() => togglePublish(article.id, article.published)}
                    className={article.published ? "tag tag-info" : "tag"}
                    style={{ cursor: "pointer", border: "none" }}
                  >
                    {article.published ? "Publié" : "Brouillon"}
                  </button>
                </td>
                <td>
                  <div style={{ display: "flex", gap: 8 }}>
                    <Link href={`/admin/articles/editer/${article.id}`} className="btn btn-ghost btn-sm">
                      Modifier
                    </Link>
                    <button onClick={() => deleteArticle(article.id)} className="btn btn-ghost btn-sm" style={{ color: "var(--color-error)" }}>
                      Supprimer
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
