"use client";

import { usePathname } from "next/navigation";

export function NavItem({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(href + "/");
  return (
    <a href={href} className={`sidebar-link${isActive ? " active" : ""}`}>
      <span className="sidebar-link-icon">{icon}</span>
      {label}
    </a>
  );
}
