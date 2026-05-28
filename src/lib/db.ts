import type { BaseSQLiteDatabase } from "drizzle-orm/sqlite-core";
import * as schema from "./schema";

type Database = BaseSQLiteDatabase<"sync" | "async", any, typeof schema>;

let db: Database | null = null;

export function getDb(): Database | null {
  if (db !== null) return db;
  if (process.env.VERCEL) {
    if (!process.env.TURSO_DB_URL || !process.env.TURSO_DB_TOKEN) return null;
    try {
      const { createClient } = require("@libsql/client/web");
      const { drizzle } = require("drizzle-orm/libsql");
      const client = createClient({
        url: process.env.TURSO_DB_URL,
        authToken: process.env.TURSO_DB_TOKEN,
      });
      db = drizzle(client, { schema }) as unknown as Database;
      return db;
    } catch {
      return null;
    }
  }
  try {
    const Database = require("better-sqlite3");
    const path = require("path");
    const { drizzle } = require("drizzle-orm/better-sqlite3");
    const dbPath = path.join(process.cwd(), "data", "lepharo.db");
    const sqlite = new Database(dbPath);
    sqlite.pragma("journal_mode = WAL");
    sqlite.pragma("foreign_keys = ON");
    db = drizzle(sqlite, { schema }) as unknown as Database;
    return db;
  } catch {
    return null;
  }
}
