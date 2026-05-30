"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 14px",
  border: "1.5px solid var(--color-border)",
  borderRadius: "var(--radius-md)",
  fontSize: "1rem",
  background: "var(--color-bg)",
  outline: "none",
};

export default function LoginPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const isPhone = identifier.length > 0 && !identifier.includes("@");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier, password }),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Email ou mot de passe incorrect");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="container page-padding" style={{ maxWidth: 440, margin: "0 auto" }}>
      <h1 style={{ marginBottom: 8 }}>Connexion</h1>
      <p style={{ color: "var(--color-text-secondary)", marginBottom: 32 }}>
        Email ou numéro de téléphone
      </p>

      {error && (
        <p style={{ color: "var(--color-accent)", fontSize: "0.875rem", marginBottom: 16 }}>
          {error}
        </p>
      )}

      <form className="card form-card" style={{ padding: 32, display: "flex", flexDirection: "column", gap: 20 }} onSubmit={handleSubmit}>
        <div>
          <label htmlFor="identifier" style={{ display: "block", fontWeight: 300, marginBottom: 6, fontSize: "0.9375rem" }}>
            Email ou téléphone
          </label>
          <div style={{ display: "flex", alignItems: "center", gap: 0, position: "relative" }}>
            {isPhone && (
              <span style={{
                position: "absolute",
                left: 12,
                display: "flex",
                alignItems: "center",
                gap: 4,
                fontSize: "0.875rem",
                color: "var(--color-text-secondary)",
                pointerEvents: "none",
                zIndex: 1,
              }}>
                <span style={{ fontSize: "1.1rem" }}>🇫🇷</span>
                <span>+33</span>
              </span>
            )}
            <input
              id="identifier"
              type={isPhone ? "tel" : "email"}
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              style={{
                ...inputStyle,
                paddingLeft: isPhone ? 80 : 14,
              }}
              placeholder="email@exemple.fr ou 06 XX XX XX XX"
            />
          </div>
        </div>
        <div>
          <label htmlFor="password" style={{ display: "block", fontWeight: 300, marginBottom: 6, fontSize: "0.9375rem" }}>
            Mot de passe
          </label>
          <div style={{ position: "relative" }}>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ ...inputStyle, paddingRight: 44 }}
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
                background: "none", border: "none", cursor: "pointer", padding: 4,
                color: "var(--color-text-tertiary)", display: "flex",
              }}
              aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
            >
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              )}
            </button>
          </div>
        </div>
        <button type="submit" className="btn btn-primary btn-lg" style={{ width: "100%", marginTop: 8 }}>
          Se connecter
        </button>

        <p style={{ textAlign: "center", fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>
          Pas encore de compte ?{" "}
          <a href="/inscription">S inscrire</a>
        </p>
      </form>
    </div>
  );
}
