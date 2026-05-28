"use client";

import { useState, useEffect, useMemo } from "react";
import { IconCalendar, IconBuilding, IconWrench, IconParty, IconInfo, IconPlus } from "@/components/icons";

const months = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];

const typeMeta: Record<string, { label: string; icon: React.ComponentType<{ size?: number; className?: string }>; tagClass: string }> = {
  ag: { label: "AG", icon: IconBuilding, tagClass: "tag-ag" },
  travaux: { label: "Travaux", icon: IconWrench, tagClass: "tag-travaux" },
  convivial: { label: "Convivial", icon: IconParty, tagClass: "tag-convivial" },
  info: { label: "Info", icon: IconInfo, tagClass: "tag-info" },
};

type EventItem = { id: number; title: string; description: string; date: string; type: string };

function parseDate(dateStr: string): Date | null {
  const parts = dateStr.split(" ");
  const day = parseInt(parts[0]);
  const monthIdx = months.indexOf(parts[1]?.toLowerCase() || "");
  const year = parseInt(parts[2]) || new Date().getFullYear();
  if (isNaN(day) || monthIdx === -1) return null;
  return new Date(year, monthIdx, day);
}

export default function CalendrierClient({ events: initialEvents }: { events: EventItem[] }) {
  const [events] = useState(initialEvents);
  const now = useMemo(() => new Date(), []);

  const upcoming = useMemo(() => {
    const cutoff = new Date(now);
    cutoff.setMonth(cutoff.getMonth() + 2);
    return events
      .map((ev) => ({ ev, date: parseDate(ev.date) }))
      .filter((e) => e.date && e.date >= now && e.date <= cutoff)
      .sort((a, b) => (a.date!.getTime() - b.date!.getTime()))
      .map((e) => e.ev);
  }, [events, now]);

  const grouped = useMemo(() => {
    const groups: { label: string; events: EventItem[] }[] = [];
    for (const ev of upcoming) {
      const d = parseDate(ev.date);
      if (!d) continue;
      const label = months[d.getMonth()] + " " + d.getFullYear();
      const last = groups[groups.length - 1];
      if (last && last.label === label) last.events.push(ev);
      else groups.push({ label, events: [ev] });
    }
    return groups;
  }, [upcoming]);

  const nowFormatted = months[now.getMonth()] + " " + now.getFullYear();
  const cutoffDate = new Date(now);
  cutoffDate.setMonth(cutoffDate.getMonth() + 2);
  const cutoffFormatted = months[cutoffDate.getMonth()] + " " + cutoffDate.getFullYear();

  return (
    <div className="container" style={{ padding: "40px 24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28, gap: 24, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <IconCalendar size={28} />
          <div>
            <h1 style={{ margin: 0, marginBottom: 4 }}>Calendrier</h1>
            <p style={{ color: "var(--color-text-secondary)", fontSize: "1.0625rem", margin: 0 }}>
              &Agrave; venir — {nowFormatted} &rarr; {cutoffFormatted}
            </p>
          </div>
        </div>
        <a href="/calendrier/nouveau" className="btn btn-primary btn-sm">
          <IconPlus size={18} />
          Proposer un événement
        </a>
      </div>

      {upcoming.length === 0 ? (
        <div className="card" style={{ padding: 40, textAlign: "center" }}>
          <p style={{ color: "var(--color-text-secondary)", marginBottom: 16 }}>
            Aucun événement prévu dans les 2 prochains mois.
          </p>
          <a href="/calendrier/nouveau" className="btn btn-primary">Proposer un événement</a>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {grouped.map((g) => (
            <div key={g.label}>
              <h3 style={{ fontSize: "1.125rem", marginBottom: 12 }}>{g.label}</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {g.events.map((ev) => {
                  const meta = typeMeta[ev.type] || { label: ev.type, icon: IconInfo, tagClass: "tag-info" };
                  const TagIcon = meta.icon;
                  return (
                    <div key={ev.id} className="card" style={{ padding: "14px 20px", display: "flex", gap: 16, alignItems: "center", borderLeft: "4px solid var(--color-primary)" }}>
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
          ))}
        </div>
      )}
    </div>
  );
}