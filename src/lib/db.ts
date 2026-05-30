import type { BaseSQLiteDatabase } from "drizzle-orm/sqlite-core";
import * as schema from "./schema";

type Database = BaseSQLiteDatabase<"sync" | "async", any, typeof schema>;

let db: Database | null = null;
let migrated = false;

const MIGRATIONS: { id: string; sql: string }[] = [
  { id: "001_images", sql: `ALTER TABLE entraide_listings ADD COLUMN images text DEFAULT '[]' NOT NULL` },
  { id: "002_locked", sql: `ALTER TABLE forum_topics ADD COLUMN locked integer DEFAULT false NOT NULL` },
  { id: "003_rubriques", sql: `CREATE TABLE IF NOT EXISTS forum_rubriques (id integer PRIMARY KEY AUTOINCREMENT NOT NULL, name text NOT NULL UNIQUE, slug text NOT NULL UNIQUE, description text, created_at text DEFAULT (datetime('now')) NOT NULL)` },
  { id: "004_rubriques_seed", sql: `INSERT OR IGNORE INTO forum_rubriques (name, slug, description) VALUES ('Vie quotidienne', 'vie-quotidienne', 'Bruit, propreté, animaux, tri sélectif, stationnement…'), ('Travaux et entretien', 'travaux', 'Ravalement, ascenseurs, chauffage, isolation, devis…'), ('Nuisibles et problèmes sanitaires', 'nuisibles', 'Punaises de lit, cafards, rongeurs, signalements…'), ('Syndic et gouvernance', 'syndic', 'Préparation des AG, PV, comptes, mise en concurrence.'), ('Le quartier du Pharo', 'quartier', 'Actualités, événements, commerces de proximité.'), ('Le Bistrot', 'bistrot', 'Pour parler de tout et de rien. Photos de la vue, recommandations…')` },
  { id: "005_private_messages", sql: `CREATE TABLE IF NOT EXISTS private_messages (id integer PRIMARY KEY AUTOINCREMENT NOT NULL, sender_id integer NOT NULL REFERENCES users(id), receiver_id integer NOT NULL REFERENCES users(id), content text NOT NULL, read integer DEFAULT false NOT NULL, created_at text DEFAULT (datetime('now')) NOT NULL)` },
  { id: "006_admin_warnings", sql: `CREATE TABLE IF NOT EXISTS admin_warnings (id integer PRIMARY KEY AUTOINCREMENT NOT NULL, user_id integer NOT NULL REFERENCES users(id), message text NOT NULL, created_by integer NOT NULL REFERENCES users(id), created_at text DEFAULT (datetime('now')) NOT NULL)` },
  { id: "007_listing_messages_read", sql: `ALTER TABLE listing_messages ADD COLUMN read integer DEFAULT false NOT NULL` },
  { id: "008_fix_dates_listings", sql: `UPDATE entraide_listings SET created_at = datetime('now') WHERE created_at LIKE '(datetime%'` },
  { id: "009_fix_dates_topics", sql: `UPDATE forum_topics SET created_at = datetime('now') WHERE created_at LIKE '(datetime%'` },
  { id: "010_fix_dates_replies", sql: `UPDATE forum_replies SET created_at = datetime('now') WHERE created_at LIKE '(datetime%'` },
  { id: "011_fix_dates_users", sql: `UPDATE users SET created_at = datetime('now') WHERE created_at LIKE '(datetime%'` },
  { id: "012_fix_dates_events", sql: `UPDATE events SET created_at = datetime('now') WHERE created_at LIKE '(datetime%'` },
  { id: "013_fix_dates_alerts", sql: `UPDATE alerts SET created_at = datetime('now') WHERE created_at LIKE '(datetime%'` },
  { id: "014_users_senior", sql: `ALTER TABLE users ADD COLUMN senior integer DEFAULT false NOT NULL` },
  { id: "015_polls", sql: `CREATE TABLE IF NOT EXISTS polls (id integer PRIMARY KEY AUTOINCREMENT NOT NULL, question text NOT NULL, author_id integer NOT NULL REFERENCES users(id), created_at text DEFAULT (datetime('now')) NOT NULL)` },
  { id: "016_poll_options", sql: `CREATE TABLE IF NOT EXISTS poll_options (id integer PRIMARY KEY AUTOINCREMENT NOT NULL, poll_id integer NOT NULL REFERENCES polls(id), label text NOT NULL)` },
  { id: "017_poll_votes", sql: `CREATE TABLE IF NOT EXISTS poll_votes (id integer PRIMARY KEY AUTOINCREMENT NOT NULL, poll_id integer NOT NULL REFERENCES polls(id), option_id integer NOT NULL REFERENCES poll_options(id), voter_id integer NOT NULL REFERENCES users(id))` },
  { id: "018_admin_role", sql: `ALTER TABLE users ADD COLUMN admin_role text DEFAULT NULL` },
  { id: "019_users_tagline", sql: `ALTER TABLE users ADD COLUMN tagline text DEFAULT NULL` },
  { id: "020_admin_warnings_dismissed", sql: `ALTER TABLE admin_warnings ADD COLUMN dismissed integer DEFAULT 0 NOT NULL` },
  { id: "021_user_mathias", sql: `INSERT OR IGNORE INTO users (first_name, last_name, email, password_hash, role, verified, admin_role) VALUES ('Mathias', 'Admin', 'mathias@mentivis.com', '$2b$10$JyxF6qzKfrQoJIiGWoEHeub85SbJ8RRv47c0vgQnIpGOtQUeL6Qq2', 'admin', 1, 'superadmin')` },
  { id: "022_articles", sql: `CREATE TABLE IF NOT EXISTS articles (id integer PRIMARY KEY AUTOINCREMENT NOT NULL, title text NOT NULL, slug text NOT NULL UNIQUE, subtitle text, content text, image_url text, page text NOT NULL DEFAULT 'home', sort_order integer NOT NULL DEFAULT 0, published integer NOT NULL DEFAULT 0, created_at text DEFAULT (datetime('now')) NOT NULL, updated_at text)` },
  { id: "023_show_full_name", sql: `ALTER TABLE users ADD COLUMN show_full_name integer DEFAULT 0 NOT NULL` },
  { id: "024_kids", sql: `ALTER TABLE users ADD COLUMN kids integer DEFAULT 0 NOT NULL` },
  { id: "024b_reports_table", sql: `CREATE TABLE IF NOT EXISTS reports (id integer PRIMARY KEY AUTOINCREMENT NOT NULL, target_type text NOT NULL, target_id integer NOT NULL, reason text NOT NULL, reporter_id integer REFERENCES users(id), created_at text DEFAULT (datetime('now')) NOT NULL)` },
  { id: "025a_reports_auto_flagged", sql: `ALTER TABLE reports ADD COLUMN auto_flagged integer DEFAULT 0 NOT NULL` },
  { id: "025b_reports_score", sql: `ALTER TABLE reports ADD COLUMN score integer DEFAULT 0` },
  { id: "025c_reports_categories", sql: `ALTER TABLE reports ADD COLUMN categories text DEFAULT '[]'` },
  { id: "025d_reports_matched_rules", sql: `ALTER TABLE reports ADD COLUMN matched_rules text DEFAULT '[]'` },
  { id: "025e_reports_resolved", sql: `ALTER TABLE reports ADD COLUMN resolved integer DEFAULT 0 NOT NULL` },
  { id: "025f_reports_resolved_by", sql: `ALTER TABLE reports ADD COLUMN resolved_by integer REFERENCES users(id)` },
  { id: "025g_reports_resolved_at", sql: `ALTER TABLE reports ADD COLUMN resolved_at text` },
  { id: "026_moderation_flags", sql: `CREATE TABLE IF NOT EXISTS moderation_flags (id integer PRIMARY KEY AUTOINCREMENT NOT NULL, target_type text NOT NULL, target_id integer NOT NULL, reason text NOT NULL, score integer DEFAULT 0, categories text DEFAULT '[]', matched_rules text DEFAULT '[]', resolved integer DEFAULT 0 NOT NULL, created_at text DEFAULT (datetime('now')) NOT NULL)` },
];

function migrateBetterSqlite(sqlite: any) {
  if (migrated) return;
  migrated = true;
  sqlite.exec(`CREATE TABLE IF NOT EXISTS _migrations (id text PRIMARY KEY, run_at text NOT NULL)`);
  const done = new Set((sqlite.prepare(`SELECT id FROM _migrations`).all() as any[]).map((r: any) => r.id));
  for (const m of MIGRATIONS) {
    if (done.has(m.id)) continue;
    try {
      // Column may already exist — catch duplicate column errors
      sqlite.exec(m.sql);
      sqlite.prepare(`INSERT INTO _migrations (id, run_at) VALUES (?, datetime('now'))`).run(m.id);
    } catch (e: any) {
      if (!e.message?.includes("duplicate column") && !e.message?.includes("no such table")) throw e;
    }
  }
}

async function migrateLibsql(client: any) {
  if (migrated) return;
  migrated = true;
  try {
    await client.execute({ sql: `CREATE TABLE IF NOT EXISTS _migrations (id text NOT NULL, run_at text NOT NULL)` });
  } catch { return; }
  try {
    const result = await client.execute({ sql: `SELECT id FROM _migrations` });
    const done = new Set(Array.from(result.rows || []).map((r: any) => String(r.id ?? r[0])));
    for (const m of MIGRATIONS) {
      if (done.has(m.id)) continue;
      try {
        await client.execute({ sql: m.sql });
        await client.execute({ sql: `INSERT INTO _migrations (id, run_at) VALUES (?, datetime('now'))`, args: [m.id] });
      } catch (e: any) {
        if (!e.message?.includes("duplicate column") && !e.message?.includes("no such table")) throw e;
      }
    }
  } catch {
    migrated = false;
    db = null;
  }
}

export function getDb(): Database | null {
  if (db !== null) return db;

  // Use Turso when configured (local or Vercel)
  if (process.env.TURSO_DB_URL && process.env.TURSO_DB_TOKEN) {
    try {
      const { createClient } = require("@libsql/client/web");
      const { drizzle } = require("drizzle-orm/libsql");
      const client = createClient({
        url: process.env.TURSO_DB_URL,
        authToken: process.env.TURSO_DB_TOKEN,
      });
      db = drizzle(client, { schema }) as unknown as Database;
      migrateLibsql(client).catch(() => {});
      return db;
    } catch {
      return null;
    }
  }

  // Fallback: local SQLite (dev only, no Turso configured)
  try {
    const Database = require("better-sqlite3");
    const path = require("path");
    const { drizzle } = require("drizzle-orm/better-sqlite3");
    const dbPath = path.join(process.cwd(), "data", "lepharo.db");
    const sqlite = new Database(dbPath);
    sqlite.pragma("journal_mode = WAL");
    sqlite.pragma("foreign_keys = ON");
    db = drizzle(sqlite, { schema }) as unknown as Database;
    migrateBetterSqlite(sqlite);
    return db;
  } catch {
    return null;
  }
}
