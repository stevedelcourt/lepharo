import Link from "next/link";
import Image from "next/image";
import { IconHandshake, IconForum, IconFolder, IconCalendar, IconUsers, IconMail } from "@/components/icons";
import "./home.css";

const categories = [
  { label: "Entraide", icon: IconHandshake, path: "/entraide" },
  { label: "Forum", icon: IconForum, path: "/forum" },
  { label: "Documents", icon: IconFolder, path: "/documents" },
  { label: "Calendrier", icon: IconCalendar, path: "/calendrier" },
  { label: "Annuaire", icon: IconUsers, path: "/annuaire" },
  { label: "Messagerie", icon: IconMail, path: "/messagerie" },
];

const feed = [
  { title: "Recherche perceuse pour ce week-end", meta: "Marie L. · Il y a 2h", tag: "Entraide" },
  { title: "Préparation AG juin 2026", meta: "Paul R. · Il y a 5h", tag: "Forum" },
  { title: "Intervention ascenseur 3 juin", meta: "Administration · Il y a 1j", tag: "Alerte" },
  { title: "Apéro des voisins samedi 31 mai", meta: "Organisé par le 8e · Il y a 2j", tag: "Événement" },
  { title: "Cours d'anglais pour enfants", meta: "Sophie K. · Il y a 2j", tag: "Entraide" },
];

export default function Home() {
  return (
    <>
      <section className="hero">
        <div className="container hero-inner">
          <div className="hero-content">
            <h1>
              Le Pharo<br />
              <em>Communauté</em>
            </h1>
            <p>
              Le site privé des résidents du 75 boulevard Charles Livon.
              Entraide, infos, discussions entre voisins.
            </p>
            <div className="hero-actions">
              <Link href="/inscription" className="btn btn-accent btn-lg">
                Rejoindre la communauté
              </Link>
              <Link href="/connexion" className="btn btn-outline btn-lg">
                Se connecter
              </Link>
            </div>
            <div className="hero-cta-secondary">
              <Link href="/a-propos">En savoir plus sur le projet</Link>
            </div>
          </div>
          <div className="hero-image">
            <Image
              src="/pharo-tour.webp"
              alt="La Tour de la Résidence du Pharo"
              width={800}
              height={473}
              className="hero-img"
              priority
            />
          </div>
        </div>
      </section>

      <section className="categories">
        <div className="container">
          <h2>Les espaces de la communauté</h2>
          <div className="categories-grid">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <Link key={cat.label} href={cat.path} className="category-card">
                  <Icon />
                  <span>{cat.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section live-feed">
        <div className="container">
          <h2>Activité récente</h2>
          <div className="feed-list">
            {feed.map((item, i) => (
              <div key={i} className="feed-item">
                <div className="feed-badge" />
                <div className="feed-item-content">
                  <div className="feed-item-title">{item.title}</div>
                  <div className="feed-item-meta">{item.meta}</div>
                </div>
                <span className="feed-item-tag">{item.tag}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="container">
          <h2>Vous habitez aussi la résidence ?</h2>
          <p>
            Créez votre compte et rejoignez vos voisins. L&apos;accès est
            réservé aux résidents et propriétaires du 75 boulevard Charles
            Livon.
          </p>
          <Link href="/inscription" className="btn btn-accent btn-lg">
            Créer mon compte
          </Link>
        </div>
      </section>
    </>
  );
}
