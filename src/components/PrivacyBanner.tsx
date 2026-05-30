"use client";

import { useState } from "react";

export default function PrivacyBanner() {
  const [open, setOpen] = useState(false);

  return (
    <div className={`privacy-banner${open ? " is-open" : ""}`}>
      <div className="container">
        <button
          className="privacy-banner-toggle"
          onClick={() => setOpen((v) => !v)}
          type="button"
        >
          <span>&#x2139;&#xFE0E;</span> RGPD info
        </button>
        {open && (
          <div className="privacy-banner-body">
            <p>Ce site est une initiative bénévole entre habitants. Il ne collecte aucune donnée personnelle, ne dépose aucun cookie de suivi, et n&apos;utilise aucun outil d&apos;analyse ou de publicité.</p>
            <p>La réglementation européenne (RGPD) nous oblige à vous informer de cette politique, même lorsqu&apos;elle se résume à ceci : rien n&apos;est collecté, rien n&apos;est transmis, rien n&apos;est conservé.</p>
            <p><strong>Vous êtes chez vous.</strong></p>
          </div>
        )}
      </div>
    </div>
  );
}
