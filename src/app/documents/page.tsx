import { getDb } from "@/lib/db";
import { documents } from "@/lib/schema";
import { desc } from "drizzle-orm";
import { fallbackDocuments } from "@/lib/fallback-data";
import { IconFolder, IconDownload } from "@/components/icons";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

const categoryMeta: Record<string, { name: string }> = {
  "assemblees-generales": { name: "Assemblées générales" },
  "reglement": { name: "Règlement de copropriété" },
  "budgets": { name: "Budgets et comptes" },
  "contrats": { name: "Contrats" },
  "diagnostics": { name: "Diagnostics techniques" },
  "courriers": { name: "Courriers" },
};

export default async function DocumentsPage() {
  const db = getDb();
  const allDocs = db ? await db.select().from(documents).orderBy(desc(documents.date)).all() : fallbackDocuments;

  const grouped: Record<string, typeof allDocs> = {};
  for (const doc of allDocs) {
    if (!grouped[doc.category]) grouped[doc.category] = [];
    grouped[doc.category].push(doc);
  }

  return (
    <div className="container" style={{ padding: "40px 24px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
        <IconFolder size={28} />
        <h1 style={{ margin: 0 }}>Espace documents</h1>
      </div>
      <p style={{ color: "var(--color-text-secondary)", fontSize: "1.0625rem", marginBottom: 32 }}>
        Consultez et téléchargez les documents de la copropriété.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
        {Object.entries(grouped).map(([cat, docs]) => {
          const meta = categoryMeta[cat] || { name: cat };
          return (
            <div key={cat}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <IconFolder size={22} />
                <h3 style={{ fontSize: "1.125rem", margin: 0 }}>{meta.name}</h3>
                <span style={{ fontSize: "0.8125rem", color: "var(--color-text-tertiary)" }}>
                  {docs.length} document{docs.length !== 1 ? "s" : ""}
                </span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {docs.map((doc) => (
                  <div key={doc.id} className="card" style={{ padding: "12px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ marginBottom: 2 }}>{doc.title}</p>
                      <p style={{ fontSize: "0.8125rem", color: "var(--color-text-tertiary)" }}>
                        {formatDate(doc.date)} · {doc.pages} pages
                      </p>
                    </div>
                    <button className="btn btn-outline btn-sm">
                      <IconDownload size={16} />
                      Télécharger
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
