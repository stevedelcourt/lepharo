"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { IconCheck, IconMail } from "@/components/icons";

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 14px",
  border: "1.5px solid var(--color-border)",
  borderRadius: "var(--radius-md)",
  fontSize: "1rem",
  background: "var(--color-bg)",
  outline: "none",
};

export default function RegisterPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [floor, setFloor] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [resending, setResending] = useState(false);
  const [resentMsg, setResentMsg] = useState("");
  const router = useRouter();

  const isPhone = phone.length > 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!email && !phone) {
      setError("Email ou numéro de téléphone requis");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, email, phone, floor, password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Erreur lors de l'inscription");
        return;
      }
      if (email) {
        setShowVerifyModal(true);
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setError("Erreur réseau — veuillez réessayer");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container page-padding" style={{ maxWidth: 560, margin: "0 auto" }}>
      <h1 style={{ marginBottom: 8 }}>Rejoindre la communauté</h1>
      <p style={{ color: "var(--color-text-secondary)", marginBottom: 32 }}>
        L&apos;accès est réservé aux résidents et propriétaires du 75 boulevard
        Charles Livon. Votre inscription sera vérifiée par un administrateur.
      </p>

      {error && (
        <p style={{ color: "var(--color-accent)", fontSize: "0.875rem", marginBottom: 16 }}>
          {error}
        </p>
      )}

      <form className="card form-card" style={{ padding: 32, display: "flex", flexDirection: "column", gap: 20 }} onSubmit={handleSubmit}>
        <div className="form-row-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div>
            <label htmlFor="firstName" style={{ display: "block", fontWeight: 300, marginBottom: 6, fontSize: "0.9375rem" }}>
              Prénom
            </label>
            <input id="firstName" type="text" required value={firstName} onChange={(e) => setFirstName(e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label htmlFor="lastName" style={{ display: "block", fontWeight: 300, marginBottom: 6, fontSize: "0.9375rem" }}>
              Nom
            </label>
            <input id="lastName" type="text" required value={lastName} onChange={(e) => setLastName(e.target.value)} style={inputStyle} />
          </div>
        </div>

        <div>
          <label htmlFor="email" style={{ display: "block", fontWeight: 300, marginBottom: 6, fontSize: "0.9375rem" }}>
            Email <span style={{ color: "var(--color-text-tertiary)", fontWeight: 400 }}>(ou téléphone ci-dessous)</span>
          </label>
          <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} placeholder="votre@email.fr" />
        </div>

        <div>
          <label htmlFor="phone" style={{ display: "block", fontWeight: 300, marginBottom: 6, fontSize: "0.9375rem" }}>
            Téléphone <span style={{ color: "var(--color-text-tertiary)", fontWeight: 400 }}>(ou email ci-dessus)</span>
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
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              style={{
                ...inputStyle,
                paddingLeft: isPhone ? 80 : 14,
              }}
              placeholder="06 XX XX XX XX"
            />
          </div>
        </div>

        <div>
          <label htmlFor="floor" style={{ display: "block", fontWeight: 300, marginBottom: 6, fontSize: "0.9375rem" }}>
            Étage
          </label>
          <select id="floor" value={floor} onChange={(e) => setFloor(e.target.value)} required style={inputStyle}>
            <option value="">Sélectionnez votre étage</option>
            {Array.from({ length: 19 }, (_, i) => (
              <option key={i} value={i + 1}>{i + 1}<sup>er</sup> étage</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="password" style={{ display: "block", fontWeight: 300, marginBottom: 6, fontSize: "0.9375rem" }}>
            Mot de passe
          </label>
          <div style={{ position: "relative" }}>
            <input id="password" type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)} style={{ ...inputStyle, paddingRight: 44 }} placeholder="Au moins 8 caractères" />
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

        <label style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: "0.875rem", color: "var(--color-text-secondary)", cursor: "pointer" }}>
          <input type="checkbox" required style={{ marginTop: 3 }} />
          <span>
            J&apos;accepte la{" "}
            <a href="/charte" target="_blank">charte de la communauté</a> et la{" "}
            <a href="/confidentialite" target="_blank">politique de confidentialité</a>.
          </span>
        </label>

        <button type="submit" className="btn btn-primary btn-lg" style={{ width: "100%", marginTop: 8 }} disabled={loading}>
          {loading ? "Inscription…" : "Créer mon compte"}
        </button>

        <p style={{ textAlign: "center", fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>
          Déjà inscrit ?{" "}
          <a href="/connexion">Se connecter</a>
        </p>
      </form>

      {showVerifyModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "var(--color-bg-card)", borderRadius: 16, padding: "40px 36px", maxWidth: 420, textAlign: "center", boxShadow: "0 8px 32px rgba(0,0,0,0.15)" }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: "var(--color-primary-light)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              <IconMail size={32} style={{ color: "var(--color-primary)" }} />
            </div>
            <h2 style={{ fontSize: "1.25rem", marginBottom: 8 }}>Vérifiez votre adresse email</h2>
            <p style={{ fontSize: "0.9375rem", color: "var(--color-text-secondary)", lineHeight: 1.6, marginBottom: 8 }}>
              Un email de vérification vous a été envoyé à <strong>{email}</strong>.
              Cliquez sur le lien qu&apos;il contient pour activer votre compte.
            </p>
            <p style={{ fontSize: "0.8125rem", color: "var(--color-text-tertiary)", marginBottom: 20 }}>
              Vérifiez vos spams si vous ne le trouvez pas dans votre boîte de réception.
            </p>
            {resentMsg && (
              <p style={{ fontSize: "0.875rem", color: resentMsg.includes("success") ? "var(--color-success)" : "var(--color-error)", marginBottom: 12 }}>
                {resentMsg}
              </p>
            )}
            <button
              onClick={async () => {
                setResending(true);
                setResentMsg("");
                try {
                  const res = await fetch("/api/verify/resend", { method: "POST" });
                  const data = await res.json();
                  if (data.success) setResentMsg("Email renvoyé avec succès !");
                  else setResentMsg("Erreur: " + (data.error || ""));
                } catch { setResentMsg("Erreur réseau"); }
                setResending(false);
              }}
              disabled={resending}
              className="btn btn-ghost btn-sm"
              style={{ marginBottom: 16, fontSize: "0.8125rem" }}
            >
              {resending ? "Envoi…" : "Renvoyer l'email"}
            </button>
            <button
              onClick={() => { setShowVerifyModal(false); router.push("/dashboard"); router.refresh(); }}
              className="btn btn-primary"
              style={{ width: "100%" }}
            >
              Accéder au site
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
