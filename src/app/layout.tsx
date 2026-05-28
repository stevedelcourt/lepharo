import type { Metadata } from "next";
import Image from "next/image";
import { Work_Sans } from "next/font/google";
import CookieBanner from "@/components/CookieBanner";
import CookiesLink from "@/components/CookiesLink";
import { NavItem } from "@/components/SidebarNav";
import { getSession } from "@/lib/auth";
import NotifBell from "@/components/notif-bell";
import ThemeToggle from "@/components/theme-toggle";
import BurgerMenu from "@/components/burger-menu";
import {
  IconHome, IconDashboard, IconUsers, IconForum, IconHandshake,
  IconCalendar, IconFolder, IconClipboard, IconUser, IconShield,
  IconBell, IconLogout, IconLogin, IconInfo, IconMail, IconBook, IconSend, IconStar, IconMessage, IconHelp, IconPoll,
} from "@/components/icons";
import "./globals.css";
import "./sidebar.css";
import "./footer.css";

const workSans = Work_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-work-sans",
});

export const metadata: Metadata = {
  title: "Le Pharo Communauté",
  description: "Le site communautaire de la Résidence du Pharo, 75 boulevard Charles Livon, Marseille",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();
  return (
    <html lang="fr" className={workSans.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{
          __html: `(function(){try{var t=localStorage.getItem("theme");if(t==="dark"||(!t&&matchMedia("(prefers-color-scheme: dark)").matches))document.documentElement.classList.add("dark");else document.documentElement.classList.add("light")}catch(e){}})()`,
        }} />
      </head>
      <body>
        <div className="layout">
          <Sidebar session={session} />
          <div className="sidebar-overlay" />
          <div className="main-area">
            <TopBar />
            <main className="main-content">{children}</main>
            <FooterBar />
          </div>
        </div>
        <BurgerMenu />
        <CookieBanner />
      </body>
    </html>
  );
}

function TopBar() {
  return (
    <div className="top-bar">
      <div className="top-bar-left">
        <button className="burger-btn" id="burger-btn" type="button" aria-label="Menu">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/></svg>
        </button>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 4, marginLeft: "auto" }}>
        <NotifBell />
        <ThemeToggle />
      </div>
    </div>
  );
}

function Sidebar({ session }: { session: { id: number; email: string; role: string; firstName: string; lastName: string } | null }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <a href="/">
          <Image src="/lepharo.svg" alt="Le Pharo" width={223} height={273} className="sidebar-building-icon" />
          <Image src="/lepharo-text.svg" alt="Le Pharo" width={140} height={44} className="sidebar-text-icon" />
        </a>
      </div>

      <nav className="sidebar-nav">
        {session ? (
          <>
            <div className="sidebar-section-label">Navigation</div>
            <NavItem href="/dashboard" icon={<IconDashboard />} label="À la une" />
            <NavItem href="/entraide" icon={<IconHandshake />} label="Entraide" className="sidebar-link-entraide" />
            <NavItem href="/annuaire" icon={<IconUsers />} label="Annuaire" />
            <NavItem href="/forum" icon={<IconForum />} label="Forum" />
            <NavItem href="/calendrier" icon={<IconCalendar />} label="Calendrier" />
            <NavItem href="/documents" icon={<IconFolder />} label="Documents" />
            <NavItem href="/sondages" icon={<IconPoll />} label="Sondages" />
            <NavItem href="/aide" icon={<IconHelp />} label="Aide" />

            <div className="sidebar-section-label" style={{ marginTop: 16 }}>Compte</div>
            <NavItem href="/profil" icon={<IconUser />} label="Mon profil" />
            <NavItem href="/mes-annonces" icon={<IconClipboard />} label="Mes annonces" />
            <NavItem href="/messagerie" icon={<IconMessage />} label="Messagerie" />
            {session.role === "admin" && (
              <NavItem href="/admin" icon={<IconShield />} label="Admin" />
            )}
          </>
        ) : (
          <>
            <div className="sidebar-section-label">Menu</div>
            <NavItem href="/" icon={<IconHome />} label="Accueil" />
            <NavItem href="/a-propos" icon={<IconInfo />} label="A propos" />
            <NavItem href="/histoire" icon={<IconBook />} label="Histoire" />
            <NavItem href="/contact" icon={<IconSend />} label="Contact" />
          </>
        )}
      </nav>

      <div className="sidebar-bottom">
        {session ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 4, width: "100%" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "4px 0" }}>
              <span style={{ fontSize: "0.8125rem", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {session.firstName}
              </span>
              <NotifBell />
            </div>
            <NavItem href="/api/logout" icon={<IconLogout />} label="Déconnexion" />
          </div>
        ) : (
          <>
            <NavItem href="/connexion" icon={<IconLogin />} label="Se connecter" />
            <a href="/inscription" className="btn btn-primary" style={{ marginTop: 8, width: "100%", justifyContent: "center" }}>
              Rejoindre
            </a>
          </>
        )}
      </div>
    </aside>
  );
}

function FooterBar() {
  return (
    <div className="footer-bar">
      <a href="/a-propos" className="footer-bar-link">A propos</a>
      <a href="/histoire" className="footer-bar-link">Histoire</a>
      <a href="/charte" className="footer-bar-link">Charte</a>
      <a href="/confidentialite" className="footer-bar-link">Confidentialité</a>
      <a href="/mentions-legales" className="footer-bar-link">Mentions légales</a>
      <a href="/contact" className="footer-bar-link">Contact</a>
      <CookiesLink className="footer-bar-link" />
      <span className="footer-bar-copyright">&copy; 2026 L&rsquo;amicale du Pharo</span>
    </div>
  );
}
