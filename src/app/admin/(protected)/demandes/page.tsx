"use client";

import { useState, useEffect } from "react";
import { IconFolder, IconMail, IconDownload, IconCheck, IconClose, IconTrash } from "@/components/icons";

type ProofRequest = {
  id: number;
  fileUrl: string;
  message: string | null;
  status: string;
  createdAt: string;
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  floor: number | null;
};

type ContactMessage = {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
};

export default function AdminDemandesPage() {
  const [tab, setTab] = useState<"proofs" | "contact">("proofs");
  const [proofs, setProofs] = useState<ProofRequest[]>([]);
  const [contacts, setContacts] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadData() {
    setLoading(true);
    try {
      const [proofRes, contactRes] = await Promise.all([
        fetch("/api/documents/proof"),
        fetch("/api/contact"),
      ]);
      if (proofRes.ok) setProofs(await proofRes.json());
      if (contactRes.ok) setContacts(await contactRes.json());
    } catch {}
    setLoading(false);
  }

  useEffect(() => { loadData(); }, []);

  async function approveProof(id: number, userId: number) {
    const res = await fetch("/api/admin/action", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "moderate", table: "users", id: userId, field: "coproprietaire", value: 1 }),
    });
    if (res.ok) {
      await fetch(`/api/delete?table=proof_requests&id=${id}`, { method: "DELETE" });
      loadData();
    }
  }

  async function rejectProof(id: number) {
    await fetch(`/api/delete?table=proof_requests&id=${id}`, { method: "DELETE" });
    loadData();
  }

  async function deleteContact(id: number) {
    await fetch(`/api/delete?table=contact_messages&id=${id}`, { method: "DELETE" });
    loadData();
  }

  if (loading) return <p>Chargement…</p>;

  return (
    <div>
      <h1 style={{ marginBottom: 16 }}>Demandes</h1>

      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        <button onClick={() => setTab("proofs")} className={`btn btn-sm ${tab === "proofs" ? "btn-primary" : "btn-ghost"}`} type="button">
          <IconFolder size={16} /> Accès documents ({proofs.length})
        </button>
        <button onClick={() => setTab("contact")} className={`btn btn-sm ${tab === "contact" ? "btn-primary" : "btn-ghost"}`} type="button">
          <IconMail size={16} /> Messages contact ({contacts.length})
        </button>
      </div>

      {tab === "proofs" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {proofs.length === 0 ? (
            <p style={{ color: "var(--color-text-secondary)" }}>Aucune demande d&apos;accès aux documents.</p>
          ) : proofs.map((p) => (
            <div key={p.id} className="card" style={{ padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 600, marginBottom: 2 }}>{p.firstName} {p.lastName} {p.floor ? `(${p.floor}e)` : ""}</p>
                <p style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)", marginBottom: 4 }}>{p.email}</p>
                {p.message && <p style={{ fontSize: "0.875rem", color: "var(--color-text)", marginBottom: 4, fontStyle: "italic" }}>« {p.message} »</p>}
                <p style={{ fontSize: "0.75rem", color: "var(--color-text-tertiary)" }}>Reçu le {new Date(p.createdAt).toLocaleDateString("fr-FR")}</p>
              </div>
              <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                <a href={p.fileUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm" style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                  <IconDownload size={14} /> Voir
                </a>
                <button onClick={() => approveProof(p.id, p.userId)} className="btn btn-primary btn-sm" type="button" style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                  <IconCheck size={14} /> Approuver
                </button>
                <button onClick={() => rejectProof(p.id)} className="btn-danger btn-sm" type="button" style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                  <IconClose size={14} /> Rejeter
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "contact" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {contacts.length === 0 ? (
            <p style={{ color: "var(--color-text-secondary)" }}>Aucun message de contact.</p>
          ) : contacts.map((c) => (
            <div key={c.id} className="card" style={{ padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span className="tag" style={{ fontSize: "0.75rem" }}>{c.subject}</span>
                </div>
                <p style={{ fontWeight: 600, marginBottom: 2 }}>{c.name} &lt;{c.email}&gt;</p>
                <p style={{ fontSize: "0.875rem", whiteSpace: "pre-wrap", marginBottom: 4, lineHeight: 1.5 }}>{c.message}</p>
                <p style={{ fontSize: "0.75rem", color: "var(--color-text-tertiary)" }}>Reçu le {new Date(c.createdAt).toLocaleDateString("fr-FR")}</p>
              </div>
              <button onClick={() => deleteContact(c.id)} className="btn-danger btn-sm" type="button" style={{ flexShrink: 0 }}><IconTrash size={14} /> Supprimer</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
