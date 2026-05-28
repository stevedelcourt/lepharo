"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { IconPoll, IconPlus, IconChevronLeft, IconClose } from "@/components/icons";

export default function NouveauSondagePage() {
  const router = useRouter();
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function addOption() {
    if (options.length < 10) setOptions((prev) => [...prev, ""]);
  }

  function removeOption(i: number) {
    if (options.length > 2) setOptions((prev) => prev.filter((_, idx) => idx !== i));
  }

  function updateOption(i: number, val: string) {
    setOptions((prev) => { const n = [...prev]; n[i] = val; return n; });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validOptions = options.filter((o) => o.trim());
    if (!question.trim() || validOptions.length < 2) {
      setError("Question et au moins 2 options requises");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/polls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: question.trim(), options: validOptions }),
      });
      const data = await res.json();
      if (data.id) router.push(`/sondages/${data.id}`);
      else setError(data.error || "Erreur");
    } catch {
      setError("Erreur lors de la création");
    }
    setSaving(false);
  }

  return (
    <div className="container" style={{ padding: "40px 24px", maxWidth: 640, margin: "0 auto" }}>
      <a href="/sondages" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: "0.875rem", color: "var(--color-text-secondary)", textDecoration: "none", marginBottom: 24 }}>
        <IconChevronLeft size={16} /> Tous les sondages
      </a>

      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32 }}>
        <IconPlus size={28} />
        <h1 style={{ margin: 0 }}>Nouveau sondage</h1>
      </div>

      {error && <div style={{ padding: "12px 16px", borderRadius: "var(--radius-md)", fontSize: "0.9375rem", background: "var(--color-error-light)", color: "var(--color-error)", marginBottom: 20 }}>{error}</div>}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div>
          <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: 6 }}>Question</label>
          <input value={question} onChange={(e) => setQuestion(e.target.value)} className="input" placeholder="Que souhaitez-vous demander aux résidents ?" style={{ width: "100%" }} required maxLength={300} />
        </div>

        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <label style={{ fontSize: "0.875rem", fontWeight: 600 }}>Options de réponse</label>
            {options.length < 10 && (
              <button type="button" onClick={addOption} className="btn-ghost btn-sm" style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: "0.8125rem" }}>
                <IconPlus size={14} /> Ajouter une option
              </button>
            )}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {options.map((opt, i) => (
              <div key={i} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input
                  value={opt}
                  onChange={(e) => updateOption(i, e.target.value)}
                  className="input"
                  placeholder={`Option ${i + 1}`}
                  style={{ flex: 1 }}
                  required
                  maxLength={200}
                />
                {options.length > 2 && (
                  <button type="button" onClick={() => removeOption(i)} className="btn-ghost btn-sm" style={{ padding: 6, lineHeight: 1, color: "var(--color-text-tertiary)" }}>
                    <IconClose size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <button type="submit" disabled={saving || !question.trim() || options.filter((o) => o.trim()).length < 2} className="btn btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <IconPoll size={18} /> {saving ? "Création…" : "Créer le sondage"}
          </button>
          <a href="/sondages" className="btn btn-ghost">Annuler</a>
        </div>
      </form>
    </div>
  );
}
