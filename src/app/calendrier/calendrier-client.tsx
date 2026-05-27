"use client";

import { useState } from "react";

const months = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];

const typeColors: Record<string, string> = {
  ag: "var(--color-primary-light)",
  travaux: "var(--color-warning-light)",
  convivial: "var(--color-success-light)",
  info: "var(--color-bg-alt)",
};

const typeLabels: Record<string, string> = {
  ag: "AG",
  travaux: "Travaux",
  convivial: "Convivial",
  info: "Info",
};

type EventItem = {
  id: number;
  title: string;
  description: string;
  date: string;
  type: string;
};

export default function CalendrierClient({ events: initialEvents }: { events: EventItem[] }) {
  const [events] = useState(initialEvents);
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth());
  const [year] = useState(now.getFullYear());

  const filtered = events.filter((ev) => {
    const evDate = new Date(ev.date.split(" ").reverse().join(" "));
    return evDate.getMonth() === month && evDate.getFullYear() === year;
  });

  return (
    <div className="container" style={{ padding: "40px 24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32, gap: 24, flexWrap: "wrap" }}>
        <div>
          <h1 style={{ marginBottom: 8 }}>Calendrier</h1>
          <p style={{ color: "var(--color-text-secondary)", fontSize: "1.0625rem", margin: 0 }}>
            Ne ratez plus rien de la vie de l immeuble.
          </p>
        </div>
        <button className="btn btn-primary">Proposer un evenement</button>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 32 }}>
        <button
          onClick={() => setMonth((m) => (m === 0 ? 11 : m - 1))}
          className="btn btn-outline"
          style={{ padding: "8px 16px" }}
        >
          &larr;
        </button>
        <div style={{ flex: 1, textAlign: "center", padding: "8px 16px", fontWeight: 300 }}>
          {months[month]} {year}
        </div>
        <button
          onClick={() => setMonth((m) => (m === 11 ? 0 : m + 1))}
          className="btn btn-outline"
          style={{ padding: "8px 16px" }}
        >
          &rarr;
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 48 }}>
        {filtered.length === 0 && (
          <p style={{ color: "var(--color-text-secondary)", textAlign: "center", padding: 40 }}>
            Aucun evenement ce mois-ci.
          </p>
        )}
        {filtered.map((ev) => (
          <div key={ev.id} className="card" style={{ padding: "16px 24px", display: "flex", gap: 20, alignItems: "center", borderLeft: `4px solid ${
            typeColors[ev.type] || "var(--color-border)"
          }` }}>
            <div style={{ minWidth: 120 }}>
              <p style={{ fontWeight: 300, fontSize: "0.9375rem" }}>{ev.date}</p>
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 300, marginBottom: 4 }}>{ev.title}</p>
              <p style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)", margin: 0 }}>{ev.description}</p>
            </div>
            <span className="tag" style={{ background: typeColors[ev.type] || "var(--color-bg-alt)" }}>
              {typeLabels[ev.type] || ev.type}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
