"use client";

import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

export function NavItem({ href, icon, label, className, badge }: { href: string; icon: React.ReactNode; label: string; className?: string; badge?: number }) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(href + "/");
  return (
    <a href={href} className={`sidebar-link${isActive ? " active" : ""}${className ? " " + className : ""}`} style={{ position: "relative" }}>
      <span className="sidebar-link-icon">{icon}</span>
      {label}
      {badge !== undefined && badge > 0 && (
        <span style={{
          position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)",
          background: "var(--color-error)", color: "#fff",
          fontSize: "0.625rem", fontWeight: 700,
          minWidth: 18, height: 18, borderRadius: 9,
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "0 5px",
        }}>
          {badge > 99 ? "99+" : badge}
        </span>
      )}
    </a>
  );
}

export function MessagerieNavItem(props: { href: string; icon: React.ReactNode; label: string; className?: string }) {
  const [unread, setUnread] = useState(0);
  useEffect(() => {
    function fetchCount() {
      fetch("/api/messagerie/conversations")
        .then((r) => r.json())
        .then((data) => {
          const total = data.reduce((s: number, c: any) => s + (c.unread || 0), 0);
          setUnread(total);
        })
        .catch(() => {});
    }
    fetchCount();
    const id = setInterval(fetchCount, 30000);
    return () => clearInterval(id);
  }, []);
  return <NavItem {...props} badge={unread} />;
}
