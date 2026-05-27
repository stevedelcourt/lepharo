"use client";

import { openCookieSettings } from "./CookieBanner";

export default function CookiesLink() {
  return (
    <a
      href="#"
      onClick={(e) => { e.preventDefault(); openCookieSettings(); }}
      className="footer-link"
    >
      Cookies
    </a>
  );
}
