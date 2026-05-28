"use client";

import { openCookieSettings } from "./CookieBanner";

export default function CookiesLink({ className }: { className?: string }) {
  return (
    <a
      href="#"
      onClick={(e) => { e.preventDefault(); openCookieSettings(); }}
      className={className}
    >
      Cookies
    </a>
  );
}
