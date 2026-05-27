import Link from "next/link";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import "../admin.css";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  if (!session || session.role !== "admin") {
    redirect("/admin/login");
  }

  const navLinks = [
    { href: "/admin", label: "Tableau de bord" },
    { href: "/admin/utilisateurs", label: "Utilisateurs" },
    { href: "/admin/forum", label: "Forum" },
    { href: "/admin/entraide", label: "Entraide" },
    { href: "/admin/documents", label: "Documents" },
    { href: "/admin/evenements", label: "Événements" },
    { href: "/admin/alertes", label: "Alertes" },
  ];

  return (
    <div>
      <nav>
        <Link href="/admin">Admin Le Pharo</Link>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <span style={{ fontSize: "0.85rem", opacity: 0.8 }}>
            {session.firstName} {session.lastName}
          </span>
          <form action="/api/logout" method="POST">
            <button type="submit" style={{
              background: "none", border: "1px solid rgba(255,255,255,0.5)",
              color: "#fff", padding: "0.3rem 0.75rem", borderRadius: 4,
              cursor: "pointer", fontSize: "0.8rem", fontWeight: 300,
            }}>
              Déconnexion
            </button>
          </form>
        </div>
      </nav>
      <div className="layout">
        <aside className="sidebar">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href}>{link.label}</Link>
          ))}
        </aside>
        <main className="main">{children}</main>
      </div>
    </div>
  );
}
