"use client";

import { useEffect } from "react";

export default function BurgerMenu() {
  useEffect(() => {
    const btn = document.getElementById("burger-btn");
    const sidebar = document.querySelector(".sidebar");
    const overlay = document.querySelector(".sidebar-overlay");
    const closeBtn = document.getElementById("sidebar-close-btn");
    if (!btn || !sidebar) return;

    const el = sidebar as HTMLElement;
    const ov = overlay as HTMLElement | null;

    function toggle() {
      el.classList.toggle("open");
      if (ov) ov.classList.toggle("open");
    }

    function close() {
      el.classList.remove("open");
      if (ov) ov.classList.remove("open");
    }

    function handleKeydown(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }

    btn.addEventListener("click", toggle);
    if (ov) ov.addEventListener("click", close);
    if (closeBtn) closeBtn.addEventListener("click", close);
    document.addEventListener("keydown", handleKeydown);

    return () => {
      btn.removeEventListener("click", toggle);
      if (ov) ov.removeEventListener("click", close);
      if (closeBtn) closeBtn.removeEventListener("click", close);
      document.removeEventListener("keydown", handleKeydown);
    };
  }, []);

  return null;
}
