import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";

let db: BetterSQLite3Database<typeof schema> | null = null;

export function getDb(): BetterSQLite3Database<typeof schema> | null {
  if (db !== null) return db;
  if (process.env.VERCEL) return null;

  try {
    const Database = require("better-sqlite3");
    const path = require("path");
    const { drizzle } = require("drizzle-orm/better-sqlite3");
    const dbPath = path.join(process.cwd(), "data", "lepharo.db");
    const sqlite = new Database(dbPath);
    sqlite.pragma("journal_mode = WAL");
    sqlite.pragma("foreign_keys = ON");
    db = drizzle(sqlite, { schema });
    return db;
  } catch {
    return null;
  }
}
