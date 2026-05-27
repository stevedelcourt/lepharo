"use client";

import { useState, useEffect, useCallback } from "react";
import "./cookie-banner.css";

const STORAGE_KEY = "lepharo-cookie-consent";

type Consent = {
  necessary: boolean;
  analytics: boolean;
  preferences: boolean;
} | null;

let openSettingsGlobal: (() => void) | null = null;

export function openCookieSettings() {
  openSettingsGlobal?.();
}

const defaultConsent: Consent = { necessary: true, analytics: false, preferences: false };

export default function CookieBanner() {
  const [consent, setConsent] = useState<Consent>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      setShowBanner(true);
    } else {
      setConsent(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    openSettingsGlobal = () => {
      setShowModal(true);
    };
    return () => { openSettingsGlobal = null; };
  }, []);

  const save = useCallback((c: Consent, closeBanner = true) => {
    setConsent(c);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(c));
    if (closeBanner) setShowBanner(false);
    setShowModal(false);
  }, []);

  const acceptAll = useCallback(() => {
    save({ necessary: true, analytics: true, preferences: true });
  }, [save]);

  const refuseAll = useCallback(() => {
    save(defaultConsent);
  }, [save]);

  const saveSettings = useCallback(() => {
    if (consent) save(consent);
  }, [consent, save]);

  return (
    <>
      <div className={`cookie-banner${!showBanner ? " hidden" : ""}`}>
        <div className="cookie-banner-inner">
          <div className="cookie-banner-text">
            <p>
              Ce site utilise des cookies pour améliorer votre expérience.
              <br />
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); setShowModal(true); }}
              >
                Personnaliser
              </a>
            </p>
          </div>
          <div className="cookie-banner-actions">
            <button className="btn btn-ghost" onClick={refuseAll}>
              Refuser
            </button>
            <button className="btn btn-accent" onClick={acceptAll}>
              Accepter
            </button>
          </div>
        </div>
      </div>

      <div className={`cookie-overlay${showModal ? " open" : ""}`}>
        <div className="cookie-modal">
          <h2>Préférences de cookies</h2>
          <p>
            Choisissez quels cookies vous autorisez. Les cookies nécessaires
            sont toujours actifs pour le fonctionnement du site.
          </p>

          <div className="cookie-category">
            <div className="cookie-category-info">
              <h4>Nécessaires</h4>
              <p>Authentification, sécurité, préférences de base.</p>
            </div>
            <button className="cookie-toggle on" disabled />
          </div>

          <div className="cookie-category">
            <div className="cookie-category-info">
              <h4>Analytiques</h4>
              <p>Fréquentation et navigation (anonymes).</p>
            </div>
            <button
              className={`cookie-toggle${consent?.analytics ? " on" : ""}`}
              onClick={() =>
                setConsent((c) =>
                  c ? { ...c, analytics: !c.analytics } : c
                )
              }
            />
          </div>

          <div className="cookie-category">
            <div className="cookie-category-info">
              <h4>Préférences</h4>
              <p>Mémorisation de vos choix et réglages.</p>
            </div>
            <button
              className={`cookie-toggle${consent?.preferences ? " on" : ""}`}
              onClick={() =>
                setConsent((c) =>
                  c ? { ...c, preferences: !c.preferences } : c
                )
              }
            />
          </div>

          <div className="cookie-modal-actions">
            <button className="btn btn-ghost" onClick={refuseAll} style={{ flex: 1 }}>
              Tout refuser
            </button>
            <button className="btn btn-outline" onClick={saveSettings} style={{ flex: 1 }}>
              Enregistrer
            </button>
            <button className="btn btn-accent" onClick={acceptAll} style={{ flex: 1 }}>
              Tout accepter
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
