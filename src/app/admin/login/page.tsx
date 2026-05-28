"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
        background: "#fff", padding: "2.5rem", borderRadius: 8,
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
        <input
          type="password" value={password} onChange={(e) => setPassword(e.target.value)}
          required
          className="input"
          style={{ marginBottom: "1.5rem" }}
        />

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
