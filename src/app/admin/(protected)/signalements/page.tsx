import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import { reports, users } from "@/lib/schema";
import { desc, eq } from "drizzle-orm";
import { IconWarning } from "@/components/icons";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

const typeLabels: Record<string, string> = {
  listing: "Annonce",
  forum_topic: "Sujet forum",
  poll: "Sondage",
};

export default async function AdminReportsPage() {
  const session = await getSession();
  if (!session || session.role !== "admin") redirect("/admin/login");

  const db = getDb();
  let allReports: any[] = [];
  if (db) {
    allReports = await db.select({
      id: reports.id,
      targetType: reports.targetType,
      targetId: reports.targetId,
      reason: reports.reason,
      reporterName: users.firstName,
      createdAt: reports.createdAt,
    }).from(reports).innerJoin(users, eq(reports.reporterId, users.id))
      .orderBy(desc(reports.createdAt)).all();
  }

  return (
    <>
      <h1><IconWarning size={24} /> Signalements ({allReports.length})</h1>
      {allReports.length === 0 ? (
        <div className="card" style={{ padding: 40, textAlign: "center" }}>
          <p style={{ color: "var(--color-text-secondary)" }}>Aucun signalement.</p>
        </div>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Type</th>
              <th>Cible</th>
              <th>Raison</th>
              <th>Signalé par</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {allReports.map((r: any) => (
              <tr key={r.id}>
                <td><span className="tag">{typeLabels[r.targetType] || r.targetType}</span></td>
                <td><a href={`/${r.targetType === "listing" ? "entraide" : r.targetType === "forum_topic" ? "forum/sujet" : "sondages"}/${r.targetId}`}>#{r.targetId}</a></td>
                <td style={{ maxWidth: 300, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.reason}</td>
                <td>{r.reporterName}</td>
                <td>{formatDate(r.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
