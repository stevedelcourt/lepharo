import { getDb } from "@/lib/db";
import { documents } from "@/lib/schema";
import { desc } from "drizzle-orm";

const categoryMeta: Record<string, { name: string; icon: string }> = {
  "assemblees-generales": { name: "Assemblees generales", icon: "T" },
  "reglement": { name: "Reglement de copropriete", icon: "D" },
  "budgets": { name: "Budgets et comptes", icon: "O" },
  "contrats": { name: "Contrats", icon: "X" },
  "diagnostics": { name: "Diagnostics techniques", icon: "P" },
  "courriers": { name: "Courriers", icon: "A" },
};

export default async function DocumentsPage() {
  const db = getDb();
  const allDocs = db.select().from(documents).orderBy(desc(documents.date)).all();

  const grouped: Record<string, typeof allDocs> = {};
  for (const doc of allDocs) {
    if (!grouped[doc.category]) grouped[doc.category] = [];
    grouped[doc.category].push(doc);
  }

  return (
    <div className="container" style={{ padding: "40px 24px" }}>
      <h1 style={{ marginBottom: 8 }}>Espace documents</h1>
      <p style={{ color: "var(--color-text-secondary)", fontSize: "1.0625rem", marginBottom: 32 }}>
        Consultez et telechargez les documents de la copropriete.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
        {Object.entries(grouped).map(([cat, docs]) => {
          const meta = categoryMeta[cat] || { name: cat, icon: "D" };
          return (
            <div key={cat}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <span style={{ fontSize: "1.125rem", color: "var(--color-primary)" }}>{meta.icon}</span>
                <h3 style={{ fontSize: "1.125rem", margin: 0 }}>{meta.name}</h3>
                <span style={{ fontSize: "0.8125rem", color: "var(--color-text-tertiary)" }}>
                  {docs.length} document{docs.length !== 1 ? "s" : ""}
                </span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {docs.map((doc) => (
                  <div key={doc.id} className="card" style={{ padding: "14px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: 300, fontSize: "0.9375rem", marginBottom: 2 }}>{doc.title}</p>
                      <p style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)" }}>
                        {doc.date} · {doc.pages} pages
                      </p>
                    </div>
                    <button className="btn btn-outline" style={{ fontSize: "0.8125rem", padding: "6px 14px" }}>
                      Telecharger
                    </button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
