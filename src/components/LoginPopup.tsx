"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPopup({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        onClose();
        router.refresh();
      } else {
        setError(data.error || "Email ou mot de passe incorrect");
      }
    } catch {
      setError("Erreur de connexion");
    }
    setLoading(false);
  };

  return (
    <div className="login-popup-overlay" onClick={onClose}>
      <div className="login-popup" onClick={(e) => e.stopPropagation()}>
        <button className="login-popup-close" onClick={onClose} type="button" aria-label="Fermer">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>

        <h2 className="login-popup-title">Connexion</h2>
        <p className="login-popup-subtitle">Connectez-vous pour accéder à la communauté</p>

        <form onSubmit={handleSubmit} className="login-popup-form">
          <div>
            <input
              className="input"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
              style={{ width: "100%" }}
            />
          </div>
          <div>
            <input
              className="input"
              type="password"
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ width: "100%" }}
            />
          </div>

          {error && <p className="login-popup-error">{error}</p>}

          <button type="submit" className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }} disabled={loading}>
            {loading ? "Connexion…" : "Se connecter"}
          </button>
        </form>

        <p className="login-popup-footer">
          Pas encore de compte ?{" "}
          <a href="/inscription" onClick={(e) => { e.preventDefault(); onClose(); window.location.href = "/inscription"; }}>
            Créer un compte
          </a>
        </p>
      </div>
    </div>
  );
}
