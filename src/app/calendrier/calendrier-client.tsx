"use client";

import { useState } from "react";
import { IconCalendar, IconChevronLeft, IconChevronRight, IconBuilding, IconWrench, IconParty, IconInfo, IconPlus } from "@/components/icons";
import { formatDate } from "@/lib/utils";

const months = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];

const typeMeta: Record<string, { label: string; icon: React.ComponentType<{ size?: number; className?: string }>; tagClass: string }> = {
  ag: { label: "AG", icon: IconBuilding, tagClass: "tag-ag" },
  travaux: { label: "Travaux", icon: IconWrench, tagClass: "tag-travaux" },
  convivial: { label: "Convivial", icon: IconParty, tagClass: "tag-convivial" },
  info: { label: "Info", icon: IconInfo, tagClass: "tag-info" },
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
    const parts = ev.date.split(" ");
    const day = parseInt(parts[0]);
    const monthIdx = months.indexOf(parts[1]?.toLowerCase() || "");
    const yr = parseInt(parts[2]) || year;
    return monthIdx === month && yr === year;
  });

  return (
    <div className="container" style={{ padding: "40px 24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28, gap: 24, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <IconCalendar size={28} />
          <div>
            <h1 style={{ margin: 0, marginBottom: 4 }}>Calendrier</h1>
            <p style={{ color: "var(--color-text-secondary)", fontSize: "1.0625rem", margin: 0 }}>
              Ne ratez plus rien de la vie de l&apos;immeuble.
            </p>
          </div>
        </div>
        <a href="/calendrier/nouveau" className="btn btn-primary btn-sm">
          <IconPlus size={18} />
          Proposer un événement
        </a>
      </div>

      <div className="card" style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 16px", marginBottom: 24, maxWidth: 400 }}>
        <button onClick={() => setMonth((m) => (m === 0 ? 11 : m - 1))} className="btn btn-ghost btn-sm">
          <IconChevronLeft size={18} />
        </button>
        <div style={{ flex: 1, textAlign: "center", fontWeight: 600 }}>
          {months[month]} {year}
        </div>
        <button onClick={() => setMonth((m) => (m === 11 ? 0 : m + 1))} className="btn btn-ghost btn-sm">
          <IconChevronRight size={18} />
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 48 }}>
        {filtered.length === 0 && (
          <p style={{ color: "var(--color-text-secondary)", textAlign: "center", padding: 40 }}>
            Aucun événement ce mois-ci.
          </p>
        )}
        {filtered.map((ev) => {
          const meta = typeMeta[ev.type] || { label: ev.type, icon: IconInfo, tagClass: "tag-info" };
          const TagIcon = meta.icon;
          return (
            <div key={ev.id} className="card" style={{ padding: "14px 20px", display: "flex", gap: 16, alignItems: "center", borderLeft: `4px solid var(--color-primary)` }}>
              <div style={{ minWidth: 100 }}>
                <p style={{ fontSize: "0.9375rem" }}>{ev.date}</p>
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ marginBottom: 2 }}>{ev.title}</p>
                <p style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)", margin: 0 }}>{ev.description}</p>
              </div>
              <span className={`tag ${meta.tagClass}`}>
                <TagIcon size={14} />
                {meta.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
