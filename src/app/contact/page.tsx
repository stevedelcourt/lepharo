"use client";

export default function ContactPage() {
  return (
    <div className="container" style={{ maxWidth: 720, margin: "0 auto", padding: "80px 24px" }}>
      <h1 style={{ marginBottom: 12 }}>Contact</h1>
      <p style={{ color: "var(--color-text-secondary)", fontSize: "1.125rem", marginBottom: 40 }}>
        Une question ? Une suggestion ? Envoyez-nous un message.
      </p>

      <form className="card" style={{ padding: 32, display: "flex", flexDirection: "column", gap: 20 }}
        onSubmit={(e) => { e.preventDefault(); }}>
        <div>
          <label htmlFor="name" style={{ display: "block", fontWeight: 300, marginBottom: 6, fontSize: "0.9375rem" }}>
            Nom
          </label>
          <input
            id="name"
            type="text"
            required
            style={{
              width: "100%",
              padding: "10px 14px",
              border: "1.5px solid var(--color-border)",
              borderRadius: "var(--radius-md)",
              fontSize: "1rem",
              background: "var(--color-bg)",
              outline: "none",
            }}
          />
        </div>
        <div>
          <label htmlFor="email" style={{ display: "block", fontWeight: 300, marginBottom: 6, fontSize: "0.9375rem" }}>
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            style={{
              width: "100%",
              padding: "10px 14px",
              border: "1.5px solid var(--color-border)",
              borderRadius: "var(--radius-md)",
              fontSize: "1rem",
              background: "var(--color-bg)",
              outline: "none",
            }}
          />
        </div>
        <div>
          <label htmlFor="subject" style={{ display: "block", fontWeight: 300, marginBottom: 6, fontSize: "0.9375rem" }}>
            Sujet
          </label>
          <select
            id="subject"
            style={{
              width: "100%",
              padding: "10px 14px",
              border: "1.5px solid var(--color-border)",
              borderRadius: "var(--radius-md)",
              fontSize: "1rem",
              background: "var(--color-bg)",
              outline: "none",
            }}
          >
            <option>Question sur le site</option>
            <option>Problème de connexion</option>
            <option>Proposer mon aide</option>
            <option>Signaler un abus</option>
            <option>Autre</option>
          </select>
        </div>
        <div>
          <label htmlFor="message" style={{ display: "block", fontWeight: 300, marginBottom: 6, fontSize: "0.9375rem" }}>
            Message
          </label>
          <textarea
            id="message"
            required
            rows={5}
            style={{
              width: "100%",
              padding: "10px 14px",
              border: "1.5px solid var(--color-border)",
              borderRadius: "var(--radius-md)",
              fontSize: "1rem",
              background: "var(--color-bg)",
              outline: "none",
              resize: "vertical",
              fontFamily: "inherit",
            }}
          />
        </div>
        <button type="submit" className="btn btn-primary" style={{ alignSelf: "flex-start" }}>
          Envoyer le message
        </button>
      </form>
    </div>
  );
}
