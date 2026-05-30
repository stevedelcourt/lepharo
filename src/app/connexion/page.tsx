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
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyle}
            placeholder="••••••••"
          />
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
