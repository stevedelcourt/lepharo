import Link from "next/link";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { IconDashboard, IconUsers, IconForum, IconHandshake, IconFolder, IconCalendar, IconBell, IconLogout, IconBook, IconStar, IconShield, IconWarning } from "@/components/icons";
import "../admin.css";

const roleHierarchy: Record<string, number> = { superadmin: 3, moderator: 2, editor: 1 };
const allNavLinks = [
  { href: "/admin", label: "Tableau de bord", icon: IconDashboard },
  { href: "/admin/utilisateurs", label: "Utilisateurs", icon: IconUsers, minRole: "superadmin" },
  { href: "/admin/forum", label: "Forum", icon: IconForum, minRole: "moderator" },
  { href: "/admin/rubriques", label: "Rubriques", icon: IconBook, minRole: "superadmin" },
  { href: "/admin/entraide", label: "Entraide", icon: IconHandshake, minRole: "moderator" },
  { href: "/admin/documents", label: "Documents", icon: IconFolder, minRole: "editor" },
  { href: "/admin/evenements", label: "Événements", icon: IconCalendar, minRole: "editor" },
  { href: "/admin/alertes", label: "Alertes", icon: IconBell, minRole: "editor" },
  { href: "/admin/articles", label: "Articles", icon: IconStar, minRole: "editor" },
  { href: "/admin/signalements", label: "Signalements", icon: IconWarning, minRole: "moderator" },
];

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session || session.role !== "admin") redirect("/admin/login");

  const adminRole = (session as any).adminRole || "superadmin";
  const level = roleHierarchy[adminRole] || 0;
  const navLinks = allNavLinks.filter((l) => !l.minRole || (roleHierarchy[l.minRole] || 99) <= level);

  return (
    <div>
      <div className="admin-header">
        <Link href="/admin" style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <IconDashboard size={20} /> Admin Le Pharo
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <span style={{ fontSize: "0.85rem", opacity: 0.8, display: "flex", alignItems: "center", gap: 4 }}>
            <IconShield size={14} /> {adminRole === "superadmin" ? "Super Admin" : adminRole === "moderator" ? "Modérateur" : "Éditeur"} - {session.firstName}
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
