"use client";

import { useState, useEffect, useRef } from "react";
import LoginPopup from "./LoginPopup";

const PUBLIC_PATHS = [
  "/", "/inscription", "/connexion", "/a-propos", "/histoire",
  "/contact", "/charte", "/confidentialite", "/mentions-legales",
  "/aide",
];

export default function HomeClientWrapper({
  children,
  isLoggedIn,
}: {
  children: React.ReactNode;
  isLoggedIn: boolean;
}) {
  const [showLogin, setShowLogin] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isLoggedIn || !ref.current) return;
    const el = ref.current;

    const handler = (e: MouseEvent) => {
      const link = (e.target as HTMLElement).closest("a");
      if (link) {
        const href = link.getAttribute("href") || "";
        if (PUBLIC_PATHS.some((p) => href === p || href.startsWith(p + "?"))) return;
        e.preventDefault();
        e.stopPropagation();
        setShowLogin(true);
        return;
      }
      const protectedEl = (e.target as HTMLElement).closest("[data-protected]");
      if (protectedEl) {
        e.preventDefault();
        setShowLogin(true);
      }
    };

    el.addEventListener("click", handler, true);
    return () => el.removeEventListener("click", handler, true);
  }, [isLoggedIn]);

  return (
    <div ref={ref}>
      {children}
      {showLogin && <LoginPopup onClose={() => setShowLogin(false)} />}
    </div>
  );
}
