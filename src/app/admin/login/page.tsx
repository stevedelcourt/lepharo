"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Erreur de connexion");
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center",
      justifyContent: "center", background: "var(--color-bg)",
    }}>
      <form onSubmit={handleSubmit} style={{
        background: "var(--color-bg-card)", padding: "2.5rem", borderRadius: 8,
        border: "1px solid var(--color-border)", width: "100%", maxWidth: 380,
      }}>
        <h1 style={{ fontSize: "1.3rem", marginBottom: "0.5rem" }}>
          Admin Le Pharo
        </h1>
        <p style={{ fontSize: "0.85rem", color: "var(--color-text-secondary)", marginBottom: "1.5rem" }}>
          Connectez-vous pour accéder au panneau d&apos;administration
        </p>

        {error && (
          <p style={{ color: "var(--color-accent)", fontSize: "0.85rem", marginBottom: "1rem" }}>
            {error}
          </p>
        )}

        <label style={{ display: "block", fontSize: "0.85rem", color: "var(--color-text-secondary)", marginBottom: "0.25rem" }}>
          Email
        </label>
        <input
          type="email" value={email} onChange={(e) => setEmail(e.target.value)}
          required
          className="input"
          style={{ marginBottom: "1rem" }}
        />

        <label style={{ display: "block", fontSize: "0.85rem", color: "var(--color-text-secondary)", marginBottom: "0.25rem" }}>
          Mot de passe
        </label>
        <div style={{ position: "relative" }}>
          <input
            type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)}
            required
            className="input"
            style={{ marginBottom: "1.5rem", width: "100%", paddingRight: 44 }}
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

        <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>
          Se connecter
        </button>

        <a href="/" style={{
          display: "block", textAlign: "center", marginTop: "1rem",
          fontSize: "0.8rem", color: "var(--color-text-tertiary)", textDecoration: "none",
        }}>
          Retour au site
        </a>
      </form>
    </div>
  );
}
