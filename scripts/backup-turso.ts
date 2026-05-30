// Run: TURSO_DB_URL=... TURSO_DB_TOKEN=... npx tsx scripts/backup-turso.ts
// Or: npm run backup (if .env.local has TURSO vars)
import { createClient } from "@libsql/client";
import fs from "fs";
import path from "path";

const url = (process.env.TURSO_DB_URL || "") as string;
const token = (process.env.TURSO_DB_TOKEN || "") as string;
if (!url || !token) {
  console.error("Missing TURSO_DB_URL or TURSO_DB_TOKEN");
  process.exit(1);
}

function esc(val: unknown): string {
  if (val === null || val === undefined) return "NULL";
  const s = String(val).replace(/'/g, "''");
  return `'${s}'`;
}

async function main() {
  const db = createClient({ url, authToken: token });

  const tables = await db.execute(
    "SELECT name FROM sqlite_master WHERE type='table' AND name NOT GLOB 'sqlite_*' AND name != '_migrations' AND name NOT GLOB '__*' ORDER BY name"
  );
  const names = tables.rows.map((r: any) => r[0]);
  console.log(`Backing up ${names.length} tables: ${names.join(", ")}`);

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const sqlPath = path.join("backups", `turso-${timestamp}.sql`);
  const jsonPath = path.join("backups", `turso-${timestamp}.json`);

  const lines: string[] = [];
  lines.push(`-- Turso backup of lepharo — ${new Date().toISOString()}`);
  lines.push(`-- Database: ${url}`);
  lines.push("");

  const jsonData: Record<string, any[]> = {};

  for (const name of names) {
    const schema = await db.execute(
      `SELECT sql FROM sqlite_master WHERE type='table' AND name='${name}'`
    );
    if (schema.rows.length > 0 && schema.rows[0][0]) {
      lines.push((schema.rows[0][0] as string) + ";");
      lines.push("");
    }

    const rows = await db.execute(`SELECT * FROM "${name}"`);
    jsonData[name] = rows.rows as any[];

    if (rows.rows.length === 0) {
      lines.push(`-- ${name}: 0 rows`);
      lines.push("");
      continue;
    }

    const columns = rows.columns;
    for (const row of rows.rows) {
      const vals = columns.map((_: string, i: number) => esc(row[i]));
      lines.push(`INSERT INTO "${name}" ("${columns.join('", "')}") VALUES (${vals.join(", ")});`);
    }
    lines.push("");
    console.log(`  ✓ ${name}: ${rows.rows.length} rows`);
  }

  fs.writeFileSync(sqlPath, lines.join("\n"), "utf-8");
  fs.writeFileSync(jsonPath, JSON.stringify(jsonData, null, 2), "utf-8");

  const sqlSize = (fs.statSync(sqlPath).size / 1024).toFixed(1);
  const jsonSize = (fs.statSync(jsonPath).size / 1024).toFixed(1);
  console.log(`\nDone! Saved:`);
  console.log(`  ${sqlPath}  (${sqlSize} KB)`);
  console.log(`  ${jsonPath}  (${jsonSize} KB)`);

  db.close();
}

main().catch((err) => {
  console.error("Backup failed:", err);
  process.exit(1);
});
