"use client";

import { useState } from "react";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("Question sur le site");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !email || !message || sending) return;
    setSending(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, subject, message }),
      });
      if (res.ok) {
        setSent(true);
      } else {
        const data = await res.json();
        alert(data.error || "Erreur lors de l'envoi");
      }
    } catch {
      alert("Erreur lors de l'envoi");
    } finally {
      setSending(false);
    }
  }

  if (sent) {
    return (
      <div className="container page-padding" style={{ maxWidth: 720, margin: "0 auto" }}>
        <h1 style={{ marginBottom: 12 }}>Message envoyé</h1>
        <p style={{ color: "var(--color-text-secondary)", fontSize: "1.125rem" }}>
          Merci ! Nous vous répondrons dans les plus brefs délais.
        </p>
      </div>
    );
  }

  return (
    <div className="container page-padding" style={{ maxWidth: 720, margin: "0 auto" }}>
      <h1 style={{ marginBottom: 12 }}>Contact</h1>
      <p style={{ color: "var(--color-text-secondary)", fontSize: "1.125rem", marginBottom: 40 }}>
        Une question ? Une suggestion ? Envoyez-nous un message.
      </p>

      <form className="card form-card" style={{ padding: 32, display: "flex", flexDirection: "column", gap: 20 }} onSubmit={handleSubmit}>
        <div>
          <label htmlFor="name" style={{ display: "block", fontWeight: 300, marginBottom: 6, fontSize: "0.9375rem" }}>Nom</label>
          <input id="name" type="text" required value={name} onChange={(e) => setName(e.target.value)}
            style={{ width: "100%", padding: "10px 14px", border: "1.5px solid var(--color-border)", borderRadius: "var(--radius-md)", fontSize: "1rem", background: "var(--color-bg)", outline: "none" }} />
        </div>
        <div>
          <label htmlFor="email" style={{ display: "block", fontWeight: 300, marginBottom: 6, fontSize: "0.9375rem" }}>Email</label>
          <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
            style={{ width: "100%", padding: "10px 14px", border: "1.5px solid var(--color-border)", borderRadius: "var(--radius-md)", fontSize: "1rem", background: "var(--color-bg)", outline: "none" }} />
        </div>
        <div>
          <label htmlFor="subject" style={{ display: "block", fontWeight: 300, marginBottom: 6, fontSize: "0.9375rem" }}>Sujet</label>
          <select id="subject" value={subject} onChange={(e) => setSubject(e.target.value)}
            style={{ width: "100%", padding: "10px 14px", border: "1.5px solid var(--color-border)", borderRadius: "var(--radius-md)", fontSize: "1rem", background: "var(--color-bg)", outline: "none" }}>
            <option>Question sur le site</option>
            <option>Problème de connexion</option>
            <option>Proposer mon aide</option>
            <option>Signaler un abus</option>
            <option>Autre</option>
          </select>
        </div>
        <div>
          <label htmlFor="message" style={{ display: "block", fontWeight: 300, marginBottom: 6, fontSize: "0.9375rem" }}>Message</label>
          <textarea id="message" required rows={5} value={message} onChange={(e) => setMessage(e.target.value)}
            style={{ width: "100%", padding: "10px 14px", border: "1.5px solid var(--color-border)", borderRadius: "var(--radius-md)", fontSize: "1rem", background: "var(--color-bg)", outline: "none", resize: "vertical", fontFamily: "inherit" }} />
        </div>
        <button type="submit" className="btn btn-primary" disabled={sending} style={{ alignSelf: "flex-start" }}>
          {sending ? "Envoi…" : "Envoyer le message"}
        </button>
      </form>
    </div>
  );
}
