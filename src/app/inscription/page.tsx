"use client";

export default function RegisterPage() {
  return (
    <div className="container" style={{ maxWidth: 560, margin: "0 auto", padding: "80px 24px" }}>
      <h1 style={{ marginBottom: 8 }}>Rejoindre la communauté</h1>
      <p style={{ color: "var(--color-text-secondary)", marginBottom: 32 }}>
        L&apos;accès est réservé aux résidents et propriétaires du 75 boulevard
        Charles Livon. Votre inscription sera vérifiée par un administrateur.
      </p>

      <form className="card" style={{ padding: 32, display: "flex", flexDirection: "column", gap: 20 }}
        onSubmit={(e) => { e.preventDefault(); }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div>
            <label htmlFor="firstName" style={{ display: "block", fontWeight: 300, marginBottom: 6, fontSize: "0.9375rem" }}>
              Prénom
            </label>
            <input id="firstName" type="text" required style={inputStyle} />
          </div>
          <div>
            <label htmlFor="lastName" style={{ display: "block", fontWeight: 300, marginBottom: 6, fontSize: "0.9375rem" }}>
              Nom
            </label>
            <input id="lastName" type="text" required style={inputStyle} />
          </div>
        </div>
        <div>
          <label htmlFor="email" style={{ display: "block", fontWeight: 300, marginBottom: 6, fontSize: "0.9375rem" }}>
            Email
          </label>
          <input id="email" type="email" required style={inputStyle} placeholder="votre@email.fr" />
        </div>
        <div>
          <label htmlFor="floor" style={{ display: "block", fontWeight: 300, marginBottom: 6, fontSize: "0.9375rem" }}>
            Étage
          </label>
          <select id="floor" required style={inputStyle}>
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
          <input id="password" type="password" required style={inputStyle} placeholder="Au moins 8 caractères" />
        </div>
        <div>
          <label htmlFor="document" style={{ display: "block", fontWeight: 300, marginBottom: 6, fontSize: "0.9375rem" }}>
            Justificatif d&apos;occupation
          </label>
          <p style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)", marginBottom: 8 }}>
            Avis de taxe foncière, bail ou quittance de charges. Le fichier
            est supprimé après vérification de votre compte.
          </p>
          <input
            id="document"
            type="file"
            required
            accept=".pdf,.jpg,.jpeg,.png"
            style={{
              width: "100%",
              padding: "8px 0",
              fontSize: "0.9375rem",
            }}
          />
        </div>
        <label style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: "0.875rem", color: "var(--color-text-secondary)", cursor: "pointer" }}>
          <input type="checkbox" required style={{ marginTop: 3 }} />
          <span>
            J&apos;accepte la{" "}
            <a href="/charte" target="_blank">charte de la communauté</a> et la{" "}
            <a href="/confidentialite" target="_blank">politique de confidentialité</a>.
          </span>
        </label>
        <button type="submit" className="btn btn-primary btn-lg" style={{ width: "100%", marginTop: 8 }}>
          Créer mon compte
        </button>
        <p style={{ textAlign: "center", fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>
          Déjà inscrit ?{" "}
          <a href="/connexion">Se connecter</a>
        </p>
      </form>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 14px",
  border: "1.5px solid var(--color-border)",
  borderRadius: "var(--radius-md)",
  fontSize: "1rem",
  background: "var(--color-bg)",
  outline: "none",
};
