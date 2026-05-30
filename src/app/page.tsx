import Link from "next/link";
import Image from "next/image";
import { getSession } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { forumTopics, entraideListings, events, users, articles as articlesTable } from "@/lib/schema";
import { desc, eq, asc } from "drizzle-orm";
import { IconHandshake, IconForum, IconFolder, IconCalendar, IconUsers, IconMail, IconArrowRight } from "@/components/icons";
import HomeClientWrapper from "@/components/HomeClientWrapper";
import PrivacyBanner from "@/components/PrivacyBanner";
import { ArticleCard } from "@/components/ArticleCard";
import { ArticleSmallCard } from "@/components/ArticleSmallCard";
import type { ArticleData } from "@/components/ArticleCard";
import "./home.css";

const categories = [
  { label: "Entraide", icon: IconHandshake, path: "/entraide" },
  { label: "Forum", icon: IconForum, path: "/forum" },
  { label: "Documents", icon: IconFolder, path: "/documents" },
  { label: "Calendrier", icon: IconCalendar, path: "/calendrier" },
  { label: "Annuaire", icon: IconUsers, path: "/annuaire" },
  { label: "Messagerie", icon: IconMail, path: "/messagerie" },
];

export default async function Home() {
  const session = await getSession();
  const isLoggedIn = !!session;
  const db = getDb();

  // Articles — for both prehome and loghome
  let articles: ArticleData[] = [];
  if (db) {
    try {
      const rows = await db.select().from(articlesTable)
        .where(eq(articlesTable.page, "home"))
        .orderBy(asc(articlesTable.sortOrder))
        .all();
      articles = rows.map((r: any) => ({
        id: r.id, title: r.title, slug: r.slug, subtitle: r.subtitle,
        content: r.content, imageUrl: r.imageUrl, page: r.page,
        sortOrder: r.sortOrder, published: r.published,
        createdAt: r.createdAt, updatedAt: r.updatedAt,
      })).filter((a) => a.published);
    } catch {}
  }

  const featuredArticle = articles[0] || null;
  const smallArticles = articles.slice(1, 4);

  // Feed — logged-in only
  let feedItems: { title: string; meta: string; tag: string; href: string }[] = [];
  if (isLoggedIn && db) {
    try {
      const recentForum = await db.select({
        id: forumTopics.id,
        title: forumTopics.title,
        authorName: users.firstName,
        createdAt: forumTopics.createdAt,
      }).from(forumTopics).innerJoin(users, eq(forumTopics.authorId, users.id))
        .orderBy(desc(forumTopics.createdAt)).limit(3).all();

      const recentListings = await db.select({
        id: entraideListings.id,
        title: entraideListings.title,
        type: entraideListings.type,
        authorName: users.firstName,
        createdAt: entraideListings.createdAt,
      }).from(entraideListings).innerJoin(users, eq(entraideListings.authorId, users.id))
        .orderBy(desc(entraideListings.createdAt)).limit(3).all();

      const recentEvents = await db.select({
        id: events.id,
        title: events.title,
        date: events.date,
      }).from(events).orderBy(desc(events.date)).limit(3).all();

      feedItems = [
        ...recentForum.map((t: any) => ({
          title: t.title,
          meta: `${t.authorName} · ${timeAgo(t.createdAt)}`,
          tag: "Forum",
          href: `/forum/sujet/${t.id}`,
        })),
        ...recentListings.map((l: any) => ({
          title: l.title,
          meta: `${l.authorName} · ${timeAgo(l.createdAt)}`,
          tag: l.type === "propose" ? "Proposition" : "Recherche",
          href: `/entraide/${l.id}`,
        })),
        ...recentEvents.map((e: any) => ({
          title: e.title,
          meta: e.date,
          tag: "Événement",
          href: `/calendrier`,
        })),
      ].slice(0, 6);
    } catch {}
  }
  if (isLoggedIn && feedItems.length === 0) {
    feedItems = [
      { title: "Bienvenue sur La communauté de La Tour du Pharo", meta: "L'équipe · Il y a 1j", tag: "Info", href: "/forum" },
      { title: "Préparation AG juin 2026", meta: "Conseil syndical · Il y a 3j", tag: "Info", href: "/forum" },
      { title: "Apéro des voisins samedi", meta: "Organisé par le 8e · Il y a 5j", tag: "Événement", href: "/calendrier" },
    ];
  }

  return (
    <HomeClientWrapper isLoggedIn={isLoggedIn}>
      {isLoggedIn ? (
        <section className="hero hero-logged">
          <div className="container hero-inner">
            <h1>
              <span><em>La communauté</em></span><br />
              <span>de La Tour du Pharo</span>
            </h1>
          </div>
        </section>
      ) : (
        <section className="hero">
          <div className="hero-bg">
            <Image
              src="/pharo-tour.webp"
              alt=""
              fill
              className="hero-bg-img"
              priority
            />
          </div>
          <div className="container hero-inner">
            <h1>
              <span><em>La communauté</em></span><br />
              <span>de La Tour du Pharo</span>
            </h1>
            <p className="hero-subtitle">
              <mark>Le site privé des résidents du 75 boulevard Charles Livon. Entraide, infos, discussions entre voisins.</mark>
            </p>
            <div className="hero-actions">
              <Link href="/inscription" className="btn btn-accent">
                Rejoindre la communauté
              </Link>
              <Link href="/connexion" className="btn btn-outline btn-hero-outline">
                Se connecter
              </Link>
            </div>
          </div>
        </section>
      )}

      <PrivacyBanner />

      <section className="categories">
        <div className="container">
          <h2>Les espaces de la communauté</h2>
          <div className="categories-grid">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <Link key={cat.label} href={cat.path} className="category-card" data-protected>
                  <Icon />
                  <span>{cat.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {isLoggedIn ? (
        <section className="content-section">
          <div className="container">
            <div className="content-layout">
              <div className="content-feed">
                <h2>Activité récente</h2>
                <div className="feed-list">
                  {feedItems.map((item, i) => (
                    <Link key={i} href={item.href} className="feed-item">
                      <span className="feed-badge" />
                      <span className="feed-item-content">
                        <span className="feed-item-title">{item.title}</span>
                        <span className="feed-item-meta">{item.meta}</span>
                      </span>
                      <span className="feed-item-tag">{item.tag}</span>
                    </Link>
                  ))}
                </div>
              </div>
              <div className="content-featured" data-protected>
                {featuredArticle ? (
                  <ArticleCard article={featuredArticle} />
                ) : (
                  <div className="content-featured-empty">
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                    <p>Article à la une</p>
                  </div>
                )}
              </div>
            </div>
            {smallArticles.length > 0 && (
              <div className="content-small-cards">
                {smallArticles.map((article) => (
                  <div key={article.id} data-protected>
                    <ArticleSmallCard article={article} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      ) : (
        <section className="content-section">
          <div className="container">
            <div className="prehome-grid">
              <div className="prehome-featured" data-protected>
                {featuredArticle ? (
                  <ArticleCard article={featuredArticle} />
                ) : (
                  <div className="content-featured-empty" style={{ height: "100%" }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                    <p>Article à la une</p>
                  </div>
                )}
              </div>
              <div className="prehome-cards">
                <Link href="/aide" className="prehome-info-card">
                  <span className="prehome-info-card-title">Comment s&rsquo;inscrire ?</span>
                  <span className="prehome-info-card-desc">
                    Créez votre compte résident et rejoignez la communauté
                  </span>
                  <IconArrowRight size={20} className="prehome-info-card-arrow" />
                </Link>
                <Link href="/aide" className="prehome-info-card">
                  <span className="prehome-info-card-title">Vous avez besoin d&rsquo;aide pour l&rsquo;inscription ?</span>
                  <span className="prehome-info-card-desc">
                    Si vous n&rsquo;avez pas d&rsquo;adresse email ou pas d&rsquo;ordinateur, vous pouvez participer quand même&nbsp;: renseignez votre numéro portable pour ouvrir un compte.
                  </span>
                  <IconArrowRight size={20} className="prehome-info-card-arrow" />
                </Link>
                <Link href="/a-propos" className="prehome-info-card">
                  <span className="prehome-info-card-title">Une initiative de résidents</span>
                  <span className="prehome-info-card-desc">
                    Nous sommes des habitants, ce site n&rsquo;est pas affilié à un syndic ou autre extérieur, c&rsquo;est une initiative commune des résidents.
                  </span>
                  <IconArrowRight size={20} className="prehome-info-card-arrow" />
                </Link>
                <Link href="/contact" className="prehome-info-card">
                  <span className="prehome-info-card-title">Comment nous écrire ?</span>
                  <span className="prehome-info-card-desc">
                    Une question ? Contactez l&rsquo;équipe du site. Vous voulez participer ou vous avez des idées et propositions&nbsp;?
                  </span>
                  <IconArrowRight size={20} className="prehome-info-card-arrow" />
                </Link>
              </div>
              {smallArticles.slice(0, 3).map((article) => (
                <div key={article.id} data-protected>
                  <ArticleSmallCard article={article} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {!isLoggedIn && (
        <section className="cta-section">
          <div className="container">
            <h2>Vous habitez aussi la résidence ?</h2>
            <p>
              Créez votre compte et rejoignez vos voisins. L&apos;accès est
              réservé aux résidents et propriétaires du 75 boulevard Charles
              Livon.
            </p>
            <Link href="/inscription" className="btn btn-accent">
              Créer mon compte
            </Link>
          </div>
        </section>
      )}
    </HomeClientWrapper>
  );
}

function timeAgo(dateStr: string) {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = Math.floor((now - then) / 1000);
  if (diff < 60) return "À l'instant";
  if (diff < 3600) return `Il y a ${Math.floor(diff / 60)}min`;
  if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)}h`;
  if (diff < 2592000) return `Il y a ${Math.floor(diff / 86400)}j`;
  return dateStr;
}
