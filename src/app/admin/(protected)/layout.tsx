import Link from "next/link";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { IconDashboard, IconUsers, IconForum, IconHandshake, IconFolder, IconCalendar, IconBell, IconLogout, IconBook } from "@/components/icons";
import "../admin.css";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  if (!session || session.role !== "admin") {
    redirect("/admin/login");
  }

  const navLinks = [
    { href: "/admin", label: "Tableau de bord", icon: IconDashboard },
    { href: "/admin/utilisateurs", label: "Utilisateurs", icon: IconUsers },
    { href: "/admin/forum", label: "Forum", icon: IconForum },
    { href: "/admin/rubriques", label: "Rubriques", icon: IconBook },
    { href: "/admin/entraide", label: "Entraide", icon: IconHandshake },
    { href: "/admin/documents", label: "Documents", icon: IconFolder },
    { href: "/admin/evenements", label: "Événements", icon: IconCalendar },
    { href: "/admin/alertes", label: "Alertes", icon: IconBell },
  ];

  return (
    <div>
      <div className="admin-header">
        <Link href="/admin" style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <IconDashboard size={20} /> Admin Le Pharo
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <span style={{ fontSize: "0.85rem", opacity: 0.8 }}>
            {session.firstName} {session.lastName}
          </span>
          <form action="/api/logout" method="POST">
            <button type="submit" style={{
              background: "none", border: "1px solid rgba(255,255,255,0.5)",
              color: "#fff", padding: "0.3rem 0.75rem", borderRadius: 4,
              cursor: "pointer", fontSize: "0.8rem", display: "inline-flex", alignItems: "center", gap: 4,
            }}>
              <IconLogout size={16} /> Déconnexion
            </button>
          </form>
        </div>
      </div>
      <div className="admin-layout">
        <aside className="admin-sidebar">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link key={link.href} href={link.href}>
                <Icon size={18} /> {link.label}
              </Link>
            );
          })}
        </aside>
        <main className="admin-main">{children}</main>
      </div>
    </div>
  );
}
