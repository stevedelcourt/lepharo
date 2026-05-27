import type { Metadata } from "next";
import Image from "next/image";
import { Inter } from "next/font/google";
import CookieBanner from "@/components/CookieBanner";
import CookiesLink from "@/components/CookiesLink";
import "./globals.css";
import "./header.css";
import "./footer.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Le Pharo Communauté",
  description: "Le site communautaire de la Résidence du Pharo, 75 boulevard Charles Livon, Marseille",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={inter.variable}>
      <body>
        <Header />
        <main style={{ flex: 1 }}>{children}</main>
        <Footer />
        <CookieBanner />
      </body>
    </html>
  );
}

function Header() {
  return (
    <header className="header">
      <div className="container header-inner">
        <a href="/" className="header-logo">
          <Image
            src="/pharo-logo.webp"
            alt="Le Pharo Communauté"
            width={44}
            height={44}
            style={{ borderRadius: "var(--radius-sm)", flexShrink: 0 }}
          />
          <span>Le Pharo</span>
        </a>
        <nav className="header-nav">
          <a href="/" className="header-nav-link">Accueil</a>
          <a href="/a-propos" className="header-nav-link">À propos</a>
          <a href="/contact" className="header-nav-link">Contact</a>
        </nav>
        <div className="header-actions">
          <a href="/connexion" className="btn btn-ghost">Se connecter</a>
          <a href="/inscription" className="btn btn-primary">Rejoindre</a>
        </div>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-brand">
          <span className="footer-logo" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Image
              src="/pharo-logo.webp"
              alt=""
              width={36}
              height={36}
              style={{ borderRadius: 6, flexShrink: 0 }}
            />
            Le Pharo Communauté
          </span>
          <p className="footer-text">
            Résidence du Pharo, 75 boulevard Charles Livon, 13007 Marseille
          </p>
        </div>
        <nav className="footer-nav">
          <a href="/a-propos" className="footer-link">À propos</a>
          <a href="/charte" className="footer-link">Charte</a>
          <a href="/confidentialite" className="footer-link">Confidentialité</a>
          <a href="/mentions-legales" className="footer-link">Mentions légales</a>
          <a href="/contact" className="footer-link">Contact</a>
          <CookiesLink />
        </nav>
      </div>
      <div className="container footer-bottom">
        <span>© {new Date().getFullYear()} Association des résidents du Pharo</span>
      </div>
    </footer>
  );
}
